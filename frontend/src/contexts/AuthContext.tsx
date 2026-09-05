import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index.js';
import { authApi } from '../api/authApi.js';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'admin' | 'customer') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shopsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('shopsphere_access_token')
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('shopsphere_logout', handleLogoutEvent);
    return () => window.removeEventListener('shopsphere_logout', handleLogoutEvent);
  }, []);

  const saveAuthSession = (userData: User, token: string, refreshToken: string) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('shopsphere_user', JSON.stringify(userData));
    localStorage.setItem('shopsphere_access_token', token);
    localStorage.setItem('shopsphere_refresh_token', refreshToken);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      saveAuthSession(response.data.user, response.data.accessToken, response.data.refreshToken);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      saveAuthSession(response.data.user, response.data.accessToken, response.data.refreshToken);
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin@shopsphere.com', 'Admin@123456');
    } else {
      await login('customer@shopsphere.com', 'Customer@123456');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network logout failures on local
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('shopsphere_user');
      localStorage.removeItem('shopsphere_access_token');
      localStorage.removeItem('shopsphere_refresh_token');
    }
  };

  const refreshUser = async () => {
    if (!accessToken) return;
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      localStorage.setItem('shopsphere_user', JSON.stringify(res.data));
    } catch {
      // In case token expired
    }
  };

  const isAuthenticated = Boolean(user && accessToken);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
