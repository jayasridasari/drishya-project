import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Point to your backend
  withCredentials: true
});

export default api;
