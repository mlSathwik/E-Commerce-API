import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import { formatPrice } from '../../utils/formatters.js';
import { Button } from '../../components/common/Button.js';

export const AdminInventory: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<Record<string, number>>({});

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getInventory();
      setInventoryData(res.data);
      const initialStock: Record<string, number> = {};
      res.data.items.forEach((item: any) => {
        initialStock[item.id] = item.stock;
      });
      setEditStock(initialStock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdate = async (productId: string) => {
    setUpdatingId(productId);
    try {
      const newStock = editStock[productId];
      await adminApi.updateStock(productId, newStock);
      await fetchInventory();
    } catch {
      alert('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !inventoryData) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading inventory status...</div>;
  }

  const { items, lowStockAlerts, counts } = inventoryData;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Inventory Management</h1>
        <p className="text-xs text-gray-400 mt-1">Real-time stock monitoring and replenishment thresholds</p>
      </div>

      {/* KPI stock counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-bold text-gray-400 uppercase">Total SKUs</span>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{counts.total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-bold text-emerald-600 uppercase">Healthy Stock</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{counts.inStock}</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-bold text-amber-500 uppercase">Low Stock (≤5)</span>
          <p className="text-xl font-black text-amber-500 mt-1">{counts.lowStock}</p>
        </div>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-[11px] font-bold text-rose-500 uppercase">Out of Stock</span>
          <p className="text-xl font-black text-rose-500 mt-1">{counts.outOfStock}</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Urgent Restock Warning: {lowStockAlerts.length} products have low or zero units!</span>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="overflow-x-auto rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/30">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock Status</th>
              <th className="p-4">Current Units</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                <td className="p-4 font-bold text-gray-900 dark:text-white max-w-xs truncate">{item.name}</td>
                <td className="p-4 font-mono text-gray-500">{item.sku}</td>
                <td className="p-4 text-gray-500">{item.category}</td>
                <td className="p-4">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      item.status === 'Out of Stock'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min={0}
                    value={editStock[item.id] ?? item.stock}
                    onChange={(e) =>
                      setEditStock({ ...editStock, [item.id]: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-20 rounded-xl border border-gray-200 bg-white p-1 text-center font-bold dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </td>
                <td className="p-4">
                  <Button
                    size="sm"
                    loading={updatingId === item.id}
                    onClick={() => handleUpdate(item.id)}
                  >
                    Update
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
