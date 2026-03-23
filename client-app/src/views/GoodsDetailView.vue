<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { catalogApi } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useOverlayStore } from '@/stores/overlay'
import EmptyState from '@/components/EmptyState.vue'
import PageTopBar from '@/components/PageTopBar.vue'
import SafeImage from '@/components/SafeImage.vue'
import UiIcon from '@/components/UiIcon.vue'
import { formatPrice } from '@/utils/price'
import { sanitizeHtml } from '@/utils/richText'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const overlayStore = useOverlayStore()

const goods = ref(null)
const isLoaded = ref(false)
const orderQuantity = ref(1)
const orderMode = ref('normal')
const formValues = reactive({})
const activeSheetParam = ref(null)

const goodsId = computed(() => Number(route.params.id))
const isPaused = computed(() => Number(goods.value?.isClose) === 1)
const parsedLabels = computed(() =>
  String(goods.value?.label || '')
    .split(/[，,|/]/)
    .map((item) => item.trim())
    .filter(Boolean),
)
const sanitizedDetail = computed(() => sanitizeHtml(goods.value?.detail || ''))
const normalizedParamsTemplate = computed(() =>
  Array.isArray(goods.value?.paramsTemplate) ? goods.value.paramsTemplate : [],
)

const quantityMin = computed(() => {
  const min = Number(goods.value?.minOrderNum)
  return min > 0 ? min : 1
})

const quantityMax = computed(() => {
  const max = Number(goods.value?.maxOrderNum)
  return max > 0 ? max : Infinity
})

const totalPrice = computed(() => {
  const price = Number(goods.value?.price || 0)
  return price * clampQuantity(orderQuantity.value)
})

const totalPriceText = computed(() => formatPrice(totalPrice.value))

const orderRangeText = computed(() => {
  if (quantityMax.value === Infinity) {
    return `${quantityMin.value} 起`
  }

  return `${quantityMin.value} - ${quantityMax.value}`
})

const paramTypeMap = {
  1: '文本输入',
  2: '多行文本',
  3: '多行文本',
  4: '日期',
  5: '时间',
  6: '布尔开关',
  7: '文件上传',
  8: '下拉选项',
  61: '链接输入',
}

function getParamTypeLabel(type) {
  return paramTypeMap[type] || `类型 ${type}`
}

function getParamInputType(type) {
  if (type === 61) {
    return 'url'
  }

  return 'text'
}

function getParamPlaceholder(param) {
  return param?.description || param?.name || '请输入内容'
}

function getParamOptions(param) {
  if (!param?.type_config) {
    return []
  }

  return String(param.type_config)
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getFieldKey(param) {
  return String(param?.key || param?.name || '')
}

function isTextareaParam(type) {
  return type === 2 || type === 3
}

function isSelectParam(type, param) {
  return Number(type) === 8 && getParamOptions(param).length > 0
}

function useOptionChips(param) {
  return isSelectParam(param.type, param) && getParamOptions(param).length <= 4
}

function normalizeMax(value) {
  const max = Number(value)

  if (max === -1 || max === 0 || Number.isNaN(max)) {
    return null
  }

  return max
}

function syncFormValues() {
  const nextKeys = new Set()

  normalizedParamsTemplate.value.forEach((param) => {
    const key = getFieldKey(param)

    if (!key) {
      return
    }

    nextKeys.add(key)

    if (!(key in formValues)) {
      formValues[key] = param?.value ?? ''
    }
  })

  Object.keys(formValues).forEach((key) => {
    if (!nextKeys.has(key)) {
      delete formValues[key]
    }
  })
}

function clampQuantity(value) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return quantityMin.value
  }

  if (numericValue < quantityMin.value) {
    return quantityMin.value
  }

  if (numericValue > quantityMax.value) {
    return quantityMax.value
  }

  return Math.floor(numericValue)
}

function updateQuantity(nextValue) {
  orderQuantity.value = clampQuantity(nextValue)
}

function increaseQuantity() {
  updateQuantity(Number(orderQuantity.value) + 1)
}

function decreaseQuantity() {
  updateQuantity(Number(orderQuantity.value) - 1)
}

function handleSwitchMode(mode) {
  if (mode === 'batch') {
    overlayStore.showToast({
      type: 'info',
      message: '批量下单暂未开放，后续再接入',
    })
    return
  }

  orderMode.value = mode
}

function openParamSheet(param) {
  activeSheetParam.value = param
}

function closeParamSheet() {
  activeSheetParam.value = null
}

function setSheetScrollLock(locked) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.style.overflow = locked ? 'hidden' : ''
  document.body.style.overflow = locked ? 'hidden' : ''
}

