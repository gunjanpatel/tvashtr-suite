/**
 * productAttributes.client.ts
 *
 * Loads a generic "product attributes" sheet and provides the data as
 * $productAttributes (ShallowRef<Record<sku, Record<attributeName, string>>>).
 *
 * Non-blocking: provides an empty shallowRef immediately so the page renders,
 * then fetches in the background and updates reactively when done.
 */
import type { NuxtApp } from '#app'
import { shallowRef } from 'vue'
import { GoogleSheetsProductAttributesRepository } from '@tvashtr/google-sheets'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()
  const sheetId: string = config.public.productAttributesSheetId ?? ''

  const dataRef = shallowRef<Record<string, Record<string, string>>>({})
  nuxtApp.provide('productAttributes', dataRef)
  nuxtApp.provide('productAttributesError', null)

  if (!sheetId || sheetId === 'YOUR_SHEET_ID_HERE' || sheetId === 'MOCK') {
    // Not configured — silently skip (zero noise for stores that don't use it)
    return
  }

  ;(async () => {
    try {
      const repo = new GoogleSheetsProductAttributesRepository(sheetId)
      dataRef.value = await repo.getAll()
    } catch (e: any) {
      console.error(`[productAttributes] Failed to fetch: ${e?.message ?? e}`)
      nuxtApp.provide('productAttributesError', 'FETCH_FAILED')
    }
  })()
})
