'use client';

import React, { useState } from 'react';
import { Search, Truck, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { getTrackingTimeline } from '@/lib/shipping/shiprocket';

export default function TrackOrderPage() {
  const [orderQuery, setOrderQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderQuery.trim())}`);
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setOrderData(data.data);
      } else {
        setError(data.error || 'No shipment found for this order or tracking reference.');
      }
    } catch (err: any) {
      setError('Network error occurred while fetching tracking details.');
    } finally {
      setLoading(false);
    }
  };

  const timeline = orderData ? getTrackingTimeline(orderData) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Search Box */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-theme-gray-border shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-theme-black tracking-tight">
          Live Shipment & Order Tracking
        </h1>
        <p className="text-xs sm:text-sm text-theme-gray-medium max-w-md mx-auto">
          Enter your Order Number (e.g. <span className="font-mono text-theme-black font-semibold">ORD-2026-89412</span>) to view real-time courier movements.
        </p>

        <form onSubmit={handleTrack} className="max-w-lg mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Order Number or Tracking Number"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs uppercase border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue font-medium"
              required
            />
            <Search className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm disabled:bg-gray-400"
          >
            {loading ? 'Tracking...' : 'Track Package'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-center space-x-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results View */}
      {orderData && (
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-theme-gray-border gap-4 text-xs">
            <div>
              <span className="text-theme-gray-medium block">Order Number</span>
              <span className="text-lg font-black font-mono text-theme-black">
                {orderData.orderNumber}
              </span>
              <p className="text-[11px] text-theme-gray-medium mt-0.5">
                Carrier: {orderData.courierName || 'Delhivery Express'} • AWB:{' '}
                <span className="font-mono font-bold text-theme-black">
                  {orderData.trackingNumber || 'Pending Assignment'}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-theme-gray-medium block">Fulfillment Status</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-0.5 ${
                  orderData.status === 'DELIVERED'
                    ? 'bg-green-100 text-green-800'
                    : orderData.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {orderData.status}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-6">
            {timeline.map((step, idx) => (
              <div key={idx} className="relative">
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.completed
                      ? 'bg-theme-blue text-white ring-4 ring-blue-50'
                      : step.current
                      ? 'bg-amber-500 text-white ring-4 ring-amber-50'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.completed ? '✓' : idx + 1}
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <h3 className="font-bold text-theme-black text-sm">{step.title}</h3>
                    <span className="text-[11px] text-theme-gray-medium">{step.time}</span>
                  </div>
                  <p className="text-xs text-theme-gray-dark mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Items Summary in Package */}
          <div className="pt-6 border-t border-theme-gray-border space-y-3">
            <h4 className="text-xs font-bold text-theme-black uppercase tracking-wider">
              Package Contents ({orderData.items?.length || 0} items)
            </h4>
            <div className="space-y-2">
              {orderData.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1">
                  <span className="text-theme-gray-dark">
                    {item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                  </span>
                  <span className="font-bold text-theme-black">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
