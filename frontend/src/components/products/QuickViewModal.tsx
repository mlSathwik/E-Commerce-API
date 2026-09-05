import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/index.js';
import { Modal } from '../common/Modal.js';
import { formatPrice, calculateDiscount } from '../../utils/formatters.js';
import { RatingStars } from '../common/RatingStars.js';
import { Button } from '../common/Button.js';
import { useCart } from '../../contexts/CartContext.js';
import { useWishlist } from '../../contexts/WishlistContext.js';
import { Heart, ShoppingCart, Check, ShieldCheck, Truck } from 'lucide-react';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart, loading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'];

  const discountPercent = calculateDiscount(product.price, product.discountPrice);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Quick View" maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images Gallery */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 h-64 sm:h-72">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                    selectedImage === idx
                      ? 'border-indigo-600 dark:border-indigo-400'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {product.brand?.name || 'ShopSphere'}
          </span>
          <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white leading-snug">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={product.rating} showNumber size="sm" />
            <span className="text-xs text-gray-400">({product.numReviews} customer reviews)</span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              {formatPrice(product.discountPrice ?? product.price)}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-extrabold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
            {product.description}
          </p>

          {/* Stock and SKU */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="text-gray-400">SKU: <strong className="text-gray-700 dark:text-gray-300">{product.sku}</strong></span>
            <span>
              Status:{' '}
              <strong className={product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </strong>
            </span>
          </div>

          {/* Quantity and Actions */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || cartLoading}
                className="flex-1 gap-2"
                size="md"
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </>
                )}
              </Button>

              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                  inWishlist
                    ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40'
                    : 'border-gray-200 text-gray-500 hover:text-rose-500 dark:border-gray-700 dark:text-gray-400'
                }`}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              className="block text-center text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View Full Product Specifications & Customer Reviews →
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
};
