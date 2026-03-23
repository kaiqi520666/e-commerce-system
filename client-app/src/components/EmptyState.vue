<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="glass-panel flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
    <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
      <span class="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
    </div>
    <h3 class="text-xl font-semibold text-white">{{ title }}</h3>
    <p class="max-w-md text-sm text-slate-300/80">{{ description }}</p>
    <slot />
  </div>
</template>
