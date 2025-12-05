'use server';

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type WeeklySale = {
  createdAt: Date;
  totalAmount: Prisma.Decimal | null;
};

const LOW_STOCK_THRESHOLD = 10;
const MAX_ACTIVITY_ITEMS = 6;
const recentSaleInclude = {
  attendant: true,
} as const;

type RecentSale = Awaited<ReturnType<typeof prisma.sale.findMany>>[number];
type ProductRecord = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function sevenDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildWeeklySalesOverview(sales: WeeklySale[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  });

  const revenueByDate = sales.reduce((map, sale) => {
    const key = new Date(sale.createdAt).toISOString().slice(0, 10);
    const amount = Number(sale.totalAmount ?? 0);
    map.set(key, (map.get(key) ?? 0) + amount);
    return map;
  }, new Map<string, number>());

  return days.map(({ key, name }) => ({
    name,
    sales: Number((revenueByDate.get(key) ?? 0).toFixed(2)),
  }));
}

function buildRecentActivity(sales: RecentSale[], products: ProductRecord[]) {
  const saleActivities = sales.map((sale) => ({
    id: sale.id,
    action: 'Sale completed',
    context: sale.attendant?.fullName ?? sale.attendant?.username ?? 'Walk-in customer',
    amount: Number(sale.totalAmount ?? 0),
    timestamp: sale.createdAt.toISOString(),
  }));

  const productActivities = products.map((product) => ({
    id: product.id,
    action: 'Product added',
    context: product.name,
    amount: null as number | null,
    timestamp: product.createdAt.toISOString(),
  }));

  return [...saleActivities, ...productActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, MAX_ACTIVITY_ITEMS);
}

export async function GET() {
  try {
    const [salesAggregate, todaysRevenueAggregate, totalProducts, lowStockItems, weeklySales, recentSales, recentProducts] =
      await Promise.all([
        prisma.sale.aggregate({
          _sum: { totalAmount: true },
          _count: true,
        }),
        prisma.sale.aggregate({
          where: { createdAt: { gte: startOfToday() } },
          _sum: { totalAmount: true },
        }),
        prisma.product.count(),
        prisma.stock.count({ where: { quantity: { lt: LOW_STOCK_THRESHOLD } } }),
        prisma.sale.findMany({
          where: { createdAt: { gte: sevenDaysAgo() } },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true, totalAmount: true },
        }),
        prisma.sale.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: recentSaleInclude,
        }),
        prisma.product.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    const totalRevenue = Number(salesAggregate._sum.totalAmount ?? 0);
    const totalSales = salesAggregate._count ?? 0;
    const todaysRevenue = Number(todaysRevenueAggregate._sum.totalAmount ?? 0);
    const averageOrderValue = totalSales ? totalRevenue / totalSales : 0;
    const conversionRate =
      totalProducts > 0 ? Math.min(100, (totalSales / totalProducts) * 100) : totalSales > 0 ? 100 : 0;

    const weeklySalesOverview = buildWeeklySalesOverview(weeklySales);
    const recentActivity = buildRecentActivity(recentSales, recentProducts);

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalSales,
        totalProducts,
        todaysRevenue,
      },
      weeklySalesOverview,
      quickStats: {
        averageOrderValue,
        conversionRate,
        lowStockItems,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Failed to load dashboard data', error);
    return NextResponse.json({ error: 'Unable to load dashboard data.' }, { status: 500 });
  }
}
