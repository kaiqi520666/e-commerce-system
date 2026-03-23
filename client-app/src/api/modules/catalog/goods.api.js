import api from '../../core'

export const goodsApi = {
  list: (data) => api.post('/open/catalog/goods/list', data),
  info: (id) => api.get(`/open/catalog/goods/info?id=${id}`),
  page: (data) => api.post('/open/catalog/goods/page', data),
}
