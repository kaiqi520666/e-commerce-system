<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveAuthRedirect } from '@/auth'
import { useUserStore } from '@/stores/user'
import { useOverlayStore } from '@/stores/overlay'
import GlassPanel from '@/components/GlassPanel.vue'
import UiIcon from '@/components/UiIcon.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const overlayStore = useOverlayStore()

const loginForm = reactive({
  phone: '',
  password: '',
})

async function handleLogin() {
  if (!loginForm.phone || !loginForm.password) {
    overlayStore.showToast({ type: 'warning', message: '请先填写手机号和密码' })
    return
  }

  overlayStore.showLoading('登录中...')

  try {
    await userStore.login(loginForm)
    const redirectTarget = resolveAuthRedirect(route)
    overlayStore.showToast({ type: 'success', message: '登录成功，正在进入目标页面' })
    router.push(redirectTarget)
  } catch (error) {
    overlayStore.showToast({ type: 'error', message: error.message || '登录失败，请稍后重试' })
  } finally {
    overlayStore.hideLoading()
  }
}
</script>

<template>
  <div class="page-theme-profile flex min-h-[100svh] items-center px-4 py-6 sm:px-6">
    <div class="mx-auto w-full max-w-[1180px]">
      <div class="grid w-full gap-4 lg:grid-cols-[minmax(0,1.05fr)_420px]">
        <section
          class="hero-shell hidden min-h-[34rem] overflow-hidden lg:flex lg:flex-col lg:justify-between"
        >
          <div class="space-y-4">
            <div
              class="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.32em] text-cyan-300/80"
            >
              <UiIcon name="login" />
              Member Access
            </div>
            <div class="space-y-3">
              <h1 class="font-display text-5xl leading-tight text-white">
                登录你的
                <span
                  class="bg-[linear-gradient(135deg,#dbeafe,#67e8f9,#60a5fa)] bg-clip-text text-transparent"
                  >Nebula</span
                >
                账号
              </h1>
              <p class="max-w-xl text-sm leading-7 text-slate-300/78">
                进入个人中心后可同步会员资料、购物状态和后续订单能力。认证页面已从个人中心独立拆出，保持用户路径更清晰。
              </p>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="hero-stat">
              <p class="hero-stat-label">Access</p>
              <p class="hero-stat-value">Profile / Orders / Benefits</p>
            </div>
            <div class="hero-stat">
              <p class="hero-stat-label">Flow</p>
              <p class="hero-stat-value">Independent Auth Route</p>
            </div>
          </div>
        </section>

        <GlassPanel class="mx-auto w-full max-w-[30rem] space-y-5">
          <div class="space-y-2">
            <p class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-cyan-300/80">
              <UiIcon name="login" />
              Login
            </p>
            <h2 class="font-display text-3xl text-white">账号登录</h2>
            <p class="text-sm text-slate-300/78">输入手机号和密码，登录后会自动返回原目标页或进入个人中心。</p>
          </div>

          <div class="space-y-3">
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400">
                <UiIcon name="phone" />
              </span>
              <input v-model="loginForm.phone" type="text" placeholder="手机号" class="input-shell input-shell-with-icon" />
            </div>
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400">
                <UiIcon name="password" />
              </span>
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                class="input-shell input-shell-with-icon"
              />
            </div>
            <button class="primary-button inline-flex items-center justify-center gap-2" :disabled="userStore.isLoading" @click="handleLogin()">
              <UiIcon name="login" />
              {{ userStore.isLoading ? '登录中...' : '登录并继续' }}
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300/78">
            <RouterLink to="/register" class="transition duration-200 hover:text-slate-100">
              没有账号？
              <span
                class="font-medium text-sky-300 underline decoration-sky-300/70 underline-offset-3 transition duration-200 hover:text-cyan-200"
              >
                去注册
              </span>
            </RouterLink>
          </div>
        </GlassPanel>
      </div>
    </div>
  </div>
</template>
