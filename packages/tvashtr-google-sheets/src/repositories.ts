import type { ProductRepository, RecipeRepository, CategoryRepository, Product, Recipe, Category } from '@tvashtr/core'
import { fetchGoogleSheetRows, fetchGoogleSheetRowsWithHeaders } from './googleSheets'
import { resolveOptimizedImage } from './imageResolver'

/**
 * Generic product-attributes repository.
 *
 * Sheet layout expected:
 *   Column A (header: "sku") — product SKU, the lookup key.
 *   Columns B…N               — any attribute names as headers (e.g. "Calories",
 *                               "Protein", "Lumen", "Weight" …).
 *
 * Rows with an empty SKU cell are skipped.
 * Attribute cells that are empty or whitespace-only are omitted from the result,
 * so callers never see blank entries.
 *
 * Returns: Record<sku, Record<attributeName, string>>
 * The attribute names preserve the original header casing from the sheet.
 */
export class GoogleSheetsProductAttributesRepository {
  constructor(private sheetId: string) {}

  async getAll(): Promise<Record<string, Record<string, string>>> {
    if (!this.sheetId || this.sheetId === 'YOUR_SHEET_ID_HERE' || this.sheetId === 'MOCK') {
      return {}
    }

    const { rows, headers } = await fetchGoogleSheetRowsWithHeaders(this.sheetId)

    const attrHeaders = headers.filter((h) => h.toLowerCase() !== 'sku')

    const result: Record<string, Record<string, string>> = {}

    for (const row of rows) {
      const sku = row.$get('sku')
      if (!sku) continue

      const attrs: Record<string, string> = {}
      for (const header of attrHeaders) {
        const value = row.$get(header)
        if (value) attrs[header] = value
      }

      if (Object.keys(attrs).length > 0) {
        result[sku] = attrs
      }
    }

    return result
  }
}

function parseVariantPrices(raw: string): Record<string, number> {
  if (!raw) return {}
  return Object.fromEntries(
    raw.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const idx = pair.lastIndexOf(':')
        if (idx === -1) return null
        const key = pair.slice(0, idx).trim()
        const val = parseFloat(pair.slice(idx + 1).trim())
        return key && !isNaN(val) ? [key, val] : null
      })
      .filter((e): e is [string, number] => e !== null)
  )
}

function looksLikePriceMap(raw: string): boolean {
  return raw.includes(':')
}

export class GoogleSheetsProductRepository implements ProductRepository {
  constructor(private sheetId: string, private optimizedImages: Set<string>) {}

  async getAll(): Promise<Product[]> {
    if (!this.sheetId || this.sheetId === 'YOUR_SHEET_ID_HERE' || this.sheetId === 'MOCK') {
      return []
    }

    const rows = await fetchGoogleSheetRows(this.sheetId)

    return rows.map((row) => {
      try {
        const sku = row.$get('sku')
        const name = row.$get('name')
        if (!sku || !name) return null

        const priceRaw = row.$getRaw('price')
        const price = typeof priceRaw === 'number' ? priceRaw : parseFloat(String(priceRaw ?? '0'))

        const variantsRaw = row.$get('variants')
        const variantPricesRaw = row.$get('variantprices') || row.$get('variant_prices')

        let variants: string[]
        let variantPrices: Record<string, number>

        if (variantsRaw && looksLikePriceMap(variantsRaw) && !variantPricesRaw) {
          variantPrices = parseVariantPrices(variantsRaw)
          variants = Object.keys(variantPrices)
        } else {
          variants = variantsRaw
            ? variantsRaw.split(',').map((v: string) => v.trim()).filter(Boolean)
            : []
          variantPrices = parseVariantPrices(variantPricesRaw)
          const extraKeys = Object.keys(variantPrices).filter((k) => !variants.includes(k))
          variants = [...variants, ...extraKeys]
        }

        const qtyDefaultRaw = row.$getRaw('qtydefault')
        const qtyDefault = typeof qtyDefaultRaw === 'number'
          ? qtyDefaultRaw
          : parseInt(String(qtyDefaultRaw ?? '1'), 10)

        const activeVal = row.$getRaw('active')
        const active = activeVal === true || String(activeVal).toUpperCase() === 'TRUE'

        const popularVal = row.$getRaw('ispopular') || row.$getRaw('popular')
        const isPopular = popularVal === true || String(popularVal).toUpperCase() === 'TRUE'

        const originalImage = row.$get('image') || ''

        const categoriesRaw = row.$get('categories')
        const categories = categoriesRaw
          ? categoriesRaw.split(',').map((c: string) => c.trim()).filter(Boolean)
          : []

        return {
          sku,
          name,
          price: isNaN(price) ? 0 : price,
          image: resolveOptimizedImage(originalImage, this.optimizedImages),
          short: row.$get('short'),
          desc: row.$get('desc'),
          variants,
          variantPrices,
          qtyDefault: isNaN(qtyDefault) ? 1 : qtyDefault,
          active,
          isPopular,
          categories,
        } satisfies Product
      } catch {
        return null
      }
    }).filter((p): p is Product => p !== null)
  }
}

