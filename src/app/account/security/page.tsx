'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function SecurityPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { label: '', color: '' };
    if (pw.length < 6) return { label: 'Too short', color: 'bg-red-400' };
    if (pw.length < 8) return { label: 'Weak', color: 'bg-orange-400' };
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (score >= 4) return { label: 'Very Strong', color: 'bg-green-500' };
    if (score === 3) return { label: 'Strong', color: 'bg-blue-500' };
    return { label: 'Medium', color: 'bg-yellow-400' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Password changed successfully! Redirecting to login...');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => router.push('/login'), 2500);
      } else {
        setError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 text-theme-blue rounded-2xl flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-theme-black">
              Security & Password
            </h1>
            <p className="text-xs text-theme-gray-medium">
              Update your login credentials and keep your account secure.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-5">
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-theme-black block mb-1">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full pl-9 pr-10 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
              <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3 text-theme-gray-medium hover:text-theme-black">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-theme-black block mb-1">New Password *</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-9 pr-10 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
              <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-theme-gray-medium hover:text-theme-black">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.label === 'Too short' ? '15%' : strength.label === 'Weak' ? '30%' : strength.label === 'Medium' ? '55%' : strength.label === 'Strong' ? '75%' : '100%' }} />
                </div>
                <span className={`text-[10px] font-bold ${strength.label === 'Very Strong' ? 'text-green-600' : strength.label === 'Strong' ? 'text-blue-600' : strength.label === 'Medium' ? 'text-yellow-600' : 'text-red-500'}`}>{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-theme-black block mb-1">Confirm New Password *</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full pl-9 pr-10 py-2.5 border rounded-xl focus:outline-none focus:border-theme-blue ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400 bg-red-50' : confirmPassword && confirmPassword === newPassword ? 'border-green-400' : 'border-theme-gray-border'}`}
                required
              />
              <Lock className="w-4 h-4 text-theme-gray-medium absolute left-3 top-3" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-theme-gray-medium hover:text-theme-black">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && <p className="text-[10px] text-red-500 mt-1">Passwords do not match.</p>}
            {confirmPassword && confirmPassword === newPassword && <p className="text-[10px] text-green-600 mt-1">✓ Passwords match.</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !!(confirmPassword && confirmPassword !== newPassword)}
              className="w-full py-3 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-theme-gray-border">
          <p className="text-[11px] text-theme-gray-medium">
            <strong>Security note:</strong> After changing your password, you will be signed out of all devices and must log in again with your new password.
          </p>
        </div>
      </div>
    </div>
  );
}
