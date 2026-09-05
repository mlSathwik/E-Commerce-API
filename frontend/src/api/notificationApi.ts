import { apiClient } from './client.js';
import { ApiResponse, NotificationItem } from '../types/index.js';

export const notificationApi = {
  getNotifications: async () => {
    const res = await apiClient.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>(
      '/notifications'
    );
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.put<ApiResponse>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.put<ApiResponse>('/notifications/read-all');
    return res.data;
  },
};