function handleSelectOption(param, option) {
  formValues[getFieldKey(param)] = option
  closeParamSheet()
}

function validateOrderForm() {
  for (const param of normalizedParamsTemplate.value) {
    const fieldKey = getFieldKey(param)
    const rawValue = String(formValues[fieldKey] ?? '').trim()
    const min = Number(param?.verify?.min) || 1
    const max = normalizeMax(param?.verify?.max)

    if (!rawValue) {
      overlayStore.showToast({
        type: 'warning',
        message: `请填写${param.name || '下单参数'}`,
      })
      return false
    }

    if (rawValue.length < min) {
      overlayStore.showToast({
        type: 'warning',
        message: `${param.name || '下单参数'}至少输入 ${min} 个字符`,
      })
      return false
    }

    if (max && rawValue.length > max) {
      overlayStore.showToast({
        type: 'warning',
        message: `${param.name || '下单参数'}最多输入 ${max} 个字符`,
      })
      return false
    }

    if (Number(param.type) === 61) {
      try {
        const url = new URL(rawValue)

        if (!/^https?:$/.test(url.protocol)) {
          throw new Error('invalid protocol')
        }
      } catch {
        overlayStore.showToast({
          type: 'warning',
          message: `${param.name || '链接'}格式不正确`,
        })
        return false
      }
    }
  }

  updateQuantity(orderQuantity.value)
  return true
}

async function fetchGoodsDetail() {
  if (!goodsId.value) {
    isLoaded.value = true
    return
  }

  overlayStore.showLoading('加载商品详情...')

  try {
    goods.value = await catalogApi.goodsInfo(goodsId.value)
    orderQuantity.value = quantityMin.value
    syncFormValues()
  } catch (error) {
    overlayStore.showToast({
      type: 'error',
      message: error.message || '商品详情加载失败',
    })
  } finally {
    isLoaded.value = true
    overlayStore.hideLoading()
  }
}

function buildCartPayload() {
  return {
    id: `goods-${goods.value.id}`,
    goodsId: goods.value.id,
    name: goods.value.name,
    subtitle: goods.value.label || goods.value.title || '商品详情页加入',
    thumb: goods.value.thumb || '',
    price: Number(goods.value.price || 0),
    quantity: clampQuantity(orderQuantity.value),
    minQuantity: quantityMin.value,
    maxQuantity: quantityMax.value,
    params: normalizedParamsTemplate.value.map((param) => ({
      key: getFieldKey(param),
      name: param.name,
      value: String(formValues[getFieldKey(param)] ?? '').trim(),
    })),
  }
}

function addToCartWithFeedback(successMessage) {
  if (!goods.value || isPaused.value || !validateOrderForm()) {
    return false
  }

  cartStore.addItem(buildCartPayload())

  overlayStore.showToast({
    type: 'success',
    message: successMessage,
  })

  return true
}

function handleAddToCart() {
  addToCartWithFeedback(`${goods.value.name} 已加入购物车`)
}

function handleBuyNow() {
  const ok = addToCartWithFeedback('已加入购物车，正在前往结算')

  if (ok) {
    router.push('/cart')
  }
}

watch(
  () => normalizedParamsTemplate.value,
  () => {
    syncFormValues()
  },
  { deep: true },
)

watch(activeSheetParam, (value) => {
  setSheetScrollLock(Boolean(value))
})

onMounted(() => {
  fetchGoodsDetail()
})

onBeforeUnmount(() => {
  setSheetScrollLock(false)
})
</script>

