/**
 * useProductAttributes(sku?)
 *
 * Returns the attribute map for a specific SKU, or the full map if no SKU is given.
 *
 * Usage in a product page:
 *   const { attributes, hasAttributes } = useProductAttributes(sku)
 *
 * `attributes` is a computed Record<attributeName, string> — already filtered
 * (empty values were stripped at fetch time by the repository).
 *
 * `hasAttributes` is a computed boolean — false when the sheet isn't configured
 * or the SKU has no row in the sheet. Use it to conditionally render the section.
 */
export function useProductAttributes(sku?: Ref<string> | string) {
  const nuxtApp = useNuxtApp()

  const allAttributes = computed<Record<string, Record<string, string>>>(
    () => (nuxtApp.$productAttributes as Record<string, Record<string, string>>) ?? {}
  )

  const attributes = computed<Record<string, string>>(() => {
    const key = typeof sku === 'string' ? sku : sku?.value
    if (!key) return {}
    return allAttributes.value[key] ?? {}
  })

  const hasAttributes = computed(() => Object.keys(attributes.value).length > 0)

  return { attributes, hasAttributes, allAttributes }
}
