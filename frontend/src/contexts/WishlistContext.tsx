import React, { createContext, useContext, useState, useEffect } from 'react';
import { Wishlist, WishlistItem, Product } from '../types/index.js';
import { wishlistApi } from '../api/wishlistApi.js';
import { useAuth } from './AuthContext.js';

interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      setWishlist(res.data);
    } catch {
      // safe failover
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (productId: string) => {
    if (!wishlist) return false;
    return wishlist.items.some((item) => item.productId === productId);
  };

  const toggleWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      alert('Please log in to save items to your wishlist.');
      return;
    }
    try {
      setLoading(true);
      if (isInWishlist(product.id)) {
        const res = await wishlistApi.removeFromWishlist(product.id);
        setWishlist(res.data);
      } else {
        const res = await wishlistApi.addToWishlist(product.id);
        setWishlist(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      setLoading(true);
      const res = await wishlistApi.removeFromWishlist(productId);
      setWishlist(res.data);
    } finally {
      setLoading(false);
    }
  };

  const wishlistCount = wishlist ? wishlist.count : 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
