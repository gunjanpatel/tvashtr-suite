import type { NuxtApp } from '#app'
import { fetchImageManifest } from '@tvashtr/google-sheets'

interface SheetPluginOptions<T> {
  /** Key on runtimeConfig.public that holds the sheet ID */
  configKey: string
  /** Key passed to nuxtApp.provide() */
  provideKey: string
  /** Value provided when sheet is unconfigured or fetch fails */
  emptyValue: T
  /** Build the repository given a sheetId (and optional image set) */
  makeRepo: (sheetId: string, optimizedImages?: Set<string>) => { getAll(): Promise<T> }
  /** Set true if the repo constructor needs the optimized image manifest */
  needsImages?: boolean
  /** If set, also provide an error key (e.g. productsError) */
  errorKey?: string
  /** Use console.warn instead of console.error when sheetId is missing */
  warnIfMissing?: boolean
}

export function createSheetPlugin<T>(options: SheetPluginOptions<T>) {
  const {
    configKey,
    provideKey,
    emptyValue,
    makeRepo,
    needsImages = false,
    errorKey,
    warnIfMissing = false,
  } = options

  return defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
    const config = useRuntimeConfig()
    const sheetId: string = (config.public as any)[configKey] ?? ''

    if (!sheetId || sheetId === 'YOUR_SHEET_ID_HERE' || sheetId === 'MOCK') {
      const log = warnIfMissing ? console.warn : console.error
      log(`[${provideKey}] ${configKey} is not configured — skipping fetch.`)
      nuxtApp.provide(provideKey, emptyValue)
      if (errorKey) nuxtApp.provide(errorKey, 'SHEET_ID_MISSING')
      return
    }

    try {
      const optimizedImages = needsImages ? await fetchImageManifest() : undefined
      const repo = makeRepo(sheetId, optimizedImages)
      const data = await repo.getAll()
      nuxtApp.provide(provideKey, data)
      if (errorKey) nuxtApp.provide(errorKey, null)
    } catch (e: any) {
      console.error(`[${provideKey}] Failed to fetch: ${e?.message ?? e}`)
      nuxtApp.provide(provideKey, emptyValue)
      if (errorKey) nuxtApp.provide(errorKey, 'FETCH_FAILED')
    }
  })
}
