import { apiClient } from './client.js';
import { ApiResponse, Product, ProductFilters } from '../types/index.js';

export const productApi = {
  getProducts: async (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const res = await apiClient.get<ApiResponse<Product[]>>(`/products?${params.toString()}`);
    return res.data;
  },

  getProductById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
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
};
