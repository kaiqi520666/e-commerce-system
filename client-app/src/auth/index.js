const AUTH_REDIRECT_QUERY_KEY = 'redirect'
const AUTH_REQUIRED_ROUTE_NAMES = ['cart', 'orders', 'profile']

function normalizeRedirectTarget(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return null
  }

  if (value.startsWith('//')) {
    return null
  }

  return value
}

function buildLoginLocation(to) {
  const redirect = normalizeRedirectTarget(to?.fullPath) || '/profile'

  return {
    name: 'login',
    query: {
      [AUTH_REDIRECT_QUERY_KEY]: redirect,
    },
  }
}

function resolveAuthRedirect(routeLike, fallback = '/profile') {
  const redirect = normalizeRedirectTarget(routeLike?.query?.[AUTH_REDIRECT_QUERY_KEY])
  return redirect || fallback
}

function isProtectedRoute(routeLike) {
  return Boolean(
    routeLike?.meta?.requiresAuth ||
      (typeof routeLike?.name === 'string' &&
        AUTH_REQUIRED_ROUTE_NAMES.includes(routeLike.name)),
  )
}

export {
  AUTH_REDIRECT_QUERY_KEY,
  AUTH_REQUIRED_ROUTE_NAMES,
  buildLoginLocation,
  isProtectedRoute,
  resolveAuthRedirect,
}
