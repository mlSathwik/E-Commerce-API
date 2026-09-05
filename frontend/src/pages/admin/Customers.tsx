import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { formatPrice, formatDate } from '../../utils/formatters.js';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getCustomers();
        setCustomers(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Customers</h1>
        <p className="text-xs text-gray-400 mt-1">Manage registered buyers, order frequencies, and lifetime value</p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/30">
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Total Orders</th>
              <th className="p-4">Lifetime Spent</th>
              <th className="p-4">Member Since</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} alt={c.name} className="h-9 w-9 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{c.name}</h4>
                      <p className="text-[10px] text-gray-400">{c.phone || 'No phone'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-300">{c.email}</td>
                <td className="p-4 font-bold text-gray-900 dark:text-white">{c.orderCount} orders</td>
                <td className="p-4 font-black text-indigo-600 dark:text-indigo-400">{formatPrice(c.totalSpent)}</td>
                <td className="p-4 text-gray-400">{formatDate(c.joinedAt)}</td>
                <td className="p-4">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
