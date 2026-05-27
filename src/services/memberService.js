import api from './api';

export const memberService = {
  getAll:  ()     => api.get('/gym/member/getallmember'),
  getById: (id)   => api.get(`/gym/member/getmember/${id}`),
  save:    (data) => api.post('/gym/member/save', data),
  update:  (data) => api.put('/gym/member/updatemember', data),
  delete:  (id)   => api.delete(`/gym/member/deletemember/${id}`)
    .catch(err => {
      // DELETE returns void (200 with no body or 204)
      // Axios sometimes errors on empty body - treat 200/204 as success
      if (err.response?.status === 200 || err.response?.status === 204) return err.response;
      throw err;
    }),
};
