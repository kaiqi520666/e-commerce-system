import api from '../../core'

export const authApi = {
  login: (data) => api.post('/open/user/auth/login', data),
  register: (data) => api.post('/open/user/auth/register', data),
}
