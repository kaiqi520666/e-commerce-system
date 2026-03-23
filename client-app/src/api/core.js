import axios from 'axios'
import { buildLoginLocation, isProtectedRoute } from '@/auth'

const TOKEN_STORAGE_KEY = 'token'
let unauthorizedHandling = null

function unwrapResponse(payload) {
  if (payload && typeof payload === 'object' && 'code' in payload) {
    if (payload.code === 1000) {
      return payload.data
    }

    const error = new Error(payload.message || '请求失败')
    error.code = payload.code
    error.payload = payload
    throw error
  }

  return payload
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

async function handleUnauthorizedError(error) {
  if (unauthorizedHandling) {
    return unauthorizedHandling
  }

  unauthorizedHandling = (async () => {
    const [{ default: router }, { default: pinia }, { useUserStore }, { useOverlayStore }] =
      await Promise.all([
        import('@/router'),
        import('@/stores'),
        import('@/stores/user'),
        import('@/stores/overlay'),
      ])

    const userStore = useUserStore(pinia)
    const overlayStore = useOverlayStore(pinia)
    const currentRoute = router.currentRoute.value
    const wasLoggedIn = userStore.isLoggedIn

    userStore.logout()

    if (wasLoggedIn) {
      overlayStore.showToast({
        type: 'warning',
        message: '登录状态已失效，请重新登录',
      })
    }

    if (isProtectedRoute(currentRoute) && currentRoute.name !== 'login') {
      await router.push(buildLoginLocation(currentRoute))
    }

    return error
  })()

  try {
    return await unauthorizedHandling
  } finally {
    unauthorizedHandling = null
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = token
  }

  return config
})

api.interceptors.response.use(
  (response) => unwrapResponse(response.data),
  async (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      '网络异常，请稍后重试'

    const normalizedError = new Error(message)
    normalizedError.code = error.response?.data?.code || error.code
    normalizedError.status = error.response?.status
    normalizedError.payload = error.response?.data

    if (normalizedError.status === 401) {
      await handleUnauthorizedError(normalizedError)
    }

    return Promise.reject(normalizedError)
  },
)

export { TOKEN_STORAGE_KEY }
export default api
