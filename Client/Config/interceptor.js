import api from './Axios';
import { getCookie } from '../src/Components/Global/CookieIT';
import { deleteCookie } from '../src/Components/Global/CookieIT';

/* ─────────────────────────────────────────────
   REQUEST INTERCEPTOR
   Attaches the auth token from the cookie to
   every outgoing request automatically.
   ───────────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = getCookie('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─────────────────────────────────────────────
   RESPONSE INTERCEPTOR
   Handles 401 Unauthorized globally — clears
   the stale cookie and redirects to login.
   ───────────────────────────────────────────── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie('auth_token');
      
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/auth/') || 
                          window.location.pathname.startsWith('/login') || 
                          window.location.pathname.startsWith('/sign-up');

      if (!isAuthRoute) {
        // Use full reload so React state is cleared cleanly
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;