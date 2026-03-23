<script setup>
import { useOverlayStore } from '@/stores/overlay'
import UiIcon from './UiIcon.vue'

const overlayStore = useOverlayStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="overlayStore.confirmState.visible"
        class="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/72 px-4 backdrop-blur-sm"
        @click.self="overlayStore.resolveConfirm(false)"
      >
        <div class="glass-panel w-full max-w-[27rem] space-y-4 border border-white/10">
          <div class="space-y-2">
            <p class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-300/80">
              <UiIcon name="confirm" />
              Confirm
            </p>
            <h3 class="text-2xl font-semibold text-white">{{ overlayStore.confirmState.title }}</h3>
            <p class="text-sm leading-7 text-slate-300/80">{{ overlayStore.confirmState.message }}</p>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white transition duration-200 hover:border-white/20 hover:bg-white/[0.08]"
              @click="overlayStore.resolveConfirm(false)"
            >
              <UiIcon name="close" />
              {{ overlayStore.confirmState.cancelText }}
            </button>
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/14 px-5 py-2.5 text-sm font-medium text-cyan-50 transition duration-200 hover:bg-cyan-300/20"
              @click="overlayStore.resolveConfirm(true)"
            >
              <UiIcon name="confirm" />
              {{ overlayStore.confirmState.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
