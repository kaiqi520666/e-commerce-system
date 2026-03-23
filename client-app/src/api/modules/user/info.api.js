import api from '../../core'

export const infoApi = {
  person: () => api.post('/app/user/info/person'),
  updatePerson: (data) => api.post('/app/user/info/updatePerson', data),
}
