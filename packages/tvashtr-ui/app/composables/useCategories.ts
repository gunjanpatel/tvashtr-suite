import type { ShallowRef } from 'vue'
import type { Category } from '@tvashtr/core'

export function useCategories() {
  const nuxtApp = useNuxtApp()
  const categories = computed<Category[]>(
    () => (nuxtApp.$categories as ShallowRef<Category[]>).value ?? []
  )
  const isReady = useState<boolean>('categories:ready', () => false)
  return { categories, isReady }
}
