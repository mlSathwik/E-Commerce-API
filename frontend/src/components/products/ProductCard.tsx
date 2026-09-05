import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Product } from '../../types/index.js';
import { formatPrice, calculateDiscount } from '../../utils/formatters.js';
import { useCart } from '../../contexts/CartContext.js';
import { useWishlist } from '../../contexts/WishlistContext.js';
import { QuickViewModal } from './QuickViewModal.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = calculateDiscount(product.price, product.discountPrice);
  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const primaryImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
  const hoverImage =
    product.images?.[1] || primaryImage;

  return (
    <>
      <div
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-gray-800/80 dark:bg-gray-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              FLASH SALE
            </span>
          )}
          {product.isTrending && !product.isFlashSale && (
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              TRENDING
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Toggle Wishlist"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95 dark:bg-gray-800/90"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              inWishlist
                ? 'fill-rose-500 text-rose-500'
                : 'text-gray-600 dark:text-gray-300 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Product Image with smooth zoom hover */}
        <Link to={`/products/${product.id}`} className="relative block h-56 w-full overflow-hidden bg-gray-50 dark:bg-gray-800/50">
          <img
            src={isHovered ? hoverImage : primaryImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
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

        {/* Card Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Brand & Stock indicator */}
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {product.brand?.name || 'ShopSphere'}
            </span>
            {isOutOfStock ? (
              <span className="font-semibold text-rose-500">Out of Stock</span>
            ) : isLowStock ? (
              <span className="font-semibold text-amber-500">Only {product.stock} left</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">In Stock</span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.id}`}
            className="mt-1 text-sm font-semibold text-gray-900 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-2"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="ml-1 font-bold text-gray-800 dark:text-gray-200">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-400">({product.numReviews})</span>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-base font-extrabold text-gray-950 dark:text-white">
                {formatPrice(product.discountPrice ?? product.price)}
              </span>
              {product.discountPrice && (
                <span className="ml-2 text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={() => addToCart(product.id, 1)}
              disabled={isOutOfStock || loading}
              aria-label="Add to cart"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-600 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
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
