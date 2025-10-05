import { useState, useEffect } from 'react';
import { api } from '@shared/api';
import { API_CONFIG } from '@shared/config';

export function useAuth() {
  const [state, setState] = useState({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Verify token and get user profile using new endpoint structure
    const verifyToken = async () => {
      try {
        const response = await api.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
        if (response.success && response.data?.user) {
          setState({
            user: response.data.user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          localStorage.removeItem('auth_token');
          setState(prev => ({ ...prev, token: null, isLoading: false }));
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        setState(prev => ({ ...prev, token: null, isLoading: false }));
      }
    };

    verifyToken();
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('userRole');
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    window.location.href = '/signin';
  };

  return { ...state, logout };
}