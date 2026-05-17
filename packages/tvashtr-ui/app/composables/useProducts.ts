import type { Product } from '@tvashtr/core'

export function useProducts() {
  const nuxtApp = useNuxtApp()
  const products = computed<Product[]>(() => nuxtApp.$products as Product[] ?? [])

  const popularProducts = computed<Product[]>(() => {
    return products.value.filter((p) => p.isPopular)
  })

  return { products, popularProducts }
}
