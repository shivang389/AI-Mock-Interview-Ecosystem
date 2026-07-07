import { create } from 'zustand';
import API from '../services/api';

export const useAuthStore = create((set) => ({
  user: localStorage.getItem('amie-auth') 
    ? JSON.parse(localStorage.getItem('amie-auth')).user 
    : null,
  token: localStorage.getItem('amie-auth') 
    ? JSON.parse(localStorage.getItem('amie-auth')).token 
    : null,
  isAuthenticated: !!localStorage.getItem('amie-auth'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data.data;

      localStorage.setItem('amie-auth', JSON.stringify({ token, user }));
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { 
        success: false, 
        message: error.response?.data?.error?.message || 'Authentication execution failure.' 
      };
    }
  },

  register: async (name, email, password, role = 'candidate') => {
    set({ loading: true });
    try {
      const response = await API.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data.data;

      localStorage.setItem('amie-auth', JSON.stringify({ token, user }));
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { 
        success: false, 
        message: error.response?.data?.error?.message || 'Registration structural failure.' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('amie-auth');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));