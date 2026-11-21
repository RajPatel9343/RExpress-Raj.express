'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('superadmin@rexpresso.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please verify staff credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-theme-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-gray-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-theme-blue text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Rexpresso Admin Console
          </h1>
          <p className="text-xs text-gray-400">
            Restricted staff access for inventory, orders, analytics, and platform governance.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-300 block mb-1">Staff Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-300 block mb-1">Staff Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black border border-gray-700 text-white rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-all shadow-md hover:shadow-blue-500/25 disabled:bg-gray-700 flex items-center justify-center space-x-2 text-xs"
          >
            <span>{loading ? 'Verifying Staff Access...' : 'Sign In to Admin Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-300">
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
