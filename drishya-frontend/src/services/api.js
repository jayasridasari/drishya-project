// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true, // Send cookies
});

let accessToken = null;

// Request interceptor - Add access token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from cookie (sent automatically)
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/refresh`,
          { refreshToken: localStorage.getItem('refreshToken') }
        );
        
        accessToken = data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        // Refresh failed - logout
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const setAccessToken = (token) => { accessToken = token; };
export default api;
