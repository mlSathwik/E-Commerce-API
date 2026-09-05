import { apiClient } from './client.js';
import { ApiResponse, Brand } from '../types/index.js';

export const brandApi = {
  getBrands: async () => {
    const res = await apiClient.get<ApiResponse<Brand[]>>('/brands');
    return res.data;
  },

  getBrandById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Brand>>(`/brands/${id}`);
    return res.data;
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
