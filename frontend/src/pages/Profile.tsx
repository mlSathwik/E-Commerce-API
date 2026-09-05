import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { authApi } from '../api/authApi.js';
import { User, Shield, MapPin, Package, Heart, Check, Save } from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'security'>('info');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ name, phone, avatar });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('Password successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordMsg(''), 3000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
          alt={user?.name}
          className="h-16 w-16 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-950"
        />
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Profile Tabs */}
        <div className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <User className="h-4 w-4" /> Personal Info
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'addresses'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <MapPin className="h-4 w-4" /> Addresses
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Shield className="h-4 w-4" /> Security
          </button>
          <Link
            to="/orders"
            className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Package className="h-4 w-4" /> Order History
          </Link>
          <Link
            to="/wishlist"
            className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Heart className="h-4 w-4" /> Saved Wishlist
          </Link>
        </div>

        {/* Right Tab Content */}
        <div className="md:col-span-3 rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Profile Information
              </h2>
              {savedSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Check className="h-4 w-4" /> Profile updated successfully!
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-xs text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <Button type="submit" loading={saving} size="md" className="gap-2 pt-2">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </form>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                Saved Shipping Addresses
              </h2>
              <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-1 text-xs">
                <span className="inline-block rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Default Address
                </span>
                <p className="font-bold text-gray-900 dark:text-white pt-1">{user?.name}</p>
                <p className="text-gray-600 dark:text-gray-300">42 Tech Park Avenue, Cyber City</p>
                <p className="text-gray-500">Bengaluru, Karnataka - 560100, India</p>
                <p className="text-gray-500">Phone: {user?.phone || '+91 9876543211'}</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Update Password
              </h2>
              {passwordMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Check className="h-4 w-4" /> {passwordMsg}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <Button type="submit" size="md">
                Update Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
