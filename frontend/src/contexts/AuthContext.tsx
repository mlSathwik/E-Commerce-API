import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { authApi } from '../api/authApi.js';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; confirmPassword?: string }) => Promise<void>;
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
    const cleanEmail = email.trim().toLowerCase();
    try {
      // Race API against a 3.5s timeout for fast resilient demo experience
      const apiPromise = authApi.login({ email: cleanEmail, password });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 3500)
      );

      let response;
      try {
        response = await Promise.race([apiPromise, timeoutPromise]);
      } catch (raceErr: any) {
        // Fallback for demo users if backend is sleeping or timing out
        if (
          (cleanEmail === 'customer@shopsphere.com' && password === 'Customer@123456') ||
          (cleanEmail === 'admin@shopsphere.com' && password === 'Admin@123456')
        ) {
          const isAdminUser = cleanEmail === 'admin@shopsphere.com';
          const mockUser: User = {
            id: isAdminUser ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222',
            email: cleanEmail,
            name: isAdminUser ? 'ShopSphere Admin' : 'Alex Johnson',
            phone: isAdminUser ? '+91 9876543210' : '+91 9876543211',
            avatar: isAdminUser
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            role: isAdminUser ? 'ADMIN' : 'CUSTOMER',
            createdAt: new Date().toISOString(),
          };
          saveAuthSession(mockUser, 'demo_access_token_' + Date.now(), 'demo_refresh_token_' + Date.now());
          return;
        }
        throw raceErr;
      }

      if (response && response.data) {
        saveAuthSession(response.data.user, response.data.accessToken, response.data.refreshToken);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; confirmPassword?: string }) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      if (response && response.data) {
        saveAuthSession(response.data.user, response.data.accessToken, response.data.refreshToken);
      }
    } catch (err: any) {
      // If backend is unavailable, provide seamless client registration
      if (!err.response || err.code === 'ERR_NETWORK') {
        const fallbackUser: User = {
          id: 'user-' + Date.now(),
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone || undefined,
          role: 'CUSTOMER',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
          createdAt: new Date().toISOString(),
        };
        saveAuthSession(fallbackUser, 'demo_access_token_' + Date.now(), 'demo_refresh_token_' + Date.now());
        return;
      }
      throw err;
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
