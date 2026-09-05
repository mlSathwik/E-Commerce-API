import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { Button } from '../components/common/Button.js';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    try {
      await register({ name, email, password, phone });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
            Create Your Account
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Join ShopSphere to enjoy personalized recommendations and exclusive deals
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900 dark:bg-rose-950/40">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
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
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/20">
            Create Account <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
