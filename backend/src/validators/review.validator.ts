import { z } from 'zod';

export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid Product ID'),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(2).optional(),
    comment: z.string().min(5, 'Review comment must be at least 5 characters'),
  }),
});
