import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach access token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopsphere_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('shopsphere_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem('shopsphere_access_token', newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('shopsphere_access_token');
          localStorage.removeItem('shopsphere_refresh_token');
          localStorage.removeItem('shopsphere_user');
          // Dispatch custom event for auth context
          window.dispatchEvent(new Event('shopsphere_logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);
