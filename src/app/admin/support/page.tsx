import React from 'react';
import prisma from '@/lib/prisma';
import { LifeBuoy, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const revalidate = 0;

export default async function AdminSupportDeskPage() {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      user: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-theme-black">
          Concierge Support Desk
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Review customer inquiries, order dispatch tickets, and warranty assistance requests.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Category</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-theme-gray-medium">
                    No active support tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-theme-black">{t.ticketNumber}</td>
                    <td className="p-4">
                      <span className="font-bold text-theme-black block">{t.user?.name}</span>
                      <span className="text-[11px] text-theme-gray-medium">{t.user?.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-theme-black max-w-xs truncate">{t.subject}</td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          t.priority === 'URGENT' ? 'text-red-600' : 'text-theme-gray-dark'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'RESOLVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-theme-gray-medium">{formatDate(t.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
