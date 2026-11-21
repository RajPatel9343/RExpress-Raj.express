'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to terms and privacy policy');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password, phone);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl border border-theme-gray-border p-8 sm:p-10 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-sm">
          R
        </div>
        <h1 className="text-2xl font-black text-theme-black tracking-tight">
          Create an Account
        </h1>
        <p className="text-xs text-theme-gray-medium">
          Join Rexpresso for express checkout, order tracking, and exclusive discounts.
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
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raj Patel"
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              required
            />
            <User className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-theme-black block mb-1">
            Email Address *
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
          <label className="text-xs font-bold text-theme-black block mb-1">
            Mobile Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
            />
            <Phone className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-theme-black block mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              required
            />
            <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-theme-black block mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              required
            />
            <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 text-theme-blue rounded border-theme-gray-border focus:ring-theme-blue"
          />
          <label htmlFor="terms" className="text-[11px] text-theme-gray-medium">
            I agree to the{' '}
            <Link href="/terms" className="text-theme-blue underline">
              Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-theme-blue underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-all shadow-md hover:shadow-blue-500/25 disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-theme-gray-medium pt-2">
        Already have an account?{' '}
        <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="font-bold text-theme-blue hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-center text-theme-gray-medium">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
