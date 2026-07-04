import { ref, computed, watch, type Ref } from 'vue'
import type { Product } from '@tvashtr/core'

export function useProductSearch(products: Ref<Product[]>) {
  const route = useRoute()
  const router = useRouter()
  const searchQuery = useState('search-query', () => (route.query.q as string) || '')

  watch(() => route.query.q, (newQ) => {
    searchQuery.value = (newQ as string) || ''
  })

  watch(searchQuery, (newVal) => {
    const nextQuery = { ...route.query }
    if (newVal.trim()) {
      nextQuery.q = newVal.trim()
    } else {
      delete nextQuery.q
    }
    router.replace({ query: nextQuery })
  })

  const searchedProducts = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return products.value
    return products.value.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.short?.toLowerCase().includes(q)
    )
  })

  return {
    searchQuery,
    searchedProducts
  }
}
