<script setup>
import CategoryTreeItem from './CategoryTreeItem.vue'

defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
  currentCategoryId: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="glass-panel w-full min-w-0 space-y-3 overflow-x-hidden">
    <div class="flex min-w-0 items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Category Tree</p>
        <h3 class="mt-1 truncate text-lg font-semibold text-white">树状分类导航</h3>
      </div>
      <span class="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100">
        Accordion
      </span>
    </div>

    <div class="w-full min-w-0 space-y-2 overflow-x-hidden">
      <CategoryTreeItem
        v-for="item in categories"
        :key="item.id"
        :node="item"
        :current-category-id="currentCategoryId"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>
