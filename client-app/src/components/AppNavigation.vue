<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'
import UiIcon from './UiIcon.vue'

const route = useRoute()
const uiStore = useUiStore()
const cartStore = useCartStore()

const navItems = computed(() =>
  uiStore.navItems.map((item) => ({
    ...item,
    active: route.name === item.name,
  })),
)

const showMobileTabbar = computed(() => route.name !== 'goods-detail')
</script>

<template>
  <div>
    <aside class="panel-aurora hidden lg:flex lg:w-[17rem] lg:flex-col lg:gap-4 lg:rounded-[1.4rem] lg:border lg:border-white/10 lg:p-4 lg:backdrop-blur-xl">
      <div class="space-y-4">
        <div class="inline-flex items-center gap-3">
          <div class="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.3rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.32),_transparent_58%),rgba(15,23,42,0.92)]">
            <span class="absolute inset-[3px] rounded-[1rem] border border-white/10" />
            <span class="absolute inset-0 bg-[conic-gradient(from_120deg,_rgba(59,130,246,0.22),_transparent,_rgba(6,182,212,0.22),_transparent,_rgba(59,130,246,0.22))]" />
            <span class="relative font-display text-lg text-cyan-100">NX</span>
          </div>
          <div>
            <p class="font-display text-xl text-white">Nebula Mall</p>
            <p class="text-xs uppercase tracking-[0.28em] text-slate-400">Black Blue Commerce</p>
          </div>
        </div>

        <div class="rounded-[1rem] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%),linear-gradient(180deg,_rgba(6,12,30,0.96),_rgba(10,18,44,0.82))] p-4 shadow-[0_18px_50px_rgba(2,8,23,0.38)]">
          <div class="flex items-center justify-between">
            <p class="text-xs uppercase tracking-[0.26em] text-cyan-300/75">Signal Stable</p>
            <UiIcon name="sparkles" class="text-cyan-200" />
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-300/85">
            以公告为首页入口，串联分类、推荐商品、购物车和个人中心，保持 PC 与移动端一致体验。
          </p>
          <div class="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            <span class="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
            Adaptive Commerce Grid
          </div>
        </div>
      </div>

      <nav class="space-y-1.5">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="group flex items-center gap-3 rounded-[0.95rem] border px-3.5 py-2.5 transition duration-200"
          :class="
            item.active
              ? 'border-cyan-300/35 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(30,41,59,0.26))] text-white shadow-[0_18px_40px_rgba(14,165,233,0.12)]'
              : 'border-white/8 bg-white/[0.03] text-slate-300 hover:border-cyan-400/20 hover:bg-cyan-400/8'
          "
        >
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <UiIcon :name="item.icon" />
          </span>
          <span class="flex-1">
            <span class="block font-medium">{{ item.label }}</span>
            <span class="block text-[11px] uppercase tracking-[0.22em] text-slate-500 group-hover:text-slate-400">
              {{ item.name }}
            </span>
          </span>
          <span v-if="item.name === 'cart' && cartStore.totalCount" class="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-2 py-0.5 text-xs text-cyan-100">
            {{ cartStore.totalCount }}
          </span>
        </RouterLink>
      </nav>
    </aside>

    <nav v-if="showMobileTabbar" class="mobile-tabbar flex lg:hidden">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="mobile-tabbar-item flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2 text-[11px] transition duration-200"
        :class="item.active ? 'mobile-tabbar-item-active text-cyan-50' : 'text-slate-400'"
      >
        <span class="mobile-tabbar-icon">
          <UiIcon :name="item.icon" />
        </span>
        <span class="truncate">{{ item.label }}</span>
        <span
          v-if="item.name === 'cart' && cartStore.totalCount"
          class="absolute top-1.5 right-3 inline-flex min-w-4 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/18 px-1 text-[10px] text-cyan-50"
        >
          {{ cartStore.totalCount }}
        </span>
      </RouterLink>
    </nav>
  </div>
</template>
