import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  Home,
  MapPin,
  Calendar,
  CreditCard,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { orderApi } from '../api/orderApi.js';
import { Order, OrderStatus } from '../types/index.js';
import { formatDate, formatDateTime, formatPrice } from '../utils/formatters.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await orderApi.getOrderById(id);
        setOrder(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center animate-pulse">
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Order Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">{error || 'Unable to retrieve order details.'}</p>
        <Link to="/orders" className="mt-6 inline-block">
          <Button size="md">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  const timelineSteps: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'PENDING', label: 'Order Placed', icon: Clock },
    { status: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle },
    { status: 'PROCESSING', label: 'Processing at Hub', icon: Package },
    { status: 'SHIPPED', label: 'Shipped via Carrier', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  // Determine current step index
  const statusRank: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
  };

  const currentRank = statusRank[order.status] ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Orders
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Status:</span>
          <Badge
            variant={
              order.status === 'DELIVERED'
                ? 'success'
                : order.status === 'CANCELLED'
                ? 'danger'
                : 'default'
            }
            size="md"
          >
            {order.status}
          </Badge>
        </div>
      </div>

      {/* Visual Timeline Section */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-8">
          Delivery Timeline
        </h2>

        {order.status === 'CANCELLED' ? (
          <div className="rounded-2xl bg-rose-50 p-6 text-center text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <h4 className="text-base font-bold">This order was cancelled</h4>
            <p className="text-xs mt-1 text-rose-500">Inventory was restored and refund was issued if paid online.</p>
          </div>
        ) : (
          <div className="relative flex flex-col md:flex-row justify-between gap-6">
            {/* Horizontal progress connecting line */}
            <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-800 -z-0">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${(Math.max(0, currentRank) / (timelineSteps.length - 1)) * 100}%` }}
              />
            </div>

            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentRank >= idx;
              const isCurrent = currentRank === idx;

              return (
                <div key={step.status} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-center">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all shadow-md ${
                      isCompleted
                        ? 'bg-indigo-600 text-white shadow-indigo-500/30 ring-4 ring-indigo-50 dark:ring-indigo-950'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left md:text-center">
                    <h5 className={`text-xs font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                      {step.label}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {isCurrent ? 'Current Status' : isCompleted ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid of Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Address */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <MapPin className="h-4 w-4 text-indigo-600" /> Shipping Destination
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold">{order.address?.fullName}</p>
          <p className="text-gray-500">{order.address?.street}</p>
          <p className="text-gray-500">{order.address?.city}, {order.address?.state} - {order.address?.postalCode}</p>
          <p className="text-gray-500">Phone: {order.address?.phone}</p>
        </div>

        {/* Payment Details */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <CreditCard className="h-4 w-4 text-indigo-600" /> Payment Information
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            Method: {order.payment?.method || 'RAZORPAY'}
          </p>
          <p className="text-gray-500">
            Payment Status: <strong className="text-emerald-600 dark:text-emerald-400">{order.payment?.status || 'COMPLETED'}</strong>
          </p>
          {order.payment?.razorpayPaymentId && (
            <p className="text-gray-400 truncate">Txn ID: {order.payment.razorpayPaymentId}</p>
          )}
        </div>

        {/* Delivery Estimate */}
        <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Calendar className="h-4 w-4 text-indigo-600" /> Delivery Target
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            Method: {order.deliveryMethod === 'EXPRESS' ? 'Priority Express' : 'Standard Delivery'}
          </p>
          <p className="text-gray-500">
            Estimated Arrival: <strong className="text-indigo-600 dark:text-indigo-400">{order.deliveryEstimate ? formatDate(order.deliveryEstimate) : '3-5 Days'}</strong>
          </p>
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Purchased Items</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {order.items?.map((item) => (
            <div key={item.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                  alt={item.name}
                  className="h-16 w-16 rounded-2xl object-cover bg-gray-50 dark:bg-gray-800"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
              </div>
              <span className="text-sm font-black text-gray-900 dark:text-white">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary Breakdown */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-xs dark:border-gray-800 max-w-xs ml-auto">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Coupon Discount:</span>
              <span className="font-semibold">-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Shipping:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax (5% GST):</span>
            <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.taxAmount)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between text-base font-black text-gray-900 dark:border-gray-800 dark:text-white">
            <span>Total Paid:</span>
            <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
