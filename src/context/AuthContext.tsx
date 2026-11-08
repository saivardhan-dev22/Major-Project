import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { endpoints } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loginAsDemo = async () => {
    try {
      const res = await endpoints.login({
        email: 'admin@docvision.ai',
        password: 'DocVision2026!'
      });
      if (res.data?.success && res.data.token) {
        localStorage.setItem('docvision_token', res.data.token);
        localStorage.setItem('docvision_logged_in', 'true');
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  const fetchCurrentUser = async () => {
    const hasExplicitLoggedOut = localStorage.getItem('docvision_logged_in') === 'false';
    const storedToken = localStorage.getItem('docvision_token');

    if (hasExplicitLoggedOut) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (storedToken) {
      try {
        const res = await endpoints.getMe();
        if (res.data?.success && res.data.user) {
          setUser(res.data.user);
          setLoading(false);
          return;
        }
      } catch {
        // Token invalid or expired
        localStorage.removeItem('docvision_token');
      }
    }

    // Default initial visit session initialization
    await loginAsDemo();
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await endpoints.login(credentials);
    if (res.data?.success) {
      if (res.data.token) {
        localStorage.setItem('docvision_token', res.data.token);
      }
      localStorage.setItem('docvision_logged_in', 'true');
      setUser(res.data.user);
    }
  };

  const register = async (data: any) => {
    const res = await endpoints.register(data);
    if (res.data?.success) {
      if (res.data.token) {
        localStorage.setItem('docvision_token', res.data.token);
      }
      localStorage.setItem('docvision_logged_in', 'true');
      setUser(res.data.user);
    }
  };

  const logout = async () => {
    try {
      await endpoints.logout();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('docvision_token');
    localStorage.setItem('docvision_logged_in', 'false');
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginAsDemo, refreshProfile }}>
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
