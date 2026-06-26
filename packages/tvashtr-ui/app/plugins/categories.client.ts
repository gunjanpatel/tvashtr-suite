import type { NuxtApp } from '#app'
import { GoogleSheetsCategoryRepository } from '@tvashtr/google-sheets'

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()
  const sheetId: string = config.public.categorySheetId ?? ''

  if (!sheetId || sheetId === 'YOUR_SHEET_ID_HERE') {
    nuxtApp.provide('categories', [])
    return
  }

  try {
    const repo = new GoogleSheetsCategoryRepository(sheetId)
    const categories = await repo.getAll()
    nuxtApp.provide('categories', categories)
  } catch (e: any) {
    console.error(`[categories] Failed to fetch categories: ${e?.message ?? e}`)
    nuxtApp.provide('categories', [])
  }
})
