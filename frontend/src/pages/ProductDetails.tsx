import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Share2,
  AlertCircle,
  MessageSquare,
  CreditCard,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { productApi } from '../api/productApi.js';
import { reviewApi } from '../api/reviewApi.js';
import { Product, ProductVariant, Review } from '../types/index.js';
import { formatPrice, calculateDiscount, formatDate } from '../utils/formatters.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { Button } from '../components/common/Button.js';
import { Modal } from '../components/common/Modal.js';
import { ProductCard } from '../components/products/ProductCard.js';
import { useCart } from '../contexts/CartContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useAuth } from '../contexts/AuthContext.js';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Variant selection state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [selectedRam, setSelectedRam] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Delivery postal code checker state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{
    checked: boolean;
    valid: boolean;
    standardDate: string;
    expressDate: string;
    codAvailable: boolean;
    message?: string;
  } | null>(null);

  // EMI calculator modal state
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        const res = await productApi.getProductById(id);
        const prod = res.data;
        setProduct(prod);
        setSelectedImage(0);

        if (prod.variants && prod.variants.length > 0) {
          const firstVariant = prod.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedColor(firstVariant.color || null);
          setSelectedStorage(firstVariant.storage || null);
          setSelectedRam(firstVariant.ram || null);
          setSelectedSize(firstVariant.size || null);
        } else {
          setSelectedVariant(null);
          setSelectedColor(null);
          setSelectedStorage(null);
          setSelectedRam(null);
          setSelectedSize(null);
        }

        window.scrollTo(0, 0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantSelect = (type: 'color' | 'storage' | 'ram' | 'size', value: string) => {
    if (!product || !product.variants) return;

    const targetColor = type === 'color' ? value : selectedColor;
    const targetStorage = type === 'storage' ? value : selectedStorage;
    const targetRam = type === 'ram' ? value : selectedRam;
    const targetSize = type === 'size' ? value : selectedSize;

    let matched = product.variants.find((v) => {
      let match = true;
      if (targetColor && v.color) match = match && v.color === targetColor;
      if (targetStorage && v.storage) match = match && v.storage === targetStorage;
      if (targetRam && v.ram) match = match && v.ram === targetRam;
      if (targetSize && v.size) match = match && v.size === targetSize;
      return match;
    });

    if (!matched) {
      matched = product.variants.find((v) => {
        if (type === 'color') return v.color === value;
        if (type === 'storage') return v.storage === value;
        if (type === 'ram') return v.ram === value;
        if (type === 'size') return v.size === value;
        return false;
      });
    }

    if (matched) {
      setSelectedVariant(matched);
      if (matched.color) setSelectedColor(matched.color);
      if (matched.storage) setSelectedStorage(matched.storage);
      if (matched.ram) setSelectedRam(matched.ram);
      if (matched.size) setSelectedSize(matched.size);

      if (matched.image && product.images) {
        const imgIndex = product.images.findIndex((img) => img === matched?.image);
        if (imgIndex !== -1) {
          setSelectedImage(imgIndex);
        }
      }
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length !== 6 || isNaN(Number(cleanPin))) {
      setPincodeResult({
        checked: true,
        valid: false,
        standardDate: '',
        expressDate: '',
        codAvailable: false,
        message: 'Please enter a valid 6-digit Indian Postal PIN code.',
      });
      return;
    }

    const now = new Date();
    const standardDelivery = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const expressDelivery = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const effectivePrice = selectedVariant
      ? (selectedVariant.discountPrice ?? selectedVariant.price)
      : (product?.discountPrice ?? product?.price ?? 0);

    setPincodeResult({
      checked: true,
      valid: true,
      standardDate: standardDelivery.toLocaleDateString('en-IN', options),
      expressDate: expressDelivery.toLocaleDateString('en-IN', options),
      codAvailable: effectivePrice <= 50000,
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center animate-pulse">
        <div className="h-96 w-full max-w-4xl mx-auto rounded-3xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Product Not Found</h2>
        <p className="mt-2 text-sm text-gray-500">{error || 'The requested product does not exist.'}</p>
        <Link to="/shop" className="mt-6 inline-block">
          <Button size="md">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? (selectedVariant.discountPrice ?? selectedVariant.price)
    : (product.discountPrice ?? product.price);

  const regularPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const discountPercent = calculateDiscount(regularPrice, currentPrice);

  const images = product.images && product.images.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = currentStock <= 0;

  const availableColors = Array.from(new Set((product.variants || []).map((v) => v.color).filter(Boolean))) as string[];
  const availableStorages = Array.from(new Set((product.variants || []).map((v) => v.storage).filter(Boolean))) as string[];
  const availableRams = Array.from(new Set((product.variants || []).map((v) => v.ram).filter(Boolean))) as string[];
  const availableSizes = Array.from(new Set((product.variants || []).map((v) => v.size).filter(Boolean))) as string[];

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedVariant?.id);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity, selectedVariant?.id);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!isAuthenticated) {
      setReviewError('Please log in to submit a product review.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await reviewApi.createReview(product.id, {
        rating: newRating,
        title: newTitle.trim() || undefined,
        comment: newComment.trim(),
      });
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: [res.data, ...(prev.reviews || [])],
              numReviews: prev.numReviews + 1,
            }
          : prev
      );
      setNewComment('');
      setNewTitle('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err: any) {
      setReviewError(
        err.response?.data?.message ||
          'Only verified purchasers who have ordered this product can submit a review.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Product Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT: Product Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="h-80 sm:h-[480px] w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800/40 flex items-center justify-center">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-110"
              />
            </div>
            {discountPercent > 0 && (
              <span className="absolute left-6 top-6 rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-md">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1 transition dark:bg-gray-900 ${
                    selectedImage === idx
                      ? 'border-indigo-600 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Meta, Variant Switchers & Purchase Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            {/* Category & Brand Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Link to={`/shop?brand=${product.brand?.slug}`} className="hover:underline">
                {product.brand?.name || 'Brand'}
              </Link>
              <span>•</span>
              <Link to={`/shop?category=${product.category?.slug}`} className="hover:underline">
                {product.category?.name || 'Category'}
              </Link>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating and review count */}
            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating} showNumber size="md" />
              <span className="text-xs text-gray-400">({product.numReviews} customer reviews)</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Verified Authentic
              </span>
            </div>

            {/* Pricing Section */}
            <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:border-gray-800 dark:bg-gray-900/60">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white">
                  {formatPrice(currentPrice)}
                </span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      {formatPrice(regularPrice)}
                    </span>
                    <span className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* EMI Calculator Callout */}
              <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    EMI starts at <strong>{formatPrice(Math.round(currentPrice / 12))}/mo</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmiModalOpen(true)}
                  className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline cursor-pointer"
                >
                  View EMI Plans
                </button>
              </div>
            </div>

            {/* 1. DYNAMIC PRODUCT VARIANTS: COLOR, STORAGE, RAM, SIZE */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
                {/* Color Selector */}
                {availableColors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Color: <span className="text-indigo-600 dark:text-indigo-400">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleVariantSelect('color', color)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 dark:bg-indigo-950/50 dark:text-indigo-300'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Storage Selector */}
                {availableStorages.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Storage: <span className="text-indigo-600 dark:text-indigo-400">{selectedStorage}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableStorages.map((storage) => {
                        const isSelected = selectedStorage === storage;
                        return (
                          <button
                            key={storage}
                            type="button"
                            onClick={() => handleVariantSelect('storage', storage)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition border ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {storage}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RAM Selector */}
                {availableRams.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      RAM: <span className="text-indigo-600 dark:text-indigo-400">{selectedRam}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableRams.map((ram) => {
                        const isSelected = selectedRam === ram;
                        return (
                          <button
                            key={ram}
                            type="button"
                            onClick={() => handleVariantSelect('ram', ram)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition border ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {ram}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {availableSizes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Size: <span className="text-indigo-600 dark:text-indigo-400">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleVariantSelect('size', size)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition border ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Availability and SKU */}
            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Stock Availability:</span>
                <strong className={currentStock > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                  {currentStock > 0 ? `In Stock (${currentStock} units available)` : 'Out of Stock'}
                </strong>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>SKU:</span>
                <strong className="text-gray-700 dark:text-gray-300 font-mono">{currentSku}</strong>
              </div>
            </div>

            {/* 2. POSTAL CODE DELIVERY CHECKER */}
            <div className="mt-6 rounded-2xl border border-gray-200/80 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white mb-2">
                <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Check Delivery & Cash on Delivery Availability</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Indian PIN Code (e.g. 560001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <Button type="submit" size="sm" variant="secondary" className="whitespace-nowrap">
                  Check
                </Button>
              </form>

              {pincodeResult && (
                <div className="mt-3 text-xs space-y-1.5">
                  {pincodeResult.valid ? (
                    <div className="rounded-xl bg-emerald-50/80 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Truck className="h-4 w-4" /> Deliverable to {pincode}
                      </div>
                      <p>
                        • <strong>Standard Delivery (Free):</strong> By {pincodeResult.standardDate}
                      </p>
                      <p>
                        • <strong>Express Delivery (₹99):</strong> By {pincodeResult.expressDate}
                      </p>
                      <p className={pincodeResult.codAvailable ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                        • {pincodeResult.codAvailable ? '✓ Cash on Delivery (COD) Available' : '⚠️ COD not available for orders above ₹50,000'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-rose-600 dark:text-rose-400 font-medium">
                      {pincodeResult.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-800 dark:text-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="px-3.5 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || cartLoading}
                  size="lg"
                  className="flex-1 gap-2"
                >
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || cartLoading}
                  variant="secondary"
                  size="lg"
                  className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
                >
                  <Zap className="h-5 w-5" /> Buy Now
                </Button>
                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label="Wishlist"
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
                    inWishlist
                      ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40'
                      : 'border-gray-200 text-gray-500 hover:text-rose-500 dark:border-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${inWishlist ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Value props badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 text-center">
            <div className="flex flex-col items-center">
              <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Express Delivery</span>
              <span className="text-[10px] text-gray-400">1-2 Days Available</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">30-Day Returns</span>
              <span className="text-[10px] text-gray-400">Hassle Free</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Official Warranty</span>
              <span className="text-[10px] text-gray-400">1 Year Brand</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Shipping, Reviews */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto gap-8">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-4 text-sm font-bold transition border-b-2 whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold transition border-b-2 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 text-sm font-bold transition border-b-2 whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Delivery & Returns
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold transition border-b-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            Customer Reviews ({product.numReviews})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="pt-6 space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Product Description</h3>
            <p>{product.description}</p>
            <p>
              Engineered with premier materials, this product embodies high standard manufacturing, longevity, and high precision craftsmanship. Suitable for daily professional and recreational usage.
            </p>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'specs' && (
          <div className="pt-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Detailed Specifications
            </h3>
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 rounded-2xl overflow-hidden dark:border-gray-800">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">{key}</span>
                    <span className="sm:col-span-2 font-medium text-gray-900 dark:text-white mt-1 sm:mt-0">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Standard specifications apply to this model.</p>
            )}
          </div>
        )}

        {/* Tab 3: Shipping & Returns */}
        {activeTab === 'shipping' && (
          <div className="pt-6 space-y-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Shipping Information</h3>
            <p>
              We provide prompt standard shipping (3-5 business days) and priority express shipping (1-2 business days) across all zip codes. Orders placed before 3 PM IST are packaged and dispatched the same day.
            </p>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-2">Return & Refund Policy</h4>
            <p>
              If you are not 100% satisfied with your purchase, you may initiate a return within 30 days of delivery. The item must be unused, in its original brand packaging with all tags attached.
            </p>
          </div>
        )}

        {/* Tab 4: Reviews & Review Form */}
        {activeTab === 'reviews' && (
          <div className="pt-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Customer Reviews</h3>
                <div className="flex items-center gap-2 mt-1">
                  <RatingStars rating={product.rating} showNumber size="md" />
                  <span className="text-xs text-gray-400">Based on {product.numReviews} ratings</span>
                </div>
              </div>
            </div>

            {/* Write a Review Form */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-800/30">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Write a Review</h4>
              <p className="text-xs text-gray-500 mb-4">
                Note: Only verified buyers who have received this product can post customer reviews.
              </p>

              {reviewSuccess && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Thank you! Your review has been published.
                </div>
              )}

              {reviewError && (
                <div className="mb-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" /> {reviewError}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Your Rating:
                  </label>
                  <RatingStars rating={newRating} interactive onRate={setNewRating} size="lg" />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Review headline (optional)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience with this product..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <Button type="submit" size="sm" loading={submittingReview}>
                  Submit Review
                </Button>
              </form>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.user?.name || 'Shopper'}`}
                          alt={rev.user?.name || 'Shopper'}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                              {rev.user?.name || 'Customer'}
                            </p>
                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Check className="h-3 w-3" /> Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">{formatDate(rev.createdAt)}</p>
                        </div>
                      </div>
                      <RatingStars rating={rev.rating} size="sm" />
                    </div>
                    {rev.title && (
                      <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2">
                        {rev.title}
                      </h5>
                    )}
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">
                  No reviews yet. Verified purchasers can submit the first review!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-950 dark:text-white">You May Also Like</h3>
              <p className="text-xs text-gray-500">Related products from the same category</p>
            </div>
            <Link to={`/shop?category=${product.category?.slug}`} className="text-xs font-semibold text-indigo-600 hover:underline">
              See more
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* 3. EMI PLANS CALCULATOR MODAL */}
      <Modal
        isOpen={isEmiModalOpen}
        onClose={() => setIsEmiModalOpen(false)}
        title="Easy EMI Payment Plans"
        maxWidth="md"
      >
        <div className="space-y-4 p-4 sm:p-6 text-xs text-gray-700 dark:text-gray-300">
          <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200">
            <p className="font-bold">Total Order Value: {formatPrice(currentPrice)}</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
              Available across HDFC, ICICI, SBI, Axis, and leading banks.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="p-2.5 font-bold">Tenure</th>
                  <th className="p-2.5 font-bold">Interest Rate</th>
                  <th className="p-2.5 font-bold">Monthly EMI</th>
                  <th className="p-2.5 font-bold">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {[
                  { months: 3, rate: 12 },
                  { months: 6, rate: 14 },
                  { months: 9, rate: 15 },
                  { months: 12, rate: 16 },
                ].map((plan) => {
                  const interest = (currentPrice * plan.rate) / 100;
                  const total = currentPrice + interest;
                  const monthly = Math.round(total / plan.months);
                  return (
                    <tr key={plan.months} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-2.5 font-bold">{plan.months} Months</td>
                      <td className="p-2.5">{plan.rate}% p.a.</td>
                      <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(monthly)}/mo
                      </td>
                      <td className="p-2.5 text-gray-500 dark:text-gray-400">
                        {formatPrice(Math.round(total))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            * Interest rates are calculated as standard bank estimates. You can select your desired tenure during final checkout under the EMI payment method.
          </p>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setIsEmiModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
