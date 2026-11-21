'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Check, X, AlertCircle, Percent, DollarSign, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    applicableTo: 'ALL',
    isActive: true,
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/offers');
      const data = await res.json();
      if (data.success) {
        setOffers(data.data);
      }
    } catch {
      setError('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '0',
      maxDiscountAmount: '',
      usageLimit: '',
      perUserLimit: '1',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      applicableTo: 'ALL',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      discountType: offer.discountType,
      discountValue: String(offer.discountValue),
      minOrderAmount: String(offer.minOrderAmount || 0),
      maxDiscountAmount: offer.maxDiscountAmount ? String(offer.maxDiscountAmount) : '',
      usageLimit: offer.usageLimit ? String(offer.usageLimit) : '',
      perUserLimit: String(offer.perUserLimit || 1),
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
      applicableTo: offer.applicableTo || 'ALL',
      isActive: offer.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingOffer ? `/api/admin/offers/${editingOffer.id}` : '/api/admin/offers';
      const method = editingOffer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(editingOffer ? 'Offer updated successfully!' : 'Offer created successfully!');
        setShowModal(false);
        fetchOffers();
      } else {
        setError(data.error || 'Failed to save offer');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccess('Offer deleted');
        fetchOffers();
      } else {
        setError(data.error || 'Failed to delete offer');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleToggleActive = async (offer: any) => {
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOffers();
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Offers & Promotions Management
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Create discount offers, set percentage or fixed rates, manage applicability, and track active promotions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Offer</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Offers Table */}
      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">Offer</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Conditions</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-theme-gray-medium">Loading offers...</td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-theme-gray-medium">No offers found. Create one to get started.</td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-theme-blue flex items-center justify-center">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-theme-black block">{offer.title}</span>
                          <span className="text-[11px] text-theme-gray-medium">{offer.description || 'No description'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-theme-black">
                      {offer.discountType === 'PERCENTAGE' ? (
                        <span className="flex items-center space-x-1 text-blue-600">
                          <Percent className="w-3.5 h-3.5" />
                          <span>{offer.discountValue}% OFF</span>
                        </span>
                      ) : (
                        <span className="text-green-600">₹{offer.discountValue} OFF</span>
                      )}
                    </td>
                    <td className="p-4 space-y-0.5 text-theme-gray-medium">
                      <div>Min order: ₹{offer.minOrderAmount}</div>
                      {offer.maxDiscountAmount && <div>Max discount: ₹{offer.maxDiscountAmount}</div>}
                    </td>
                    <td className="p-4 space-y-0.5 text-theme-gray-medium">
                      <div>From: {formatDate(offer.startDate)}</div>
                      {offer.endDate && <div>To: {formatDate(offer.endDate)}</div>}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(offer)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          offer.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(offer)}
                        className="p-1.5 text-theme-gray-medium hover:text-theme-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-1.5 text-theme-gray-medium hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-theme-gray-border">
              <h2 className="text-base font-bold text-theme-black">
                {editingOffer ? 'Edit Promotion Offer' : 'Create Promotion Offer'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-theme-gray-medium hover:text-theme-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-theme-black block mb-1">Offer Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Special 20% Off"
                  className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-theme-black block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details and promotional copy..."
                  className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-theme-black block mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-theme-black block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder="e.g. 15 or 500"
                    className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-theme-black block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                  />
                </div>
                <div>
                  <label className="font-bold text-theme-black block mb-1">Max Discount Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Optional ceiling"
                    className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-theme-black block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                  />
                </div>
                <div>
                  <label className="font-bold text-theme-black block mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveOffer"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-theme-blue focus:ring-theme-blue"
                />
                <label htmlFor="isActiveOffer" className="font-bold text-theme-black">
                  Offer is Active and Applicable
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-theme-gray-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-theme-gray-border rounded-xl font-bold hover:bg-theme-gray-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-colors"
                >
                  {editingOffer ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
