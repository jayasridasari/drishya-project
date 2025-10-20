import axios from 'axios';
import { toast } from 'react-toastify';

let accessToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add access token
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('✅ Access token attached');
    } else {
      console.log('⚠️ No access token available');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error('Status:', error.response?.status);
    console.error('Error data:', error.response?.data);

    // FIX: Don't refresh auth tokens for login/register/refresh endpoints
    const isAuthEndpoint =
      originalRequest.url.includes('/api/auth/login') ||
      originalRequest.url.includes('/api/auth/register') ||
      originalRequest.url.includes('/api/auth/refresh');

    // Only attempt refresh for protected APIs, not for login/register/refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      console.log('🔄 Attempting token refresh...');
      if (isRefreshing) {
        console.log('⏳ Token refresh already in progress, queuing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          console.error('❌ No refresh token found');
          throw new Error('No refresh token available');
        }

        console.log('🔑 Calling refresh endpoint...');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
          { refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          }
        );

        console.log('✅ Token refreshed successfully');
        accessToken = data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear auth data
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        accessToken = null;

        // Show error and redirect
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);

        return Promise.reject(refreshError);
      }
    }

    // For login and registration, just reject and let login page show the error from backend
    return Promise.reject(error);
  }
);

export const setAccessToken = (token) => {
  console.log('🔐 Setting access token:', token ? 'Token set' : 'Token cleared');
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export default api;
