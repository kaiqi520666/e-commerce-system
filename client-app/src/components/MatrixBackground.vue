<template>
  <div class="matrix-background" aria-hidden="true">
    <canvas ref="matrixCanvas" class="matrix-canvas" :style="{ opacity }" />
    <div class="scan-line-vertical" />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  opacity: {
    type: Number,
    default: 0.2,
  },
  color: {
    type: String,
    default: '#52f7d4',
  },
  fontSize: {
    type: Number,
    default: 12,
  },
  chars: {
    type: String,
    default: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*',
  },
  speed: {
    type: Number,
    default: 60,
  },
  bgColor: {
    type: String,
    default: 'rgba(5, 10, 24, 0.1)',
  },
})

const matrixCanvas = ref(null)

let matrixInterval = null
let resizeObserver = null

function stopMatrixEffect() {
  if (matrixInterval) {
    clearInterval(matrixInterval)
    matrixInterval = null
  }
}

function startMatrixEffect() {
  const canvas = matrixCanvas.value

  if (!canvas) {
    return
  }

  stopMatrixEffect()

  const parent = canvas.parentElement
  const rect = parent?.getBoundingClientRect()

  canvas.width = rect?.width || parent?.clientWidth || 320
  canvas.height = rect?.height || parent?.clientHeight || 220

  if (!canvas.width || !canvas.height) {
    return
  }

  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  const columns = Math.max(1, Math.floor(canvas.width / props.fontSize))
  const drops = Array.from({ length: columns }, () =>
    Math.floor(Math.random() * (canvas.height / props.fontSize)),
  )

  const draw = () => {
    context.fillStyle = props.bgColor
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = props.color
    context.font = `${props.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

    for (let index = 0; index < drops.length; index += 1) {
      const char = props.chars[Math.floor(Math.random() * props.chars.length)]
      const x = index * props.fontSize
      const y = drops[index] * props.fontSize

      context.fillText(char, x, y)

      if (y > canvas.height && Math.random() > 0.975) {
        drops[index] = 0
      }

      drops[index] += 1
    }
  }

  draw()
  matrixInterval = setInterval(draw, props.speed)
}

onMounted(async () => {
  await nextTick()
  await new Promise((resolve) => window.setTimeout(resolve, 120))
  startMatrixEffect()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      startMatrixEffect()
    })

    if (matrixCanvas.value?.parentElement) {
      resizeObserver.observe(matrixCanvas.value.parentElement)
    }
  }
})

onUnmounted(() => {
  stopMatrixEffect()

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>

<style scoped>
.matrix-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.matrix-canvas {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  mix-blend-mode: screen;
}

.scan-line-vertical {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 18%, transparent 82%, rgba(255, 255, 255, 0.03)),
    repeating-linear-gradient(
      180deg,
      rgba(82, 247, 212, 0.045) 0,
      rgba(82, 247, 212, 0.045) 1px,
      transparent 1px,
      transparent 5px
    );
  opacity: 0.5;
}
</style>
