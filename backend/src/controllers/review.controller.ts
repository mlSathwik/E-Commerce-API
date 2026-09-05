import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../types/index.js';
import { getMemoryStore } from '../services/db.service.js';
import { cacheService } from '../services/cache.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();

    const reviews = store.reviews.filter((r) => r.productId === id);
    return sendSuccess(res, 200, 'Product reviews fetched', reviews);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch reviews', 'SERVER_ERROR');
  }
};

export const createProductReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user!.id;
    const store = getMemoryStore();

    const product = store.products.find((p) => p.id === productId);
    if (!product) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    const user = store.users.find((u) => u.id === userId);

    const newReview = {
      id: crypto.randomUUID(),
      productId,
      userId,
      user: {
        name: user ? user.name : req.user!.name,
        avatar: user ? user.avatar : null,
      },
      rating: parseInt(rating, 10),
      title: title || null,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.reviews.unshift(newReview);

    // Recalculate product rating & review count
    const allProductReviews = store.reviews.filter((r) => r.productId === productId);
    const avgRating =
      allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length;

    product.rating = parseFloat(avgRating.toFixed(1));
    product.numReviews = allProductReviews.length;
    product.updatedAt = new Date();

    await cacheService.delPattern('products:*');

    return sendSuccess(res, 201, 'Review submitted successfully', newReview);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create review', 'SERVER_ERROR');
  }
};

export const getAllReviewsAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = getMemoryStore();
    const enriched = store.reviews.map((r) => {
      const product = store.products.find((p) => p.id === r.productId);
      return {
        ...r,
        productName: product ? product.name : 'Unknown Product',
      };
    });
    return sendSuccess(res, 200, 'All reviews fetched', enriched);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch reviews', 'SERVER_ERROR');
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const review = store.reviews.find((r) => r.id === id);

    if (!review) {
      return sendError(res, 404, 'Review not found', 'REVIEW_NOT_FOUND');
    }

    // Role check: admin or review owner
    if (req.user!.role !== 'ADMIN' && review.userId !== req.user!.id) {
      return sendError(res, 403, 'Unauthorized to delete this review', 'FORBIDDEN');
    }

    store.reviews = store.reviews.filter((r) => r.id !== id);

    // Recalculate
    const allProductReviews = store.reviews.filter((r) => r.productId === review.productId);
    const product = store.products.find((p) => p.id === review.productId);
    if (product) {
      product.numReviews = allProductReviews.length;
      product.rating =
        allProductReviews.length > 0
          ? parseFloat((allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length).toFixed(1))
          : 0;
      product.updatedAt = new Date();
    }

    await cacheService.delPattern('products:*');

    return sendSuccess(res, 200, 'Review deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete review', 'SERVER_ERROR');
  }
};
