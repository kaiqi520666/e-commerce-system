import { createRouter, createWebHistory } from 'vue-router'
import pinia from '@/stores'
import { useUserStore } from '@/stores/user'
import { buildLoginLocation, resolveAuthRedirect } from '@/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/notice',
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        guestOnly: true,
      },
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: {
        guestOnly: true,
      },
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/notice',
      name: 'notice',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/NoticeView.vue'),
    },
    {
      path: '/category',
      name: 'category',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/CategoryView.vue'),
    },
    {
      path: '/goods/:id',
      name: 'goods-detail',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/GoodsDetailView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/views/CartView.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/views/OrdersView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/views/ProfileView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const userStore = useUserStore(pinia)

  if (!userStore.isBootstrapped) {
    await userStore.bootstrapAuth()
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return buildLoginLocation(to)
  }

  if (to.meta.guestOnly && userStore.isLoggedIn) {
    return resolveAuthRedirect(to)
  }

  return true
})

export default router
