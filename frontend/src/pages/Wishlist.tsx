import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext.js';
import { useCart } from '../contexts/CartContext.js';
import { formatPrice } from '../utils/formatters.js';
import { Button } from '../components/common/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { Link } from 'react-router-dom';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveAllToCart = async () => {
    if (!wishlist) return;
    for (const item of wishlist.items) {
      if (item.product) {
        await addToCart(item.productId, 1);
        await removeFromWishlist(item.productId);
      }
    }
  };

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={<Heart className="h-10 w-10 text-rose-500" />}
          title="Your Wishlist is Empty"
          description="Save favorite flagship items you want to keep an eye on by tapping the heart icon on any product."
          actionText="Explore Trending Items"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
            My Wishlist ({wishlist.count})
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Saved products ready to be transferred to your cart whenever you desire.
          </p>
        </div>

        <Button onClick={handleMoveAllToCart} size="md" className="gap-2 self-start sm:self-auto">
          <ShoppingCart className="h-4 w-4" /> Move All to Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.items.map((item) => {
          const p = item.product;
          if (!p) return null;

          return (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-3xl border border-gray-200/80 bg-white p-4 shadow-sm transition hover:shadow-card dark:border-gray-800 dark:bg-gray-900"
            >
              <button
                onClick={() => removeFromWishlist(p.id)}
                aria-label="Remove from wishlist"
                className="absolute right-6 top-6 z-10 rounded-full bg-white/90 p-1.5 text-gray-400 shadow-sm hover:text-rose-500 dark:bg-gray-800/90"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <Link to={`/products/${p.id}`} className="block h-48 w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                  alt={p.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </Link>

              <div className="mt-4 flex flex-1 flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {p.brand?.name}
                  </span>
                  <Link
                    to={`/products/${p.id}`}
                    className="block text-xs sm:text-sm font-bold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-2 mt-0.5"
                  >
                    {p.name}
                  </Link>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm font-black text-gray-950 dark:text-white">
                    {formatPrice(p.discountPrice ?? p.price)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      addToCart(p.id, 1);
                      removeFromWishlist(p.id);
                    }}
                    disabled={p.stock <= 0}
                    className="gap-1.5"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
