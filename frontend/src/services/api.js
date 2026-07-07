import axios from 'axios';

// Dynamically targets Cloud Backend in production, falls back to local port 5005 for development
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5005/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('amie-auth');
    if (authStorage) {
      const { token } = JSON.parse(authStorage);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;