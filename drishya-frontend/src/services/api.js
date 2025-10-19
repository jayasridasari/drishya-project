import axios from 'axios';

let accessToken = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
        );
        
        accessToken = data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        accessToken = null;
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export const setAccessToken = (token) => {
  accessToken = token;
};

export default api;
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
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
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
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
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
