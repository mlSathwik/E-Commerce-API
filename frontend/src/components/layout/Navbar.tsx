import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  CheckCheck,
  ShieldAlert,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useCart } from '../../contexts/CartContext.js';
import { useWishlist } from '../../contexts/WishlistContext.js';
import { useTheme } from '../../contexts/ThemeContext.js';
import { useNotifications } from '../../contexts/NotificationContext.js';
import { productApi } from '../../api/productApi.js';
import { Product } from '../../types/index.js';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Autocomplete search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await productApi.getProducts({ search: searchQuery, limit: 5 });
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/90">
      {/* Top promotional notification bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-4 py-1.5 text-center text-xs font-semibold text-white">
        <span className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Grand Opening Sale! Use code <strong className="underline uppercase tracking-wide">WELCOME10</strong> for 10% OFF + Free Shipping on orders over ₹1,000!
        </span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-gray-950 dark:text-white">
              Shop<span className="text-indigo-600 dark:text-indigo-400">Sphere</span>
            </span>
            <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase -mt-1">Modern Commerce</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link to="/" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link>
          <Link to="/shop" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Shop</Link>
          <Link to="/deals" className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 transition hover:opacity-80">
            <Sparkles className="w-3.5 h-3.5" /> Deals
          </Link>
          <Link to="/compare" className="transition hover:text-indigo-600 dark:hover:text-indigo-400">Compare</Link>
        </nav>

        {/* Search Bar with Autocomplete */}
        <div ref={searchRef} className="relative hidden md:block w-72 lg:w-96">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full rounded-full border border-gray-200 bg-gray-50/80 py-2 pl-10 pr-4 text-xs sm:text-sm text-gray-900 placeholder-gray-400 transition duration-150 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Autocomplete Suggestions Popover */}
          {isSearchFocused && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Product Suggestions
              </div>
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  onClick={() => setIsSearchFocused(false)}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 truncate">
                    <p className="truncate text-xs font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">₹{(item.discountPrice ?? item.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-1.5 mt-1 dark:border-gray-800 text-center">
                <button
                  onClick={handleSearchSubmit}
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications Bell with Popover */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="Notifications"
              className="relative rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2 py-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-gray-400">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 rounded-xl transition cursor-pointer ${
                          n.isRead ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40' : 'bg-indigo-50/50 dark:bg-indigo-950/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{n.title}</p>
                          {!n.isRead && <span className="h-2 w-2 rounded-full bg-indigo-600"></span>}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative hidden sm:flex rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Menu */}
          <div ref={profileRef} className="relative">
            {isAuthenticated && user ? (
              <div>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 p-1 transition hover:border-indigo-500 dark:border-gray-800"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 pr-1 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in">
                    <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-block rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                        >
                          <ShieldAlert className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <UserIcon className="h-4 w-4" /> My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Package className="h-4 w-4" /> My Orders
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <UserIcon className="h-3.5 w-3.5" /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden rounded-xl p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950 space-y-3">
          <form onSubmit={handleSearchSubmit} className="pt-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </form>
          <div className="flex flex-col space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:text-indigo-600">Home</Link>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:text-indigo-600">Shop Catalog</Link>
            <Link to="/deals" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 text-rose-600 font-semibold">Flash Deals</Link>
            <Link to="/compare" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:text-indigo-600">Product Comparison</Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 text-indigo-600 font-bold">Admin Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
