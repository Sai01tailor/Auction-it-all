import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.yourdomain.com',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

export default api;