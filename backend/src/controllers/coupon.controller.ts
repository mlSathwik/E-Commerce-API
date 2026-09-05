import { Request, Response } from 'express';
import crypto from 'crypto';
import { getMemoryStore } from '../services/db.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    const store = getMemoryStore();

    const coupon = store.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );

    if (!coupon) {
      return sendError(res, 404, 'Invalid coupon code', 'COUPON_NOT_FOUND');
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return sendError(res, 400, 'This coupon has expired', 'COUPON_EXPIRED');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return sendError(res, 400, 'Coupon usage limit has been reached', 'COUPON_LIMIT_REACHED');
    }

    if (orderAmount < coupon.minimumOrder) {
      return sendError(
        res,
        400,
        `Minimum order amount of ₹${coupon.minimumOrder} required for this coupon`,
        'MINIMUM_ORDER_NOT_MET'
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return sendSuccess(res, 200, 'Coupon applied successfully', {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount: Math.min(discountAmount, orderAmount),
    });
  } catch (error: any) {
    return sendError(res, 500, 'Coupon validation failed', 'SERVER_ERROR');
  }
};

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const store = getMemoryStore();
    return sendSuccess(res, 200, 'Coupons fetched', store.coupons);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch coupons', 'SERVER_ERROR');
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrder = 0,
      maxDiscount,
      expiryDate,
      usageLimit = 100,
      isActive = true,
    } = req.body;
    const store = getMemoryStore();

    const normalizedCode = code.trim().toUpperCase();
    const existing = store.coupons.find((c) => c.code === normalizedCode);
    if (existing) {
      return sendError(res, 400, 'Coupon code already exists', 'COUPON_EXISTS');
    }

    const newCoupon = {
      id: crypto.randomUUID(),
      code: normalizedCode,
      discountType,
      discountValue: parseFloat(discountValue),
      minimumOrder: parseFloat(minimumOrder),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      expiryDate: new Date(expiryDate),
      usageLimit: parseInt(usageLimit, 10),
      usedCount: 0,
      isActive: Boolean(isActive),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.coupons.unshift(newCoupon);
    return sendSuccess(res, 201, 'Coupon created successfully', newCoupon);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to create coupon', 'SERVER_ERROR');
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const idx = store.coupons.findIndex((c) => c.id === id);
    if (idx === -1) {
      return sendError(res, 404, 'Coupon not found', 'COUPON_NOT_FOUND');
    }

    store.coupons[idx] = {
      ...store.coupons[idx],
      ...req.body,
      updatedAt: new Date(),
    };

    return sendSuccess(res, 200, 'Coupon updated successfully', store.coupons[idx]);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to update coupon', 'SERVER_ERROR');
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    store.coupons = store.coupons.filter((c) => c.id !== id);
    return sendSuccess(res, 200, 'Coupon deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete coupon', 'SERVER_ERROR');
  }
};
