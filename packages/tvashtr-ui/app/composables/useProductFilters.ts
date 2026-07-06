import { ref, computed, watch, type Ref } from 'vue'
import type { Product, Category } from '@tvashtr/core'

export function useProductFilters(products: Ref<Product[]>, categories: Ref<Category[]>) {
  const route = useRoute()
  const router = useRouter()

  // 1. Search State
  const searchQuery = useState('search-query', () => (route.query.q as string) || '')
  watch(() => route.query.q, (newQ) => {
    searchQuery.value = (newQ as string) || ''
  })

  // 2. Category State
  const activeFilters = ref<Set<string>>(new Set(
    route.query.categories
      ? String(route.query.categories).split(',').filter(Boolean)
      : []
  ))

  watch(() => route.query.categories, (newCats) => {
    activeFilters.value = new Set(
      newCats ? String(newCats).split(',').filter(Boolean) : []
    )
  })

  // Separate categories by type
  const dietaryCategories = computed(() => categories.value.filter(cat => cat.type === 'dietary'))
  const usageCategories = computed(() => categories.value.filter(cat => cat.type === 'usage'))

  // Filter actions
  function toggleFilter(slug: string) {
    const next = new Set(activeFilters.value)
    next.has(slug) ? next.delete(slug) : next.add(slug)
    activeFilters.value = next
    syncUrl()
  }

  function clearFilters() {
    activeFilters.value = new Set()
    syncUrl()
  }

  function isRowClear(type: 'dietary' | 'usage'): boolean {
    const targetCategories = type === 'dietary' ? dietaryCategories.value : usageCategories.value
    const targetSlugs = targetCategories.map(cat => cat.slug)
    return ![...activeFilters.value].some(slug => targetSlugs.includes(slug))
  }

  function clearRowFilters(type: 'dietary' | 'usage') {
    const targetCategories = type === 'dietary' ? dietaryCategories.value : usageCategories.value
    const targetSlugs = targetCategories.map(cat => cat.slug)
    
    const next = new Set(activeFilters.value)
    targetSlugs.forEach(slug => next.delete(slug))
    activeFilters.value = next
    syncUrl()
  }

  // Unified URL sync
  function syncUrl() {
    const nextQuery = { ...route.query }
    
    // Sync search
    if (searchQuery.value.trim()) {
      nextQuery.q = searchQuery.value.trim()
    } else {
      delete nextQuery.q
    }

    // Sync categories
    const cats = [...activeFilters.value]
    if (cats.length) {
      nextQuery.categories = cats.join(',')
    } else {
      delete nextQuery.categories
    }

    router.replace({ query: nextQuery })
  }

  // Watch search query changes to sync URL
  watch(searchQuery, () => {
    syncUrl()
  })

  // Count items matching category
  function countForCategory(slug: string): number {
    return products.value.filter(p => p.categories && p.categories.includes(slug)).length
  }

  // Filtered products list
  const filteredProducts = computed(() => {
    let result = products.value

    // Apply search filter
    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.short?.toLowerCase().includes(q) ||
        p.desc?.toLowerCase().includes(q)
      )
    }

    // Apply category filters
    if (activeFilters.value.size > 0) {
      result = result.filter(p => {
        const productCats = p.categories ? p.categories : []
        return [...activeFilters.value].every(slug => productCats.includes(slug))
      })
    }

    return result
  })

  const productsReady = useState<boolean>('products:ready', () => false)
  const categoriesReady = useState<boolean>('categories:ready', () => false)
  const isReady = computed(() => productsReady.value && categoriesReady.value)

  return {
    searchQuery,
    activeFilters,
    dietaryCategories,
    usageCategories,
    toggleFilter,
    clearFilters,
    isRowClear,
    clearRowFilters,
    countForCategory,
    filteredProducts,
    isReady
  }
}
