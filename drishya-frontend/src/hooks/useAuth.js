import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/api/profile');
      setUser(data.profile);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', { 
        refreshToken: localStorage.getItem('refreshToken') 
      });
      localStorage.removeItem('refreshToken');
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed');
    }
  };

  return { user, loading, logout };
};
