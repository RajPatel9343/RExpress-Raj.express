'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Truck, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/utils';

interface AdminOrderDetailControlProps {
  order: any;
}

export default function AdminOrderDetailControl({ order }: AdminOrderDetailControlProps) {
  const router = useRouter();

  const [status, setStatus] = useState(order.status);
  const [courierName, setCourierName] = useState(order.courierName || 'Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  let shippingAddress: any = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddressSnapshot);
  } catch (err) {}

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          courierName,
          trackingNumber,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to update order status');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="text-xs text-theme-blue font-bold flex items-center space-x-1 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-theme-gray-light text-theme-black rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print Commercial Invoice</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>Order parameters and tracking updated successfully in database!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Order Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-theme-gray-border gap-4">
          <div>
            <span className="text-xs text-theme-gray-medium block">Order Identifier</span>
            <h1 className="text-2xl font-black font-mono text-theme-black">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-theme-gray-medium mt-0.5">
              Customer: <span className="font-bold text-theme-black">{order.user?.name}</span> ({order.user?.email}) • Placed: {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-theme-gray-medium block">Total Order Value</span>
            <span className="text-2xl font-black text-theme-blue">
              {formatPrice(order.totalAmount)}
            </span>
            <span className="block text-[11px] font-bold text-green-700">
              Payment: {order.paymentMethod} ({order.paymentStatus})
            </span>
          </div>
        </div>

        {/* Fulfillment Control Form */}
        <form onSubmit={handleSave} className="p-6 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-4 text-xs">
          <h3 className="text-sm font-bold text-theme-black">
            Fulfillment & Tracking Control Panel
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-theme-black block mb-1">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue font-bold text-theme-black bg-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="PACKED">PACKED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Carrier Name</label>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="e.g. Delhivery Express"
                className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">
                AWB / Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DEL-IND-99482104"
                className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue font-mono bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-theme-black block mb-1">Admin Internal Notes</label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal fulfillment notes visible only to operations staff..."
              className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue bg-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-colors shadow-sm disabled:bg-gray-400 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>

        {/* Order Items Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-theme-black">Purchased Items</h3>
          <div className="divide-y divide-theme-gray-border text-xs">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-theme-black block">{item.productName}</span>
                  <span className="text-[11px] text-theme-gray-medium">
                    SKU: {item.productSku} {item.variantName ? `• ${item.variantName}` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-theme-gray-medium block">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </span>
                  <span className="font-extrabold text-theme-black">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address Snapshot */}
        <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border text-xs space-y-1">
          <span className="font-bold text-theme-black block mb-1">Shipping Destination</span>
          <p className="font-bold text-theme-black">{shippingAddress.fullName} ({shippingAddress.phone})</p>
          <p className="text-theme-gray-dark">
            {shippingAddress.addressLine1}, {shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}, ` : ''}{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
          </p>
        </div>
      </div>
    </div>
  );
}
