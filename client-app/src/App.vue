<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import AppNavigation from '@/components/AppNavigation.vue'
import GlobalConfirm from '@/components/GlobalConfirm.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import GlobalToast from '@/components/GlobalToast.vue'

const route = useRoute()
const uiStore = useUiStore()

const shellRouteNames = ['notice', 'category', 'goods-detail', 'cart', 'orders', 'profile']

const pageMeta = computed(
  () =>
    ({
      notice: {
        title: '公告中枢',
        subtitle: '今日活动、推荐类目与精选商品在这里汇总。',
        themeClass: 'page-theme-notice',
      },
      category: {
        title: '',
        subtitle: '',
        themeClass: 'page-theme-category',
      },
      'goods-detail': {
        title: '商品详情',
        subtitle: '查看商品主图、价格、参数模板、商品详情与注意事项。',
        themeClass: 'page-theme-category',
      },
      cart: {
        title: '购物车',
        subtitle: '本阶段先完成购物车视觉和本地状态流转。',
        themeClass: 'page-theme-cart',
      },
      orders: {
        title: '订单轨道',
        subtitle: '后端订单未接入前，先以完整布局与状态占位承接。',
        themeClass: 'page-theme-orders',
      },
      profile: {
        title: '个人中心',
        subtitle: '承接个人资料、会员权益与账户入口。',
        themeClass: 'page-theme-profile',
      },
      login: {
        title: '',
        subtitle: '',
        themeClass: 'page-theme-profile',
      },
      register: {
        title: '',
        subtitle: '',
        themeClass: 'page-theme-profile',
      },
    })[route.name] || {
      title: 'Nebula Mall',
      subtitle: '新一代黑蓝科技商城体验。',
      themeClass: 'page-theme-notice',
    },
)

const showShell = computed(() => shellRouteNames.includes(route.name))
const isMobileCategoryPage = computed(() => route.name === 'category')
const isGoodsDetailPage = computed(() => route.name === 'goods-detail')

watch(
  () => route.name,
  (name) => {
    uiStore.setRouteName(name)
  },
  { immediate: true },
)
</script>

<template>
  <div class="app-bg min-h-screen" :class="pageMeta.themeClass">
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="halo halo-top" />
      <div class="halo halo-bottom" />
      <div class="halo halo-center" />
      <div class="orbital orbital-one" />
      <div class="orbital orbital-two" />
      <div class="grid-noise" />
    </div>

    <template v-if="showShell">
      <div
        class="relative mx-auto flex w-full max-w-[1500px] px-3 pt-3 sm:px-5 lg:gap-4 lg:px-6 lg:pb-6"
        :class="
          isMobileCategoryPage
            ? 'h-[100svh] overflow-hidden lg:min-h-screen lg:h-auto'
            : isGoodsDetailPage
              ? 'min-h-screen pb-3'
              : 'min-h-screen pb-[calc(7.5rem+env(safe-area-inset-bottom))]'
        "
      >
        <AppNavigation />

        <main class="flex-1 min-w-0">
          <RouterView />
        </main>
      </div>
    </template>

    <template v-else>
      <RouterView />
    </template>
  </div>
  <GlobalToast />
  <GlobalConfirm />
  <GlobalLoading />
</template>
