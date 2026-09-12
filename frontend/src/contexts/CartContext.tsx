import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem } from '../types/index.js';
import { cartApi } from '../api/cartApi.js';
import { useAuth } from './AuthContext.js';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number, variantId?: string | null) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      setCart(res.data);
    } catch {
      // Cart fetch fail safe
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1, variantId?: string | null) => {
    try {
      setLoading(true);
      const res = await cartApi.addToCart(productId, quantity, variantId);
      setCart(res.data);
      setIsCartOpen(true); // Pop open cart drawer or alert
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      const res = await cartApi.updateCartItem(itemId, quantity);
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setLoading(true);
      const res = await cartApi.removeCartItem(itemId);
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartApi.clearCart();
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart ? cart.itemCount : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
