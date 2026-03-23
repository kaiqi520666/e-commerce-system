import api from '../../core'

export const categoryApi = {
  list: () => api.post('/open/catalog/category/list'),
}
