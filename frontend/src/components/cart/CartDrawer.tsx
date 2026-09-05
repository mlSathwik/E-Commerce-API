import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.js';
import { formatPrice } from '../../utils/formatters.js';
import { Button } from '../common/Button.js';
import { couponApi } from '../../api/couponApi.js';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = cart?.freeShippingThreshold || 1000;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping + Math.round((subtotal - discountAmount) * 0.05));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
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
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Your Shopping Cart ({cart?.itemCount || 0})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free shipping progress indicator */}
          <div className="border-b border-gray-100 bg-indigo-50/50 px-6 py-3.5 dark:border-gray-800 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                <Truck className="h-4 w-4" />
                {progressPercent >= 100
                  ? '🎉 You unlocked FREE Delivery!'
                  : `Add ${formatPrice(freeShippingThreshold - subtotal)} more for FREE Delivery`}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your cart is empty</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                  Explore our modern collection and add items to your cart.
                </p>
                <Button
                  size="sm"
                  className="mt-5"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <img
                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                    alt={item.product?.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {item.product?.name}
                      </h4>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {formatPrice(item.effectivePrice)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-rose-500 transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs uppercase text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <Tag className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                </div>
                <Button type="submit" size="sm" variant="secondary" loading={isValidatingCoupon}>
                  Apply
                </Button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                  <span>Coupon {appliedCoupon} applied!</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {couponError && <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(Math.round((subtotal - discountAmount) * 0.05))}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-gray-900 dark:border-gray-800 dark:text-white">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={handleCheckout} className="w-full gap-2" size="md">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  View Full Cart Page
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
