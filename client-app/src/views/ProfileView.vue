<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOverlayStore } from '@/stores/overlay'
import { useUserStore } from '@/stores/user'
import MatrixBackground from '@/components/MatrixBackground.vue'
import UiIcon from '@/components/UiIcon.vue'

const router = useRouter()
const overlayStore = useOverlayStore()
const userStore = useUserStore()

const displayName = computed(() => userStore.profile?.username || 'Nebula 会员')
const displayPhone = computed(
  () => userStore.profile?.phone || '登录后同步手机号与会员资料',
)

const balanceText = computed(() => '¥29250.00')
const stats = computed(() => [
  { label: '累计消费', value: '0.00', icon: 'cart', accentClass: 'profile-stat-blue' },
  { label: '累计佣金', value: '0.00', icon: 'invite', accentClass: 'profile-stat-violet' },
  { label: '成功订单', value: '0', icon: 'orders', accentClass: 'profile-stat-emerald' },
])

const featureCards = computed(() => [
  {
    title: '代理中心',
    description: '查看团队数据和返佣设置',
    icon: 'arrow',
    toneClass: 'profile-feature-blue',
  },
  {
    title: '专属邀请码',
    description: 'ZHANG1',
    icon: 'invite',
    toneClass: 'profile-feature-violet',
    actionText: '复制',
  },
])

const menuItems = computed(() => [
  { title: '钱包地址', icon: 'product' },
  { title: '消费记录', icon: 'cart' },
  { title: '充值记录', icon: 'success' },
  { title: '提现记录', icon: 'arrow' },
  { title: '同步数据', icon: 'loading' },
])

async function handleLogout() {
  const confirmed = await overlayStore.confirm({
    title: '退出登录',
    message: '确认退出当前账号吗？退出后将清空本地登录状态。',
    confirmText: '退出',
    cancelText: '取消',
  })

  if (!confirmed) {
    return
  }

  userStore.logout()
  overlayStore.showToast({ type: 'success', message: '已退出登录' })
  router.push('/login')
}

async function handleRefreshProfile() {
  if (!userStore.isLoggedIn) {
    overlayStore.showToast({
      type: 'info',
      message: '请先登录后再同步数据',
    })
    return
  }

  overlayStore.showLoading('同步个人资料...')

  try {
    await userStore.fetchProfile()
    overlayStore.showToast({
      type: 'success',
      message: '资料已刷新',
    })
  } catch (error) {
    overlayStore.showToast({
      type: 'error',
      message: error.message || '资料同步失败，请稍后重试',
    })
  } finally {
    overlayStore.hideLoading()
  }
}

function handleCopyInviteCode() {
  overlayStore.showToast({
    type: 'success',
    message: '邀请码已复制',
  })
}

function handleMenuClick(title) {
  if (title === '同步数据') {
    handleRefreshProfile()
    return
  }

  overlayStore.showToast({
    type: 'info',
    message: `${title} 功能正在接入中`,
  })
}

function handleRecharge() {
  overlayStore.showToast({
    type: 'info',
    message: '充值流程正在接入中',
  })
}

function handleWithdraw() {
  overlayStore.showToast({
    type: 'info',
    message: '提现流程正在接入中',
  })
}

onMounted(async () => {
  if (userStore.token && !userStore.profile) {
    overlayStore.showLoading('同步个人资料...')

    try {
      await userStore.fetchProfile()
    } catch (error) {
      overlayStore.showToast({
        type: 'error',
        message: error.message || '个人资料同步失败，请重新登录',
      })
    } finally {
      overlayStore.hideLoading()
    }
  }
})
</script>

