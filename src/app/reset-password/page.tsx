'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed. The link may have expired.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Invalid or missing reset token. Please request a new password reset link.</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5">
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Password reset successfully! You can now sign in with your new password.</span>
        </div>
        <Link
          href="/login"
          className="w-full py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-all shadow-md flex items-center justify-center space-x-2"
        >
          <span>Go to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-theme-black block mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-9 pr-9 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              required
            />
            <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-3 text-theme-gray-medium hover:text-theme-black"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-theme-black block mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full pl-9 pr-9 py-2.5 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              required
            />
            <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-theme-gray-medium hover:text-theme-black"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-all shadow-md hover:shadow-blue-500/25 disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-theme-gray-border p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-sm">
            R
          </div>
          <h1 className="text-2xl font-black text-theme-black tracking-tight">
            Set a new password
          </h1>
          <p className="text-xs text-theme-gray-medium">
            Choose a strong password to protect your Rexpresso account.
          </p>
        </div>

        <Suspense fallback={<div className="text-xs text-theme-gray-medium text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="text-center text-xs text-theme-gray-medium pt-2">
          <Link href="/login" className="font-bold text-theme-blue hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
