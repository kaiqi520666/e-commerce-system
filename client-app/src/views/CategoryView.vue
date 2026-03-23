<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useCatalogStore } from '@/stores/catalog'
import { useCartStore } from '@/stores/cart'
import { useOverlayStore } from '@/stores/overlay'
import CategoryRail from '@/components/CategoryRail.vue'
import EmptyState from '@/components/EmptyState.vue'
import ProductCard from '@/components/ProductCard.vue'
import SafeImage from '@/components/SafeImage.vue'
import UiIcon from '@/components/UiIcon.vue'
import { formatPrice } from '@/utils/price'

const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const overlayStore = useOverlayStore()

const searchKeyword = ref('')
const isMobileCategorySheetOpen = ref(false)
const mobileContentRef = ref(null)

const topCategories = computed(() => catalogStore.categories || [])

function findCategoryNode(nodes, targetId) {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node
    }

    if (node.children?.length) {
      const childMatch = findCategoryNode(node.children, targetId)

      if (childMatch) {
        return childMatch
      }
    }
  }

  return null
}

function findTopCategoryId(nodes, targetId, rootId = null) {
  for (const node of nodes) {
    const currentRootId = rootId ?? node.id

    if (node.id === targetId) {
      return currentRootId
    }

    if (node.children?.length) {
      const childMatch = findTopCategoryId(node.children, targetId, currentRootId)

      if (childMatch) {
        return childMatch
      }
    }
  }

  return null
}

const activeTopCategoryId = computed(() => {
  if (!catalogStore.currentCategoryId) {
    return topCategories.value[0]?.id ?? null
  }

  return (
    findTopCategoryId(topCategories.value, catalogStore.currentCategoryId) ??
    catalogStore.currentCategoryId
  )
})

const activeTopCategory = computed(() => {
  if (!activeTopCategoryId.value) {
    return null
  }

  return findCategoryNode(topCategories.value, activeTopCategoryId.value)
})

const mobileSideCategories = computed(() => {
  if (!activeTopCategory.value) {
    return []
  }

  const children = Array.isArray(activeTopCategory.value.children)
    ? activeTopCategory.value.children
    : []

  return [
    {
      id: activeTopCategory.value.id,
      name: activeTopCategory.value.name,
      isAll: true,
    },
    ...children.map((item) => ({
      id: item.id,
      name: item.name,
      isAll: false,
      hasChildren: Array.isArray(item.children) && item.children.length > 0,
    })),
  ]
})

const filteredGoods = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return catalogStore.goods
  }

  return catalogStore.goods.filter((item) => {
    const haystack = [item.name, item.label].filter(Boolean).join(' ').toLowerCase()

    return haystack.includes(keyword)
  })
})

async function initialize() {
  if (!catalogStore.categories.length) {
    await catalogStore.fetchCategories()
  }

  await catalogStore.fetchGoodsByCategory(catalogStore.currentCategoryId)
}

async function handleSelect(categoryId) {
  await catalogStore.fetchGoodsByCategory(categoryId, { page: 1, append: false })
  await nextTick()

  if (mobileContentRef.value) {
    mobileContentRef.value.scrollTop = 0
  }
}

async function handleTopCategorySelect(categoryId) {
  await handleSelect(categoryId)
}

async function handleSheetSelect(categoryId) {
  await handleSelect(categoryId)
  isMobileCategorySheetOpen.value = false
}

