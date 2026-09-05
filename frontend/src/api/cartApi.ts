import { apiClient } from './client.js';
import { ApiResponse, Cart } from '../types/index.js';

export const cartApi = {
  getCart: async () => {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart');
    return res.data;
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    const res = await apiClient.post<ApiResponse<Cart>>('/cart/add', {
      productId,
      quantity,
    });
    return res.data;
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const res = await apiClient.put<ApiResponse<Cart>>(`/cart/${itemId}`, {
      quantity,
    });
    return res.data;
  },

  removeCartItem: async (itemId: string) => {
    const res = await apiClient.delete<ApiResponse<Cart>>(`/cart/${itemId}`);
    return res.data;
  },

  clearCart: async () => {
    const res = await apiClient.delete<ApiResponse>('/cart');
    return res.data;
  },
};
