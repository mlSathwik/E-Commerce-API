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
    const color = (req.query.color as string)?.trim().toLowerCase();
    const storage = (req.query.storage as string)?.trim().toLowerCase();
    const ram = (req.query.ram as string)?.trim().toLowerCase();
    const size = (req.query.size as string)?.trim().toLowerCase();

    // Cache key
    const cacheKey = `products:list:${JSON.stringify(req.query)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const store = getMemoryStore();
    let filtered = [...store.products];

    // Multi-token intelligent search across Name, Brand, Category, SKU, Description, Specs, Variants
    if (search) {
      const tokens = search.split(/\s+/).filter(Boolean);
      filtered = filtered.filter((p) => {
        const cat = store.categories.find((c) => c.id === p.categoryId);
        const br = store.brands.find((b) => b.id === p.brandId);
        const pVariants = store.productVariants.filter((v) => v.productId === p.id);
        const varColors = pVariants.map((v) => v.color || '').join(' ');
        const varStorages = pVariants.map((v) => v.storage || '').join(' ');
        const varSizes = pVariants.map((v) => v.size || '').join(' ');
        const specStr = p.specifications ? JSON.stringify(p.specifications) : '';

        const searchableText = `${p.name} ${p.description} ${p.sku} ${cat?.name || ''} ${br?.name || ''} ${specStr} ${varColors} ${varStorages} ${varSizes}`.toLowerCase();

        return tokens.every((token) => searchableText.includes(token));
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

    // Color filter
    if (color && color !== 'all') {
      filtered = filtered.filter((p) => {
        const pVariants = store.productVariants.filter((v) => v.productId === p.id);
        return pVariants.some((v) => v.color && v.color.toLowerCase().includes(color));
      });
    }

    // Storage filter
    if (storage && storage !== 'all') {
      filtered = filtered.filter((p) => {
        const pVariants = store.productVariants.filter((v) => v.productId === p.id);
        return pVariants.some((v) => v.storage && v.storage.toLowerCase() === storage);
      });
    }

    // RAM filter
    if (ram && ram !== 'all') {
      filtered = filtered.filter((p) => {
        const pVariants = store.productVariants.filter((v) => v.productId === p.id);
        return pVariants.some((v) => v.ram && v.ram.toLowerCase() === ram);
      });
    }

    // Size filter
    if (size && size !== 'all') {
      filtered = filtered.filter((p) => {
        const pVariants = store.productVariants.filter((v) => v.productId === p.id);
        return pVariants.some((v) => v.size && v.size.toLowerCase() === size);
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

    // Flags
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

    // Enrich with Category, Brand, and Variants preview
    const enriched = paginated.map((product) => {
      const categoryObj = store.categories.find((c) => c.id === product.categoryId);
      const brandObj = store.brands.find((b) => b.id === product.brandId);
      const productVariants = store.productVariants.filter((v) => v.productId === product.id);
      return {
        ...product,
        category: categoryObj,
        brand: brandObj,
        variants: productVariants,
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

    await cacheService.set(cacheKey, responsePayload, 60);
    return res.status(200).json(responsePayload);
  } catch (error: any) {
    return sendError(res, 500, error.message || 'Failed to fetch products', 'SERVER_ERROR');
  }
};

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string)?.trim().toLowerCase();
    if (!q || q.length < 2) {
      return sendSuccess(res, 200, 'Search suggestions', {
        products: [],
        categories: [],
        brands: [],
      });
    }

    const store = getMemoryStore();
    const tokens = q.split(/\s+/).filter(Boolean);

    // Matching products
    const matchedProducts = store.products
      .filter((p) => {
        const cat = store.categories.find((c) => c.id === p.categoryId);
        const br = store.brands.find((b) => b.id === p.brandId);
        const searchable = `${p.name} ${br?.name || ''} ${cat?.name || ''} ${p.sku}`.toLowerCase();
        return tokens.every((tok) => searchable.includes(tok));
      })
      .slice(0, 6)
      .map((p) => {
        const cat = store.categories.find((c) => c.id === p.categoryId);
        const br = store.brands.find((b) => b.id === p.brandId);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.discountPrice ?? p.price,
          originalPrice: p.price,
          image: p.images?.[0] || null,
          categoryName: cat?.name || 'Category',
          brandName: br?.name || 'Brand',
        };
      });

    // Matching categories
    const matchedCategories = store.categories
      .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
      .slice(0, 3)
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon }));

    // Matching brands
    const matchedBrands = store.brands
      .filter((b) => b.name.toLowerCase().includes(q) || b.slug.includes(q))
      .slice(0, 3)
      .map((b) => ({ id: b.id, name: b.name, slug: b.slug, logo: b.logo }));

    return sendSuccess(res, 200, 'Suggestions fetched', {
      products: matchedProducts,
      categories: matchedCategories,
      brands: matchedBrands,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch search suggestions', 'SERVER_ERROR');
  }
};

export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const categorySlug = (req.query.category as string)?.trim().toLowerCase();
    const store = getMemoryStore();

    let targetProducts = store.products;
    let currentCategory: any = null;

    if (categorySlug && categorySlug !== 'all') {
      currentCategory = store.categories.find(
        (c) => c.slug === categorySlug || c.id === categorySlug || c.name.toLowerCase() === categorySlug
      );
      if (currentCategory) {
        targetProducts = store.products.filter((p) => p.categoryId === currentCategory.id);
      }
    }

    // Aggregate available brands
    const brandIds = new Set(targetProducts.map((p) => p.brandId));
    const availableBrands = store.brands
      .filter((b) => brandIds.has(b.id))
      .map((b) => ({ id: b.id, name: b.name, slug: b.slug }));

    // Price range
    const prices = targetProducts.map((p) => p.discountPrice ?? p.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 250000;

    // Aggregate variants attributes
    const productIds = new Set(targetProducts.map((p) => p.id));
    const relevantVariants = store.productVariants.filter((v) => productIds.has(v.productId));

    const colorsSet = new Set<string>();
    const storageSet = new Set<string>();
    const ramSet = new Set<string>();
    const sizeSet = new Set<string>();

    for (const v of relevantVariants) {
      if (v.color) colorsSet.add(v.color);
      if (v.storage) storageSet.add(v.storage);
      if (v.ram) ramSet.add(v.ram);
      if (v.size) sizeSet.add(v.size);
    }

    return sendSuccess(res, 200, 'Dynamic filter options fetched', {
      category: currentCategory,
      brands: availableBrands,
      priceRange: { min: minPrice, max: maxPrice },
      colors: Array.from(colorsSet),
      storages: Array.from(storageSet),
      rams: Array.from(ramSet),
      sizes: Array.from(sizeSet),
      totalCount: targetProducts.length,
    });
  } catch (error: any) {
    return sendError(res, 500, 'Failed to fetch filter options', 'SERVER_ERROR');
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
    const variants = store.productVariants.filter((v) => v.productId === product.id);
    const reviews = store.reviews.filter((r) => r.productId === product.id);

    // Reviews rating distribution stats
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
    }

    // Related products in the same category
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
        variants,
        deliveryOptions: store.deliveryOptions,
        emiPlans: store.emiPlans,
        reviews,
        reviewStats: {
          averageRating: product.rating,
          totalReviews: product.numReviews,
          distribution,
        },
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
      variants,
    } = req.body;

    const existingSku = store.products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
    if (existingSku) {
      return sendError(res, 400, 'Product with this SKU already exists', 'SKU_ALREADY_EXISTS');
    }

    const slug =
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') +
      '-' +
      Math.floor(Math.random() * 1000);

    const productId = crypto.randomUUID();
    const newProduct = {
      id: productId,
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
      images:
        images && images.length > 0
          ? images
          : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.products.unshift(newProduct);

    // Save product variants if supplied
    if (variants && Array.isArray(variants)) {
      for (const v of variants) {
        store.productVariants.push({
          id: crypto.randomUUID(),
          productId,
          sku: v.sku || `${sku}-${crypto.randomBytes(3).toString('hex')}`,
          color: v.color || null,
          storage: v.storage || null,
          ram: v.ram || null,
          size: v.size || null,
          processor: v.processor || null,
          screenSize: v.screenSize || null,
          price: parseFloat(v.price || price),
          discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : null,
          stock: parseInt(v.stock || stock, 10),
          image: v.image || newProduct.images[0],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

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
      discountPrice:
        req.body.discountPrice !== undefined
          ? req.body.discountPrice
            ? parseFloat(req.body.discountPrice)
            : null
          : existing.discountPrice,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : existing.stock,
      updatedAt: new Date(),
    };

    store.products[productIndex] = updated;

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
    store.productVariants = store.productVariants.filter((v) => v.productId !== id);
    store.productImages = store.productImages.filter((img) => img.productId !== id);

    if (store.products.length === initialLen) {
      return sendError(res, 404, 'Product not found', 'PRODUCT_NOT_FOUND');
    }

    await cacheService.delPattern('products:*');
    return sendSuccess(res, 200, 'Product deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, 'Failed to delete product', 'SERVER_ERROR');
  }
};
