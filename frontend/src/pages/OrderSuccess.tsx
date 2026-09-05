import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle, ArrowRight, ShoppingBag, Package, Calendar, ShieldCheck } from 'lucide-react';
import { orderApi } from '../api/orderApi.js';
import { Order } from '../types/index.js';
import { formatDate, formatPrice } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';

export const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fire festive confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Safe fallback
    }

    const fetchOrder = async () => {
      if (!id) return;
      try {
        const res = await orderApi.getOrderById(id);
        setOrder(res.data);
      } catch {
        // Safe fail
      }
    };
    fetchOrder();
  }, [id]);

  const estimatedDelivery = order?.deliveryEstimate
    ? formatDate(order.deliveryEstimate)
    : 'In 3 to 5 business days';

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10 animate-bounce">
        <CheckCircle className="h-14 w-14" />
      </div>

      <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
        Payment & Order Confirmed
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
        Thank You for Your Order!
      </h1>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Your order has been registered and is now being prepared for dispatch at our nearest fulfillment center.
      </p>

      {/* Order Details Card */}
      <div className="mt-8 rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 text-left max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">Order ID</span>
            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
              {order?.orderNumber || id}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Estimated Delivery</span>
            <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1 justify-end">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              {estimatedDelivery}
            </p>
          </div>
        </div>

        {order && (
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>Items:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{order.items?.length || 1} items</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-black text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs truncate">
                {order.address?.street}, {order.address?.city}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to={`/orders/${id}`}>
          <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-indigo-500/20">
            <Package className="h-4 w-4" /> Track Order Status
          </Button>
        </Link>
        <Link to="/shop">
          <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
