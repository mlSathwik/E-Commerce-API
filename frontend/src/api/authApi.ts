import { apiClient } from './client.js';
import { ApiResponse, User } from '../types/index.js';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      credentials
    );
    return res.data;
  },

  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/register',
      data
    );
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  updateProfile: async (data: { name?: string; phone?: string; avatar?: string }) => {
    const res = await apiClient.put<ApiResponse<User>>('/auth/me', data);
    return res.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('shopsphere_refresh_token');
    const res = await apiClient.post<ApiResponse>('/auth/logout', { refreshToken });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; password: string }) => {
    const res = await apiClient.post<ApiResponse>('/auth/reset-password', data);
    return res.data;
  },

  adminLogin: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/admin/login',
      credentials
    );
    return res.data;
  },

  adminRegister: async (data: { name: string; email: string; password: string; adminCode: string; phone?: string }) => {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/admin/register',
      data
    );
    return res.data;
  },
};
