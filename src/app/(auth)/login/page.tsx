'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleQuickLogin = (role: 'ADMIN' | 'CUSTOMER') => {
    if (role === 'ADMIN') {
      setEmail('superadmin@rexpresso.com');
      setPassword('Admin@123456');
    } else {
      setEmail('customer@example.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-theme-gray-border p-8 sm:p-10 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-sm">
          R
        </div>
        <h1 className="text-2xl font-black text-theme-black tracking-tight">
          Welcome to Rexpresso
        </h1>
        <p className="text-xs text-theme-gray-medium">
          Sign in to access your orders, wishlist, and concierge support.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-theme-black block mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              required
            />
            <Mail className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-theme-black">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-theme-blue hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              required
            />
            <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-all shadow-md hover:shadow-blue-500/25 disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Fast Fill Buttons */}
      <div className="pt-4 border-t border-theme-gray-border space-y-2">
        <p className="text-[11px] font-semibold text-theme-gray-medium text-center uppercase tracking-wider">
          Quick 1-Click Demo Logins
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('ADMIN')}
            className="px-3 py-2 bg-blue-50 text-theme-blue rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200"
          >
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('CUSTOMER')}
            className="px-3 py-2 bg-gray-100 text-theme-black rounded-xl font-bold hover:bg-gray-200 transition-colors border border-gray-200"
          >
            Customer Demo
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-theme-gray-medium pt-2">
        Don&apos;t have an account?{' '}
        <Link href={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="font-bold text-theme-blue hover:underline">
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-center text-theme-gray-medium">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
