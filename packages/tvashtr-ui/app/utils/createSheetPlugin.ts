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

  return defineNuxtPlugin((nuxtApp: NuxtApp) => {
    const config = useRuntimeConfig()
    const sheetId: string = (config.public as any)[configKey] ?? ''

    // ── useState as reactive backing store ─────────────────────────────────
    // useState is shared across plugins and components by key — guaranteed
    // reactive in Nuxt. Setting .value in the IIFE will trigger re-renders.
    const dataState = useState<T>(provideKey, () => emptyValue)
    const isReady = useState<boolean>(`${provideKey}:ready`, () => false)
    const errorState = useState<string | null>(
      errorKey ?? `${provideKey}:error`, () => null
    )

    // Provide refs for any code that accesses via nuxtApp.$xxx
    nuxtApp.provide(provideKey, dataState)
    if (errorKey) nuxtApp.provide(errorKey, errorState)

    if (!sheetId || sheetId === 'YOUR_SHEET_ID_HERE' || sheetId === 'MOCK') {
      const log = warnIfMissing ? console.warn : console.error
      log(`[${provideKey}] ${configKey} is not configured — skipping fetch.`)
      if (errorKey) errorState.value = 'SHEET_ID_MISSING'
      isReady.value = true
      return
    }

    // ── Fire fetch in the background — do not await ────────────────────────
    ;(async () => {
      try {
        const optimizedImages = needsImages ? await fetchImageManifest() : undefined
        const repo = makeRepo(sheetId, optimizedImages)
        dataState.value = await repo.getAll()
      } catch (e: any) {
        console.error(`[${provideKey}] Failed to fetch: ${e?.message ?? e}`)
        if (errorKey) errorState.value = 'FETCH_FAILED'
      } finally {
        isReady.value = true
      }
    })()
  })
}
