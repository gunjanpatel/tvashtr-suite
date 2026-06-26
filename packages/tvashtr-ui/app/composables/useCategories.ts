import type { Category } from '@tvashtr/core'

export function useCategories() {
  const nuxtApp = useNuxtApp()
  const categories = computed<Category[]>(() => nuxtApp.$categories as Category[] ?? [])
  return { categories }
}
