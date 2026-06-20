/**
 * Generic Google Sheets gviz API client.
 * Uses native fetch — compatible with browser, Node 18+, and Cloudflare Workers.
 */

export interface GoogleSheetRow {
  $get: (key: string) => string
  $getRaw: (key: string) => any
  [key: string]: any
}

export interface GoogleSheetTable {
  rows: GoogleSheetRow[]
  headers: string[]
}

// ── Private: single source of truth for gviz fetch + parse ──────────────────

async function fetchGoogleSheetTable(sheetId: string): Promise<GoogleSheetTable> {
  if (!sheetId || sheetId === 'YOUR_SHEET_ID_HERE' || sheetId === 'MOCK') {
    throw new Error('SHEET_ID_MISSING')
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1`
  const raw = await fetch(url).then((r) => r.text())
  const jsonText = raw.replace(/^[^(]+\(/, '').replace(/\);?\s*$/, '')
  const data = JSON.parse(jsonText)
  const table = data?.table
  if (!table) throw new Error('No table in gviz response')

  const colIndex: Record<string, number> = {}
  const headers: string[] = []

  ;(table.cols as any[]).forEach((col: any, i: number) => {
    const label = (col.label ?? col.id ?? '').trim()
    if (!label) return
    headers.push(label)
    colIndex[label.toLowerCase().replace(/_/g, '')] = i
  })

  const rows = (table.rows as any[]).map((row: any) => {
    const cells = row.c || []

    const get = (key: string): string => {
      const i = colIndex[key.toLowerCase().replace(/_/g, '')]
      if (i === undefined) return ''
      const cell = cells[i]
      if (!cell || cell.v === null || cell.v === undefined) return ''
      return String(cell.v).trim()
    }

    const getRaw = (key: string): any => {
      const i = colIndex[key.toLowerCase().replace(/_/g, '')]
      if (i === undefined) return undefined
      return cells[i]?.v ?? undefined
    }

    return { $get: get, $getRaw: getRaw } as GoogleSheetRow
  })

  return { rows, headers }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Returns rows only — existing consumers unchanged. */
export async function fetchGoogleSheetRows(sheetId: string): Promise<GoogleSheetRow[]> {
  const { rows } = await fetchGoogleSheetTable(sheetId)
  return rows
}

/** Returns rows + original header labels — for dynamic column discovery. */
export async function fetchGoogleSheetRowsWithHeaders(sheetId: string): Promise<GoogleSheetTable> {
  return await fetchGoogleSheetTable(sheetId)
}