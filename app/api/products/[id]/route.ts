import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku ?? '',
    costPrice: Number(product.cost ?? 0),
    sellingPrice: Number(product.price ?? 0),
    stockQuantity: product.stock?.quantity ?? 0,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, sku, costPrice, sellingPrice, stock } = await request.json();

    const updateData: any = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
      }
      updateData.name = trimmedName;
    }

    if (sku !== undefined) {
      const trimmedSku = String(sku).trim();
      if (!trimmedSku) {
        return NextResponse.json({ error: 'SKU cannot be empty.' }, { status: 400 });
      }
      updateData.sku = trimmedSku;
    }

    if (costPrice !== undefined) {
      const parsedCost = Number(costPrice);
      if (Number.isNaN(parsedCost)) {
        return NextResponse.json({ error: 'Cost price must be a valid number.' }, { status: 400 });
      }
      updateData.cost = parsedCost;
    }

    if (sellingPrice !== undefined) {
      const parsedSelling = Number(sellingPrice);
      if (Number.isNaN(parsedSelling)) {
        return NextResponse.json({ error: 'Selling price must be a valid number.' }, { status: 400 });
      }
      updateData.price = parsedSelling;
    }

    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (Number.isNaN(parsedStock)) {
        return NextResponse.json({ error: 'Stock must be a valid number.' }, { status: 400 });
      }
      updateData.stock = {
        upsert: {
          update: { quantity: parsedStock },
          create: { quantity: parsedStock },
        },
      };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { stock: true },
    });

    return NextResponse.json({ product: formatProduct(product) });
  } catch (error: any) {
    console.error('Failed to update product', error);
    const message = error?.meta?.target?.includes('sku') ? 'SKU must be unique.' : 'Unable to update product.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.saleItem.deleteMany({ where: { productId: id } });
    await prisma.stock.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
