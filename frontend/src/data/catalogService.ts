import {
  seedCategories,
  seedBrands,
  seedDeliveryOptions,
  seedEmiPlans,
  seedProducts,
  seedProductVariants,
  seedProductImages,
} from './catalog.data.js';
import { Product, Category, Brand, ProductVariant, ProductFilters } from '../types/index.js';

// Pre-build index maps for ultra-fast lookups
const categoryMap = new Map<string, Category>();
seedCategories.forEach((c) => {
  categoryMap.set(c.id, {
    ...c,
    productCount: seedProducts.filter((p) => p.categoryId === c.id).length,
  });
});

const brandMap = new Map<string, Brand>();
seedBrands.forEach((b) => {
  brandMap.set(b.id, {
    ...b,
    productCount: seedProducts.filter((p) => p.brandId === b.id).length,
  });
});

// Build full product list with relations
export const allProducts: Product[] = seedProducts.map((p) => {
  const images = seedProductImages
    .filter((img) => img.productId === p.id)
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    .map((img) => img.url);

  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80';
  const category = categoryMap.get(p.categoryId);
  const brand = brandMap.get(p.brandId);
  const variants: ProductVariant[] = seedProductVariants
    .filter((v) => v.productId === p.id)
    .map((v) => ({
      ...v,
      image: v.image || primaryImage,
    }));

  return {
    ...p,
    name: p.name,
    images: images.length > 0 ? images : [primaryImage],
    thumbnail: primaryImage,
    category,
    brand,
    variants,
    deliveryOptions: seedDeliveryOptions,
    emiPlans: seedEmiPlans,
  } as unknown as Product;
});

export const catalogService = {
  getCategories: (): Category[] => {
    return Array.from(categoryMap.values());
  },

  getCategoryByIdOrSlug: (idOrSlug: string): Category | undefined => {
    return (
      categoryMap.get(idOrSlug) ||
      Array.from(categoryMap.values()).find((c) => c.slug === idOrSlug)
    );
  },

  getBrands: (): Brand[] => {
    return Array.from(brandMap.values());
  },

  getProducts: (filters: ProductFilters = {}) => {
    let filtered = [...allProducts];

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const cat = Array.from(categoryMap.values()).find(
        (c) => c.slug.toLowerCase() === filters.category?.toLowerCase() || c.id === filters.category
      );
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }

    // Brand filter
    if (filters.brand && filters.brand !== 'all') {
      const br = Array.from(brandMap.values()).find(
        (b) => b.slug.toLowerCase() === filters.brand?.toLowerCase() || b.id === filters.brand
      );
      if (br) {
        filtered = filtered.filter((p) => p.brandId === br.id);
      }
    }

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }

    // Price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => (p.discountPrice || p.price) >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => (p.discountPrice || p.price) <= (filters.maxPrice ?? Infinity));
    }

    // Rating
    if (filters.rating) {
      filtered = filtered.filter((p) => p.rating >= (filters.rating ?? 0));
    }

    // In Stock
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Featured / Trending / Flash Sale
    if (filters.featured) {
      filtered = filtered.filter((p) => p.isFeatured);
    }
    if (filters.trending) {
      filtered = filtered.filter((p) => p.isTrending);
    }
    if (filters.flashSale) {
      filtered = filtered.filter((p) => p.isFlashSale);
    }

    // Variant attributes filtering
    if (filters.storage) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v) => v.storage?.toLowerCase() === filters.storage?.toLowerCase())
      );
    }
    if (filters.ram) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v) => v.ram?.toLowerCase() === filters.ram?.toLowerCase())
      );
    }
    if (filters.size) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v) => v.size?.toLowerCase() === filters.size?.toLowerCase())
      );
    }
    if (filters.color) {
      filtered = filtered.filter((p) =>
        p.variants?.some((v) => v.color?.toLowerCase() === filters.color?.toLowerCase())
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'price-low':
        filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'new':
        filtered.reverse();
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
        break;
    }

    const total = filtered.length;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  getProductByIdOrSlug: (idOrSlug: string): Product | undefined => {
    return allProducts.find(
      (p) => p.id === idOrSlug || p.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
  },

  getSuggestions: (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand?.name.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.discountPrice || p.price,
        discountPrice: p.discountPrice,
        image: p.thumbnail,
        category: p.category?.name,
      }));
  },

  getFilterOptions: (categorySlug?: string) => {
    let prods = allProducts;
    if (categorySlug && categorySlug !== 'all') {
      const cat = Array.from(categoryMap.values()).find(
        (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
      );
      if (cat) {
        prods = prods.filter((p) => p.categoryId === cat.id);
      }
    }

    const brandNames = Array.from(
      new Set(prods.map((p) => p.brand?.name).filter(Boolean) as string[])
    );

    const colors = new Set<string>();
    const storage = new Set<string>();
    const ram = new Set<string>();
    const sizes = new Set<string>();

    prods.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.color) colors.add(v.color);
        if (v.storage) storage.add(v.storage);
        if (v.ram) ram.add(v.ram);
        if (v.size) sizes.add(v.size);
      });
    });

    const prices = prods.map((p) => p.discountPrice || p.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 200000;

    return {
      categories: Array.from(categoryMap.values()).map((c) => c.name),
      brands: brandNames,
      colors: Array.from(colors),
      storage: Array.from(storage),
      ram: Array.from(ram),
      sizes: Array.from(sizes),
      priceRange: { min: minPrice, max: maxPrice },
    };
  },
};
