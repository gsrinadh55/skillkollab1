import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillkollab_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration & network errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An network error occurred';
    
    // Auto-logout if unauthorized on protected resources
    if (status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      localStorage.removeItem('skillkollab_token');
      localStorage.removeItem('skillkollab_user');
      // Dispatch custom event to notify auth context without page reload
      window.dispatchEvent(new CustomEvent('skillkollab_auth_expired'));
    }

    console.error(`[API Error ${status}]:`, message);
    return Promise.reject({ status, message, raw: error });
  }
);

export default api;
