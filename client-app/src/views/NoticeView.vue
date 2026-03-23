<script setup>
import { computed, onMounted } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import GlassPanel from '@/components/GlassPanel.vue'
import ProductCard from '@/components/ProductCard.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import UiIcon from '@/components/UiIcon.vue'

const catalogStore = useCatalogStore()

const quickCategories = computed(() => catalogStore.flatCategories.slice(0, 4))

const noticeCards = [
  {
    title: '限时通告',
    detail: '本周新品开放预约，首发 72 小时支持极速发货与专属售后通道。',
    icon: 'sparkles',
  },
  {
    title: '运费策略',
    detail: '全场满 299 元包邮，部分数码套装支持跨仓拆分配送。',
    icon: 'shield',
  },
  {
    title: '会员提醒',
    detail: '新注册用户可在“我的”页面领取专属科技礼包与新品折扣券。',
    icon: 'product',
  },
]

onMounted(async () => {
  if (!catalogStore.categories.length) {
    await catalogStore.fetchCategories()
  }

  if (!catalogStore.featuredGoods.length) {
    await catalogStore.fetchFeaturedGoods()
  }
})
</script>

<template>
  <div class="space-y-6">
    <section class="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
      <GlassPanel class="hero-panel overflow-hidden">
        <div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div class="space-y-4">
            <p class="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.26em] text-cyan-100">
              公告首页 / Feature-Rich Showcase
            </p>
            <div class="space-y-3">
              <h2 class="font-display text-4xl leading-tight text-white sm:text-5xl xl:text-6xl">
                深海黑蓝背景下的
                <span class="bg-[linear-gradient(135deg,#dbeafe,#67e8f9,#60a5fa)] bg-clip-text text-transparent">商城中控首页</span>
              </h2>
              <p class="max-w-2xl text-sm leading-7 text-slate-300/78">
                把公告、推荐品类、商品流和活动权益压缩进一套更具层次的黑蓝科技界面，不再只是卡片堆叠，而是一个有主次节奏的商城入口。
              </p>
            </div>
            <div class="grid gap-2 sm:grid-cols-3">
              <div class="hero-metric">
                <p class="hero-metric-label">Status</p>
                <p class="hero-metric-value">Stable Signal</p>
              </div>
              <div class="hero-metric">
                <p class="hero-metric-label">Display</p>
                <p class="hero-metric-value">Liquid Glass</p>
              </div>
              <div class="hero-metric">
                <p class="hero-metric-label">Adapt</p>
                <p class="hero-metric-value">PC / Mobile</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2.5">
              <RouterLink to="/category" class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/14 px-4 py-2.5 text-sm font-medium text-cyan-50 transition duration-200 hover:bg-cyan-300/20">
                进入分类浏览
                <UiIcon name="arrow" />
              </RouterLink>
              <RouterLink to="/profile" class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:border-white/20 hover:bg-white/[0.08]">
                查看会员权益
                <UiIcon name="chevron" />
              </RouterLink>
            </div>
          </div>

          <div class="grid gap-3">
            <article v-for="notice in noticeCards" :key="notice.title" class="notice-card">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-3">
                  <p class="text-xs uppercase tracking-[0.28em] text-cyan-300/80">{{ notice.title }}</p>
                  <p class="text-sm leading-7 text-slate-300/80">{{ notice.detail }}</p>
                </div>
                <div class="notice-card-icon">
                  <UiIcon :name="notice.icon" />
                </div>
              </div>
            </article>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel class="overflow-hidden">
        <div class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-cyan-300/80">Realtime Feed</p>
            <h3 class="mt-2 font-display text-3xl text-white">今日商城速览</h3>
          </div>
          <div class="space-y-2.5">
            <div class="notice-feed-row">
              <span class="notice-feed-dot bg-cyan-300" />
              <span>新品首发档期已开启，优先展示科技周边和旗舰设备。</span>
            </div>
            <div class="notice-feed-row">
              <span class="notice-feed-dot bg-emerald-300" />
              <span>购物车与订单暂为前端占位，分类和商品流已经接通后端接口。</span>
            </div>
            <div class="notice-feed-row">
              <span class="notice-feed-dot bg-sky-300" />
              <span>个人中心支持真实登录、注册与资料读取，为后续订单链路预留入口。</span>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-visual-grid" />
            <div class="hero-visual-ring hero-visual-ring-lg" />
            <div class="hero-visual-ring hero-visual-ring-sm" />
            <div class="hero-visual-core">
              <span class="font-display text-xl tracking-[0.34em] text-cyan-100">NEXUS</span>
            </div>
          </div>
        </div>
      </GlassPanel>
    </section>

    <section class="space-y-4">
      <SectionHeader
        eyebrow="Quick Access"
        title="热门分类入口"
        description="结合后端分类树，优先展示最先进入的热门业务域。"
      />

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RouterLink
          v-for="item in quickCategories"
          :key="item.id"
          to="/category"
          class="quick-access-card group cursor-pointer"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.26em] text-slate-400">
                Level {{ item.level + 1 }}
              </p>
              <h3 class="mt-2 text-xl font-semibold text-white">{{ item.name }}</h3>
            </div>
            <div class="quick-access-icon">
              <UiIcon name="chevron" />
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="space-y-4">
      <SectionHeader
        eyebrow="Featured Goods"
        title="推荐商品流"
        description="直接接入后端商品列表结果，首页从全量商品中截取精选内容展示。"
      />

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <ProductCard
          v-for="item in catalogStore.featuredGoods"
          :key="item.id"
          :product="item"
        />
      </div>
    </section>

    <GlassPanel class="promo-band">
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="space-y-3 lg:col-span-2">
          <p class="text-xs uppercase tracking-[0.28em] text-cyan-300/80">会员福利</p>
          <h3 class="font-display text-3xl text-white">新品订阅、科技礼包与售后优先通道</h3>
          <p class="text-sm leading-7 text-slate-300/78">
            第一阶段先把视觉骨架和信息架构搭好。后续接入优惠券、营销活动和订单履约后，这里将继续扩展为完整的会员权益中心。
          </p>
        </div>

        <div class="rounded-[1.8rem] border border-cyan-300/15 bg-cyan-300/8 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <p class="text-xs uppercase tracking-[0.24em] text-cyan-100">Next Step</p>
          <p class="mt-3 text-sm leading-7 text-slate-200/85">
            完成基础页面后，优先继续补商品详情、真实购物车接口和订单流。
          </p>
        </div>
      </div>
    </GlassPanel>
  </div>
</template>
