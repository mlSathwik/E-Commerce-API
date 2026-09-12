import { apiClient } from './client.js';
import { ApiResponse, Category } from '../types/index.js';
import { catalogService } from '../data/catalogService.js';

export const categoryApi = {
  getCategories: async () => {
    try {
      const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length >= 11) {
        const scrubbed = ['gaming-vr', 'home-kitchen', 'sports-fitness', 'womens-fashion', 'fitness'];
        const hasScrubbed = res.data.data.some((c) => scrubbed.includes(c.slug.toLowerCase()));
        if (!hasScrubbed) {
          return res.data;
        }
      }
    } catch (err) {
      // Ignore and fallback
    }
    return {
      success: true,
      message: 'Categories loaded',
      data: catalogService.getCategories(),
    };
  },

  getCategoryById: async (id: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
      if (res.data?.success && res.data.data) {
        return res.data;
      }
    } catch (err) {}
    const cat = catalogService.getCategoryByIdOrSlug(id);
    if (cat) {
      return { success: true, message: 'Category loaded', data: cat };
    }
    throw new Error('Category not found');
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
