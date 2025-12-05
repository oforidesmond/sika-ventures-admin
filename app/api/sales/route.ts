import { NextResponse } from 'next/server';
import { PaymentMethod, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const paymentMethodSet = new Set(Object.values(PaymentMethod));

const saleInclude = {
  attendant: true,
  items: {
    include: {
      product: true,
    },
  },
} as const satisfies Prisma.SaleInclude;

type SaleWithRelations = Prisma.SaleGetPayload<{ include: typeof saleInclude }>;
type FormattedSale = ReturnType<typeof formatSale>;

type ProductWithStock = {
  id: string;
  name: string;
  price: Prisma.Decimal;
  stock: {
    quantity: number;
  } | null;
};

function formatSale(sale: SaleWithRelations) {
  return {
    id: sale.id,
    receiptNumber: sale.receiptNumber,
    userId: sale.userId,
    paymentMethod: sale.paymentMethod,
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount ?? 0),
    totalAmount: Number(sale.totalAmount),
    createdAt: sale.createdAt,
    attendant: sale.attendant
      ? {
          id: sale.attendant.id,
          fullName: sale.attendant.fullName,
          username: sale.attendant.username,
        }
      : null,
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total),
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
          }
        : null,
    })),
  };
}

function buildRevenueOverview(sales: FormattedSale[]) {
  const today = new Date();
  const lastSevenDays = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  });

  const revenueByDate = sales.reduce((map, sale) => {
    const saleDateKey = new Date(sale.createdAt).toISOString().slice(0, 10);
    const currentTotal = map.get(saleDateKey) ?? 0;
    map.set(saleDateKey, currentTotal + sale.totalAmount);
    return map;
  }, new Map<string, number>());

  return lastSevenDays.map(({ key, label }) => ({
    day: label,
    revenue: Number((revenueByDate.get(key) ?? 0).toFixed(2)),
  }));
}

function buildSalesSummary(sales: FormattedSale[]) {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalSales = sales.length;
  const averageOrderValue = totalSales ? totalRevenue / totalSales : 0;

  return {
    totalRevenue,
    totalSales,
    averageOrderValue,
    revenueOverview: buildRevenueOverview(sales),
  };
}

function toCents(value: number) {
  return Math.round(value * 100);
}

function centsToAmount(cents: number) {
  return cents / 100;
}

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: saleInclude,
      orderBy: { createdAt: 'desc' },
    });

    const formattedSales = sales.map(formatSale);
    const summary = buildSalesSummary(formattedSales);

    return NextResponse.json({ sales: formattedSales, summary });
  } catch (error) {
    console.error('Failed to fetch sales', error);
    return NextResponse.json({ error: 'Unable to fetch sales.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { receiptNumber, userId, paymentMethod, items, discount = 0 } = body ?? {};

    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    const normalizedPaymentMethod = String(paymentMethod).toUpperCase() as PaymentMethod;
    if (!paymentMethod || !paymentMethodSet.has(normalizedPaymentMethod)) {
      return NextResponse.json({ error: 'paymentMethod is invalid.' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one sale item is required.' }, { status: 400 });
    }

    const parsedDiscount = Number(discount ?? 0);
    if (Number.isNaN(parsedDiscount) || parsedDiscount < 0) {
      return NextResponse.json({ error: 'discount must be a positive number.' }, { status: 400 });
    }

    const sanitizedItems: { productId: string; quantity: number; priceOverride?: number }[] = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (!item || typeof item !== 'object') {
        return NextResponse.json({ error: `Item at position ${index + 1} is invalid.` }, { status: 400 });
      }

      if (!item.productId) {
        return NextResponse.json({ error: `Item ${index + 1} is missing productId.` }, { status: 400 });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: `Item ${index + 1} quantity must be a positive integer.` }, { status: 400 });
      }

      let priceOverride: number | undefined;
      if (item.price !== undefined) {
        priceOverride = Number(item.price);
        if (!Number.isFinite(priceOverride) || priceOverride < 0) {
          return NextResponse.json({ error: `Item ${index + 1} price must be a positive number.` }, { status: 400 });
        }
      }

      sanitizedItems.push({ productId: item.productId, quantity, priceOverride });
    }

    const productIds = Array.from(new Set(sanitizedItems.map((item) => item.productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: {
          select: {
            quantity: true,
          },
        },
      },
    });

    if (products.length !== productIds.length) {
      const missing = productIds.filter((id) => !products.find((product: ProductWithStock) => product.id === id));
      return NextResponse.json({ error: `Products not found: ${missing.join(', ')}` }, { status: 404 });
    }

    const productMap = new Map<string, ProductWithStock>(
      products.map((product: ProductWithStock) => [product.id, product]),
    );

    let subtotalInCents = 0;
    const itemsPayload = sanitizedItems.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error('Product missing during sale creation.');
      }

      if (!product.stock) {
        throw new Error(`Product "${product.name}" has no stock record.`);
      }

      const available = product.stock.quantity;
      if (item.quantity > available) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${available}`);
      }

      const defaultPrice = Number(product.price);
      const unitPrice = item.priceOverride ?? defaultPrice;

      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw new Error(`Invalid price for ${product.name}.`);
      }

      const priceInCents = toCents(unitPrice);
      const lineTotalInCents = priceInCents * item.quantity;
      subtotalInCents += lineTotalInCents;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: centsToAmount(priceInCents),
        total: centsToAmount(lineTotalInCents),
      };
    });

    const discountInCents = toCents(parsedDiscount);
    if (discountInCents > subtotalInCents) {
      return NextResponse.json({ error: 'Discount cannot exceed subtotal.' }, { status: 400 });
    }

    const sale = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        for (const item of itemsPayload) {
          const stock = await tx.stock.findUnique({ where: { productId: item.productId } });
          if (!stock || stock.quantity < item.quantity) {
            throw new Error('Stock levels changed. Please refresh and try again.');
          }
        }

        const createdSale = await tx.sale.create({
          data: {
            receiptNumber:
              receiptNumber && typeof receiptNumber === 'string' && receiptNumber.trim().length > 0
                ? receiptNumber.trim()
                : `SAL-${Date.now()}`,
            userId,
            subtotal: centsToAmount(subtotalInCents),
            discount: centsToAmount(discountInCents),
            totalAmount: centsToAmount(subtotalInCents - discountInCents),
            paymentMethod: normalizedPaymentMethod,
            items: {
              create: itemsPayload,
            },
          },
          include: saleInclude,
        });

        await Promise.all(
          itemsPayload.map((item) =>
            tx.stock.update({
              where: { productId: item.productId },
              data: { quantity: { decrement: item.quantity } },
            }),
          ),
        );

        return createdSale;
      },
      {
        timeout: 30000, // 30 seconds timeout
      }
    );

    return NextResponse.json({ sale: formatSale(sale) }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create sale', error);

    if (error instanceof Error && error.message) {
      const message = error.message.includes('Insufficient stock') || error.message.includes('no stock record')
        ? error.message
        : undefined;

      if (message) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const metaMessage = error?.code === 'P2002' && error?.meta?.target?.includes('receiptNumber')
      ? 'Receipt number must be unique.'
      : 'Unable to create sale.';

    return NextResponse.json({ error: metaMessage }, { status: 500 });
  }
}
