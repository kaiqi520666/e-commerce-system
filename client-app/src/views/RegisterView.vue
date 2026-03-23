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

const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  inviteCode: '',
})

async function handleRegister() {
  if (!registerForm.username || !registerForm.phone || !registerForm.password) {
    overlayStore.showToast({ type: 'warning', message: '请先完成必填信息' })
    return
  }

  overlayStore.showLoading('注册中...')

  try {
    await userStore.register(registerForm)
    const redirectTarget = resolveAuthRedirect(route)
    overlayStore.showToast({ type: 'success', message: '注册成功，正在进入目标页面' })
    router.push(redirectTarget)
  } catch (error) {
    overlayStore.showToast({ type: 'error', message: error.message || '注册失败，请稍后重试' })
  } finally {
    overlayStore.hideLoading()
  }
}
</script>

<template>
  <div class="page-theme-profile flex min-h-[100svh] items-center px-4 py-6 sm:px-6">
    <div class="mx-auto w-full max-w-[1180px]">
      <div class="grid w-full gap-4 lg:grid-cols-[420px_minmax(0,1.05fr)]">
        <GlassPanel class="order-2 mx-auto w-full max-w-[30rem] space-y-5 lg:order-1">
          <div class="space-y-2">
            <p class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-cyan-300/80">
              <UiIcon name="register" />
              Register
            </p>
            <h2 class="font-display text-3xl text-white">创建商城账号</h2>
            <p class="text-sm text-slate-300/78">
              注册完成后会直接进入个人中心，后续承接订单、地址和会员权益。
            </p>
          </div>

          <div class="space-y-3">
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400">
                <UiIcon name="account" />
              </span>
              <input
                v-model="registerForm.username"
                type="text"
                placeholder="用户名"
                class="input-shell input-shell-with-icon"
              />
            </div>
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400">
                <UiIcon name="phone" />
              </span>
              <input
                v-model="registerForm.phone"
                type="text"
                placeholder="手机号"
                class="input-shell input-shell-with-icon"
              />
            </div>
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400">
                <UiIcon name="password" />
              </span>
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                class="input-shell input-shell-with-icon"
              />
            </div>
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-4 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400">
                <UiIcon name="invite" />
              </span>
              <input
                v-model="registerForm.inviteCode"
                type="text"
                placeholder="邀请码（可选）"
                class="input-shell input-shell-with-icon"
              />
            </div>
            <button
              class="primary-button inline-flex items-center justify-center gap-2"
              :disabled="userStore.isLoading"
              @click="handleRegister()"
            >
              <UiIcon name="register" />
              {{ userStore.isLoading ? '提交中...' : '注册并进入商城' }}
            </button>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300/78">
            <RouterLink to="/login" class="transition duration-200 hover:text-slate-100">
              已有账号？
              <span
                class="font-medium text-sky-300 underline decoration-sky-300/70 underline-offset-3 transition duration-200 hover:text-cyan-200"
              >
                去登录
              </span>
            </RouterLink>
          </div>
        </GlassPanel>

        <section
          class="hero-shell order-1 hidden min-h-[34rem] overflow-hidden lg:order-2 lg:flex lg:flex-col lg:justify-between"
        >
          <div class="space-y-4">
            <div
              class="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.32em] text-cyan-300/80"
            >
              <UiIcon name="register" />
              New Member Onboarding
            </div>
            <div class="space-y-3">
              <h1 class="font-display text-5xl leading-tight text-white">
                开通你的
                <span
                  class="bg-[linear-gradient(135deg,#dbeafe,#67e8f9,#60a5fa)] bg-clip-text text-transparent"
                  >商城身份</span
                >
              </h1>
              <p class="max-w-xl text-sm leading-7 text-slate-300/78">
                注册流程已经从个人中心抽离为独立页面，让未登录用户先完成认证，再进入资料、订单和会员权益路径。
              </p>
            </div>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="hero-stat">
              <p class="hero-stat-label">Route</p>
              <p class="hero-stat-value">Standalone Register View</p>
            </div>
            <div class="hero-stat">
              <p class="hero-stat-label">After Sign Up</p>
              <p class="hero-stat-value">Redirect To Target Route</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
