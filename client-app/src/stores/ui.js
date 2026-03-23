import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const navItems = [
  { name: 'notice', label: '公告', to: '/notice', icon: 'notice' },
  { name: 'category', label: '分类', to: '/category', icon: 'category' },
  { name: 'cart', label: '购物车', to: '/cart', icon: 'cart' },
  { name: 'orders', label: '订单', to: '/orders', icon: 'orders' },
  { name: 'profile', label: '我的', to: '/profile', icon: 'profile' },
]

export const useUiStore = defineStore('ui', () => {
  const currentRouteName = ref('notice')

  const currentNav = computed(
    () => navItems.find((item) => item.name === currentRouteName.value) || navItems[0],
  )

  function setRouteName(name) {
    currentRouteName.value = name || 'notice'
  }

  return {
    navItems,
    currentRouteName,
    currentNav,
    setRouteName,
  }
})
