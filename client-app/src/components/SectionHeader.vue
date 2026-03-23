<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
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
  <header class="flex min-w-0 flex-wrap items-end justify-between gap-4">
    <div class="min-w-0 space-y-2">
      <p v-if="eyebrow" class="text-xs uppercase tracking-[0.32em] text-cyan-300/80">
        {{ eyebrow }}
      </p>
      <h2 class="font-display text-2xl text-white sm:text-3xl">
        {{ title }}
      </h2>
      <p v-if="description" class="max-w-2xl break-words text-sm text-slate-300/80">
        {{ description }}
      </p>
    </div>
    <slot name="action" />
  </header>
</template>
