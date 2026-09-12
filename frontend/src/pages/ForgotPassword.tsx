import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../api/authApi.js';
import { Button } from '../components/common/Button.js';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ message: string; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      setSuccessData({
        message: res.message || 'Password reset instructions have been generated.',
        resetToken: res.data?.resetToken,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
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
            Reset Your Password
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter your registered email address and we'll generate a secure reset link.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900 dark:bg-rose-950/40 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="space-y-4 rounded-2xl bg-emerald-50/80 p-5 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" /> Reset Request Generated
            </div>
            <p>{successData.message}</p>
            {successData.resetToken && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold block mb-1">Testing Token:</span>
                <code className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono break-all">
                  {successData.resetToken}
                </code>
                <div className="mt-3">
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(successData.resetToken)}`}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                  >
                    Proceed to Reset Password Page <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
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

            <Button type="submit" loading={loading} size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/20">
              Send Reset Link <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-gray-500 pt-2">
          <Link to="/login" className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline dark:text-indigo-400">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
