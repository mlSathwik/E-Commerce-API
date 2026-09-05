import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../types/index.js';
import { getMemoryStore } from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const store = getMemoryStore();

    let cart = store.carts.find((c) => c.userId === userId);
    if (!cart) {
      cart = { id: crypto.randomUUID(), userId, createdAt: new Date(), updatedAt: new Date() };
      store.carts.push(cart);
    }

    const items = store.cartItems
      .filter((ci) => ci.cartId === cart!.id)
      .map((item) => {
        const product = store.products.find((p) => p.id === item.productId);
        const effectivePrice = product ? (product.discountPrice ?? product.price) : 0;
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product,
          effectivePrice,
          subtotal: effectivePrice * item.quantity,
        };
      })
      .filter((item) => item.product !== undefined);

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    // Free shipping threshold ₹1000
    const freeShippingThreshold = 1000;
    const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 99;
    const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + shipping + tax;

    return sendSuccess(res, 200, 'Cart fetched successfully', {
      id: cart.id,
      items,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal,
      shipping,
      freeShippingThreshold,
      amountToFreeShipping,
      tax,
      total,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch cart', 'SERVER_ERROR');
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;
    const qty = Math.max(1, parseInt(quantity, 10));
    const store = getMemoryStore();

    const product = store.products.find((p) => p.id === productId);
    if (!product) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (product.stock < qty) {
      return sendError(res, 400, `Insufficient stock! Only ${product.stock} units available`, 'INSUFFICIENT_STOCK');
    }

    let cart = store.carts.find((c) => c.userId === userId);
    if (!cart) {
      cart = { id: crypto.randomUUID(), userId, createdAt: new Date(), updatedAt: new Date() };
      store.carts.push(cart);
    }

    let existingItem = store.cartItems.find((ci) => ci.cartId === cart!.id && ci.productId === productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + qty;
      if (newQuantity > product.stock) {
        return sendError(res, 400, `Cannot add more. Only ${product.stock} units available in total`, 'INSUFFICIENT_STOCK');
      }
      existingItem.quantity = newQuantity;
      existingItem.updatedAt = new Date();
    } else {
      store.cartItems.push({
        id: crypto.randomUUID(),
        cartId: cart.id,
        productId,
        quantity: qty,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return getCart(req, res);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to add item to cart', 'SERVER_ERROR');
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);
    const store = getMemoryStore();

    const item = store.cartItems.find((ci) => ci.id === itemId);
    if (!item) {
      return sendError(res, 404, 'Cart item not found', 'ITEM_NOT_FOUND');
    }

    const product = store.products.find((p) => p.id === item.productId);
    if (!product) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    if (qty <= 0) {
      store.cartItems = store.cartItems.filter((ci) => ci.id !== itemId);
    } else {
      if (qty > product.stock) {
        return sendError(res, 400, `Only ${product.stock} units available`, 'INSUFFICIENT_STOCK');
      }
      item.quantity = qty;
      item.updatedAt = new Date();
    }

    return getCart(req, res);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update cart item', 'SERVER_ERROR');
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const store = getMemoryStore();

    store.cartItems = store.cartItems.filter((ci) => ci.id !== itemId);
    return getCart(req, res);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to remove cart item', 'SERVER_ERROR');
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const store = getMemoryStore();
    const cart = store.carts.find((c) => c.userId === userId);

    if (cart) {
      store.cartItems = store.cartItems.filter((ci) => ci.cartId !== cart.id);
    }

    return sendSuccess(res, 200, 'Cart cleared successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to clear cart', 'SERVER_ERROR');
  }
};
