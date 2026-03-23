<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Number,
    default: 16,
  },
  minLength: {
    type: Number,
    default: 12,
  },
  maxLength: {
    type: Number,
    default: 28,
  },
  charset: {
    type: String,
    default: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$%#*+-=',
  },
})

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChar(source) {
  return source.charAt(randomBetween(0, source.length - 1))
}

function createColumn(index) {
  const length = randomBetween(props.minLength, props.maxLength)
  const text = Array.from({ length }, () => randomChar(props.charset)).join('\n')

  return {
    id: `matrix-${index}`,
    text,
    duration: `${randomBetween(7, 13)}s`,
    delay: `${randomBetween(-14, 0)}s`,
    left: `${(index / props.columns) * 100}%`,
    opacity: (Math.random() * 0.28 + 0.24).toFixed(2),
    blur: `${(Math.random() * 0.45).toFixed(2)}px`,
  }
}

const columns = computed(() =>
  Array.from({ length: props.columns }, (_, index) => createColumn(index)),
)
</script>

<template>
  <div class="matrix-rain" aria-hidden="true">
    <span
      v-for="column in columns"
      :key="column.id"
      class="matrix-rain-column"
      :style="{
        left: column.left,
        animationDuration: column.duration,
        animationDelay: column.delay,
        opacity: column.opacity,
        filter: `blur(${column.blur})`,
      }"
    >
      {{ column.text }}
    </span>
  </div>
</template>

<style scoped>
.matrix-rain {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  mask-image: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.98) 10%,
    rgba(0, 0, 0, 0.9) 86%,
    transparent 100%
  );
}

.matrix-rain-column {
  position: absolute;
  top: -165%;
  width: 1ch;
  white-space: pre;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1;
  color: rgba(34, 211, 238, 0.82);
  text-shadow:
    0 0 10px rgba(6, 182, 212, 0.34),
    0 0 20px rgba(34, 211, 238, 0.12);
  animation-name: matrix-rain-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.matrix-rain-column::first-line {
  color: rgba(186, 230, 253, 0.98);
}

@keyframes matrix-rain-fall {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(0, 360%, 0);
  }
}
</style>
