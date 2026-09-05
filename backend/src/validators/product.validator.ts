import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    discountPrice: z.coerce.number().positive().optional().nullable(),
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    categoryId: z.string().min(1, 'Invalid Category ID'),
    brandId: z.string().min(1, 'Invalid Brand ID'),
    isFeatured: z.coerce.boolean().optional(),
    isTrending: z.coerce.boolean().optional(),
    isFlashSale: z.coerce.boolean().optional(),
    specifications: z.record(z.any()).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Invalid Product ID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    price: z.coerce.number().positive().optional(),
    discountPrice: z.coerce.number().positive().optional().nullable(),
    sku: z.string().min(3).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    categoryId: z.string().min(1).optional(),
    brandId: z.string().min(1).optional(),
    isFeatured: z.coerce.boolean().optional(),
    isTrending: z.coerce.boolean().optional(),
    isFlashSale: z.coerce.boolean().optional(),
    specifications: z.record(z.any()).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),
    search: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    rating: z.coerce.number().optional(),
    inStock: z.coerce.boolean().optional(),
    sort: z.enum([
      'featured',
      'price_asc',
      'price_desc',
      'rating_desc',
      'newest',
      'bestselling',
      'discount',
    ]).default('featured'),
    featured: z.coerce.boolean().optional(),
    trending: z.coerce.boolean().optional(),
    flashSale: z.coerce.boolean().optional(),
  }),
});
