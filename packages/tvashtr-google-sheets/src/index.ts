/**
 * @tvashtr/google-sheets
 * Google Sheets gviz API fetcher, image resolver, and catalog repositories.
 * Uses native fetch — works in browsers, Node 18+, and Cloudflare Workers.
 */

export { fetchGoogleSheetRows } from './googleSheets'
export type { GoogleSheetRow } from './googleSheets'

export { fetchImageManifest, resolveOptimizedImage } from './imageResolver'

export { GoogleSheetsProductRepository, GoogleSheetsRecipeRepository } from './repositories'
