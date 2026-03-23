import api, { TOKEN_STORAGE_KEY } from './core'

export { TOKEN_STORAGE_KEY }
export { authApi } from './modules/user/auth.api'
export { infoApi } from './modules/user/info.api'
export { catalogApi } from './modules/catalog'
export default api
