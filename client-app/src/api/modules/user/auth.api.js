import api from '../index'

export const authApi = {
  login: (data) => api.post('/user/login', data),
  register: (data) => api.post('/user/register', data),
}
