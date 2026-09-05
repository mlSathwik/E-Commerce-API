import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  Star,
  Quote,
  Zap,
  TrendingUp,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { productApi } from '../api/productApi.js';
import { categoryApi } from '../api/categoryApi.js';
import { Product, Category } from '../types/index.js';
import { ProductCard } from '../components/products/ProductCard.js';
import { ProductCardSkeleton } from '../components/common/Skeleton.js';
import { Button } from '../components/common/Button.js';
import { formatPrice } from '../utils/formatters.js';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Flash sale countdown state (e.g. 14 hours, 32 mins, 45 secs)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
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
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, trendRes, flashRes, allRes] = await Promise.all([
          categoryApi.getCategories(),
          productApi.getProducts({ trending: true, limit: 8 }),
          productApi.getProducts({ flashSale: true, limit: 4 }),
          productApi.getProducts({ limit: 16 }),
        ]);

        setCategories(catsRes.data);
        setTrendingProducts(trendRes.data);
        setFlashSaleProducts(flashRes.data);

        // Sort best sellers by review count
        const sortedBest = [...allRes.data].sort((a, b) => b.numReviews - a.numReviews).slice(0, 8);
        setBestSellers(sortedBest);

        // New arrivals
        const sortedNew = [...allRes.data].reverse().slice(0, 8);
        setNewArrivals(sortedNew);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const testimonials = [
    {
      name: 'Sophia Reynolds',
      role: 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'The iPhone 16 Pro Max arrived in less than 24 hours in pristine condition. ShopSphere has completely replaced other e-commerce apps for me!',
    },
    {
      name: 'David Chen',
      role: 'Tech Enthusiast',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Seamless checkout with Razorpay and instant order tracking updates. The Sony WH-1000XM5 headphones are 100% genuine with official warranty.',
    },
    {
      name: 'Elena Rostova',
      role: 'Creative Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'The MacBook Pro M3 Max arrived ahead of schedule. Customer support was extraordinarily responsive when I updated my shipping address.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-gray-950 text-white py-16 sm:py-24">
        {/* Abstract background decorative shapes */}
        <div className="absolute top-0 -left-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Next-Gen E-Commerce Experience</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Discover Products <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                You'll Fall In Love With
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Shop flagship smartphones, powerhouse laptops, audiophile headphones, luxury sneakers, and smart home tech at guaranteed authentic prices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link to="/shop">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/deals">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-700 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm">
                  Explore Flash Deals <Zap className="h-4 w-4 text-amber-400 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Micro stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-indigo-800/40 text-left">
              <div>
                <p className="text-2xl font-extrabold text-white">50k+</p>
                <p className="text-xs text-gray-400">Happy Shoppers</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">100%</p>
                <p className="text-xs text-gray-400">Authentic Brands</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">24h</p>
                <p className="text-xs text-gray-400">Express Delivery</p>
              </div>
            </div>
          </div>

          {/* Hero visual cards */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
                <img
                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80"
                  alt="Featured Flagship Phone"
                  className="rounded-2xl object-cover h-80 sm:h-96 w-full"
                />
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Featured Spotlight</span>
                    <h3 className="text-base font-bold text-white">Titanium Pro Edition</h3>
                    <p className="text-xs text-indigo-200">From ₹134,900</p>
                  </div>
                  <Link to="/shop">
                    <Button size="sm" className="bg-white text-gray-950 hover:bg-gray-100 font-bold">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
              Featured Categories
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Explore curated product categories tailored for you
            </p>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            All Categories <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative flex flex-col items-center rounded-2xl border border-gray-200/80 bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-card dark:border-gray-800/80 dark:bg-gray-900"
            >
              <div className="h-20 w-20 overflow-hidden rounded-2xl mb-3 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=200&q=80'}
                  alt={cat.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {cat.name}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {cat.productCount ?? 12}+ Products
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALE SECTION WITH LIVE COUNTDOWN TIMER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 p-6 sm:p-10 text-white shadow-xl shadow-rose-600/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/20 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md mb-2">
                <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> Flash Sale Happening Now
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Up to 50% OFF – Limited Time Offers
              </h2>
            </div>

            {/* Countdown timer blocks */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-100 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Ends In:
              </span>
              <div className="flex items-center gap-1.5 font-mono text-base sm:text-lg font-black">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span>:</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span>:</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md text-amber-300">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Flash sale products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : flashSaleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" /> Trending Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              The hottest picks shopper enthusiasts are buying right now
            </p>
          </div>
          <Link
            to="/shop?sort=bestselling"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View More <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : trendingProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNERS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 to-purple-900 p-8 text-white shadow-xl flex flex-col justify-between h-72">
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Spatial Sound</span>
              <h3 className="text-2xl sm:text-3xl font-black">Sony & Bose Flagships</h3>
              <p className="text-xs text-indigo-200 max-w-xs">Immerse yourself with world-class noise cancellation and studio drivers.</p>
            </div>
            <div className="relative z-10 pt-4">
              <Link to="/shop?category=audio-headphones">
                <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 font-bold">
                  Explore Audio
                </Button>
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
              alt="Audio"
              className="absolute -right-10 -bottom-10 h-64 w-64 object-contain opacity-40 rotate-12"
            />
          </div>

          {/* Banner 2 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-slate-800 p-8 text-white shadow-xl flex flex-col justify-between h-72">
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Streetwear & Performance</span>
              <h3 className="text-2xl sm:text-3xl font-black">Nike & Adidas Sneakers</h3>
              <p className="text-xs text-gray-300 max-w-xs">Iconic silhouettes and ultra-responsive cushioning for everyday momentum.</p>
            </div>
            <div className="relative z-10 pt-4">
              <Link to="/shop?category=sports-fitness">
                <Button size="sm" className="bg-rose-600 text-white hover:bg-rose-500 font-bold">
                  Shop Footwear
                </Button>
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80"
              alt="Sneakers"
              className="absolute -right-10 -bottom-10 h-64 w-64 object-contain opacity-40 -rotate-12"
            />
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS & NEW ARRIVALS TABS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-amber-500" /> Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Customer favorites with the highest verified ratings
            </p>
          </div>
          <Link
            to="/shop?sort=rating_desc"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Explore Catalog <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="bg-gray-100/70 dark:bg-gray-900/50 py-16 border-y border-gray-200/60 dark:border-gray-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Community Trust</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white mt-1">
              Loved by shoppers worldwide
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              See what verified customers are saying about their ShopSphere shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center text-amber-400 gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{t.name}</h4>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
