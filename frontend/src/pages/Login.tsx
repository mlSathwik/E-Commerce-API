import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/common/Button.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login, quickDemoLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const handleDemo = async (role: 'admin' | 'customer') => {
    setError('');
    try {
      await quickDemoLogin(role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      setError('Demo login failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-200/80 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Sign in to access your cart, orders, and wishlist
          </p>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div className="rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100 dark:border-indigo-950 dark:bg-indigo-950/30 text-center space-y-2">
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
            ⚡ Quick Evaluation Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white p-2 text-xs font-bold text-indigo-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-indigo-300"
            >
              <User className="h-3.5 w-3.5" /> Customer Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 p-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900 dark:bg-rose-950/40">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
              <span>Remember me</span>
            </label>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/20">
            Sign In <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
