import { apiClient } from './client.js';
import { ApiResponse, Order } from '../types/index.js';

export const orderApi = {
  createOrder: async (orderData: {
    addressId?: string;
    shippingAddress?: any;
    deliveryMethod?: string;
    paymentMethod?: string;
    couponCode?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<{ order: Order; razorpayOrder?: any }>>(
      '/orders',
      orderData
    );
    return res.data;
  },

  getOrders: async (status?: string) => {
    const url = status ? `/orders?status=${status}` : '/orders';
    const res = await apiClient.get<ApiResponse<Order[]>>(url);
    return res.data;
  },

  getOrderById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const res = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return res.data;
  },
};
