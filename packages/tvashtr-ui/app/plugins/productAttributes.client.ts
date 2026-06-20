/**
 * productAttributes.client.ts
 *
 * Loads a generic "product attributes" sheet and provides the data as
 * $productAttributes (Record<sku, Record<attributeName, string>>).
 *
 * Stores that don't configure NUXT_PUBLIC_PRODUCT_ATTRIBUTES_SHEET_ID simply
 * get an empty map — no errors, no warnings, zero overhead.
 *
 * Stores that do configure it get a fully dynamic attribute table keyed by SKU.
 * The consumer decides what to call it: Nutrition, Specs, Features, etc.
 */
import type { NuxtApp } from '#app'
import { GoogleSheetsProductAttributesRepository } from '@tvashtr/google-sheets'

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()
  const sheetId: string = config.public.productAttributesSheetId ?? ''

  console.log('[productAttributes] sheetId:', JSON.stringify(sheetId))

  if (!sheetId || sheetId === 'YOUR_SHEET_ID_HERE' || sheetId === 'MOCK') {
    console.log('[productAttributes] bailing out — sheetId not configured')
    nuxtApp.provide('productAttributes', {})
    nuxtApp.provide('productAttributesError', null)
    return
  }

  try {
    const repo = new GoogleSheetsProductAttributesRepository(sheetId)
    const attributes = await repo.getAll()

    console.log('[productAttributes] fetched:', JSON.stringify(attributes))

    nuxtApp.provide('productAttributes', attributes)
    nuxtApp.provide('productAttributesError', null)
  } catch (e: any) {
    console.error(`[productAttributes] Failed to fetch: ${e?.message ?? e}`)
    nuxtApp.provide('productAttributes', {})
    nuxtApp.provide('productAttributesError', 'FETCH_FAILED')
  }
})
