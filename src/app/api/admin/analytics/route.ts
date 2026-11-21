import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const [
      totalRevenueResult,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      }),
    ]);

    // Top selling products by order items count
    const topOrderItems = await prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        recentOrders,
        topSelling: topOrderItems.map((item) => ({
          name: item.productName,
          unitsSold: item._sum.quantity || 0,
          revenue: item._sum.totalPrice || 0,
        })),
      },
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate analytics' }, { status: 500 });
  }
}
