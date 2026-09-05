import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { couponApi } from '../../api/couponApi.js';
import { Coupon } from '../../types/index.js';
import { formatDate, formatPrice } from '../../utils/formatters.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minimumOrder: 500,
    maxDiscount: 1500,
    expiryDate: '2026-12-31',
    usageLimit: 100,
  });

  const fetchCoupons = async () => {
    const res = await couponApi.getCoupons();
    setCoupons(res.data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await couponApi.createCoupon(formData as any);
      setCoupons((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
    } catch {
      alert('Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete coupon?')) return;
    await couponApi.deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Discount Coupons</h1>
          <p className="text-xs text-gray-400 mt-1">Configure percentage discounts, minimum carts, and expiry dates</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="md" className="gap-2">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl">
                  {c.code}
                </span>
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white mt-3">
                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Min Order: {formatPrice(c.minimumOrder)}
              </p>
              <p className="text-[11px] text-gray-400">
                Used {c.usedCount} of {c.usageLimit} times
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span>Expires: {formatDate(c.expiryDate)}</span>
              <button onClick={() => handleDelete(c.id)} className="text-rose-500 hover:text-rose-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Promo Coupon">
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Code (Uppercase)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FIXED">FIXED (₹)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Discount Value</label>
                <input
                  type="number"
                  required
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Min Order (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.minimumOrder}
                  onChange={(e) => setFormData({ ...formData, minimumOrder: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create Coupon</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
