import type { NuxtApp } from '#app'
import { fetchImageManifest, GoogleSheetsProductRepository } from '@tvashtr/google-sheets'

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()
  const sheetId: string = config.public.sheetId ?? ''

  if (!sheetId || sheetId === 'YOUR_SHEET_ID_HERE') {
    console.error('[products] NUXT_PUBLIC_SHEET_ID is not set in .env — cannot load products.')
    nuxtApp.provide('products', [])
    nuxtApp.provide('productsError', 'SHEET_ID_MISSING')
    return
  }

  try {
    const optimizedSet = await fetchImageManifest()
    const repo = new GoogleSheetsProductRepository(sheetId, optimizedSet)
    const products = await repo.getAll()

    nuxtApp.provide('products', products)
    nuxtApp.provide('productsError', null)
  } catch (e: any) {
    console.error(`[products] Failed to fetch products: ${e?.message ?? e}`)
    nuxtApp.provide('products', [])
    nuxtApp.provide('productsError', 'FETCH_FAILED')
  }
})
