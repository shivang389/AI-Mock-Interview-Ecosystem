import axios from 'axios';

const API = axios.create({
  // Shifts targeting to the fresh, unhijacked port 5005
  baseURL: 'http://127.0.0.1:5005/api/v1',
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