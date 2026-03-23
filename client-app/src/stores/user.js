import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi, infoApi, TOKEN_STORAGE_KEY } from '@/api'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref(localStorage.getItem(TOKEN_STORAGE_KEY) || '')
    const refreshToken = ref('')
    const profile = ref(null)
    const isLoading = ref(false)
    const isBootstrapped = ref(false)

    const isLoggedIn = computed(() => Boolean(token.value))

    function syncTokenStorage() {
      if (token.value) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token.value)
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    }

    function applyAuthPayload(payload) {
      token.value = payload?.token || ''
      refreshToken.value = payload?.refreshToken || ''
      syncTokenStorage()
    }

    async function login(form) {
      isLoading.value = true

      try {
        const data = await authApi.login(form)
        applyAuthPayload(data)
        await fetchProfile()
        return data
      } finally {
        isLoading.value = false
      }
    }

    async function register(form) {
      isLoading.value = true

      try {
        const data = await authApi.register(form)
        applyAuthPayload(data)
        await fetchProfile()
        return data
      } finally {
        isLoading.value = false
      }
    }

    async function fetchProfile() {
      if (!token.value) {
        profile.value = null
        return null
      }

      isLoading.value = true

      try {
        profile.value = await infoApi.person()
        return profile.value
      } catch (error) {
        token.value = ''
        refreshToken.value = ''
        profile.value = null
        syncTokenStorage()
        throw error
      } finally {
        isLoading.value = false
      }
    }

    async function bootstrapAuth() {
      if (isBootstrapped.value) {
        return isLoggedIn.value
      }

      isBootstrapped.value = true

      if (!token.value) {
        profile.value = null
        return false
      }

      try {
        await fetchProfile()
        return true
      } catch {
        return false
      }
    }

    function logout() {
      token.value = ''
      refreshToken.value = ''
      profile.value = null
      syncTokenStorage()
    }

    return {
      token,
      refreshToken,
      profile,
      isLoading,
      isBootstrapped,
      isLoggedIn,
      login,
      register,
      fetchProfile,
      bootstrapAuth,
      logout,
    }
  },
  {
    persist: {
      pick: ['token', 'refreshToken'],
    },
  },
)
