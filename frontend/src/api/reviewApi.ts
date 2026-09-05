import { apiClient } from './client.js';
import { ApiResponse, Review } from '../types/index.js';

export const reviewApi = {
  getProductReviews: async (productId: string) => {
    const res = await apiClient.get<ApiResponse<Review[]>>(`/reviews/product/${productId}`);
    return res.data;
  },

  createReview: async (productId: string, data: { rating: number; title?: string; comment: string }) => {
    const res = await apiClient.post<ApiResponse<Review>>(`/reviews/product/${productId}`, data);
    return res.data;
  },

  getAllReviewsAdmin: async () => {
    const res = await apiClient.get<ApiResponse<Review[]>>('/reviews/admin');
    return res.data;
  },

  deleteReview: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/reviews/${id}`);
    return res.data;
  },
};
