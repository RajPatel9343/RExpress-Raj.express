import React from 'react';
import prisma from '@/lib/prisma';
import { Warehouse, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export const revalidate = 0;

export default async function AdminInventoryPage() {
  const [warehouses, products] = await Promise.all([
    prisma.warehouse.findMany({
      include: {
        _count: { select: { inventory: true } },
      },
    }),
    prisma.product.findMany({
      include: {
        brand: true,
        category: true,
      },
      orderBy: { stock: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm">
        <h1 className="text-xl sm:text-2xl font-black text-theme-black">
          Warehouse & Inventory Hub
        </h1>
        <p className="text-xs text-theme-gray-medium mt-1">
          Monitor SKU stock thresholds, reserved units, and multi-warehouse allocations.
        </p>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-white p-6 rounded-3xl border border-theme-gray-border shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 bg-blue-50 text-theme-blue rounded-xl flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </span>
              <span className="font-mono text-[11px] font-bold text-theme-gray-medium">
                {wh.code}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-theme-black">{wh.name}</h3>
              <p className="text-xs text-theme-gray-medium mt-0.5">{wh.address}, {wh.city}, {wh.state}</p>
            </div>
            <div className="pt-2 border-t border-theme-gray-border flex items-center justify-between text-xs">
              <span className="text-green-700 font-semibold flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Active Hub
              </span>
              <span className="text-theme-gray-dark font-bold">{wh.postalCode}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Product Stock Table */}
      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-theme-gray-border">
          <h2 className="text-base font-bold text-theme-black">SKU Stock Levels</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4">Threshold</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {products.map((p) => {
                const isLow = p.stock <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-theme-black">{p.sku}</td>
                    <td className="p-4 font-semibold text-theme-black max-w-xs truncate">{p.name}</td>
                    <td className="p-4 text-theme-gray-medium">{p.category?.name || '—'}</td>
                    <td className="p-4 font-extrabold text-theme-black text-sm">{p.stock}</td>
                    <td className="p-4 text-theme-gray-medium">{p.lowStockThreshold} units</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full font-bold text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock Alert</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>Optimal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
