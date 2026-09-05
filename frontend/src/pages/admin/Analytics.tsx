import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { adminApi } from '../../api/adminApi.js';
import { formatPrice } from '../../utils/formatters.js';

export const AdminAnalytics: React.FC = () => {
  const [range, setRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getAnalytics(range);
        setAnalyticsData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  const ranges = [
    { label: '7 Days', val: '7d' },
    { label: '30 Days', val: '30d' },
    { label: '90 Days', val: '90d' },
    { label: '1 Year', val: '1y' },
  ];

  if (loading || !analyticsData) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading comprehensive analytics...</div>;
  }

  const { performanceData, summary } = analyticsData;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Business Analytics</h1>
          <p className="text-xs text-gray-400 mt-1">Multi-period revenue, conversion dynamics, and volume reports</p>
        </div>

        {/* Range Selector */}
        <div className="flex gap-1.5 rounded-2xl bg-white p-1 border border-gray-200 dark:border-gray-800 dark:bg-gray-900">
          {ranges.map((r) => (
            <button
              key={r.val}
              onClick={() => setRange(r.val)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                range === r.val
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-400 font-semibold uppercase">Revenue Growth</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary.growth}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Year-over-year compounding rate</p>
        </div>
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-400 font-semibold uppercase">Average Order Value (AOV)</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatPrice(summary.averageOrderValue)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Across all completed checkout baskets</p>
        </div>
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs text-gray-400 font-semibold uppercase">Repeat Customer Rate</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{summary.repeatCustomerRate}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">High shopper retention loyalty index</p>
        </div>
      </div>

      {/* Chart 1: Revenue Timeline */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revenue Timeline ({range.toUpperCase()})</h3>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: any) => [formatPrice(Number(v)), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Orders vs Conversion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Order Volume</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(v: any) => [v, 'Orders Completed']} />
                <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Conversion Rate (%)</h3>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 6]} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Conversion']} />
                <Line type="monotone" dataKey="conversionRate" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
