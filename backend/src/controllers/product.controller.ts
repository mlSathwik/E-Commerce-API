import { Request, Response } from 'express';
import crypto from 'crypto';
import { getMemoryStore } from '../services/db.service.js';
import { cacheService } from '../services/cache.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = (req.query.search as string)?.trim().toLowerCase();
    const category = (req.query.category as string)?.trim().toLowerCase();
    const brand = (req.query.brand as string)?.trim().toLowerCase();
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const rating = req.query.rating ? parseFloat(req.query.rating as string) : undefined;
    const inStock = req.query.inStock === 'true';
    const sort = (req.query.sort as string) || 'featured';
    const featured = req.query.featured === 'true';
    const trending = req.query.trending === 'true';
    const flashSale = req.query.flashSale === 'true';

    // Generate cache key
    const cacheKey = `products:list:${JSON.stringify(req.query)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const store = getMemoryStore();
    let filtered = [...store.products];

    // Search filter
    if (search) {
      filtered = filtered.filter((p) => {
        const cat = store.categories.find((c) => c.id === p.categoryId);
        const br = store.brands.find((b) => b.id === p.brandId);
        return (
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          (cat && cat.name.toLowerCase().includes(search)) ||
          (br && br.name.toLowerCase().includes(search))
        );
      });
    }

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => {
        const cat = store.categories.find((c) => c.id === p.categoryId);
        return cat && (cat.slug === category || cat.id === category || cat.name.toLowerCase() === category);
      });
    }

    // Brand filter
    if (brand && brand !== 'all') {
      filtered = filtered.filter((p) => {
        const br = store.brands.find((b) => b.id === p.brandId);
        return br && (br.slug === brand || br.id === brand || br.name.toLowerCase() === brand);
      });
    }

    // Price range
    if (minPrice !== undefined) {
      filtered = filtered.filter((p) => (p.discountPrice ?? p.price) >= minPrice);
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter((p) => (p.discountPrice ?? p.price) <= maxPrice);
    }

    // Rating
    if (rating !== undefined) {
      filtered = filtered.filter((p) => p.rating >= rating);
    }

    // In Stock
    if (inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Featured / Trending / FlashSale
    if (featured) {
      filtered = filtered.filter((p) => p.isFeatured);
    }
    if (trending) {
      filtered = filtered.filter((p) => p.isTrending);
    }
    if (flashSale) {
      filtered = filtered.filter((p) => p.isFlashSale);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        filtered.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        break;
      case 'rating_desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'bestselling':
        filtered.sort((a, b) => b.numReviews - a.numReviews);
        break;
      case 'discount':
        filtered.sort((a, b) => {
          const discA = a.discountPrice ? (a.price - a.discountPrice) / a.price : 0;
          const discB = b.discountPrice ? (b.price - b.discountPrice) / b.price : 0;
          return discB - discA;
        });
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // Enrich with Category, Brand, and Primary Image
    const enriched = paginated.map((product) => {
      const category = store.categories.find((c) => c.id === product.categoryId);
      const brand = store.brands.find((b) => b.id === product.brandId);
      return {
        ...product,
        category,
        brand,
      };
    });

    const responsePayload = {
      success: true,
      message: 'Products fetched successfully',
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    // Cache product list for 60 seconds
    await cacheService.set(cacheKey, responsePayload, 60);

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Failed to fetch products', 'SERVER_ERROR');
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `products:detail:${id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const store = getMemoryStore();
    const product = store.products.find((p) => p.id === id || p.slug === id);
    if (!product) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    const category = store.categories.find((c) => c.id === product.categoryId);
    const brand = store.brands.find((b) => b.id === product.brandId);
    const reviews = store.reviews.filter((r) => r.productId === product.id);

    // Get related products from the same category
    const relatedProducts = store.products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4)
      .map((p) => ({
        ...p,
        category: store.categories.find((c) => c.id === p.categoryId),
        brand: store.brands.find((b) => b.id === p.brandId),
      }));

    const responsePayload = {
      success: true,
      message: 'Product details fetched successfully',
      data: {
        ...product,
        category,
        brand,
        reviews,
        relatedProducts,
      },
    };

    await cacheService.set(cacheKey, responsePayload, 120);

    return res.status(200).json(responsePayload);
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch product details', 'SERVER_ERROR');
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const store = getMemoryStore();
    const {
      name,
      description,
      price,
      discountPrice,
      sku,
      stock,
      categoryId,
      brandId,
      isFeatured,
      isTrending,
      isFlashSale,
      specifications,
      images,
    } = req.body;

    const existingSku = store.products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
    if (existingSku) {
      return sendError(res, 400, 'Product with this SKU already exists', 'SKU_ALREADY_EXISTS');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);

    const newProduct = {
      id: crypto.randomUUID(),
      name,
      slug,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      sku,
      stock: parseInt(stock, 10),
      rating: 5.0,
      numReviews: 0,
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isFlashSale: Boolean(isFlashSale),
      categoryId,
      brandId,
      specifications: specifications || {},
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.products.unshift(newProduct);

    // Invalidate caches
    await cacheService.delPattern('products:*');

    return sendSuccess(res, 201, 'Product created successfully', newProduct);
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Failed to create product', 'SERVER_ERROR');
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const productIndex = store.products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    const existing = store.products[productIndex];
    const updated = {
      ...existing,
      ...req.body,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : existing.price,
      discountPrice: req.body.discountPrice !== undefined ? (req.body.discountPrice ? parseFloat(req.body.discountPrice) : null) : existing.discountPrice,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : existing.stock,
      updatedAt: new Date(),
    };

    store.products[productIndex] = updated;

    // Invalidate caches
    await cacheService.delPattern('products:*');

    return sendSuccess(res, 200, 'Product updated successfully', updated);
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Failed to update product', 'SERVER_ERROR');
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const store = getMemoryStore();
    const initialLen = store.products.length;
    store.products = store.products.filter((p) => p.id !== id);

    if (store.products.length === initialLen) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Invalidate caches
    await cacheService.delPattern('products:*');

    return sendSuccess(res, 200, 'Product deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete product', 'SERVER_ERROR');
  }
};
