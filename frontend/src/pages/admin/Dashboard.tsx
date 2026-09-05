import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminApi } from '../../api/adminApi.js';
import { formatPrice, formatDate } from '../../utils/formatters.js';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboardStats();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
        <div className="h-80 rounded-3xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  const { kpis, revenueTrend, salesByCategory, topProducts, recentOrders } = data;
  const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Store Analytics Overview</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Real-time performance metrics, orders, revenue, and active catalog summary.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-gray-950 dark:text-white">
              {formatPrice(kpis.totalRevenue)}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> +18.4% vs last month
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-gray-950 dark:text-white">
              {kpis.totalOrders}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> +12.1% this week
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Customers</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-black text-gray-950 dark:text-white">
              {kpis.totalCustomers}
            </h2>
            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> Active accounts
            </div>
          </div>
        </div>

        {/* Total Products & Low stock warning */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Products</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                {kpis.totalProducts}
              </h2>
              <span className="text-xs text-gray-400">In 10 categories</span>
            </div>
            {kpis.lowStockCount > 0 && (
              <Link
                to="/admin/inventory"
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline"
              >
                <AlertTriangle className="h-3.5 w-3.5" /> {kpis.lowStockCount} Low Stock
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section: Revenue Area Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Revenue Trend Area Chart */}
        <div className="lg:col-span-8 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revenue & Sales Velocity</h3>
              <p className="text-xs text-gray-400">7-day performance trajectory</p>
            </div>
            <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              Live Feed
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatPrice(Number(val)), 'Revenue']}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Donut Chart */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sales By Category</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesByCategory.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [formatPrice(Number(val)), 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {salesByCategory.map((item: any, idx: number) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{formatPrice(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables: Top Selling Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Performing Products</h3>
            <Link to="/admin/products" className="text-xs font-semibold text-indigo-600 hover:underline">
              All Products →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topProducts.map((p: any) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="h-10 w-10 rounded-xl object-cover bg-gray-50 dark:bg-gray-800" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{p.name}</h5>
                    <p className="text-[10px] text-gray-400">{p.sku} • {p.salesCount} units sold</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:underline">
              All Orders →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentOrders.map((o: any) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white">#{o.orderNumber}</h5>
                  <p className="text-[10px] text-gray-400">{o.customerName} • {formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-gray-900 dark:text-white">{formatPrice(o.totalAmount)}</p>
                  <span className="inline-block text-[10px] font-bold text-indigo-600 uppercase">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
