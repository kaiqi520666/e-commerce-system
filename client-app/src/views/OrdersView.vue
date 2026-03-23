<script setup>
import { ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import GlassPanel from '@/components/GlassPanel.vue'
import SectionHeader from '@/components/SectionHeader.vue'

const tabs = ['全部', '待支付', '待发货', '已完成']
const currentTab = ref('全部')

const orders = [
  {
    id: 'NO20260323001',
    status: '待支付',
    amount: 1798,
    goods: 'Nebula X1 降噪耳机 × 2',
  },
  {
    id: 'NO20260322018',
    status: '已完成',
    amount: 2599,
    goods: 'Atlas Mini 便携主机 × 1',
  },
]
</script>

<template>
  <div class="space-y-4">
    <SectionHeader
      eyebrow="Orders Placeholder"
      title="订单轨道页面"
      description="保留完整订单页面气质与布局，等待真实订单接口和流程接入。"
    />

    <div class="glass-panel flex flex-wrap gap-2.5">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="rounded-full border px-4 py-2 text-sm transition duration-200"
        :class="
          currentTab === tab
            ? 'border-cyan-300/35 bg-cyan-300/14 text-cyan-100'
            : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-400/20 hover:bg-cyan-400/8'
        "
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="space-y-3">
      <GlassPanel
        v-for="order in orders"
        :key="order.id"
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.26em] text-slate-400">{{ order.id }}</p>
          <h3 class="mt-2 text-lg font-semibold text-white">{{ order.goods }}</h3>
          <p class="mt-2 text-sm text-slate-400">状态：{{ order.status }}</p>
        </div>
        <div class="text-left sm:text-right">
          <p class="font-display text-2xl text-cyan-300">¥{{ order.amount.toFixed(2) }}</p>
          <button class="mt-3 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition duration-200 hover:bg-cyan-300/18">
            查看详情
          </button>
        </div>
      </GlassPanel>
    </div>

    <EmptyState
      title="更多订单状态待接入"
      description="订单流、支付态、物流态和售后态将在后续后端能力到位后接入。"
    />
  </div>
</template>