<template>
  <div class="profile-page mx-auto w-full max-w-[720px] space-y-4 pb-2">
    <section class="profile-hero">
      <MatrixBackground :opacity="0.18" :font-size="13" :speed="58" />

      <div class="profile-hero-head">
        <div class="profile-avatar">
          <UiIcon name="account" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h1 class="truncate text-[1.7rem] font-semibold text-white">{{ displayName }}</h1>
              <p class="mt-1 text-sm text-slate-300/80">{{ displayPhone }}</p>
            </div>

            <button
              v-if="userStore.isLoggedIn"
              type="button"
              class="profile-refresh"
              @click="handleRefreshProfile()"
            >
              <UiIcon name="loading" />
              刷新
            </button>
          </div>
        </div>
      </div>

      <div class="profile-balance">
        <p class="text-sm text-slate-300/72">总资产</p>
        <p class="mt-3 font-display text-[2.55rem] leading-none text-cyan-300">
          {{ balanceText }}
        </p>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button type="button" class="profile-primary-action" @click="handleRecharge()">
          <UiIcon name="success" />
          充值
        </button>
        <button type="button" class="profile-secondary-action" @click="handleWithdraw()">
          <UiIcon name="arrow" />
          提现
        </button>
      </div>
    </section>

    <section class="grid grid-cols-3 gap-3">
      <article
        v-for="item in stats"
        :key="item.label"
        class="profile-stat-card"
        :class="item.accentClass"
      >
        <div class="profile-stat-icon">
          <UiIcon :name="item.icon" />
        </div>
        <p class="mt-5 font-display text-[1.8rem] leading-none text-white">{{ item.value }}</p>
        <p class="mt-2 text-xs text-slate-300/78">{{ item.label }}</p>
      </article>
    </section>

    <section class="space-y-3">
      <article
        v-for="item in featureCards"
        :key="item.title"
        class="profile-feature-card"
        :class="item.toneClass"
      >
        <div class="flex items-center gap-3">
          <div class="profile-feature-icon">
            <UiIcon :name="item.icon" />
          </div>

          <div class="min-w-0 flex-1">
            <h2 class="text-xl font-semibold text-white">{{ item.title }}</h2>
            <p class="mt-1 text-sm text-slate-300/78">{{ item.description }}</p>
          </div>

          <button
            v-if="item.actionText"
            type="button"
            class="profile-copy-button"
            @click="handleCopyInviteCode()"
          >
            <UiIcon name="invite" />
            {{ item.actionText }}
          </button>
          <span v-else class="profile-feature-arrow">
            <UiIcon name="chevron" />
          </span>
        </div>
      </article>
    </section>

    <section class="space-y-3">
      <button
        v-for="item in menuItems"
        :key="item.title"
        type="button"
        class="profile-menu-item"
        @click="handleMenuClick(item.title)"
      >
        <span class="profile-menu-leading">
          <span class="profile-menu-icon">
            <UiIcon :name="item.icon" />
          </span>
          <span class="text-lg font-medium text-white">{{ item.title }}</span>
        </span>

        <span class="text-slate-500">
          <UiIcon name="chevron" />
        </span>
      </button>
    </section>

    <section v-if="userStore.isLoggedIn">
      <button type="button" class="profile-logout-action" @click="handleLogout()">
        <UiIcon name="logout" />
        退出登录
      </button>
    </section>

    <section v-if="!userStore.isLoggedIn" class="profile-guest-card">
      <div>
        <p class="text-xs uppercase tracking-[0.24em] text-cyan-300/78">Guest Access</p>
        <h2 class="mt-2 text-xl font-semibold text-white">当前为访客预览模式</h2>
        <p class="mt-2 text-sm leading-6 text-slate-300/76">
          登录后可同步真实资料、钱包相关能力和后续订单权益。
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <RouterLink to="/login" class="profile-primary-action justify-center">
          去登录
        </RouterLink>
        <RouterLink to="/register" class="profile-secondary-action justify-center">
          去注册
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  position: relative;
}

.profile-hero,
.profile-stat-card,
.profile-feature-card,
.profile-menu-item,
.profile-guest-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03)),
    rgba(7, 17, 36, 0.74);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 46px rgba(2, 8, 23, 0.32);
  backdrop-filter: blur(18px) saturate(122%);
  -webkit-backdrop-filter: blur(18px) saturate(122%);
}

.profile-hero {
  border-radius: 1.45rem;
  padding: 1rem;
  background:
    radial-gradient(circle at 14% 10%, rgba(34, 211, 238, 0.11), transparent 24%),
    radial-gradient(circle at 82% 18%, rgba(59, 130, 246, 0.14), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.03)),
    rgba(7, 17, 36, 0.76);
}

.profile-hero-head,
.profile-balance,
.profile-primary-action,
.profile-secondary-action {
  position: relative;
  z-index: 1;
}

.profile-hero-head {
  display: flex;
  align-items: flex-start;
  gap: 0.95rem;
}

