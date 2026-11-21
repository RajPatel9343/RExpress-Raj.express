'use client';

import React, { useState, useEffect } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { Users, Mail, Phone, ShieldAlert, ShieldCheck, Trash2, Search } from 'lucide-react';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user: any) => {
    const isBlocking = !user.isBlocked;
    const confirmMsg = isBlocking
      ? `Are you sure you want to block ${user.name}? They will immediately be logged out and cannot access their account.`
      : `Are you sure you want to unblock ${user.name}?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/users/${user.id}/block`, {
        method: isBlocking ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin action' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`User ${isBlocking ? 'blocked' : 'unblocked'} successfully`);
        fetchUsers();
      } else {
        setError(data.error || 'Failed to update user status');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove/anonymize user "${name}"? Historical orders will be preserved.`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Account removed successfully');
        fetchUsers();
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch {
      setError('Network error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === 'ALL' || u.role === filter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Customer & Account Management
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Review customers & sellers, manage permissions, suspend or reactivate access.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
            />
            <Search className="w-3.5 h-3.5 text-theme-gray-medium absolute left-2.5 top-2.5" />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="SELLER">Sellers</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs">
          {success}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-theme-gray-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-theme-gray-bg border-b border-theme-gray-border text-theme-gray-dark font-bold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-gray-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-theme-gray-medium">Loading accounts...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-theme-gray-medium">No accounts found.</td>
                </tr>
              ) : (
                filteredUsers.map((c) => {
                  const totalSpend = (c.orders || [])
                    .filter((o: any) => o.paymentStatus === 'PAID')
                    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

                  return (
                    <tr key={c.id} className="hover:bg-theme-gray-bg/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-theme-blue text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {c.name ? c.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-theme-black block">{c.name}</span>
                            <span className="text-[10px] text-theme-gray-medium font-mono">ID: {c.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-theme-blue rounded font-bold text-[10px]">
                          {c.role}
                        </span>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-theme-gray-dark">
                          <Mail className="w-3.5 h-3.5 text-theme-gray-medium" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center space-x-1.5 text-theme-gray-medium text-[11px]">
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-theme-gray-medium">{formatDate(c.createdAt)}</td>
                      <td className="p-4 font-bold text-theme-black">{c._count?.orders || c.orders?.length || 0} orders</td>
                      <td className="p-4">
                        {c.isBlocked ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-[10px] font-bold">
                            Blocked / Suspended
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-bold">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleBlock(c)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            c.isBlocked
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={c.isBlocked ? 'Unblock user' : 'Block user'}
                        >
                          {c.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 text-theme-gray-medium hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Permanently remove / anonymize account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
