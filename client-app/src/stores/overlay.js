import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

let toastSeed = 0

export const useOverlayStore = defineStore('overlay', () => {
  const toasts = ref([])
  const loadingText = ref('加载中...')
  const loadingCount = ref(0)
  const confirmState = ref({
    visible: false,
    title: '请确认',
    message: '',
    confirmText: '确认',
    cancelText: '取消',
    resolve: null,
  })

  const isLoading = computed(() => loadingCount.value > 0)

  function showToast(options) {
    const config =
      typeof options === 'string'
        ? { message: options }
        : options || {}

    const toast = {
      id: ++toastSeed,
      type: config.type || 'info',
      message: config.message || '',
      duration: config.duration ?? 2200,
    }

    toasts.value.push(toast)

    if (toast.duration > 0) {
      window.setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    }

    return toast.id
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  function showLoading(text = '加载中...') {
    loadingText.value = text
    loadingCount.value += 1
  }

  function hideLoading() {
    loadingCount.value = Math.max(0, loadingCount.value - 1)
  }

  function resetLoading() {
    loadingCount.value = 0
    loadingText.value = '加载中...'
  }

  function confirm(options) {
    const config =
      typeof options === 'string'
        ? { message: options }
        : options || {}

    return new Promise((resolve) => {
      confirmState.value = {
        visible: true,
        title: config.title || '请确认',
        message: config.message || '',
        confirmText: config.confirmText || '确认',
        cancelText: config.cancelText || '取消',
        resolve,
      }
    })
  }

  function resolveConfirm(result) {
    const resolver = confirmState.value.resolve

    confirmState.value = {
      visible: false,
      title: '请确认',
      message: '',
      confirmText: '确认',
      cancelText: '取消',
      resolve: null,
    }

    if (resolver) {
      resolver(result)
    }
  }

  return {
    toasts,
    loadingText,
    loadingCount,
    isLoading,
    confirmState,
    showToast,
    removeToast,
    showLoading,
    hideLoading,
    resetLoading,
    confirm,
    resolveConfirm,
  }
})
