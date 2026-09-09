import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      set({
        user: response.data,
        token: response.data.token,
        isLoading: false,
      });
      localStorage.setItem('token', response.data.token);
      return response;
    } catch (error) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(email);
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  verify: async (email, otp, username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.verify(email, otp, username, password);
      set({
        user: response.data,
        token: response.data.token,
        isLoading: false,
      });
      localStorage.setItem('token', response.data.token);
      return response;
    } catch (error) {
      set({
        error: error.message || 'Verification failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    set({
      user: null,
      token: null,
    });
    localStorage.removeItem('token');
  },

  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.getProfile();
      set({
        user: response.data,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch profile',
        isLoading: false,
      });
      throw error;
    }
  },

  isAuthenticated: () => {
    const state = useAuthStore.getState();
    return !!state.token && !!state.user;
  },
}));