<template>
  <PageTopBar
    fixed
    :title="goods?.name || '商品详情'"
    container-class="max-w-[980px]"
  />

  <div
    class="goods-flow-page mx-auto mt-[5.1rem] max-w-[980px] pb-[calc(10.5rem+env(safe-area-inset-bottom))] lg:mt-[5.4rem] lg:pb-6"
  >

    <EmptyState
      v-if="isLoaded && !goods"
      title="商品详情不存在"
      description="请确认商品 ID 是否有效，或者稍后重新进入详情页。"
    />

    <template v-else-if="goods">
      <section v-if="goods.title || goods.content" class="goods-flow-banner">
        <div class="goods-flow-banner-icon">
          <UiIcon name="warning" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="goods-flow-kicker">注意事项</p>
          <p class="mt-2 text-sm leading-6 text-amber-100/88">
            {{ goods.content || goods.title }}
          </p>
        </div>
      </section>

      <section class="goods-flow-panel goods-flow-product">
        <div class="goods-flow-thumb-wrap">
          <div class="goods-flow-thumb">
            <SafeImage
              :src="goods.thumb"
              :alt="goods.name"
              fallback-text="NX"
              image-class="h-full w-full object-cover"
              fallback-class="goods-flow-thumb-fallback"
            />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span
              v-for="item in parsedLabels"
              :key="item"
              class="goods-flow-badge goods-flow-badge-info"
            >
              {{ item }}
            </span>
            <span v-if="isPaused" class="goods-flow-badge goods-flow-badge-danger">
              已暂停购买
            </span>
          </div>

          <h2 class="mt-2 text-xl font-semibold text-white sm:text-2xl">{{ goods.name }}</h2>

          <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300/82">
            <span>商品编号：{{ goods.id }}</span>
            <span>购买范围：{{ orderRangeText }}</span>
            <span v-if="goods.stock === -1">库存：充足</span>
          </div>

          <div class="mt-4 flex items-end gap-2">
            <span class="text-sm text-cyan-200/75">单价</span>
            <span class="font-display text-3xl leading-none text-cyan-300">
              ¥{{ formatPrice(goods.price) }}
            </span>
          </div>

          <div v-if="goods.desc || goods.title || goods.content" class="goods-flow-summary">
            <p class="goods-flow-summary-title">{{ goods.title || '商品说明' }}</p>
            <p class="text-sm leading-7 text-slate-300/82">
              {{ goods.desc || goods.content || '当前商品暂未配置额外说明。' }}
            </p>
          </div>
        </div>
      </section>
      <section v-if="sanitizedDetail" class="goods-flow-panel">
        <div class="flex items-center gap-2">
          <span class="goods-flow-kicker">商品详情</span>
        </div>
        <div
          class="detail-rich mt-3 text-sm leading-7 text-slate-200/88"
          v-html="sanitizedDetail"
        />
      </section>

      <section class="goods-flow-panel goods-flow-order">
        <div class="goods-flow-tabs">
          <button
            type="button"
            class="goods-flow-tab"
            :class="{ 'goods-flow-tab-active': orderMode === 'normal' }"
            @click="handleSwitchMode('normal')"
          >
            普通下单
          </button>
          <button
            type="button"
            class="goods-flow-tab"
            :class="{ 'goods-flow-tab-active': orderMode === 'batch' }"
            @click="handleSwitchMode('batch')"
          >
            批量下单
          </button>
        </div>

        <div class="goods-flow-form">
          <div v-for="item in normalizedParamsTemplate" :key="item.key" class="goods-flow-field">
            <div class="flex flex-wrap items-center gap-2">
              <label class="goods-flow-label">
                <span class="text-rose-300">*</span>
                {{ item.name }}
              </label>
              <span class="goods-flow-meta">{{ getParamTypeLabel(item.type) }}</span>
            </div>

            <div v-if="useOptionChips(item)" class="goods-flow-chip-group">
              <button
                v-for="option in getParamOptions(item)"
                :key="option"
                type="button"
                class="goods-flow-option"
                :class="{ 'goods-flow-option-active': formValues[getFieldKey(item)] === option }"
                @click="formValues[getFieldKey(item)] = option"
              >
                {{ option }}
              </button>
            </div>

            <button
              v-else-if="isSelectParam(item.type, item)"
              type="button"
              class="goods-flow-input goods-flow-sheet-trigger"
              @click="openParamSheet(item)"
            >
              <span>
                {{ formValues[getFieldKey(item)] || `请选择${item.name}` }}
              </span>
              <span class="goods-flow-sheet-arrow">
                <UiIcon name="chevron" />
              </span>
            </button>

            <textarea
              v-else-if="isTextareaParam(item.type)"
              v-model.trim="formValues[getFieldKey(item)]"
              :placeholder="getParamPlaceholder(item)"
              class="goods-flow-input min-h-28 resize-y py-3"
            />

            <input
              v-else
              v-model.trim="formValues[getFieldKey(item)]"
              :type="getParamInputType(item.type)"
              :placeholder="getParamPlaceholder(item)"
              class="goods-flow-input"
            />
          </div>

          <div v-if="!normalizedParamsTemplate.length" class="goods-flow-empty">
            当前商品没有额外参数，可直接填写数量下单。
          </div>

          <div class="goods-flow-field">
            <div class="flex flex-wrap items-center gap-2">
              <label class="goods-flow-label">
                <span class="text-rose-300">*</span>
                数量
              </label>
              <span class="goods-flow-meta goods-flow-meta-muted">
                下单范围 {{ quantityMin }} - {{ quantityMax === Infinity ? '不限' : quantityMax }}
              </span>
            </div>

            <div class="goods-flow-quantity">
              <div class="text-xs text-slate-400">当前数量将按商品规则自动校验</div>
              <div class="goods-flow-stepper-group">
                <button type="button" class="goods-flow-stepper" @click="decreaseQuantity()">
                  -
                </button>
                <input
                  v-model.number="orderQuantity"
                  type="number"
                  :min="quantityMin"
                  :max="quantityMax === Infinity ? undefined : quantityMax"
                  class="goods-flow-quantity-input"
                  @blur="updateQuantity(orderQuantity)"
                />
                <button
                  type="button"
                  class="goods-flow-stepper goods-flow-stepper-primary"
                  @click="increaseQuantity()"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-if="goods" class="goods-flow-footer">
      <div class="min-w-0">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
        <p class="mt-1 font-display text-[1.9rem] leading-none text-cyan-300">
          ¥{{ totalPriceText }}
        </p>
      </div>

      <div class="goods-flow-footer-actions">
        <button
          type="button"
          class="goods-flow-action goods-flow-action-secondary"
          :disabled="isPaused"
          @click="handleAddToCart()"
        >
          加入购物车
        </button>
        <button
          type="button"
          class="goods-flow-action goods-flow-action-primary"
          :disabled="isPaused"
          @click="handleBuyNow()"
        >
          立即购买
        </button>
      </div>
    </div>

    <div
      v-if="activeSheetParam"
      class="fixed inset-0 z-40 bg-slate-950/72 backdrop-blur-sm"
      @click.self="closeParamSheet()"
    >
      <div class="goods-flow-sheet">
        <div class="goods-flow-sheet-handle" />
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="goods-flow-kicker">Select Option</p>
            <h3 class="mt-2 truncate text-xl font-semibold text-white">
              {{ activeSheetParam.name }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-slate-300/82">
              {{ activeSheetParam.description || `请选择${activeSheetParam.name}` }}
            </p>
          </div>
          <button type="button" class="goods-flow-sheet-close" @click="closeParamSheet()">
            <UiIcon name="close" />
          </button>
        </div>

        <div class="mt-4 space-y-2">
          <button
            v-for="option in getParamOptions(activeSheetParam)"
            :key="option"
            type="button"
            class="goods-flow-sheet-option"
            :class="{
              'goods-flow-sheet-option-active':
                formValues[getFieldKey(activeSheetParam)] === option,
            }"
            @click="handleSelectOption(activeSheetParam, option)"
          >
            <span>{{ option }}</span>
            <UiIcon v-if="formValues[getFieldKey(activeSheetParam)] === option" name="success" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.goods-flow-page {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.goods-flow-banner,
.goods-flow-panel,
.goods-flow-footer {
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 20px 58px rgba(2, 8, 23, 0.26);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
}

.goods-flow-banner {
  display: flex;
  gap: 0.9rem;
  border-radius: 1.15rem;
  background:
    linear-gradient(180deg, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.08)),
    rgba(32, 18, 4, 0.72);
  padding: 0.95rem 1rem;
}

