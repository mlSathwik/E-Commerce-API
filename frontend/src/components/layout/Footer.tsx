import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 pb-20 sm:pb-0">
      {/* Service Highlights Bar */}
      <div className="border-b border-gray-100 dark:border-gray-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Free Delivery</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">On all orders over ₹1,000</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">100% Secure Payment</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Powered by Razorpay & SSL</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Easy 30-Day Returns</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Hassle-free replacement policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">Best Price Guarantee</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">Verified official brand warranties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-950 dark:text-white">
                Shop<span className="text-indigo-600 dark:text-indigo-400">Sphere</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
              Discover premium tech, fashion, smartphones, audio gear, and lifestyle products curated for quality and speed.
            </p>
            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">Subscribe to our VIP Newsletter</h5>
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" /> Thank you for subscribing! Check your inbox for exclusive deals.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Shop</h5>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><Link to="/shop" className="hover:text-indigo-600">All Products</Link></li>
              <li><Link to="/deals" className="hover:text-indigo-600">Flash Sale & Deals</Link></li>
              <li><Link to="/shop?category=smartphones" className="hover:text-indigo-600">Smartphones</Link></li>
              <li><Link to="/shop?category=laptops" className="hover:text-indigo-600">Laptops</Link></li>
              <li><Link to="/shop?category=audio" className="hover:text-indigo-600">Audio</Link></li>
              <li><Link to="/shop?category=smartwatches" className="hover:text-indigo-600">Smartwatches</Link></li>
              <li><Link to="/shop?category=gaming" className="hover:text-indigo-600">Gaming</Link></li>
            </ul>
          </div>

          {/* Column 2: Customer Service */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Customer Support</h5>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><Link to="/orders" className="hover:text-indigo-600">Track My Order</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-600">Shipping & Returns</Link></li>
              <li><a href="#faq" className="hover:text-indigo-600">FAQs & Help Center</a></li>
              <li><a href="#contact" className="hover:text-indigo-600">Contact Us</a></li>
              <li><a href="#privacy" className="hover:text-indigo-600">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Contact</h5>
            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>42 Tech Park, Bengaluru, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-indigo-500" />
                <span>+91 1800 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span>support@shopsphere.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-gray-100 pt-8 dark:border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} ShopSphere Inc. All rights reserved. Built for modern shopping.</p>
          <div className="flex items-center gap-6">
            <Link to="/shop" className="hover:text-gray-600">Terms of Service</Link>
            <Link to="/shop" className="hover:text-gray-600">Security</Link>
            <Link to="/deals" className="hover:text-gray-600">Gift Cards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
