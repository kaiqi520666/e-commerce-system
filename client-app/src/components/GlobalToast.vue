<script setup>
import { useOverlayStore } from '@/stores/overlay'
import UiIcon from './UiIcon.vue'

const overlayStore = useOverlayStore()

const toastTypeClassMap = {
  info: 'border-cyan-300/20 bg-[linear-gradient(180deg,rgba(8,47,73,0.96),rgba(8,23,44,0.92))] text-cyan-50',
  success: 'border-emerald-300/20 bg-[linear-gradient(180deg,rgba(6,78,59,0.96),rgba(6,46,33,0.92))] text-emerald-50',
  warning: 'border-amber-300/20 bg-[linear-gradient(180deg,rgba(120,53,15,0.96),rgba(69,26,3,0.92))] text-amber-50',
  error: 'border-rose-300/20 bg-[linear-gradient(180deg,rgba(127,29,29,0.96),rgba(69,10,10,0.92))] text-rose-50',
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4">
      <div class="flex w-full max-w-[28rem] flex-col gap-2">
        <TransitionGroup name="toast">
          <div
            v-for="toast in overlayStore.toasts"
            :key="toast.id"
            class="pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_20px_50px_rgba(2,8,23,0.42)] backdrop-blur-xl"
            :class="toastTypeClassMap[toast.type] || toastTypeClassMap.info"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex shrink-0">
                  <UiIcon :name="toast.type" />
                </span>
                <p class="text-sm leading-6">{{ toast.message }}</p>
              </div>
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1 text-xs text-white/65 transition duration-200 hover:text-white"
                @click="overlayStore.removeToast(toast.id)"
              >
                <UiIcon name="close" />
                关闭
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>
