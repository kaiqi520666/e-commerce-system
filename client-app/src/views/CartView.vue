<script setup>
import { useCartStore } from '@/stores/cart'
import { useOverlayStore } from '@/stores/overlay'
import EmptyState from '@/components/EmptyState.vue'
import GlassPanel from '@/components/GlassPanel.vue'
import SafeImage from '@/components/SafeImage.vue'
import UiIcon from '@/components/UiIcon.vue'
import { formatPrice } from '@/utils/price'

const cartStore = useCartStore()
const overlayStore = useOverlayStore()

function handleIncrease(item) {
  const previousQuantity = item.quantity
  cartStore.increase(item.id)

  if (item.quantity === previousQuantity) {
    overlayStore.showToast({
      type: 'info',
      message: `${item.name} 已达到购买上限`,
    })
    return
  }

  overlayStore.showToast({
    type: 'success',
    message: `${item.name} 数量已增加到 ${item.quantity}`,
  })
}

function handleDecrease(item) {
  if (item.quantity <= 1) {
    cartStore.decrease(item.id)
    overlayStore.showToast({
      type: 'warning',
      message: `${item.name} 已从购物车移除`,
    })
    return
  }

  cartStore.decrease(item.id)
  overlayStore.showToast({
    type: 'info',
    message: `${item.name} 数量已减少到 ${item.quantity}`,
  })
}

function handleRemove(item) {
  cartStore.removeItem(item.id)
  overlayStore.showToast({
    type: 'warning',
    message: `${item.name} 已从购物车移除`,
  })
}

async function handleClearCart() {
  if (!cartStore.items.length) {
    return
  }

  const confirmed = await overlayStore.confirm({
    title: '清空购物车',
    message: '确认清空购物车中的所有商品吗？此操作无法撤销。',
    confirmText: '确认清空',
    cancelText: '再想想',
  })

  if (!confirmed) {
    return
  }

  cartStore.clear()
  overlayStore.showToast({
    type: 'info',
    message: '购物车已清空',
  })
}

function handleCheckout() {
  overlayStore.showToast({
    type: 'warning',
    message: '结算流程尚未接入后端，当前先保留购物车确认页',
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section v-if="cartStore.items.length" class="space-y-3">
        <GlassPanel
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex flex-col gap-5 rounded-[1.5rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(18,35,67,0.92),rgba(9,21,43,0.92))] p-4 shadow-[0_24px_60px_rgba(2,8,23,0.34)]"
        >
          <div class="flex gap-4 items-center">
            <div
              class="flex h-20 w-20 shrink-0 overflow-hidden rounded-[1.35rem] border border-cyan-300/25 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),rgba(8,47,73,0.24))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_40px_rgba(8,47,73,0.22)]"
            >
              <SafeImage
                :src="item.thumb"
                :alt="item.name"
                fallback-text="NX"
                image-class="h-full w-full object-cover"
                fallback-class="flex h-full w-full items-center justify-center font-display text-lg text-cyan-100"
              />
            </div>
            <div class="min-w-0 flex-1 space-y-4">
              <div class="flex items-start justify-between gap-3">
                <h3 class="line-clamp-2 text-[1.08rem] leading-snug font-semibold text-white">
                  {{ item.name }}
                </h3>
              </div>

              <div class="flex flex-wrap items-end gap-x-3 gap-y-2">
                <div class="flex items-center gap-1.5 text-slate-300/78">
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
                  >
                    <UiIcon name="product" />
                  </span>
                  <p class="font-display text-[0.98rem] leading-none text-slate-100">
                    ¥{{ formatPrice(item.price) }}
                  </p>
                </div>

                <div class="flex items-center gap-1.5 text-cyan-200">
                  <span
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/22 bg-cyan-300/12"
                  >
                    <UiIcon name="orders" />
                  </span>
                  <p class="font-display text-[1.18rem] leading-none text-cyan-300">
                    ¥{{ formatPrice(item.price * item.quantity) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-rose-200/18 bg-[linear-gradient(180deg,rgba(71,35,63,0.88),rgba(48,25,48,0.9))] px-3 py-2 text-[11px] font-medium text-rose-50 transition duration-200 hover:border-rose-200/28 hover:bg-[linear-gradient(180deg,rgba(91,43,78,0.96),rgba(58,29,59,0.96))]"
              @click="handleRemove(item)"
            >
              <UiIcon name="close" />
              删除
            </button>

            <div class="flex items-center gap-3">
              <button
                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg text-white transition duration-200 hover:border-cyan-300/30 hover:bg-cyan-300/10"
                @click="handleDecrease(item)"
              >
                -
              </button>
              <div
                class="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-xs text-cyan-100"
              >
                {{ item.quantity }}
              </div>
              <button
                class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg text-white transition duration-200 hover:border-cyan-300/30 hover:bg-cyan-300/10"
                @click="handleIncrease(item)"
              >
                +
              </button>
            </div>
          </div>
        </GlassPanel>
      </section>

      <EmptyState v-else title="购物车当前为空" description="去分类页或商品详情页加入商品" />

      <GlassPanel class="h-fit space-y-4">
        <div>
          <p class="text-xs uppercase tracking-[0.28em] text-cyan-300/80">结算概览</p>
          <h3 class="mt-2 font-display text-3xl text-white">
            ¥{{ formatPrice(cartStore.totalAmount) }}
          </h3>
        </div>
        <div class="space-y-3 text-sm text-slate-300/78">
          <div class="flex items-center justify-between">
            <span>商品数量</span>
            <span>{{ cartStore.totalCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>商品种类</span>
            <span>{{ cartStore.items.length }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span>购物车状态</span>
            <span>{{ cartStore.items.length ? '已就绪' : '为空' }}</span>
          </div>
        </div>
        <button
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/14 px-5 py-3 text-sm font-medium text-cyan-50 transition duration-200 hover:bg-cyan-300/20"
          @click="handleCheckout()"
        >
          去结算
        </button>
        <button
          type="button"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-100 transition duration-200 hover:bg-white/[0.08]"
          :disabled="!cartStore.items.length"
          @click="handleClearCart()"
        >
          清空购物车
        </button>
      </GlassPanel>
    </div>
  </div>
</template>
