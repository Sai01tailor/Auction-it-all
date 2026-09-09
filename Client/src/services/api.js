import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    throw error.response?.data || error.message;
  }
);

// Auth Endpoints
export const authAPI = {
  register: (email) => apiClient.post('/auth/register', { email }),
  verify: (email, otp, username, password) =>
    apiClient.post('/auth/verify', { email, otp, username, password }),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (email, otp, newPassword) =>
    apiClient.post('/auth/reset-password', { email, otp, newPassword }),
  getProfile: () => apiClient.get('/auth/profile'),
  googleInitiate: () => {
    const baseUrl = API_BASE_URL.replace('/api', '');
    window.location.href = `${baseUrl}/auth/google`;
  },
  googleCallback: (code) => apiClient.get('/auth/google/callback', { params: { code } }),
};

// Auction & Item Endpoints
export const itemsAPI = {
  getItems: (params) => apiClient.get('/items', { params }),
  getFilterOptions: () => apiClient.get('/items/filter-options'),
  getItemById: (id) => apiClient.get(`/items/${id}`),
  getItemBids: (id, params) => apiClient.get(`/items/${id}/bids`, { params }),
  getUserBids: () => apiClient.get('/items/user/my-bids'),
  placeBid: (id, bidAmount) => apiClient.post(`/items/${id}/bid`, { bidAmount }),
  buyDutch: (id) => apiClient.post(`/items/${id}/buy-dutch`, {}),
  submitBlindBid: (id, bidAmount) => apiClient.post(`/items/${id}/blind-bid`, { bidAmount }),
  getBlindReveal: (id) => apiClient.get(`/items/${id}/blind-reveal`),
};

// Seller Endpoints
export const sellerAPI = {
  createListing: (formData) =>
    apiClient.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getListings: (params) => apiClient.get('/seller/listings', { params }),
  getSales: () => apiClient.get('/seller/sales'),
};

// Wallet & Payment Endpoints
export const walletAPI = {
  getBalance: () => apiClient.get('/wallet/balance'),
  createOrder: (amount, currency) =>
    apiClient.post('/payments/create-order', { amount, currency }),
};

// KYC Endpoints
export const kycAPI = {
  getStatus: () => apiClient.get('/kyc/status'),
  submitKYC: (formData) =>
    apiClient.post('/kyc/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Leaderboard Endpoints
export const leaderboardAPI = {
  getLeaderboard: (itemId) =>
    itemId
      ? apiClient.get('/leaderboard', { params: { itemId } })
      : apiClient.get('/leaderboard'),
};

export default apiClient;
