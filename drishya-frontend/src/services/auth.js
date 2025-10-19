import { setAccessToken } from '../services/api';

// Initialize auth on app start
export const initializeAuth = () => {
  const user = localStorage.getItem('user');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (user && refreshToken) {
    console.log('🔐 Found stored auth data');
    // Don't set access token here - it will be refreshed on first API call
    return true;
  }
  
  console.log('❌ No stored auth data');
  return false;
};

// Clear all auth data
export const clearAuth = () => {
  console.log('🧹 Clearing all auth data');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
  setAccessToken(null);
};
