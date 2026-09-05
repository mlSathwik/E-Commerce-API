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
} from 'lucide-react';
import { productApi } from '../api/productApi.js';
import { reviewApi } from '../api/reviewApi.js';
import { Product, Review } from '../types/index.js';
import { formatPrice, calculateDiscount, formatDate } from '../utils/formatters.js';
import { RatingStars } from '../components/common/RatingStars.js';
import { Button } from '../components/common/Button.js';
import { ProductCard } from '../components/products/ProductCard.js';
import { useCart } from '../contexts/CartContext.js';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useAuth } from '../contexts/AuthContext.js';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        const res = await productApi.getProductById(id);
        setProduct(res.data);
        setSelectedImage(0);
        window.scrollTo(0, 0);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  const discountPercent = calculateDiscount(product.price, product.discountPrice);
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit a product review.');
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
      // Append review
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
    } catch (err) {
      alert('Failed to submit review');
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

        {/* RIGHT: Product Meta & Purchase Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            {/* Category & Brand Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <span>{product.brand?.name || 'Brand'}</span>
              <span>•</span>
              <span>{product.category?.name || 'Category'}</span>
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
            <div className="mt-6 flex items-baseline gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 dark:border-gray-800 dark:bg-gray-900/60">
              <span className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white">
                {formatPrice(product.discountPrice ?? product.price)}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Brief description */}
            <p className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {/* Availability and SKU */}
            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Stock Availability:</span>
                <strong className={product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                  {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
                </strong>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>SKU:</span>
                <strong className="text-gray-700 dark:text-gray-300">{product.sku}</strong>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-8 space-y-4">
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
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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
              <span className="text-[10px] text-gray-400">2-4 Days</span>
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
              {reviewSuccess && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Thank you! Your review has been published.
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
                    placeholder="Share your honest feedback about this product..."
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
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {rev.user?.name || 'Verified Buyer'}
                          </p>
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
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products: "You may also like" */}
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
    </div>
  );
};
