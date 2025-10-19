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
