import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().min(1).optional(),
    shippingAddress: z.object({
      fullName: z.string().min(2),
      phone: z.string().min(8),
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(4),
      country: z.string().default('India'),
    }).optional(),
    deliveryMethod: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
    paymentMethod: z.enum(['RAZORPAY', 'COD']).default('RAZORPAY'),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid Order ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  }),
});
