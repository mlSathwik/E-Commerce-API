import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { authApi } from '../../api/authApi.js';
import { Button } from '../../components/common/Button.js';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, quickDemoLogin, loading, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await authApi.adminLogin({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('shopsphere_access_token', res.data.accessToken);
        localStorage.setItem('shopsphere_refresh_token', res.data.refreshToken);
        window.location.href = '/admin';
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Access Denied: Admin privileges required to access this portal.'
      );
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    try {
      await quickDemoLogin('admin');
      window.location.href = '/admin';
    } catch (err: any) {
      setError('Failed to authenticate demo admin.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            ShopSphere Backoffice
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Administrative Management Console & Security Gateway
          </p>
        </div>

        {/* 1-Click Demo Admin Button */}
        <div className="rounded-2xl bg-indigo-950/40 p-3.5 border border-indigo-900/60 text-center">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-2">
            ⚡ Quick Evaluation Admin Access
          </span>
          <Button
            type="button"
            onClick={handleDemoAdmin}
            size="sm"
            className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold gap-2 text-white"
          >
            <ShieldCheck className="h-4 w-4" /> 1-Click Login as Demo Admin
          </Button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-950/50 p-3.5 text-xs font-semibold text-rose-300 border border-rose-900/60 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@shopsphere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30"
          >
            Authenticate Admin <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          <Link to="/" className="text-slate-400 hover:text-indigo-400 underline">
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
