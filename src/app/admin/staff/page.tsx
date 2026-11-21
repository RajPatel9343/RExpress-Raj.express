'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Pencil, Trash2, Shield, ShieldOff, AlertCircle, CheckCircle2, X } from 'lucide-react';

type StaffRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PRODUCT_MANAGER'
  | 'ORDER_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'MARKETING_MANAGER'
  | 'SUPPORT_AGENT'
  | 'ACCOUNTANT';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: StaffRole;
  isBlocked: boolean;
  createdAt: string;
}

const STAFF_ROLES: StaffRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'PRODUCT_MANAGER',
  'ORDER_MANAGER',
  'INVENTORY_MANAGER',
  'MARKETING_MANAGER',
  'SUPPORT_AGENT',
  'ACCOUNTANT',
];

const ROLE_COLORS: Record<StaffRole, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  PRODUCT_MANAGER: 'bg-indigo-100 text-indigo-800',
  ORDER_MANAGER: 'bg-teal-100 text-teal-800',
  INVENTORY_MANAGER: 'bg-orange-100 text-orange-800',
  MARKETING_MANAGER: 'bg-pink-100 text-pink-800',
  SUPPORT_AGENT: 'bg-yellow-100 text-yellow-800',
  ACCOUNTANT: 'bg-green-100 text-green-800',
};

const inputCls = 'w-full px-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue';
const labelCls = 'text-xs font-bold text-theme-black block mb-1';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null);
  const [confirmBlock, setConfirmBlock] = useState<StaffUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<StaffUser | null>(null);

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' as StaffRole, phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success) setStaff(data.data);
      else setError(data.error || 'Failed to load staff');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Staff member added successfully.');
        setShowAdd(false);
        setForm({ name: '', email: '', password: '', role: 'ADMIN', phone: '' });
        fetchStaff();
      } else {
        setError(data.error || 'Failed to add staff');
      }
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
      const res = await fetch(`/api/admin/staff/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, role: form.role }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Staff member updated.');
        setShowEdit(false);
        setEditTarget(null);
        fetchStaff();
      } else {
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlock = async () => {
    if (!confirmBlock) return;
    try {
      const res = await fetch(`/api/admin/staff/${confirmBlock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !confirmBlock.isBlocked }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(confirmBlock.isBlocked ? 'Staff unblocked.' : 'Staff blocked.');
        fetchStaff();
      }
    } catch { /* ignore */ }
    setConfirmBlock(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/staff/${confirmDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Staff member deleted.');
        fetchStaff();
      }
    } catch { /* ignore */ }
    setConfirmDelete(null);
  };

  const openEdit = (s: StaffUser) => {
    setEditTarget(s);
    setForm({ name: s.name, email: s.email, password: '', role: s.role, phone: s.phone || '' });
    setShowEdit(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">Staff Management</h1>
          <p className="text-xs text-theme-gray-medium mt-1">Manage admin and staff accounts, roles, and access.</p>
        </div>
        <button
          onClick={() => { setForm({ name: '', email: '', password: '', role: 'ADMIN', phone: '' }); setShowAdd(true); }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-theme-gray-medium">Loading staff...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-theme-gray-medium">No staff members found.</td></tr>
              ) : staff.map((s) => (
                <tr key={s.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-theme-blue text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-theme-black block">{s.name}</span>
                        <span className="text-[10px] text-theme-gray-medium font-mono">ID: {s.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-theme-gray-dark">{s.email}</td>
                  <td className="p-4 text-theme-gray-medium">{s.phone || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLORS[s.role]}`}>
                      {s.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                      {s.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 text-theme-gray-medium hover:text-theme-blue transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmBlock(s)}
                        className={`p-1.5 transition-colors ${s.isBlocked ? 'text-green-600 hover:text-green-700' : 'text-orange-500 hover:text-orange-600'}`}
                        title={s.isBlocked ? 'Unblock' : 'Block'}
                      >
                        {s.isBlocked ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(s)}
                        className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
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

      {/* Add Staff Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-theme-gray-border shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-theme-black">Add New Staff</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 text-theme-gray-medium hover:text-theme-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Jane Doe" /></div>
              <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="jane@rexpresso.com" /></div>
              <div><label className={labelCls}>Password *</label><input type="password" className={inputCls} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min 8 characters" /></div>
              <div>
                <label className={labelCls}>Role *</label>
                <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as StaffRole }))}>
                  {STAFF_ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Phone</label><input type="tel" className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" /></div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 border border-theme-gray-border rounded-xl text-xs font-bold text-theme-gray-dark hover:bg-theme-gray-bg">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark disabled:bg-gray-400">{submitting ? 'Adding...' : 'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEdit && editTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-theme-gray-border shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-theme-black">Edit Staff</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 text-theme-gray-medium hover:text-theme-black"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-3 text-xs">
              <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
              <div><label className={labelCls}>Phone</label><input type="tel" className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div>
                <label className={labelCls}>Role *</label>
                <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as StaffRole }))}>
                  {STAFF_ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 py-2.5 border border-theme-gray-border rounded-xl text-xs font-bold text-theme-gray-dark hover:bg-theme-gray-bg">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark disabled:bg-gray-400">{submitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Confirm Dialog */}
      {confirmBlock && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-theme-gray-border shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-theme-black">{confirmBlock.isBlocked ? 'Unblock' : 'Block'} Staff</h2>
            <p className="text-xs text-theme-gray-medium">
              Are you sure you want to <strong>{confirmBlock.isBlocked ? 'unblock' : 'block'}</strong> <strong>{confirmBlock.name}</strong>?
              {!confirmBlock.isBlocked && ' They will lose access immediately.'}
            </p>
            <div className="flex space-x-2">
              <button onClick={() => setConfirmBlock(null)} className="flex-1 py-2.5 border border-theme-gray-border rounded-xl text-xs font-bold text-theme-gray-dark hover:bg-theme-gray-bg">Cancel</button>
              <button onClick={handleBlock} className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white ${confirmBlock.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {confirmBlock.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-theme-gray-border shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-black text-theme-black">Delete Staff Member</h2>
            <p className="text-xs text-theme-gray-medium">
              Permanently delete <strong>{confirmDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-theme-gray-border rounded-xl text-xs font-bold text-theme-gray-dark hover:bg-theme-gray-bg">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
