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
} from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { orderApi } from '../api/orderApi.js';
import { paymentApi } from '../api/paymentApi.js';
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
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Alex Johnson',
    phone: user?.phone || '+91 9876543211',
    street: '42 Tech Park Avenue, Cyber City',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100',
    country: 'India',
  });

  // Step 2: Delivery Option
  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

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
  const deliveryCost = subtotal >= 1000 ? 0 : deliveryMethod === 'EXPRESS' ? 149 : 99;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + deliveryCost + tax;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create order on backend
      const res = await orderApi.createOrder({
        shippingAddress,
        deliveryMethod,
        paymentMethod,
      });

      const order = res.data.order;
      const razorpayOrder = res.data.razorpayOrder;

      // 2. If COD, finish directly
      if (paymentMethod === 'COD') {
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
          // In test / offline environments, simulate successful payment
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
                    Postal / Zip Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Street Address / Flat No. *
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Choose Delivery Option</h2>
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
                      <p className="text-[11px] text-gray-500">Free on orders above ₹1,000</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                    {subtotal >= 1000 ? 'FREE' : '₹99'}
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
                    {subtotal >= 1000 ? 'FREE' : '₹149'}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Method</h2>
              </div>

              <div className="space-y-4">
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
                        Online Payment (Razorpay: UPI, Cards, NetBanking, Wallets)
                      </h4>
                      <p className="text-[11px] text-gray-500">Encrypted and verified on server</p>
                    </div>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                </label>

                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 cursor-pointer transition ${
                    paymentMethod === 'COD'
                      ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'}`}>
                      {paymentMethod === 'COD' && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        Cash on Delivery (COD)
                      </h4>
                      <p className="text-[11px] text-gray-500">Pay with cash or UPI upon package arrival</p>
                    </div>
                  </div>
                </label>
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review & Confirm</h2>
              </div>

              {/* Items summary */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{item.product?.name}</h5>
                        <p className="text-[11px] text-gray-400">Qty: {item.quantity} × {formatPrice(item.effectivePrice)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping & Payment confirmation block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/40 text-xs">
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white">Shipping To:</h5>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{shippingAddress.fullName}</p>
                  <p className="text-gray-500">{shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                  <p className="text-gray-500">Phone: {shippingAddress.phone}</p>
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white">Method & Payment:</h5>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">Delivery: {deliveryMethod === 'EXPRESS' ? 'Priority Express' : 'Standard Delivery'}</p>
                  <p className="text-gray-500">Payment: {paymentMethod === 'RAZORPAY' ? 'Razorpay Online' : 'Cash on Delivery'}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Button onClick={() => setStep(3)} variant="outline" size="md">
                  Back
                </Button>
                <Button onClick={handlePlaceOrder} loading={loading} size="lg" className="gap-2 shadow-lg shadow-indigo-500/20">
                  Place Order ({formatPrice(totalAmount)}) <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Order Summary */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Summary</h3>
          <div className="space-y-2 text-xs border-b border-gray-100 pb-4 dark:border-gray-800">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Items Subtotal</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Shipping</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {deliveryCost === 0 ? 'FREE' : formatPrice(deliveryCost)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Tax (5% GST)</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(tax)}</span>
            </div>
          </div>
          <div className="flex justify-between text-base font-black text-gray-900 dark:text-white">
            <span>Total</span>
            <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
