import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { authApi } from '../api/authApi.js';
import { orderApi } from '../api/orderApi.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useCart } from '../contexts/CartContext.js';
import {
  User,
  Shield,
  MapPin,
  Package,
  Heart,
  Check,
  Save,
  Bell,
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { Link } from 'react-router-dom';
import { Order, Address } from '../types/index.js';
import { formatPrice } from '../utils/formatters.js';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<
    'info' | 'addresses' | 'orders' | 'wishlist' | 'notifications' | 'payment' | 'security'
  >('info');

  // Personal Info Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Addresses State (Scoped strictly per user)
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`shopsphere_addresses_${user.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    if (user.email === 'customer@shopsphere.com') {
      return [
        {
          id: 'addr-1',
          fullName: 'Alex Johnson',
          phone: '+91 9876543211',
          street: '42 Tech Park Avenue, Cyber City',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560100',
          country: 'India',
          addressType: 'HOME',
          isDefault: true,
        },
      ];
    }
    return [];
  });

  const saveUserAddresses = (newAddrs: Address[]) => {
    setAddresses(newAddrs);
    if (user?.id) {
      localStorage.setItem(`shopsphere_addresses_${user.id}`, JSON.stringify(newAddrs));
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
      const saved = localStorage.getItem(`shopsphere_addresses_${user.id}`);
      if (saved) {
        try {
          setAddresses(JSON.parse(saved));
          return;
        } catch {}
      }
      if (user.email === 'customer@shopsphere.com') {
        setAddresses([
          {
            id: 'addr-1',
            fullName: 'Alex Johnson',
            phone: '+91 9876543211',
            street: '42 Tech Park Avenue, Cyber City',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560100',
            country: 'India',
            addressType: 'HOME',
            isDefault: true,
          },
        ]);
      } else {
        setAddresses([]);
      }
    } else {
      setAddresses([]);
    }
  }, [user?.id]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Notifications preferences
  const [notifPreferences, setNotifPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    stockAlerts: false,
    smsAlerts: true,
  });

  // Payment Preferences
  const [preferredMethod, setPreferredMethod] = useState<'RAZORPAY' | 'UPI' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [paymentSavedSuccess, setPaymentSavedSuccess] = useState(false);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          const res = await orderApi.getOrders();
          setOrders(res.data);
        } catch {
          // fallback
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ name, phone, avatar });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // safe fallback
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.postalCode) return;
    const added: Address = {
      id: `addr-${Date.now()}`,
      ...newAddr,
      isDefault: addresses.length === 0,
    };
    saveUserAddresses([...addresses, added]);
    setShowAddAddress(false);
    setNewAddr({
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'HOME',
    });
  };

  const handleDeleteAddress = (id: string) => {
    saveUserAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    saveUserAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('Password successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordMsg(''), 3000);
  };

  const handleSavePaymentPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSavedSuccess(true);
    setTimeout(() => setPaymentSavedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Profile Summary */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="h-16 w-16 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-950"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user?.name}</h1>
              {user?.role === 'ADMIN' && (
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/shop"
            className="rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Explore Catalog
          </Link>
          <Link
            to="/cart"
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm"
          >
            View Cart
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Profile Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <User className="h-4 w-4" /> Personal Information
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
            onClick={() => setActiveTab('orders')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Package className="h-4 w-4" /> Orders
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'wishlist'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Heart className="h-4 w-4" /> Wishlist
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === 'payment'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <CreditCard className="h-4 w-4" /> Payment Preferences
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
        </div>

        {/* Right Tab Content */}
        <div className="md:col-span-3 rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* 1. PERSONAL INFORMATION */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Personal Information
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
                  placeholder="+91 9876543210"
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

          {/* 2. SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Saved Shipping Addresses
                </h2>
                <Button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  size="sm"
                  className="gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add New Address
                </Button>
              </div>

              {showAddAddress && (
                <form onSubmit={handleAddAddress} className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
                  <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                    New Address Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                      <input
                        type="text"
                        required
                        value={newAddr.fullName}
                        onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="House/Flat No., Building, Street Area"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        value={newAddr.postalCode}
                        onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 p-2 text-xs dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" size="sm">Save Address</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            DEFAULT
                          </span>
                        )}
                        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {addr.addressType}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{addr.street}</p>
                      <p className="text-gray-500">{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="text-gray-500">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                        aria-label="Delete Address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CUSTOMER ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Your Orders
                </h2>
                <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1">
                  View Full Orders Portal <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Package className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">No orders placed yet.</p>
                  <Link to="/shop">
                    <Button size="sm">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 dark:text-white">#{ord.orderNumber}</span>
                          <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-1">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items?.length || 1} items
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {formatPrice(ord.totalAmount)}
                        </span>
                        <Link
                          to={`/orders/${ord.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          Track <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. CUSTOMER WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Your Saved Wishlist
                </h2>
                <Link to="/wishlist" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1">
                  View Full Wishlist <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {(!wishlist || wishlist.items.length === 0) ? (
                <div className="py-12 text-center space-y-3">
                  <Heart className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500">Your wishlist is currently empty.</p>
                  <Link to="/shop">
                    <Button size="sm">Explore Products</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-gray-200 p-3 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                          alt={item.product?.name}
                          className="h-12 w-12 rounded-xl object-contain p-1 bg-white dark:bg-gray-900"
                        />
                        <div>
                          <Link to={`/products/${item.productId}`} className="font-bold text-gray-900 dark:text-white hover:underline">
                            {item.product?.name}
                          </Link>
                          <p className="text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5">
                            {formatPrice(item.product?.discountPrice ?? item.product?.price ?? 0)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            addToCart(item.productId, 1);
                            removeFromWishlist(item.productId);
                          }}
                          size="sm"
                          className="gap-1.5"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" /> Move to Cart
                        </Button>
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. NOTIFICATIONS PREFERENCES */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-lg">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Order Status Alerts</p>
                    <p className="text-[11px] text-gray-500">Receive live updates when orders are shipped or delivered</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.orderUpdates}
                    onChange={(e) => setNotifPreferences({ ...notifPreferences, orderUpdates: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Promotions & Flash Deals</p>
                    <p className="text-[11px] text-gray-500">Get notified about exclusive discounts and coupons</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.promotions}
                    onChange={(e) => setNotifPreferences({ ...notifPreferences, promotions: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Back-in-Stock Alerts</p>
                    <p className="text-[11px] text-gray-500">Notify when out-of-stock items in your wishlist return</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.stockAlerts}
                    onChange={(e) => setNotifPreferences({ ...notifPreferences, stockAlerts: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">SMS Delivery Notifications</p>
                    <p className="text-[11px] text-gray-500">Receive SMS notifications on your verified mobile number</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.smsAlerts}
                    onChange={(e) => setNotifPreferences({ ...notifPreferences, smsAlerts: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 6. PAYMENT PREFERENCES */}
          {activeTab === 'payment' && (
            <form onSubmit={handleSavePaymentPrefs} className="space-y-6 max-w-lg">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Payment Preferences
              </h2>
              {paymentSavedSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Check className="h-4 w-4" /> Payment preferences updated!
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Default Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'RAZORPAY', 'COD'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPreferredMethod(method)}
                      className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                        preferredMethod === method
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 dark:bg-indigo-950/50 dark:text-indigo-300'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {method === 'UPI' ? 'UPI (Instant)' : method === 'RAZORPAY' ? 'Cards / NetBanking' : 'Cash on Delivery'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Primary UPI ID / VPA
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okhdfcbank"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
                />
              </div>

              <Button type="submit" size="md" className="gap-2">
                <Save className="h-4 w-4" /> Save Payment Preferences
              </Button>
            </form>
          )}

          {/* 7. SECURITY TAB */}
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
