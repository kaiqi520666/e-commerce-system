<script setup>
import { computed, ref } from 'vue'
import UiIcon from './UiIcon.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  currentCategoryId: {
    type: Number,
    default: null,
  },
  depth: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['select'])

const hasChildren = computed(() => Boolean(props.node.children?.length))
const isSelected = computed(() => props.node.id === props.currentCategoryId)
const isOpen = ref(false)

function toggle() {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value
  }
}

function handleSelect() {
  emit('select', props.node.id)
}
</script>

<template>
  <div class="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
    <div
      class="group w-full min-w-0 max-w-full rounded-[0.95rem] border py-2.5 pr-3 transition duration-200"
      :class="
        isSelected
          ? 'border-cyan-300/35 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(30,41,59,0.26))] text-white shadow-[0_14px_30px_rgba(34,211,238,0.1)]'
          : 'border-white/8 bg-white/[0.03] text-slate-300 hover:border-cyan-400/20 hover:bg-cyan-400/8'
      "
      :style="{ paddingLeft: `${12 + depth * 10}px` }"
    >
      <div v-if="depth === 0" class="flex min-w-0 items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="flex h-9 w-9 shrink-0 overflow-hidden rounded-[0.85rem] border border-white/10 bg-slate-950/55"
          >
            <img v-if="node.thumb" :src="node.thumb" :alt="node.name" class="h-full w-full object-cover" />
            <span v-else class="flex h-full w-full items-center justify-center text-cyan-200">
              <UiIcon name="category" />
            </span>
          </span>

          <button type="button" class="min-w-0 max-w-full cursor-pointer overflow-hidden text-left" @click="handleSelect">
            <span class="block truncate text-sm font-semibold">{{ node.name }}</span>
            <span class="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {{ hasChildren ? `${node.children.length} 个子分类` : '叶子分类' }}
            </span>
          </button>
        </div>

        <button
          v-if="hasChildren"
          type="button"
          class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[0.7rem] border border-white/10 bg-slate-950/55 text-cyan-200 transition duration-200 hover:border-cyan-300/30"
          @click="toggle"
        >
          <span class="transition duration-200" :class="isOpen ? 'rotate-90' : ''">
            <UiIcon name="chevron" />
          </span>
        </button>
      </div>

      <div v-else class="grid min-w-0 items-center gap-3" style="grid-template-columns: auto auto minmax(0,1fr);">
        <button
          v-if="hasChildren"
          type="button"
          class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[0.7rem] border border-white/10 bg-slate-950/55 text-cyan-200 transition duration-200 hover:border-cyan-300/30"
          @click="toggle"
        >
          <span class="transition duration-200" :class="isOpen ? 'rotate-90' : ''">
            <UiIcon name="chevron" />
          </span>
        </button>
        <span v-else class="h-8 w-2 shrink-0"></span>

        <button type="button" class="min-w-0 max-w-full cursor-pointer overflow-hidden text-left" @click="handleSelect">
          <span class="block truncate text-sm font-semibold">{{ node.name }}</span>
          <span class="block text-[11px] uppercase tracking-[0.18em] text-slate-500">
            {{ hasChildren ? `${node.children.length} 个子分类` : '叶子分类' }}
          </span>
        </button>
      </div>
    </div>

    <Transition name="category-accordion">
      <div v-if="hasChildren && isOpen" class="w-full min-w-0 max-w-full space-y-2 overflow-x-hidden">
        <CategoryTreeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :current-category-id="currentCategoryId"
          :depth="depth + 1"
          @select="emit('select', $event)"
        />
      </div>
    </Transition>
  </div>
</template>