.goods-flow-banner-icon {
  display: inline-flex;
  height: 2.4rem;
  width: 2.4rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  background: rgba(251, 191, 36, 0.14);
  color: #fbbf24;
}

.goods-flow-kicker {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(125, 211, 252, 0.82);
}

.goods-flow-panel {
  overflow: hidden;
  border-radius: 1.25rem;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.09), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.025)),
    rgba(7, 17, 36, 0.78);
  padding: 1rem;
}

.goods-flow-product {
  display: flex;
  gap: 1rem;
}

.goods-flow-thumb-wrap {
  flex-shrink: 0;
}

.goods-flow-thumb {
  height: 5.3rem;
  width: 5.3rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.2rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(6, 12, 28, 0.92));
  box-shadow: 0 16px 34px rgba(2, 8, 23, 0.24);
}

.goods-flow-thumb-fallback {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  color: #bae6fd;
}

.goods-flow-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.18rem 0.52rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.goods-flow-badge-info {
  border: 1px solid rgba(96, 165, 250, 0.22);
  background: rgba(59, 130, 246, 0.18);
  color: #dbeafe;
}

.goods-flow-badge-danger {
  border: 1px solid rgba(251, 113, 133, 0.2);
  background: rgba(190, 24, 93, 0.18);
  color: #ffe4e6;
}

.goods-flow-summary {
  margin-top: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.035);
  padding: 0.9rem;
}

.goods-flow-summary-title {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
}

.goods-flow-order {
  padding: 0;
}

.goods-flow-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.goods-flow-tab {
  position: relative;
  border: 0;
  background: transparent;
  padding: 1rem 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(148, 163, 184, 0.92);
  cursor: pointer;
}

