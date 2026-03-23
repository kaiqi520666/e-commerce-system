<script setup>
import { useOverlayStore } from '@/stores/overlay'
import UiIcon from './UiIcon.vue'

const overlayStore = useOverlayStore()
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="overlayStore.isLoading"
        class="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
      >
        <div class="glass-panel flex min-w-[13rem] flex-col items-center gap-4 border border-cyan-300/15 px-6 py-6 text-center">
          <div class="loading-orbit">
            <span class="loading-orbit-core">
              <UiIcon name="loading" />
            </span>
          </div>
          <div class="space-y-1">
            <p class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-300/80">
              <UiIcon name="loading" />
              Loading
            </p>
            <p class="text-sm text-slate-100">{{ overlayStore.loadingText }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
