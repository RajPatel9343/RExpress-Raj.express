'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-theme-gray-border p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-sm">
            R
          </div>
          <h1 className="text-2xl font-black text-theme-black tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-xs text-theme-gray-medium">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-5">
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                If <strong>{email}</strong> is registered, check your inbox for a password reset link.
              </span>
            </div>
            <p className="text-xs text-theme-gray-medium text-center">
              Didn&apos;t receive it? Check your spam folder or{' '}
              <button
                onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-theme-blue hover:underline font-bold"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-all shadow-md hover:shadow-blue-500/25 disabled:bg-gray-400 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        <div className="text-center text-xs text-theme-gray-medium pt-2">
          Remembered your password?{' '}
          <Link href="/login" className="font-bold text-theme-blue hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
