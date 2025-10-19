import axios from 'axios';

let accessToken = null;

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken: localStorage.getItem('refreshToken') });
        accessToken = data.accessToken;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export const setAccessToken = (token) => { accessToken = token; };
export default api;
