import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../types/index.js';
import { getMemoryStore } from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const store = getMemoryStore();

    let wishlist = store.wishlists.find((w) => w.userId === userId);
    if (!wishlist) {
      wishlist = { id: crypto.randomUUID(), userId, createdAt: new Date(), updatedAt: new Date() };
      store.wishlists.push(wishlist);
    }

    const items = store.wishlistItems
      .filter((wi) => wi.wishlistId === wishlist!.id)
      .map((wi) => {
        const product = store.products.find((p) => p.id === wi.productId);
        const category = product ? store.categories.find((c) => c.id === product.categoryId) : undefined;
        const brand = product ? store.brands.find((b) => b.id === product.brandId) : undefined;
        return {
          id: wi.id,
          productId: wi.productId,
          product: product ? { ...product, category, brand } : undefined,
          createdAt: wi.createdAt,
        };
      })
      .filter((wi) => wi.product !== undefined);

    return sendSuccess(res, 200, 'Wishlist fetched successfully', {
      id: wishlist.id,
      items,
      count: items.length,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch wishlist', 'SERVER_ERROR');
  }
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;
    const store = getMemoryStore();

    const product = store.products.find((p) => p.id === productId);
    if (!product) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    let wishlist = store.wishlists.find((w) => w.userId === userId);
    if (!wishlist) {
      wishlist = { id: crypto.randomUUID(), userId, createdAt: new Date(), updatedAt: new Date() };
      store.wishlists.push(wishlist);
    }

    const existing = store.wishlistItems.find((wi) => wi.wishlistId === wishlist!.id && wi.productId === productId);
    if (!existing) {
      store.wishlistItems.push({
        id: crypto.randomUUID(),
        wishlistId: wishlist.id,
        productId,
        createdAt: new Date(),
      });
    }

    return getWishlist(req, res);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to add item to wishlist', 'SERVER_ERROR');
  }
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;
    const store = getMemoryStore();

    const wishlist = store.wishlists.find((w) => w.userId === userId);
    if (wishlist) {
      store.wishlistItems = store.wishlistItems.filter(
        (wi) => !(wi.wishlistId === wishlist.id && (wi.productId === productId || wi.id === productId))
      );
    }

    return getWishlist(req, res);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to remove item from wishlist', 'SERVER_ERROR');
  }
};
