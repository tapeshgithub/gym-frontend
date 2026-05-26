import api from './api';

export const planService = {
  getAll: () => api.get('/gym/plan/getallplan'),
  getById: (id) => api.get(`/gym/plan/getplan/${id}`),
  save: (data) => api.post('/gym/plan/save', data),
  update: (data) => api.put('/gym/plan/update', data),
  delete: (id) => api.delete(`/gym/plan/deleteplan/${id}`),
};
