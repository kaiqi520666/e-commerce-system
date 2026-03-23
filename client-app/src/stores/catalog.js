import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { catalogApi } from '@/api'

function flattenTree(nodes, level = 0) {
  return nodes.flatMap((node) => [
    { ...node, level },
    ...(node.children?.length ? flattenTree(node.children, level + 1) : []),
  ])
}

export const useCatalogStore = defineStore('catalog', () => {
  const categories = ref([])
  const featuredGoods = ref([])
  const goods = ref([])
  const currentCategoryId = ref(null)
  const goodsPagination = ref({
    page: 1,
    size: 12,
    total: 0,
  })
  const isCategoryLoading = ref(false)
  const isGoodsLoading = ref(false)
  const isGoodsLoadingMore = ref(false)

  const flatCategories = computed(() => flattenTree(categories.value))
  const currentCategory = computed(
    () => flatCategories.value.find((item) => item.id === currentCategoryId.value) || null,
  )
  const hasMoreGoods = computed(
    () => goods.value.length < Number(goodsPagination.value.total || 0),
  )

  async function fetchCategories() {
    isCategoryLoading.value = true

    try {
      const data = await catalogApi.categoryList()
      categories.value = Array.isArray(data) ? data : []

      if (!currentCategoryId.value && flatCategories.value.length) {
        currentCategoryId.value = flatCategories.value[0].id
      }

      return categories.value
    } finally {
      isCategoryLoading.value = false
    }
  }

  async function fetchFeaturedGoods() {
    isGoodsLoading.value = true

    try {
      const data = await catalogApi.goodsList()

      featuredGoods.value = Array.isArray(data) ? data.slice(0, 6) : []
      return featuredGoods.value
    } finally {
      isGoodsLoading.value = false
    }
  }

  async function fetchGoodsByCategory(
    categoryId = currentCategoryId.value,
    options = {},
  ) {
    const { page = 1, size = goodsPagination.value.size || 12, append = false } = options

    if (append) {
      if (isGoodsLoadingMore.value || !hasMoreGoods.value) {
        return goods.value
      }

      isGoodsLoadingMore.value = true
    } else {
      isGoodsLoading.value = true
    }

    try {
      currentCategoryId.value = categoryId

      const data = await catalogApi.goodsPage({
        categoryId: categoryId ?? undefined,
        page,
        size,
      })

      const nextList = Array.isArray(data?.list) ? data.list : []
      const pagination = data?.pagination || {}

      goodsPagination.value = {
        page: Number(pagination.page || page),
        size: Number(pagination.size || size),
        total: Number(pagination.total || 0),
      }

      goods.value = append ? [...goods.value, ...nextList] : nextList

      return goods.value
    } finally {
      if (append) {
        isGoodsLoadingMore.value = false
      } else {
        isGoodsLoading.value = false
      }
    }
  }

  async function loadMoreGoods() {
    if (!hasMoreGoods.value || isGoodsLoading.value || isGoodsLoadingMore.value) {
      return goods.value
    }

    return fetchGoodsByCategory(currentCategoryId.value, {
      page: goodsPagination.value.page + 1,
      size: goodsPagination.value.size,
      append: true,
    })
  }

  return {
    categories,
    flatCategories,
    featuredGoods,
    goods,
    goodsPagination,
    currentCategoryId,
    currentCategory,
    isCategoryLoading,
    isGoodsLoading,
    isGoodsLoadingMore,
    hasMoreGoods,
    fetchCategories,
    fetchFeaturedGoods,
    fetchGoodsByCategory,
    loadMoreGoods,
  }
})
