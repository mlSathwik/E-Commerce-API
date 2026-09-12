import { apiClient } from './client.js';
import { ApiResponse, Brand } from '../types/index.js';
import { catalogService } from '../data/catalogService.js';

export const brandApi = {
  getBrands: async () => {
    try {
      const res = await apiClient.get<ApiResponse<Brand[]>>('/brands');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length >= 20) {
        return res.data;
      }
    } catch (err) {
      // Fallback
    }
    return {
      success: true,
      message: 'Brands loaded',
      data: catalogService.getBrands(),
    };
  },

  getBrandById: async (id: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Brand>>(`/brands/${id}`);
      if (res.data?.success && res.data.data) {
        return res.data;
      }
    } catch (err) {}
    const brand = catalogService.getBrands().find((b) => b.id === id || b.slug === id);
    if (brand) {
      return { success: true, message: 'Brand loaded', data: brand };
    }
    throw new Error('Brand not found');
  },

  createBrand: async (data: Partial<Brand>) => {
    const res = await apiClient.post<ApiResponse<Brand>>('/brands', data);
    return res.data;
  },

  updateBrand: async (id: string, data: Partial<Brand>) => {
    const res = await apiClient.put<ApiResponse<Brand>>(`/brands/${id}`, data);
    return res.data;
  },

  deleteBrand: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/brands/${id}`);
    return res.data;
  },
};
