<script setup>
import { useRouter } from 'vue-router'
import UiIcon from '@/components/UiIcon.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
  fixed: {
    type: Boolean,
    default: false,
  },
  containerClass: {
    type: String,
    default: '',
  },
})

const router = useRouter()

function handleBack() {
  router.back()
}
</script>

<template>
  <div
    :class="[
      fixed ? 'fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-5 lg:px-6' : '',
      'pointer-events-none',
    ]"
  >
    <div :class="[containerClass, 'mx-auto w-full max-w-[980px]']">
      <div class="page-topbar pointer-events-auto">
        <button type="button" class="page-topbar-back" @click="handleBack()">
          <span class="inline-flex rotate-180">
            <UiIcon name="chevron" />
          </span>
        </button>
        <h1 class="page-topbar-title">{{ title }}</h1>
        <span class="page-topbar-back opacity-0" aria-hidden="true">
          <span class="inline-flex rotate-180">
            <UiIcon name="chevron" />
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.15rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
    rgba(7, 17, 36, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 18px 46px rgba(2, 8, 23, 0.3);
  backdrop-filter: blur(18px) saturate(125%);
  -webkit-backdrop-filter: blur(18px) saturate(125%);
  padding: 0.8rem 0.9rem;
}

.page-topbar-back {
  display: inline-flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  cursor: pointer;
}

.page-topbar-title {
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
}
</style>
