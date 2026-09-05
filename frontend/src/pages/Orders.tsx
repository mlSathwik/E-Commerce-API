import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import { orderApi } from '../api/orderApi.js';
import { Order, OrderStatus } from '../types/index.js';
import { formatPrice, formatDate } from '../utils/formatters.js';
import { Badge } from '../components/common/Badge.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const statuses = ['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getOrders(activeStatus === 'ALL' ? undefined : activeStatus);
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeStatus]);

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'default';
      case 'CONFIRMED':
        return 'purple';
      case 'CANCELLED':
        return 'danger';
      case 'PENDING':
      default:
        return 'warning';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
          My Orders
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Review your order history, track live shipments, and access invoices.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeStatus === status
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-10 w-10" />}
            title="No orders found"
            description={
              activeStatus === 'ALL'
                ? 'You have not placed any orders yet. Explore our premier catalog!'
                : `You do not have any orders with status "${activeStatus}".`
            }
            actionText="Start Shopping"
            actionLink="/shop"
          />
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 transition hover:shadow-md"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/70 p-4 sm:px-6 dark:border-gray-800 dark:bg-gray-800/40 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-gray-400">Order ID:</span>
                    <strong className="ml-1 text-gray-900 dark:text-white">#{order.orderNumber}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items preview in Order */}
              <div className="p-4 sm:p-6 divide-y divide-gray-100 dark:divide-gray-800">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        className="h-14 w-14 rounded-xl object-cover bg-gray-50 dark:bg-gray-800"
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-gray-400">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-3.5 dark:border-gray-800 dark:bg-gray-800/20 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Delivery Method: <strong className="text-gray-700 dark:text-gray-300">{order.deliveryMethod}</strong>
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View Details & Track <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
