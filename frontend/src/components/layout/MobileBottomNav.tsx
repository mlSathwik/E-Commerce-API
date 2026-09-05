import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext.js';
import { useWishlist } from '../../contexts/WishlistContext.js';
import { useAuth } from '../../contexts/AuthContext.js';

export const MobileBottomNav: React.FC = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 bg-white/95 backdrop-blur-lg sm:hidden dark:border-gray-800/80 dark:bg-gray-950/95 shadow-lg">
      <div className="flex h-16 items-center justify-around px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`
          }
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`
          }
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Shop</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`
          }
        >
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              {wishlistCount}
            </span>
          )}
          <span>Wishlist</span>
        </NavLink>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
              {itemCount}
            </span>
          )}
          <span>Cart</span>
        </button>

        <NavLink
          to={isAuthenticated ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition ${
              isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`
          }
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
