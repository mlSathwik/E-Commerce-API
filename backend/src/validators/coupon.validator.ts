import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).toUpperCase(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    discountValue: z.number().positive(),
    minimumOrder: z.number().min(0).default(0),
    maxDiscount: z.number().positive().optional().nullable(),
    expiryDate: z.string().datetime().or(z.string().min(10)),
    usageLimit: z.number().int().min(1).default(100),
    isActive: z.boolean().default(true),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    orderAmount: z.number().positive(),
  }),
});
