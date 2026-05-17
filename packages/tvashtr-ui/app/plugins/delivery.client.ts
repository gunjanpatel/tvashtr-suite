import type { NuxtApp } from '#app'
import type { DeliveryOption } from '@tvashtr/checkout'

export default defineNuxtPlugin(async (nuxtApp: NuxtApp) => {
  const config = useRuntimeConfig()
  const sheetId: string = config.public.deliverySheetId ?? ''

  if (!sheetId || sheetId === 'YOUR_DELIVERY_SHEET_ID_HERE') {
    console.warn('[delivery] NUXT_PUBLIC_DELIVERY_SHEET_ID not set — no delivery options loaded.')
    nuxtApp.provide('deliveryOptions', [])
    nuxtApp.provide('deliveryError', 'SHEET_ID_MISSING')
    return
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`

  try {
    const raw = await $fetch<string>(url, { responseType: 'text' })
    const jsonText = raw.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '')
    const data = JSON.parse(jsonText)
    const table = data?.table
    if (!table) throw new Error('No table in gviz response')

    const colIndex: Record<string, number> = {}
    ;(table.cols as any[]).forEach((col: any, i: number) => {
      const label = (col.label ?? col.id ?? '').trim().toLowerCase().replace(/\s+/g, '')
      if (label) colIndex[label] = i
    })

    const required = ['title', 'price']
    const missing = required.filter((k) => colIndex[k] === undefined)
    if (missing.length) {
      throw new Error(`Delivery sheet is missing required columns: ${missing.join(', ')}`)
    }

    const get = (cells: any[], key: string): string => {
      const i = colIndex[key]
      if (i === undefined) return ''
      const cell = cells[i]
      if (!cell || cell.v === null || cell.v === undefined) return ''
      return String(cell.v).trim()
    }

    const getRaw = (cells: any[], key: string): any => {
      const i = colIndex[key]
      if (i === undefined) return undefined
      return cells[i]?.v ?? undefined
    }

    const options: DeliveryOption[] = (table.rows as any[])
      .map((row: any, idx: number) => {
        try {
          const cells = row.c
          if (!cells) return null

          const title = get(cells, 'title')
          if (!title) return null

          const activeVal = getRaw(cells, 'active')
          if (activeVal !== undefined && activeVal !== null && activeVal !== '') {
            if (activeVal !== true && String(activeVal).toUpperCase() !== 'TRUE') return null
          }

          const priceRaw = getRaw(cells, 'price')
          const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw ?? '0'))
          if (isNaN(price)) return null

          const key = get(cells, 'key') || `delivery-${idx}`

          return {
            id: `delivery-${idx}`,
            key,
            title,
            description: get(cells, 'description'),
            price,
            time: get(cells, 'time'),
            freeAboveThreshold: getRaw(cells, 'free_above_threshold') ?? false,
            alwaysShow: getRaw(cells, 'always_show') ?? false
          } satisfies DeliveryOption
        } catch {
          return null
        }
      })
      .filter((o): o is DeliveryOption => o !== null)

    nuxtApp.provide('deliveryOptions', options)
    nuxtApp.provide('deliveryError', null)
  } catch (e: any) {
    console.error(`[delivery] Failed to fetch delivery sheet: ${e?.message ?? e}`)
    nuxtApp.provide('deliveryOptions', [])
    nuxtApp.provide('deliveryError', 'FETCH_FAILED')
  }
})
