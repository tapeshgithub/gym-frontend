import api from './api';

export const authService = {
  login: (data) => api.post('/gym/auth/login', data),
  register: (data) => api.post('/gym/auth/register', data),
};
