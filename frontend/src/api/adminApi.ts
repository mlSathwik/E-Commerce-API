import { apiClient } from './client.js';
import { ApiResponse } from '../types/index.js';

export const adminApi = {
  getDashboardStats: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/admin/dashboard');
    return res.data;
  },

  getAnalytics: async (range: string = '30d') => {
    const res = await apiClient.get<ApiResponse<any>>(`/admin/analytics?range=${range}`);
    return res.data;
  },

  getCustomers: async () => {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/customers');
    return res.data;
  },

  getInventory: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/admin/inventory');
    return res.data;
  },

  updateStock: async (productId: string, stock: number) => {
    const res = await apiClient.put<ApiResponse<any>>(`/admin/inventory/${productId}`, { stock });
    return res.data;
  },

  uploadImage: async (formData: FormData) => {
    const res = await apiClient.post<ApiResponse<{ url: string }>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