.goods-flow-tab-active {
  color: white;
}

.goods-flow-tab-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  height: 2px;
  width: 4rem;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.95), rgba(37, 99, 235, 0.95));
}

.goods-flow-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.goods-flow-field {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.goods-flow-label {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.goods-flow-meta {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.16);
  padding: 0.18rem 0.52rem;
  font-size: 0.72rem;
  color: #cfe7ff;
}

.goods-flow-meta-muted {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(191, 219, 254, 0.76);
}

.goods-flow-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.95rem 1rem;
  color: white;
  outline: none;
}

.goods-flow-input::placeholder {
  color: rgba(148, 163, 184, 0.72);
}

.goods-flow-input:focus {
  border-color: rgba(56, 189, 248, 0.28);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
}

.goods-flow-sheet-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
}

.goods-flow-sheet-arrow {
  display: inline-flex;
  color: rgba(191, 219, 254, 0.82);
}

.goods-flow-sheet {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  max-height: min(78vh, 42rem);
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: 1.4rem 1.4rem 0 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(10, 14, 39, 0.98), rgba(7, 17, 36, 0.98)), rgba(7, 17, 36, 0.98);
  padding: 0.9rem 1rem calc(1rem + env(safe-area-inset-bottom));
  box-shadow: 0 -18px 50px rgba(2, 8, 23, 0.52);
}

.goods-flow-sheet-handle {
  margin: 0 auto 0.9rem;
  height: 0.28rem;
  width: 3.2rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.38);
}

.goods-flow-sheet-close {
  display: inline-flex;
  height: 2.2rem;
  width: 2.2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
}

.goods-flow-sheet-option {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.035);
  padding: 0.95rem 1rem;
  color: #f8fafc;
  text-align: left;
}

.goods-flow-sheet-option-active {
  border-color: rgba(56, 189, 248, 0.26);
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.18), rgba(37, 99, 235, 0.12));
}

.goods-flow-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.goods-flow-option {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.95rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.72rem 1rem;
  color: rgba(226, 232, 240, 0.88);
  cursor: pointer;
  transition: all 180ms ease;
}

.goods-flow-option-active {
  border-color: rgba(56, 189, 248, 0.26);
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.24), rgba(37, 99, 235, 0.16));
  color: white;
}

.goods-flow-empty {
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.95rem 1rem;
  color: rgba(191, 219, 254, 0.72);
}

.goods-flow-quantity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.035);
  padding: 0.9rem 1rem;
}

.goods-flow-stepper-group {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
}

.goods-flow-stepper {
  display: inline-flex;
  height: 2.35rem;
  width: 2.35rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: #cfe7ff;
  font-size: 1.15rem;
  cursor: pointer;
}

.goods-flow-stepper-primary {
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.28), rgba(37, 99, 235, 0.34));
  color: white;
}

.goods-flow-quantity-input {
  width: 4.2rem;
  border: 0;
  background: transparent;
  text-align: center;
  font-size: 1.1rem;
  color: white;
  outline: none;
}

.goods-flow-quantity-input::-webkit-outer-spin-button,
.goods-flow-quantity-input::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.goods-flow-footer {
  position: fixed;
  right: 0.75rem;
  bottom: max(0.75rem, env(safe-area-inset-bottom));
  left: 0.75rem;
  z-index: 32;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(3, 7, 18, 0.98), rgba(7, 17, 36, 0.96)), rgba(7, 17, 36, 0.98);
  padding: 0.95rem 1rem;
}

.goods-flow-footer-actions {
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
}

.goods-flow-action {
  border: 0;
  border-radius: 999px;
  padding: 0.92rem 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.goods-flow-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.goods-flow-action-secondary {
  background: rgba(255, 255, 255, 0.06);
  color: white;
}

.goods-flow-action-primary {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.95), rgba(37, 99, 235, 0.95));
  color: white;
}

@media (max-width: 640px) {
  .goods-flow-product {
    flex-direction: column;
  }

  .goods-flow-thumb {
    height: 5.8rem;
    width: 5.8rem;
  }

  .goods-flow-quantity {
    flex-direction: column;
    align-items: stretch;
  }

  .goods-flow-stepper-group {
    justify-content: flex-end;
  }

  .goods-flow-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .goods-flow-footer-actions {
    width: 100%;
  }
}

@media (min-width: 1024px) {
  .goods-flow-footer {
    position: sticky;
    right: auto;
    left: auto;
    bottom: 1rem;
    width: 100%;
    border-radius: 1.35rem;
    margin-top: 0.25rem;
  }
}
</style>
