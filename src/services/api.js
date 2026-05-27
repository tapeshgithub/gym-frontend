import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url || '';

    // Only redirect to login on 401 (Unauthorized - token truly invalid/expired)
    // Do NOT redirect on:
    //   - 403 (Forbidden - might be a role issue on one endpoint, not all)
    //   - Network errors (undefined status)
    //   - Any error from mutating endpoints (PUT, DELETE) since the action
    //     succeeded in the DB but the response parsing may fail
    const method = error.config?.method?.toUpperCase();
    const isMutation = method === 'PUT' || method === 'DELETE';

    if (status === 401 && !isMutation) {
      // Genuine auth failure on a read operation - token is expired/invalid
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_user');
      window.location.href = '/login';
    }

    // For mutations (PUT/DELETE) that fail with 401/403,
    // just reject the promise so the page can show an error toast
    // without logging the user out (the action likely succeeded in DB)
    return Promise.reject(error);
  }
);

export default api;
