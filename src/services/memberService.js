import api from './api';

export const memberService = {
  getAll: () => api.get('/gym/member/getallmember'),
  getById: (id) => api.get(`/gym/member/getmember/${id}`),
  save: (data) => api.post('/gym/member/save', data),
  update: (data) => api.put('/gym/member/updatemember', data),
  delete: (id) => api.delete(`/gym/member/deletemember/${id}`),
};