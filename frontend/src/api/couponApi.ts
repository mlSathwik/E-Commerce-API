import { apiClient } from './client.js';
import { ApiResponse, Coupon } from '../types/index.js';

export const couponApi = {
  validateCoupon: async (code: string, orderAmount: number) => {
    const res = await apiClient.post<ApiResponse<{ coupon: Partial<Coupon>; discountAmount: number }>>(
      '/coupons/validate',
      { code, orderAmount }
    );
    return res.data;
  },

  getCoupons: async () => {
    const res = await apiClient.get<ApiResponse<Coupon[]>>('/coupons');
    return res.data;
  },

  createCoupon: async (data: Partial<Coupon>) => {
    const res = await apiClient.post<ApiResponse<Coupon>>('/coupons', data);
    return res.data;
  },

  updateCoupon: async (id: string, data: Partial<Coupon>) => {
    const res = await apiClient.put<ApiResponse<Coupon>>(`/coupons/${id}`, data);
    return res.data;
  },

  deleteCoupon: async (id: string) => {
    const res = await apiClient.delete<ApiResponse>(`/coupons/${id}`);
    return res.data;
  },
};
