<script setup>
import GlassPanel from './GlassPanel.vue'
import SafeImage from './SafeImage.vue'
import UiIcon from './UiIcon.vue'
import { formatPrice } from '@/utils/price'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

function getLabelList(label) {
  if (!label) {
    return []
  }

  return String(label)
    .split(/[，,|/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}

function getPurchaseStatus(isClose) {
  if (Number(isClose) === 1) {
    return {
      text: '已暂停购买',
      icon: 'warning',
      className:
        'border-rose-300/35 bg-[linear-gradient(180deg,rgba(127,29,29,0.96),rgba(69,10,10,0.92))] text-rose-50 shadow-[0_10px_24px_rgba(127,29,29,0.28)]',
    }
  }

  return null
}
</script>

<template>
  <GlassPanel
    class="group product-shell h-full overflow-hidden"
    :class="Number(props.product.isClose) === 1 ? 'grayscale-[0.92] opacity-78' : ''"
  >
    <div class="flex h-full flex-col gap-4">
      <div
        class="relative overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.24),transparent_58%),linear-gradient(180deg,rgba(15,23,42,0.78),rgba(8,15,34,0.98))] p-3.5"
      >
        <div
          v-if="getPurchaseStatus(product.isClose)"
          class="absolute inset-0 z-10 flex items-center justify-center"
        >
          <span
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md"
            :class="getPurchaseStatus(product.isClose).className"
          >
            <UiIcon :name="getPurchaseStatus(product.isClose).icon" />
            {{ getPurchaseStatus(product.isClose).text }}
          </span>
        </div>

        <div
          v-if="getLabelList(props.product.label).length"
          class="absolute inset-x-3.5 bottom-3.5 z-10 flex flex-wrap gap-2"
        >
          <span
            v-for="item in getLabelList(props.product.label)"
            :key="item"
            class="inline-flex rounded-full border border-emerald-300/30 bg-[linear-gradient(180deg,rgba(6,95,70,0.92),rgba(6,78,59,0.84))] px-2.5 py-1 text-[11px] text-emerald-50 shadow-[0_10px_24px_rgba(6,95,70,0.22)] backdrop-blur-md"
          >
            {{ item }}
          </span>
        </div>

        <SafeImage
          :src="product.thumb"
          :alt="product.name"
          fallback-text="NEBULA"
          image-class="w-full aspect-4/3 rounded-[0.9rem] object-cover object-center opacity-88 transition duration-300 group-hover:scale-[1.03]"
          fallback-class="flex aspect-4/3 items-center justify-center rounded-[0.9rem] bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_50%),rgba(255,255,255,0.04)] text-lg text-cyan-200/75"
        />
      </div>

      <div class="flex flex-1 flex-col gap-3">
        <div class="space-y-2">
          <div class="space-y-1.5">
            <h3 class="line-clamp-2 text-base font-semibold leading-6 text-white">
              {{ props.product.name }}
            </h3>
          </div>
        </div>

        <div class="mt-auto flex items-center justify-between gap-3">
          <div>
            <p class="font-display text-2xl text-cyan-300">
              ¥{{ formatPrice(props.product.price) }}
            </p>
          </div>
          <RouterLink
            v-if="Number(props.product.isClose) !== 1"
            :to="`/goods/${props.product.id}`"
            class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3 py-2 text-xs font-medium text-slate-300 transition duration-200 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
          >
            详情
            <UiIcon name="arrow" />
          </RouterLink>
          <button
            v-else
            class="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-full border border-white/8 bg-white/[0.02] px-3 py-2 text-xs font-medium text-slate-500"
            disabled
          >
            详情
            <UiIcon name="arrow" />
          </button>
        </div>
      </div>
    </div>
  </GlassPanel>
</template>
