import api from './api';

export const membershipService = {
  getAll:  ()     => api.get('/gym/membership/getallmembership'),
  getById: (id)   => api.get(`/gym/membership/getmembership/${id}`),
  save:    (data) => api.post('/gym/membership/save', data),
  update:  (data) => api.put('/gym/membership/update', data),
  delete:  (id)   => api.delete(`/gym/membership/deletemembership/${id}`)
    .catch(err => {
      if (err.response?.status === 200 || err.response?.status === 204) return err.response;
      throw err;
    }),
};
