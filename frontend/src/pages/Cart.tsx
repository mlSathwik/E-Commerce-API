import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Truck, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { formatPrice } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { couponApi } from '../api/couponApi.js';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-10 w-10" />}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any products to your cart yet. Explore our premier catalog."
          actionText="Explore Products"
          actionLink="/shop"
        />
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const freeShippingThreshold = cart.freeShippingThreshold || 1000;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 99;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const estimatedTax = Math.round((subtotal - discountAmount) * 0.05);
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping + estimatedTax);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidating(true);
    setCouponError('');
    try {
      const res = await couponApi.validateCoupon(couponCode.trim(), subtotal);
      setDiscountAmount(res.data.discountAmount);
      setAppliedCoupon(res.data.coupon.code || couponCode.toUpperCase());
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
      setDiscountAmount(0);
      setAppliedCoupon(null);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            You have {cart.itemCount} items ready for checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
        >
          Clear All Items
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            {progressPercent >= 100
              ? '🎉 Congratulations! You qualify for FREE Delivery!'
              : `Add ${formatPrice(freeShippingThreshold - subtotal)} more to qualify for FREE DELIVERY!`}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-200/60 dark:bg-gray-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid: Left Cart Items, Right Order Summary */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-8 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {cart.items.map((item) => (
            <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                  alt={item.product?.name}
                  className="h-20 w-20 rounded-2xl object-cover bg-gray-50 dark:bg-gray-800"
                />
                <div>
                  <Link
                    to={`/products/${item.productId}`}
                    className="text-sm font-bold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {item.product?.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Unit Price: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatPrice(item.effectivePrice)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-end sm:self-center">
                {/* Quantity picker */}
                <div className="flex items-center rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-800 dark:text-gray-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <span className="text-sm font-black text-gray-900 dark:text-white w-24 text-right">
                  {formatPrice(item.subtotal)}
                </span>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-6 flex justify-between items-center">
            <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Order Summary Box */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Order Summary</h2>

          {/* Coupon input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Have a Promo Code?
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs uppercase text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <Tag className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <Button type="submit" size="sm" variant="secondary" loading={isValidating}>
                Apply
              </Button>
            </div>
            {appliedCoupon && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Coupon {appliedCoupon} applied successfully!
              </p>
            )}
            {couponError && <p className="text-xs text-rose-500 font-medium">{couponError}</p>}
          </form>

          {/* Price Breakdown */}
          <div className="space-y-2.5 border-t border-gray-100 pt-4 text-xs dark:border-gray-800">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span className="font-semibold">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Shipping</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {shipping === 0 ? 'FREE' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Estimated GST (5%)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(estimatedTax)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900 dark:border-gray-800 dark:text-white">
              <span>Total Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <Button onClick={() => navigate('/checkout')} size="lg" className="w-full gap-2 shadow-lg shadow-indigo-500/20">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Safe & encrypted checkout
          </div>
        </div>
      </div>
    </div>
  );
};
