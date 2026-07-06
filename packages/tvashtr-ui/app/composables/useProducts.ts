import type { ShallowRef } from 'vue'
import type { Product } from '@tvashtr/core'

export function useProducts() {
  const nuxtApp = useNuxtApp()

  const products = computed<Product[]>(
    () => (nuxtApp.$products as ShallowRef<Product[]>).value ?? []
  )

  const popularProducts = computed<Product[]>(() => {
    return products.value.filter((p) => p.isPopular)
  })

  const isReady = useState<boolean>('products:ready', () => false)

  return { products, popularProducts, isReady }
}
