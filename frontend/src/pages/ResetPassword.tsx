import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Lock, Key, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../api/authApi.js';
import { Button } from '../components/common/Button.js';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide a valid reset token');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authApi.resetPassword({ token: token.trim(), password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link or token may be expired.');
    } finally {
      setLoading(false);
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
            Set New Password
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Please enter your reset token and choose a strong new password.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900 dark:bg-rose-950/40 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-3 rounded-2xl bg-emerald-50 p-5 text-center text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-1" />
            <h4 className="text-sm font-bold">Password Successfully Reset!</h4>
            <p>Your password has been securely updated. Redirecting you to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reset Token *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Paste reset token here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <Key className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Password *
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
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 pl-10 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/20">
              Reset Password <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-gray-500 pt-2">
          <Link to="/login" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            Remember your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
