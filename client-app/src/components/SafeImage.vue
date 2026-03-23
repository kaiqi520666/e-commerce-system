<script setup>
import { computed, ref, watch } from 'vue'
import UiIcon from './UiIcon.vue'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  fallbackText: {
    type: String,
    default: 'NEBULA',
  },
  fallbackIcon: {
    type: String,
    default: 'category',
  },
  imageClass: {
    type: String,
    default: '',
  },
  fallbackClass: {
    type: String,
    default: '',
  },
})

const hasError = ref(false)
const placeholderFailed = ref(false)
const PLACEHOLDER_SRC = '/placeholder.svg'

const normalizedSrc = computed(() => String(props.src || '').trim())
const resolvedSrc = computed(() => {
  if (placeholderFailed.value) {
    return ''
  }

  if (hasError.value || !normalizedSrc.value) {
    return PLACEHOLDER_SRC
  }

  return normalizedSrc.value
})
const shouldRenderFallback = computed(() => !resolvedSrc.value)

function handleError() {
  if (resolvedSrc.value === PLACEHOLDER_SRC) {
    placeholderFailed.value = true
  } else {
    hasError.value = true
  }
}

watch(
  () => props.src,
  () => {
    hasError.value = false
    placeholderFailed.value = false
  },
)
</script>

<template>
  <img
    v-if="!shouldRenderFallback"
    :src="resolvedSrc"
    :alt="alt"
    :class="imageClass"
    @error="handleError"
  />
  <div
    v-else
    :class="fallbackClass"
  >
    <span
      v-if="fallbackText"
      class="font-display tracking-[0.28em]"
    >
      {{ fallbackText }}
    </span>
    <UiIcon v-else :name="fallbackIcon" />
  </div>
</template>
