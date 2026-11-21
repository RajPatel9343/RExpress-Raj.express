import React from 'react';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';
import OrderDetailView from '@/components/account/OrderDetailView';

interface CustomerOrderDetailPageProps {
  params: { id: string };
}

export default async function CustomerOrderDetailPage({
  params,
}: CustomerOrderDetailPageProps) {
  const session = await getCurrentUser();
  if (!session) {
    redirect(`/login?redirect=/account/orders/${params.id}`);
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }],
      ...(!isStaffRole(session.role) ? { userId: session.userId } : {}),
    },
    include: {
      items: true,
      payments: true,
      user: true,
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderDetailView order={order} />;
}
