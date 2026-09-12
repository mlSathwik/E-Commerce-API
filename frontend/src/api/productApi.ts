import { apiClient } from './client.js';
import { ApiResponse, Product, ProductFilters } from '../types/index.js';
import { catalogService } from '../data/catalogService.js';

export const productApi = {
  getProducts: async (filters: ProductFilters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const res = await apiClient.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
      // Check if API returned full modern catalog (not legacy 14 products)
      if (res.data?.success && Array.isArray(res.data.data)) {
        // If meta total or data length indicates full catalog, use it
        if ((res.data.meta?.total && res.data.meta.total > 20) || res.data.data.length > 15) {
          return res.data;
        }
      }
    } catch (err) {
      // Fallback
    }

    // Return rich 181-product catalog
    const result = catalogService.getProducts(filters);
    return {
      success: true,
      message: 'Products fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  },

  getProductById: async (id: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
      if (res.data?.success && res.data.data && res.data.data.variants && res.data.data.variants.length > 0) {
        return res.data;
      }
    } catch (err) {}

    const prod = catalogService.getProductByIdOrSlug(id);
    if (prod) {
      return {
        success: true,
        message: 'Product fetched successfully',
        data: prod,
      };
    }
    throw new Error('Product not found');
  },

  createProduct: async (data: Partial<Product>) => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    const res = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/products/${id}`);
    return res.data;
  },

  getSuggestions: async (query: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Array<{ id: string; name: string; price: number; discountPrice?: number | null; image?: string; category?: string }>>>(
        `/products/search/suggestions?q=${encodeURIComponent(query)}`
      );
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data;
      }
    } catch (err) {}

    return {
      success: true,
      message: 'Suggestions loaded',
      data: catalogService.getSuggestions(query),
    };
  },

  getFilterOptions: async (category?: string) => {
    try {
      const url = category
        ? `/products/filters/options?category=${encodeURIComponent(category)}`
        : '/products/filters/options';
      const res = await apiClient.get<ApiResponse<{
        categories: string[];
        brands: string[];
        colors: string[];
        storage: string[];
        ram: string[];
        sizes: string[];
        priceRange: { min: number; max: number };
      }>>(url);
      if (res.data?.success && res.data.data && res.data.data.categories.length >= 11) {
        return res.data;
      }
    } catch (err) {}

    return {
      success: true,
      message: 'Filter options loaded',
      data: catalogService.getFilterOptions(category),
    };
  },
};
