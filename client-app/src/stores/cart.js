import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

function normalizeParams(params) {
  return Array.isArray(params)
    ? params
        .map((item) => ({
          key: String(item?.key || ''),
          name: String(item?.name || ''),
          value: String(item?.value || '').trim(),
        }))
        .filter((item) => item.key && item.value)
    : []
}

function buildItemSignature(payload) {
  const goodsId = String(payload?.goodsId || payload?.id || '')
  const params = normalizeParams(payload?.params)
  const paramSignature = params
    .map((item) => `${item.key}:${item.value}`)
    .sort()
    .join('|')

  return `${goodsId}__${paramSignature}`
}

function createCartItem(payload) {
  const minQuantity = Math.max(1, Number(payload?.minQuantity) || 1)
  const maxQuantityValue = Number(payload?.maxQuantity)
  const maxQuantity =
    Number.isFinite(maxQuantityValue) && maxQuantityValue > 0
      ? Math.floor(maxQuantityValue)
      : Infinity
  const requestedQuantity = Math.max(1, Number(payload?.quantity) || minQuantity)
  const quantity = Math.min(Math.max(requestedQuantity, minQuantity), maxQuantity)

  return {
    id: buildItemSignature(payload),
    goodsId: payload?.goodsId ?? payload?.id,
    name: payload?.name || '',
    subtitle: payload?.subtitle || '',
    thumb: payload?.thumb || '',
    price: Number(payload?.price || 0),
    quantity,
    minQuantity,
    maxQuantity,
    params: normalizeParams(payload?.params),
  }
}

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref([])

    const totalCount = computed(() =>
      items.value.reduce((sum, item) => sum + item.quantity, 0),
    )

    const totalAmount = computed(() =>
      items.value.reduce((sum, item) => sum + item.quantity * item.price, 0),
    )

    function clampItemQuantity(item, nextQuantity) {
      const min = Math.max(1, Number(item?.minQuantity) || 1)
      const max =
        Number.isFinite(item?.maxQuantity) && item.maxQuantity > 0
          ? Math.floor(item.maxQuantity)
          : Infinity
      const normalized = Math.max(1, Number(nextQuantity) || min)

      return Math.min(Math.max(normalized, min), max)
    }

    function increase(id) {
      const target = items.value.find((item) => item.id === id)

      if (target) {
        target.quantity = clampItemQuantity(target, target.quantity + 1)
      }
    }

    function decrease(id) {
      const target = items.value.find((item) => item.id === id)

      if (!target) return

      if (target.quantity <= Math.max(1, Number(target.minQuantity) || 1)) {
        items.value = items.value.filter((item) => item.id !== id)
      } else {
        target.quantity = clampItemQuantity(target, target.quantity - 1)
      }
    }

    function removeItem(id) {
      items.value = items.value.filter((item) => item.id !== id)
    }

    function clear() {
      items.value = []
    }

    function addItem(payload) {
      const nextItem = createCartItem(payload)
      const target = items.value.find((item) => item.id === nextItem.id)

      if (target) {
        target.quantity = clampItemQuantity(
          target,
          target.quantity + (Number(payload?.quantity) || nextItem.minQuantity),
        )
        target.price = nextItem.price
        target.thumb = nextItem.thumb
        target.subtitle = nextItem.subtitle
        target.params = nextItem.params
        target.minQuantity = nextItem.minQuantity
        target.maxQuantity = nextItem.maxQuantity
        return
      }

      items.value.push(nextItem)
    }

    return {
      items,
      totalCount,
      totalAmount,
      addItem,
      increase,
      decrease,
      removeItem,
      clear,
    }
  },
  {
    persist: true,
  },
)
