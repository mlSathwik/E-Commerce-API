import { apiClient } from './client.js';
import { ApiResponse } from '../types/index.js';

export const paymentApi = {
  createCheckoutSession: async (orderId: string) => {
    const res = await apiClient.post<ApiResponse<any>>('/payments/checkout', { orderId });
    return res.data;
  },

  verifyPayment: async (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const res = await apiClient.post<ApiResponse<any>>('/payments/verify', data);
    return res.data;
  },
};