.profile-avatar {
  display: inline-flex;
  height: 4rem;
  width: 4rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 1.2rem;
  border: 1px solid rgba(103, 232, 249, 0.28);
  background:
    radial-gradient(circle at top, rgba(103, 232, 249, 0.22), rgba(37, 99, 235, 0.14)),
    rgba(8, 23, 44, 0.84);
  color: #a5f3fc;
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 14px 36px rgba(8, 47, 73, 0.24);
}

.profile-refresh {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  border: 1px solid rgba(34, 211, 238, 0.22);
  background:
    linear-gradient(180deg, rgba(34, 211, 238, 0.14), rgba(6, 182, 212, 0.08)),
    rgba(8, 23, 44, 0.5);
  padding: 0.55rem 0.85rem;
  font-size: 0.82rem;
  color: #cffafe;
}

.profile-balance {
  margin-top: 1rem;
}

.profile-primary-action,
.profile-secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 1rem;
  padding: 0.95rem 1rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.profile-primary-action {
  border: 1px solid rgba(34, 211, 238, 0.26);
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.94), rgba(6, 182, 212, 0.92));
  color: #ecfeff;
  box-shadow: 0 16px 34px rgba(8, 47, 73, 0.26);
}

.profile-secondary-action {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.025)),
    rgba(7, 17, 36, 0.66);
  color: #f8fafc;
}

.profile-stat-card {
  border-radius: 1.15rem;
  padding: 0.9rem 0.85rem;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03)),
    rgba(7, 17, 36, 0.72);
}

.profile-stat-card::after,
.profile-feature-card::after {
  content: '';
  position: absolute;
  top: -1.9rem;
  right: -1.15rem;
  height: 5.8rem;
  width: 5.8rem;
  border-radius: 999px;
  opacity: 0.26;
}

.profile-stat-blue::after {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.9), transparent 68%);
}

.profile-stat-violet::after {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.72), transparent 68%);
}

.profile-stat-emerald::after {
  background: radial-gradient(circle, rgba(14, 165, 233, 0.76), transparent 68%);
}

.profile-stat-icon,
.profile-feature-icon,
.profile-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.9rem;
}

.profile-stat-icon {
  height: 2.25rem;
  width: 2.25rem;
  border: 1px solid rgba(125, 211, 252, 0.18);
  background: rgba(56, 189, 248, 0.12);
  color: #bae6fd;
}

.profile-feature-card {
  border-radius: 1.2rem;
  padding: 1rem;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.1), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03)),
    rgba(7, 17, 36, 0.74);
}

.profile-feature-blue::after {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.88), transparent 68%);
}

.profile-feature-violet::after {
  background: radial-gradient(circle, rgba(14, 165, 233, 0.7), transparent 68%);
}

.profile-feature-icon {
  height: 2.5rem;
  width: 2.5rem;
  border: 1px solid rgba(125, 211, 252, 0.18);
  background: rgba(56, 189, 248, 0.12);
  color: #bae6fd;
}

.profile-copy-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.35rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(34, 211, 238, 0.18);
  background:
    linear-gradient(180deg, rgba(34, 211, 238, 0.12), rgba(59, 130, 246, 0.08)),
    rgba(8, 23, 44, 0.48);
  padding: 0.65rem 0.8rem;
  font-size: 0.82rem;
  color: #cffafe;
}

.profile-feature-arrow {
  display: inline-flex;
  color: #60a5fa;
}

.profile-menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 1.15rem;
  padding: 1rem;
  text-align: left;
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 22%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.025)),
    rgba(7, 17, 36, 0.72);
}

.profile-menu-leading {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
}

.profile-menu-icon {
  height: 2rem;
  width: 2rem;
  border: 1px solid rgba(125, 211, 252, 0.16);
  background: rgba(56, 189, 248, 0.1);
  color: #a5f3fc;
}

.profile-guest-card {
  border-radius: 1.2rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-logout-action {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 1.15rem;
  border: 1px solid rgba(248, 113, 113, 0.18);
  background:
    linear-gradient(180deg, rgba(127, 29, 29, 0.28), rgba(69, 10, 10, 0.18)),
    rgba(7, 17, 36, 0.68);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 16px 36px rgba(2, 8, 23, 0.24);
  padding: 1rem;
  color: #ffe4e6;
}

@media (min-width: 768px) {
  .profile-hero {
    padding: 1.15rem;
  }

  .profile-menu-item {
    padding: 1.05rem 1.1rem;
  }
}
</style>
