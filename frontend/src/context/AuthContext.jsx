import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Sync / verify authenticated user session on mount
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/users/profile');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, [logout]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = res.data;

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(receivedToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, ...createdUser } = res.data;

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(createdUser));

    setToken(receivedToken);
    setUser(createdUser);
    return createdUser;
  };

  const updateProfile = async (updateData) => {
    const res = await api.put('/users/profile', updateData);
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  };

  const changePassword = async (passwordData) => {
    const res = await api.put('/users/change-password', passwordData);
    return res.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