function getMobileLabelList(label) {
  if (!label) {
    return []
  }

  return String(label)
    .split(/[，,|/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 1)
}

function handleSearchSubmit() {
  if (!searchKeyword.value.trim()) {
    overlayStore.showToast({
      type: 'info',
      message: '请输入关键词后再搜索',
    })
  }
}

function handleQuickAdd(product) {
  if (Number(product.isClose) === 1) {
    overlayStore.showToast({
      type: 'warning',
      message: '该商品已暂停购买',
    })
    return
  }

  cartStore.addItem({
    id: `goods-${product.id}`,
    goodsId: product.id,
    name: product.name,
    subtitle: product.label || '分类页快捷加入',
    thumb: product.thumb || '',
    price: Number(product.price || 0),
    quantity: Number(product.minOrderNum) || 1,
    minQuantity: Number(product.minOrderNum) || 1,
    maxQuantity: Number(product.maxOrderNum) || Infinity,
    params: [],
  })

  overlayStore.showToast({
    type: 'success',
    message: `${product.name} 已加入购物车`,
  })
}

async function handleMobileContentScroll(event) {
  const element = event.target

  if (!element || catalogStore.isGoodsLoadingMore || !catalogStore.hasMoreGoods) {
    return
  }

  const threshold = 72
  const remaining = element.scrollHeight - element.scrollTop - element.clientHeight

  if (remaining <= threshold) {
    await catalogStore.loadMoreGoods()
  }
}

onMounted(() => {
  initialize()
})
</script>

<template>
  <div class="min-w-0 max-w-full space-y-4">
    <div class="hidden lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-4">
      <div>
        <CategoryRail
          :categories="catalogStore.categories"
          :current-category-id="catalogStore.currentCategoryId"
          @select="handleSelect"
        />
      </div>

      <section class="space-y-4">
        <div class="glass-panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div
              class="inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55"
            >
              <img
                v-if="activeTopCategory?.thumb"
                :src="activeTopCategory.thumb"
                :alt="activeTopCategory.name"
                class="h-full w-full object-cover"
              />
              <span v-else class="flex h-full w-full items-center justify-center text-cyan-200">
                <UiIcon name="category" />
              </span>
            </div>

            <div>
              <p class="text-xs uppercase tracking-[0.28em] text-slate-400">当前焦点分类</p>
              <h2 class="mt-2 text-2xl font-semibold text-white">
                {{ catalogStore.currentCategory?.name || '全部商品' }}
              </h2>
            </div>
          </div>

          <div
            class="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100"
          >
            共 {{ filteredGoods.length }} 件商品
          </div>
        </div>

        <template v-if="filteredGoods.length">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ProductCard v-for="item in filteredGoods" :key="item.id" :product="item" />
          </div>

          <div v-if="catalogStore.hasMoreGoods" class="flex justify-center">
            <button
              type="button"
              class="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100"
              :disabled="catalogStore.isGoodsLoadingMore"
              @click="catalogStore.loadMoreGoods()"
            >
              {{ catalogStore.isGoodsLoadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </template>

        <EmptyState
          v-else
          title="该分类下暂未返回商品"
          description="当前分类下没有匹配商品，可能是该分类暂无可售商品，或当前搜索关键词没有命中结果。"
        />
      </section>
    </div>

    <section class="category-mobile-shell space-y-4 lg:hidden">
      <div class="category-mobile-search">
        <div class="category-mobile-search-input">
          <span class="category-mobile-search-icon">
            <UiIcon name="search" />
          </span>
          <input
            v-model.trim="searchKeyword"
            type="text"
            placeholder="请输入搜索内容"
            class="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
            @keydown.enter="handleSearchSubmit()"
          />
        </div>
        <button type="button" class="category-mobile-search-button" @click="handleSearchSubmit()">
          搜索
        </button>
        <button
          type="button"
          class="category-mobile-filter-button"
          @click="isMobileCategorySheetOpen = true"
        >
          <UiIcon name="filter" />
          全部分类
        </button>
      </div>

      <div class="category-mobile-topbar scrollbar-hide">
        <div class="category-mobile-topbar-track">
          <button
            v-for="item in topCategories"
            :key="item.id"
            type="button"
            class="category-mobile-topitem"
            :class="{ 'category-mobile-topitem-active': item.id === activeTopCategoryId }"
            @click="handleTopCategorySelect(item.id)"
          >
            <span class="category-mobile-topthumb">
              <SafeImage
                :src="item.thumb"
                :alt="item.name"
                fallback-text=""
                fallback-icon="category"
                image-class="h-full w-full object-cover"
                fallback-class="flex h-full w-full items-center justify-center text-cyan-200"
              />
            </span>
            <span class="truncate">{{ item.name }}</span>
          </button>
        </div>
      </div>

      <div class="grid min-w-0 max-w-full grid-cols-[108px_minmax(0,1fr)] gap-2.5">
        <aside class="category-mobile-side scrollbar-hide">
          <button
            v-for="item in mobileSideCategories"
            :key="item.id"
            type="button"
            class="category-mobile-sideitem"
            :class="{
              'category-mobile-sideitem-active': item.id === catalogStore.currentCategoryId,
            }"
            @click="handleSelect(item.id)"
          >
            <span class="block truncate">{{ item.isAll ? '全部' : item.name }}</span>
          </button>
        </aside>

        <section
          ref="mobileContentRef"
          class="category-mobile-content min-w-0 max-w-full space-y-3 scrollbar-hide"
          @scroll.passive="handleMobileContentScroll"
        >
          <div class="category-mobile-head">
            <div class="min-w-0">
              <p class="text-xs uppercase tracking-[0.24em] text-cyan-300/78">Category</p>
              <h2 class="mt-1 truncate text-lg font-semibold text-white">
                {{ catalogStore.currentCategory?.name || '全部商品' }}
              </h2>
            </div>
            <span class="category-mobile-count shrink-0">{{ filteredGoods.length }} 件</span>
          </div>

          <div v-if="filteredGoods.length" class="space-y-2">
            <article
              v-for="item in filteredGoods"
              :key="item.id"
              class="category-mobile-product min-w-0 max-w-full"
              :class="Number(item.isClose) === 1 ? 'opacity-70 grayscale-[0.88]' : ''"
            >
              <div class="flex min-w-0 max-w-full items-center gap-2.5">
                <div class="category-mobile-product-thumb">
                  <SafeImage
                    :src="item.thumb"
                    :alt="item.name"
                    fallback-text=""
                    fallback-icon="category"
                    image-class="h-full w-full object-cover"
                    fallback-class="flex h-full w-full items-center justify-center text-cyan-200"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex min-w-0 items-center gap-1.5">
                    <span
                      v-for="label in getMobileLabelList(item.label)"
                      :key="label"
                      class="shrink-0 rounded-md bg-cyan-400 px-1.5 py-0.5 text-[10px] font-semibold text-slate-950"
                    >
                      {{ label }}
                    </span>
                    <span
                      v-if="Number(item.isClose) === 1"
                      class="shrink-0 rounded-md bg-rose-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    >
                      已暂停
                    </span>
                    <h3 class="truncate text-[13px] font-semibold leading-5 text-white">
                      {{ item.name }}
                    </h3>
                  </div>

                  <div class="mt-1.5 flex min-w-0 items-center gap-1.5">
                    <p class="min-w-0 font-display text-[1rem] leading-none text-orange-400">
                      ¥{{ formatPrice(item.price) }}
                    </p>
                    <div class="ml-auto flex shrink-0 items-center gap-1.5">
                      <RouterLink
                        v-if="Number(item.isClose) !== 1"
                        :to="`/goods/${item.id}`"
                        class="rounded-full border border-cyan-300/35 px-2.5 py-1 text-[11px] font-medium text-cyan-100"
                      >
                        立即购买
                      </RouterLink>
                      <button
                        v-else
                        type="button"
                        class="cursor-not-allowed rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                        disabled
                      >
                        立即购买
                      </button>
                      <button
                        type="button"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/12 text-cyan-100"
                        :disabled="Number(item.isClose) === 1"
                        @click="handleQuickAdd(item)"
                      >
                        <UiIcon name="cart" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <EmptyState
            v-else
            title="该分类下暂未返回商品"
            description="当前分类没有匹配到商品，可以切换分类或调整搜索关键词。"
          />

          <div
            v-if="filteredGoods.length && catalogStore.isGoodsLoadingMore"
            class="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-center text-sm text-slate-300"
          >
            正在加载更多商品...
          </div>

          <div
            v-else-if="filteredGoods.length && !catalogStore.hasMoreGoods"
            class="pb-1 text-center text-xs text-slate-500 h-10"
          >
            已经到底了
          </div>
        </section>
      </div>
    </section>

    <div
      v-if="isMobileCategorySheetOpen"
      class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
      @click.self="isMobileCategorySheetOpen = false"
    >
      <div
        class="absolute inset-x-0 bottom-0 w-full max-w-full overflow-hidden rounded-t-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,39,0.98),rgba(7,17,36,0.98))] p-4 shadow-[0_-18px_50px_rgba(2,8,23,0.52)]"
      >
        <div class="mb-3 flex min-w-0 items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-[0.24em] text-cyan-300/80">All Categories</p>
            <h3 class="mt-1 truncate text-lg font-semibold text-white">完整树状分类</h3>
          </div>
          <button
            type="button"
            class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200"
            @click="isMobileCategorySheetOpen = false"
          >
            <UiIcon name="close" />
          </button>
        </div>

        <div
          class="max-h-[70vh] min-w-0 max-w-full overflow-x-hidden overflow-y-auto pb-4 scrollbar-hide"
        >
          <CategoryRail
            :categories="catalogStore.categories"
            :current-category-id="catalogStore.currentCategoryId"
            @select="handleSheetSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>
