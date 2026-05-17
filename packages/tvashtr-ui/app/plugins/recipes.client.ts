import type { NuxtApp } from '#app'
import { fetchImageManifest, GoogleSheetsRecipeRepository } from '@tvashtr/google-sheets'

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()
  const sheetId: string = config.public.recipeSheetId ?? ''

  if (!sheetId) {
    console.warn('[recipes] NUXT_PUBLIC_RECIPE_SHEET_ID is not set — recipes will not load.')
    nuxtApp.provide('recipes', [])
    return
  }

  try {
    const optimizedSet = await fetchImageManifest()
    const repo = new GoogleSheetsRecipeRepository(sheetId, optimizedSet)
    const recipes = await repo.getAll()

    nuxtApp.provide('recipes', recipes)
  } catch (e: any) {
    console.error(`[recipes] Failed to fetch recipes: ${e?.message ?? e}`)
    nuxtApp.provide('recipes', [])
  }
})
