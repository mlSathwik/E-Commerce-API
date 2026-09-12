import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Plus,
  ArrowRight,
  Check,
  AlertTriangle,
  Sparkles,
  Home as HomeIcon,
  Briefcase,
  Building2,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { orderApi } from '../api/orderApi.js';
import { paymentApi } from '../api/paymentApi.js';
import { couponApi } from '../api/couponApi.js';
import { formatPrice } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Address
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Alex Johnson',
    phone: user?.phone || '+91 9876543211',
    street: '42 Tech Park Avenue, Cyber City',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100',
    country: 'India',
    addressType: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
  });

  // Step 2: Delivery Option
  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'EMI' | 'COD'>('RAZORPAY');
  const [selectedEmiMonths, setSelectedEmiMonths] = useState<number>(6);

  // Coupon code state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="mt-6 inline-block">
          <Button size="md">Browse Catalog</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotal;
  const deliveryCost = deliveryMethod === 'EXPRESS' ? 99 : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxableAmount * 0.05); // 5% GST
  const totalAmount = taxableAmount + deliveryCost + tax;

  const isCodAllowed = totalAmount <= 50000;

  // Handle Coupon Apply
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponApi.validateCoupon(couponCode.trim(), subtotal);
      if (res.success && res.data) {
        setAppliedCoupon({
          code: res.data.coupon.code || couponCode.trim().toUpperCase(),
          discountAmount: res.data.discountAmount,
          description: `${res.data.coupon.discountValue}% OFF discount applied`,
        });
        setCouponCode('');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    // Pre-flight check: COD limit
    if (paymentMethod === 'COD' && totalAmount > 50000) {
      setError('Cash on Delivery is limited to ₹50,000. Please select Razorpay or EMI.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on backend
      const res = await orderApi.createOrder({
        shippingAddress,
        deliveryMethod,
        paymentMethod,
        emiMonths: paymentMethod === 'EMI' ? selectedEmiMonths : undefined,
        couponCode: appliedCoupon?.code,
      });

      const order = res.data.order;
      const razorpayOrder = res.data.razorpayOrder;

      // 2. If COD or direct EMI confirmation, navigate to success
      if (paymentMethod === 'COD' || paymentMethod === 'EMI') {
        await refreshCart();
        navigate(`/order-success/${order.id}`);
        return;
      }

      // 3. Razorpay Online Payment Flow
      if (paymentMethod === 'RAZORPAY') {
        const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_shopsphere_mock_id';

        const razorpayOptions = {
          key: rzpKey,
          amount: Math.round(order.totalAmount * 100),
          currency: 'INR',
          name: 'ShopSphere E-Commerce',
          description: `Order #${order.orderNumber}`,
          order_id: razorpayOrder?.id,
          prefill: {
            name: shippingAddress.fullName,
            email: user?.email,
            contact: shippingAddress.phone,
          },
          theme: {
            color: '#4f46e5',
          },
          handler: async (response: any) => {
            try {
              await paymentApi.verifyPayment({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id || razorpayOrder?.id,
                razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpaySignature: response.razorpay_signature || 'verified_mock_sig',
              });
              await refreshCart();
              navigate(`/order-success/${order.id}`);
            } catch (verErr) {
              setError('Payment verification failed. Please check your order in My Orders.');
              navigate(`/orders/${order.id}`);
            }
          },
        };

        if (typeof (window as any).Razorpay !== 'undefined') {
          const rzp = new (window as any).Razorpay(razorpayOptions);
          rzp.on('payment.failed', function (response: any) {
            setError(response.error?.description || 'Payment Failed');
          });
          rzp.open();
        } else {
          // In test / offline simulation environments
          await paymentApi.verifyPayment({
            orderId: order.id,
            razorpayOrderId: razorpayOrder?.id || `order_${Date.now()}`,
            razorpayPaymentId: `pay_${Date.now()}`,
            razorpaySignature: 'simulated_sig',
          });
          await refreshCart();
          navigate(`/order-success/${order.id}`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please check stock availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Checkout Steps Progress Header */}
      <div className="mb-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</span>
            Address
          </button>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <button
            onClick={() => step > 2 && setStep(2)}
            className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
            Delivery
          </button>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <button
            onClick={() => step > 3 && setStep(3)}
            className={`flex items-center gap-1.5 ${step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
            Payment
          </button>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <span className={`flex items-center gap-1.5 ${step === 4 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step === 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>4</span>
            Review
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 max-w-4xl mx-auto rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-200 dark:border-rose-900 dark:bg-rose-950/40">
          {error}
        </div>
      )}

      {/* Main Grid: Steps on Left, Order Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shipping Address</h2>
              </div>

              {/* Address Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Address Type
                </label>
                <div className="flex gap-3">
                  {[
                    { type: 'HOME', label: 'Home', icon: HomeIcon },
                    { type: 'WORK', label: 'Work', icon: Briefcase },
                    { type: 'OTHER', label: 'Other', icon: Building2 },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setShippingAddress({ ...shippingAddress, addressType: type as any })}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition border ${
                        shippingAddress.addressType === type
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Postal / PIN Code (6 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Street Address / Flat No. / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setStep(2)} size="md" className="gap-2">
                  Continue to Delivery <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Method */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <Truck className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Choose Delivery Speed</h2>
              </div>

              <div className="space-y-4">
                <label
                  onClick={() => setDeliveryMethod('STANDARD')}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 cursor-pointer transition ${
                    deliveryMethod === 'STANDARD'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${deliveryMethod === 'STANDARD' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                      {deliveryMethod === 'STANDARD' && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Standard Delivery (3-5 Business Days)</h4>
                      <p className="text-[11px] text-gray-500">Free courier shipping with tracking</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    FREE
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryMethod('EXPRESS')}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 cursor-pointer transition ${
                    deliveryMethod === 'EXPRESS'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${deliveryMethod === 'EXPRESS' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                      {deliveryMethod === 'EXPRESS' && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Priority Express (1-2 Business Days)</h4>
                      <p className="text-[11px] text-gray-500">Fast-tracked courier dispatch with daily SMS alerts</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                    ₹99
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <Button onClick={() => setStep(1)} variant="outline" size="md">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} size="md" className="gap-2">
                  Continue to Payment <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select Payment Method</h2>
              </div>

              <div className="space-y-4">
                {/* 1. Razorpay */}
                <label
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 cursor-pointer transition ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMethod === 'RAZORPAY' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                      {paymentMethod === 'RAZORPAY' && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        Online Payment (Razorpay: UPI, Credit/Debit Cards, NetBanking)
                      </h4>
                      <p className="text-[11px] text-gray-500">100% Secure 256-bit SSL encrypted transaction</p>
                    </div>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                </label>

                {/* 2. Easy EMI */}
                <div
                  className={`rounded-2xl border-2 p-4 transition ${
                    paymentMethod === 'EMI'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div
                    onClick={() => setPaymentMethod('EMI')}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMethod === 'EMI' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                        {paymentMethod === 'EMI' && <Check className="h-3 w-3" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                          Easy Monthly Installments (EMI)
                        </h4>
                        <p className="text-[11px] text-gray-500">Flexible 3, 6, 9, or 12 month payment plans</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      From {formatPrice(Math.round(totalAmount / 12))}/mo
                    </span>
                  </div>

                  {paymentMethod === 'EMI' && (
                    <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-gray-800 space-y-3">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Choose EMI Tenure:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { months: 3, rate: 12 },
                          { months: 6, rate: 14 },
                          { months: 9, rate: 15 },
                          { months: 12, rate: 16 },
                        ].map((plan) => {
                          const interest = (totalAmount * plan.rate) / 100;
                          const monthly = Math.round((totalAmount + interest) / plan.months);
                          const isSelected = selectedEmiMonths === plan.months;

                          return (
                            <button
                              key={plan.months}
                              type="button"
                              onClick={() => setSelectedEmiMonths(plan.months)}
                              className={`rounded-xl border p-2.5 text-center text-xs transition ${
                                isSelected
                                  ? 'border-indigo-600 bg-white font-bold text-indigo-700 shadow-sm dark:bg-gray-800 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400'
                              }`}
                            >
                              <div className="font-bold">{plan.months} Months</div>
                              <div className="text-indigo-600 dark:text-indigo-400 text-xs font-extrabold mt-0.5">
                                {formatPrice(monthly)}/mo
                              </div>
                              <div className="text-[10px] text-gray-400">{plan.rate}% interest</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Cash on Delivery (COD with ₹50,000 max check) */}
                <div
                  className={`rounded-2xl border-2 p-4 transition ${
                    !isCodAllowed
                      ? 'border-gray-200 bg-gray-50/70 opacity-70 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900/30'
                      : paymentMethod === 'COD'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 cursor-pointer'
                      : 'border-gray-200 dark:border-gray-700 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (isCodAllowed) setPaymentMethod('COD');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMethod === 'COD' && isCodAllowed ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                        {paymentMethod === 'COD' && isCodAllowed && <Check className="h-3 w-3" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                          Cash on Delivery (COD)
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          {isCodAllowed
                            ? 'Pay with cash or UPI QR upon courier arrival'
                            : 'COD is limited to orders up to ₹50,000.'}
                        </p>
                      </div>
                    </div>
                    {!isCodAllowed && (
                      <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" /> Exceeds ₹50k Limit
                      </span>
                    )}
                  </div>

                  {!isCodAllowed && (
                    <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
                      Orders exceeding ₹50,000 must be paid via Razorpay (UPI / Card) or Easy EMI for insurance and security purposes.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button onClick={() => setStep(2)} variant="outline" size="md">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} size="md" className="gap-2">
                  Review Order <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Place Order */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review & Confirm Order</h2>
              </div>

              {/* Items summary */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || item.product?.images?.[0] || item.product?.thumbnail}
                        alt={item.name || item.product?.name}
                        className="h-12 w-12 rounded-xl object-contain bg-gray-50 dark:bg-gray-800 p-1"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                          {item.name || item.product?.name}
                        </h5>
                        {item.variantDetails && (
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.variantDetails}
                          </span>
                        )}
                        <p className="text-[11px] text-gray-400">
                          Qty: {item.quantity} × {formatPrice(item.effectivePrice)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Delivery & Payment Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/40 text-xs">
                <div>
                  <h6 className="font-bold text-gray-900 dark:text-white mb-1">Delivering To:</h6>
                  <p className="text-gray-600 dark:text-gray-300">{shippingAddress.fullName} ({shippingAddress.addressType})</p>
                  <p className="text-gray-500">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                  <p className="text-gray-500">Phone: {shippingAddress.phone}</p>
                </div>
                <div>
                  <h6 className="font-bold text-gray-900 dark:text-white mb-1">Selected Payment:</h6>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold">
                    {paymentMethod === 'RAZORPAY' && 'Online Payment (Razorpay)'}
                    {paymentMethod === 'EMI' && `Easy EMI (${selectedEmiMonths} Months @ ~${formatPrice(Math.round(totalAmount / selectedEmiMonths))}/mo)`}
                    {paymentMethod === 'COD' && 'Cash on Delivery (COD)'}
                  </p>
                  <p className="text-gray-500 mt-1">
                    Delivery Speed: {deliveryMethod === 'EXPRESS' ? 'Priority Express (1-2 Days)' : 'Standard Delivery (3-5 Days)'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button onClick={() => setStep(3)} variant="outline" size="md">
                  Back
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  loading={loading}
                  size="lg"
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black"
                >
                  Place Order ({formatPrice(totalAmount)}) <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ORDER SUMMARY SIDEBAR WITH COUPON */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
            Order Summary
          </h3>

          {/* Coupon Code Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Have a Promo Code?
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> {appliedCoupon.code} applied!
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-gray-300 p-2 text-xs uppercase text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <Button type="submit" size="sm" loading={couponLoading}>
                  Apply
                </Button>
              </form>
            )}
            {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {deliveryCost === 0 ? 'FREE' : formatPrice(deliveryCost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (5% GST)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-black text-gray-950 dark:border-gray-800 dark:text-white">
              <span>Total Payable</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 text-[11px] text-gray-500 dark:bg-gray-800/40 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Buyer Protection Included
            </div>
            <p>Your order qualifies for 30-day returns and genuine brand replacement guarantee.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
