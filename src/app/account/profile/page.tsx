'use client';

import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, Camera, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          avatarUrl: data.data.avatarUrl || '',
        });
        setPreviewImage(data.data.avatarUrl || null);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, avatarUrl: data.url }));
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch {
      setError('Image upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Profile updated successfully!');
        setUser(data.data);
        setEditing(false);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
      });
      setPreviewImage(user.avatarUrl || null);
    }
    setEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-theme-gray-border shadow-sm text-center text-xs text-theme-gray-medium">
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-theme-black">
            Personal Information & Profile
          </h1>
          <p className="text-xs text-theme-gray-medium mt-1">
            Review and update your identity, contact details, and account preferences.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-theme-gray-border shadow-sm space-y-6 text-xs">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4 pb-6 border-b border-theme-gray-border">
          <div className="relative">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-16 h-16 rounded-2xl object-cover border border-theme-gray-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-theme-blue text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            {editing && (
              <label className="absolute -bottom-1 -right-1 bg-theme-black text-white p-1.5 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors shadow">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-theme-black">{user?.name}</h2>
            <p className="text-theme-gray-medium">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-50 text-theme-blue rounded font-bold text-[10px]">
              {user?.role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="font-bold text-theme-black block mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Registered Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                required
              />
            </div>

            <div>
              <label className="font-bold text-theme-black block mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-theme-gray-border">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-theme-gray-border rounded-xl font-bold hover:bg-theme-gray-bg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-theme-blue text-white rounded-xl font-bold hover:bg-theme-blue-dark transition-colors shadow-sm disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-1">
              <span className="text-theme-gray-medium font-semibold">Full Legal Name</span>
              <p className="text-sm font-bold text-theme-black">{user?.name}</p>
            </div>

            <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-1">
              <span className="text-theme-gray-medium font-semibold">Registered Email</span>
              <p className="text-sm font-bold text-theme-black">{user?.email}</p>
            </div>

            <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-1">
              <span className="text-theme-gray-medium font-semibold">Telephone Contact</span>
              <p className="text-sm font-bold text-theme-black">{user?.phone || 'Not provided'}</p>
            </div>

            <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-1">
              <span className="text-theme-gray-medium font-semibold">Member Since</span>
              <p className="text-sm font-bold text-theme-black">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
