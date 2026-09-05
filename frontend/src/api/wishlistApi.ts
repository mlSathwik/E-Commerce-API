import { apiClient } from './client.js';
import { ApiResponse, Wishlist } from '../types/index.js';

export const wishlistApi = {
  getWishlist: async () => {
    const res = await apiClient.get<ApiResponse<Wishlist>>('/wishlist');
    return res.data;
  },

  addToWishlist: async (productId: string) => {
    const res = await apiClient.post<ApiResponse<Wishlist>>('/wishlist', { productId });
    return res.data;
  },

  removeFromWishlist: async (productId: string) => {
    const res = await apiClient.delete<ApiResponse<Wishlist>>(`/wishlist/${productId}`);
    return res.data;
  },
};
