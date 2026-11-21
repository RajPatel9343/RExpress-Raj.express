import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AdminOrderDetailControl from '@/components/admin/AdminOrderDetailControl';

interface AdminOrderDetailPageProps {
  params: { id: string };
}

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }],
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

  return <AdminOrderDetailControl order={order} />;
}
