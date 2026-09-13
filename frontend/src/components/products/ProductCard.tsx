import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star, CheckCircle, Truck, Zap } from 'lucide-react';
import { Product } from '../../types/index.js';
import { formatPrice, calculateDiscount } from '../../utils/formatters.js';
import { useCart } from '../../contexts/CartContext.js';
import { useWishlist } from '../../contexts/WishlistContext.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { QuickViewModal } from './QuickViewModal.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, loading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const finalPrice = product.discountPrice ?? product.price;
  const originalPrice = product.price;
  const savings = product.discountPrice ? originalPrice - product.discountPrice : 0;
  const discountPercent = calculateDiscount(originalPrice, product.discountPrice);
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Approximate 12-month EMI estimate for items >= 3,000
  const emiPerMonth = finalPrice >= 3000 ? Math.round(finalPrice / 12) : null;

  const primaryImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1] || primaryImage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    await addToCart(product.id, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    toggleWishlist(product);
  };

  return (
    <>
      <div
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800/90 dark:bg-gray-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-black text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFlashSale && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Zap className="h-3 w-3 fill-white" /> FLASH SALE
            </span>
          )}
          {product.isTrending && !product.isFlashSale && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              TRENDING
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Toggle Wishlist"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95 dark:bg-gray-800/95"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              inWishlist
                ? 'fill-rose-500 text-rose-500'
                : 'text-gray-600 hover:text-rose-500 dark:text-gray-300'
            }`}
          />
        </button>

        {/* Product Image */}
        <Link
          to={`/products/${product.id}`}
          className="relative block h-56 w-full overflow-hidden bg-gray-50/80 dark:bg-gray-800/40"
        >
          <img
            src={isHovered ? hoverImage : primaryImage}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Quick View Button Hover Overlay */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-indigo-600 dark:bg-gray-800/95 dark:text-white dark:hover:bg-gray-800"
            >
              <Eye className="h-3.5 w-3.5" /> Quick View
            </button>
          </div>
        </Link>

        {/* Card Body */}
        <div className="flex flex-1 flex-col p-4">
          {/* Brand & Stock indicator */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {product.brand?.name || 'SHOPSPHERE'}
            </span>
            {isOutOfStock ? (
              <span className="font-semibold text-rose-500">Out of Stock</span>
            ) : isLowStock ? (
              <span className="font-semibold text-amber-500">Only {product.stock} left</span>
            ) : (
              <span className="font-medium text-emerald-600 dark:text-emerald-400">In Stock</span>
            )}
          </div>

          {/* Product Name */}
          <Link
            to={`/products/${product.id}`}
            className="mt-1.5 text-sm font-semibold text-gray-900 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>

          {/* Rating & Review count */}
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="ml-1 font-bold text-gray-800 dark:text-gray-200">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">({product.numReviews.toLocaleString()})</span>
          </div>

          {/* Pricing Block */}
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-gray-950 dark:text-white">
                {formatPrice(finalPrice)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  MRP: {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            {savings > 0 && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                You Save {formatPrice(savings)} ({discountPercent}% OFF)
              </p>
            )}

            {emiPerMonth && (
              <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                EMI from {formatPrice(emiPerMonth)}/month
              </p>
            )}
          </div>

          {/* Delivery Info */}
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Free Delivery</span>
            {finalPrice >= 20000 && (
              <span className="ml-1 text-indigo-600 dark:text-indigo-400">| Express Available</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || loading}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition shadow-sm active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              }`}
            >
              {isAdded ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
};
