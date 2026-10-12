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

    const parseDate = (cells: any[], key: string): Date | null => {
      const i = colIndex[key]
      if (i === undefined) return null
      const cell = cells[i]
      if (!cell || cell.v === null || cell.v === undefined) return null

      // If cell has a formatted string (cell.f), try parsing that first (e.g. "2026-10-11" or "11/10/2026")
      if (cell.f && typeof cell.f === 'string') {
        const d = new Date(cell.f)
        if (!isNaN(d.getTime())) return d
      }

      const val = String(cell.v).trim()

      // Handle Google Sheets gviz format: "Date(YYYY,M,D)" or "Date(YYYY,M,D,H,M,S)"
      // Note: In Google Sheets gviz, month is 0-indexed (0 = Jan, 9 = Oct)
      const match = val.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/)
      if (match) {
        const year = parseInt(match[1], 10)
        const month = parseInt(match[2], 10) // 0-indexed
        const day = parseInt(match[3], 10)
        const hours = match[4] ? parseInt(match[4], 10) : 0
        const minutes = match[5] ? parseInt(match[5], 10) : 0
        const seconds = match[6] ? parseInt(match[6], 10) : 0
        return new Date(year, month, day, hours, minutes, seconds)
      }

      const parsed = new Date(val)
      return isNaN(parsed.getTime()) ? null : parsed
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

          const startDate = parseDate(cells, 'start_date') || parseDate(cells, 'startdate')
          const endDate = parseDate(cells, 'end_date') || parseDate(cells, 'enddate')

          const now = new Date()

          if (startDate && now < startDate) {
            return null
          }

          if (endDate) {
            // End of day (23:59:59.999) if no specific time was provided
            if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
              endDate.setHours(23, 59, 59, 999)
            }
            if (now > endDate) {
              return null
            }
          }

          const key = get(cells, 'key') || `delivery-${idx}`

          return {
            id: `delivery-${idx}`,
            key,
            title,
            description: get(cells, 'description'),
            price,
            time: get(cells, 'time'),
            freeAboveThreshold: getRaw(cells, 'free_above_threshold') ?? false,
            alwaysShow: getRaw(cells, 'always_show') ?? false,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
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
