import api from '../index'

export const infoApi = {
  person: () => api.post('/user/person'),
  updatePerson: (data) => api.post('/user/updatePerson', data),
}
