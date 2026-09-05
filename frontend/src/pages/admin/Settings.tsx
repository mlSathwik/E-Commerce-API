import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Check } from 'lucide-react';
import { Button } from '../../components/common/Button.js';

export const AdminSettings: React.FC = () => {
  const [storeName, setStoreName] = useState('ShopSphere');
  const [supportEmail, setSupportEmail] = useState('support@shopsphere.com');
  const [currency, setCurrency] = useState('INR (₹)');
  const [freeShippingMin, setFreeShippingMin] = useState(1000);
  const [taxRate, setTaxRate] = useState(5);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Store Settings</h1>
        <p className="text-xs text-gray-400 mt-1">Configure global store currency, shipping thresholds, and taxes</p>
      </div>

      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isSaved && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Check className="h-4 w-4" /> Store settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Storefront Name
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Customer Support Email
            </label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Store Currency
              </label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-gray-500 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                GST / Sales Tax Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Free Shipping Order Minimum (₹)
            </label>
            <input
              type="number"
              min={0}
              value={freeShippingMin}
              onChange={(e) => setFreeShippingMin(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Orders whose subtotal meets or exceeds this amount receive automatic free shipping.
            </span>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <Button type="submit" size="md" className="gap-2">
              <Save className="h-4 w-4" /> Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
