import { apiClient } from './client.js';
import { ApiResponse, Category } from '../types/index.js';

export const categoryApi = {
  getCategories: async () => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },

  getCategoryById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data;
  },

  createCategory: async (data: Partial<Category>) => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return res.data;
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/categories/${id}`);
    return res.data;
  },
};