export class GoogleSheetsRecipeRepository implements RecipeRepository {
  constructor(private sheetId: string, private optimizedImages: Set<string>) {}

  async getAll(): Promise<Recipe[]> {
    if (!this.sheetId || this.sheetId === 'YOUR_SHEET_ID_HERE' || this.sheetId === 'MOCK') {
      return []
    }

    const rows = await fetchGoogleSheetRows(this.sheetId)

    return rows.map((row) => {
      try {
        const slug = row.$get('slug')
        const title = row.$get('title')
        if (!slug || !title) return null

        const ingredientsRaw = row.$get('ingredients')
        const ingredients = ingredientsRaw
          ? ingredientsRaw.split('\n').map((i: string) => i.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
          : []

        const activeVal = row.$getRaw('active')
        const active = activeVal === true || String(activeVal).toUpperCase() === 'TRUE'

        const popularVal = row.$getRaw('ispopular') || row.$getRaw('popular')
        const isPopular = popularVal === true || String(popularVal).toUpperCase() === 'TRUE'

        const originalImage = row.$get('image') || ''

        const recipeProductsStr = row.$get('recipeproducts') || row.$get('products') || ''
        const recipeProducts = recipeProductsStr.split(',').map((item: string) => {
          const parts = item.split(':').map((s: string) => s.trim())
          if (parts.length === 0 || !parts[0]) return null
          return {
            sku: parts[0],
            variant: parts[1] || '',
            qty: parseInt(parts[2] || '1', 10) || 1
          }
        }).filter(Boolean) as { sku: string, variant: string, qty: number }[]

        return {
          slug,
          title,
          image: resolveOptimizedImage(originalImage, this.optimizedImages),
          description: row.$get('description') || row.$get('short'),
          category: row.$get('category'),
          prepTime: row.$get('preptime'),
          cookTime: row.$get('cooktime'),
          ingredients,
          content: row.$get('content') || row.$get('instructions'),
          recipeProducts,
          isPopular,
          active,
        } satisfies Recipe
      } catch {
        return null
      }
    }).filter((r): r is Recipe => r !== null && r.active)
  }
}

export class GoogleSheetsCategoryRepository implements CategoryRepository {
  constructor(private sheetId: string) {}

  async getAll(): Promise<Category[]> {
    if (!this.sheetId || this.sheetId === 'YOUR_SHEET_ID_HERE' || this.sheetId === 'MOCK') {
      return []
    }

    const rows = await fetchGoogleSheetRows(this.sheetId)

    return rows.map((row) => {
      try {
        const slug = row.$get('slug')
        const name = row.$get('name')
        if (!slug || !name) return null

        const activeVal = row.$getRaw('active')
        const active = activeVal === true || String(activeVal).toUpperCase() === 'TRUE'

        return {
          slug,
          name,
          description: row.$get('description') || '',
          active,
        } satisfies Category
      } catch {
        return null
      }
    }).filter((c): c is Category => c !== null && c.active)
  }
}
