import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi.js';
import { Product } from '../types/index.js';
import { ProductCard } from '../components/products/ProductCard.js';
import { ProductCardSkeleton } from '../components/common/Skeleton.js';
import { Zap, Clock, Sparkles } from 'lucide-react';

export const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProducts({ sort: 'discount', limit: 16 });
        setDeals(res.data);
      } catch (err) {
        console.error('Failed to load deals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-700 p-8 sm:p-12 text-white shadow-xl shadow-rose-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-3">
            <Zap className="h-4 w-4 fill-amber-300 text-amber-300" /> Exclusive Flash Deals
          </div>
          <h1 className="text-3xl sm:text-5xl font-black">
            Limited Time Clearance Sale
          </h1>
          <p className="mt-2 text-sm text-pink-100 max-w-md">
            Save up to 50% across electronics, flagship mobile phones, wearables, and apparel.
          </p>
        </div>

        {/* Big countdown timer */}
        <div className="rounded-2xl bg-black/40 p-4 backdrop-blur-md text-center">
          <span className="text-xs text-pink-200 font-bold uppercase tracking-wider block mb-2">
            Sale Ends In:
          </span>
          <div className="flex items-center gap-2 font-mono text-2xl font-black">
            <div className="bg-white/10 px-3 py-2 rounded-xl">{String(timeLeft.hours).padStart(2, '0')}h</div>
            <span>:</span>
            <div className="bg-white/10 px-3 py-2 rounded-xl">{String(timeLeft.minutes).padStart(2, '0')}m</div>
            <span>:</span>
            <div className="bg-white/10 px-3 py-2 rounded-xl text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}s</div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : deals.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
};
