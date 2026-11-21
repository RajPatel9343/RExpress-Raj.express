'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Store, Plus, Pencil, Trash2, AlertCircle, CheckCircle2, X, ToggleLeft, ToggleRight } from 'lucide-react';

interface StoreOwner {
  id: string;
  name: string;
  email: string;
}

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  isActive: boolean;
  isSuspended?: boolean;
  owner?: StoreOwner | null;
  ownerId?: string | null;
}

const inputCls = 'w-full px-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue';
const labelCls = 'text-xs font-bold text-theme-black block mb-1';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const emptyForm = {
  name: '', slug: '', description: '', contactEmail: '', contactPhone: '',
  address: '', city: '', state: '', postalCode: '', ownerId: '',
};

export default function StoresManagementPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [owners, setOwners] = useState<StoreOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<StoreItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ store: StoreItem; action: 'delete' | 'suspend' | 'activate' } | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stores');
      const data = await res.json();
      if (data.success) {
        setStores(data.data.stores || data.data);
        setOwners(data.data.owners || []);
      } else setError(data.error || 'Failed to load stores');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Store created successfully.');
        setShowCreate(false);
        setForm({ ...emptyForm });
        fetchStores();
      } else setError(data.error || 'Failed to create store');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/stores/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Store updated.');
        setShowEdit(false);
        setEditTarget(null);
        fetchStores();
      } else setError(data.error || 'Update failed');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { store, action } = confirmAction;
    try {
      if (action === 'delete') {
        const res = await fetch(`/api/admin/stores/${store.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) showToast('Store deleted.');
      } else {
        const res = await fetch(`/api/admin/stores/${store.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();
        if (data.success) showToast(`Store ${action}d.`);
      }
      fetchStores();
    } catch { /* ignore */ }
    setConfirmAction(null);
  };

  const openEdit = (s: StoreItem) => {
    setEditTarget(s);
    setForm({
      name: s.name, slug: s.slug, description: s.description || '',
      contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '',
      address: s.address || '', city: s.city || '', state: s.state || '',
      postalCode: s.postalCode || '', ownerId: s.ownerId || '',
    });
    setShowEdit(true);
  };

  const StoreForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-3 text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Store Name *</label>
          <input className={inputCls} value={form.name} required placeholder="My Store"
            onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Slug *</label>
          <input className={inputCls} value={form.slug} required placeholder="my-store"
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Description</label>
          <textarea className={inputCls} rows={2} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short store description" />
        </div>
        <div>
          <label className={labelCls}>Contact Email</label>
          <input type="email" className={inputCls} value={form.contactEmail}
            onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="store@example.com" />
        </div>
        <div>
          <label className={labelCls}>Contact Phone</label>
          <input type="tel" className={inputCls} value={form.contactPhone}
            onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="+1 555 000" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Address</label>
          <input className={inputCls} value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St" />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input className={inputCls} value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="New York" />
        </div>
        <div>
          <label className={labelCls}>State</label>
          <input className={inputCls} value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="NY" />
        </div>
        <div>
          <label className={labelCls}>Postal Code</label>
          <input className={inputCls} value={form.postalCode}
            onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="10001" />
        </div>
        <div>
          <label className={labelCls}>Owner</label>
          <select className={inputCls} value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}>
            <option value="">— Select owner —</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
          </select>
        </div>
      </div>
      <div className="flex space-x-2 pt-2">
        <button type="button" onClick={() => { setShowCreate(false); setShowEdit(false); }}
          className="flex-1 py-2.5 border border-theme-gray-border rounded-xl text-xs font-bold text-theme-gray-dark hover:bg-theme-gray-bg">Cancel</button>
        <button type="submit" disabled={submitting}
          className="flex-1 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark disabled:bg-gray-400">
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{toast}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">Stores Management</h1>
          <p className="text-xs text-theme-gray-medium mt-1">Create and manage seller stores on the platform.</p>
        </div>
        <button onClick={() => { setForm({ ...emptyForm }); setShowCreate(true); }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Create Store</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">Store</th>
                <th className="p-4">Owner</th>
                <th className="p-4">City</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-theme-gray-medium">Loading stores...</td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-theme-gray-medium">No stores found.</td></tr>
              ) : stores.map((s) => (
                <tr key={s.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-theme-blue/10 text-theme-blue rounded-xl flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-theme-black block">{s.name}</span>
                        <span className="text-[10px] text-theme-gray-medium">/{s.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-theme-gray-dark">{s.owner?.name || '—'}<br /><span className="text-[10px] text-theme-gray-medium">{s.owner?.email}</span></td>
                  <td className="p-4 text-theme-gray-medium">{s.city || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isSuspended ? 'bg-red-100 text-red-700' : s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {s.isSuspended ? 'Suspended' : s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-theme-gray-medium hover:text-theme-blue" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmAction({ store: s, action: s.isSuspended ? 'activate' : 'suspend' })}
                        className={`p-1.5 ${s.isSuspended ? 'text-green-600 hover:text-green-700' : 'text-orange-500 hover:text-orange-600'}`}
                        title={s.isSuspended ? 'Activate' : 'Suspend'}>
                        {s.isSuspended ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setConfirmAction({ store: s, action: 'delete' })} className="p-1.5 text-red-400 hover:text-red-600" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-theme-gray-border shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-theme-black">Create Store</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 text-theme-gray-medium hover:text-theme-black"><X className="w-5 h-5" /></button>
            </div>
            <StoreForm onSubmit={handleCreate} submitLabel="Create Store" />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-theme-gray-border shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-theme-black">Edit Store</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 text-theme-gray-medium hover:text-theme-black"><X className="w-5 h-5" /></button>
            </div>
            <StoreForm onSubmit={handleEdit} submitLabel="Save Changes" />
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-theme-gray-border shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-theme-black capitalize">{confirmAction.action} Store</h2>
            <p className="text-xs text-theme-gray-medium">
              Are you sure you want to <strong>{confirmAction.action}</strong> <strong>{confirmAction.store.name}</strong>?
              {confirmAction.action === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex space-x-2">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 border border-theme-gray-border rounded-xl text-xs font-bold text-theme-gray-dark hover:bg-theme-gray-bg">Cancel</button>
              <button onClick={handleConfirmAction}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white ${confirmAction.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : confirmAction.action === 'suspend' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
