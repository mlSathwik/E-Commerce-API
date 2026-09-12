import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Eye, CheckCircle, Truck, XCircle } from 'lucide-react';
import { orderApi } from '../../api/orderApi.js';
import { Order, OrderStatus } from '../../types/index.js';
import { formatPrice, formatDate } from '../../utils/formatters.js';
import { Badge } from '../../components/common/Badge.js';
import { Button } from '../../components/common/Button.js';
import { Modal } from '../../components/common/Modal.js';
import { TableRowSkeleton } from '../../components/common/Skeleton.js';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders();
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await orderApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Customer Orders</h1>
        <p className="text-xs text-gray-400 mt-1">Manage fulfillment, shipping statuses, and refunds</p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-800/30">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                  <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    #{order.orderNumber}
                  </td>
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">
                    {order.address?.fullName || 'Customer'}
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="p-4 font-black text-gray-900 dark:text-white">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="p-4">
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800">
                      {order.payment?.method || 'RAZORPAY'}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                      className="rounded-xl border border-gray-200 bg-white p-1.5 text-xs font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber} Details`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <p className="text-gray-400">Customer: <strong className="text-gray-900 dark:text-white">{selectedOrder.address?.fullName}</strong></p>
                <p className="text-gray-400">Phone: {selectedOrder.address?.phone}</p>
                <p className="text-gray-400">Address: {selectedOrder.address?.street}, {selectedOrder.address?.city}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
                <p className="text-[11px] text-gray-400">{selectedOrder.deliveryMethod}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-gray-900 dark:text-white">Items:</h5>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-bold">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                variant="outline"
                className="gap-1 flex-1"
              >
                <Truck className="h-3.5 w-3.5" /> Mark Shipped
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                variant="primary"
                className="gap-1 flex-1"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Mark Delivered
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
