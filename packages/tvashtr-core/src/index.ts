/**
 * @tvashtr/core
 * Zero-runtime shared TypeScript types and SOLID interfaces.
 * Every other @tvashtr package depends on this.
 */

// ── Data Model Types ────────────────────────────────────────────────────────

export interface Product {
  sku: string
  name: string
  price: number
  image: string
  short: string
  desc: string
  variants: string[]
  variantPrices: Record<string, number>
  qtyDefault: number
  active: boolean
  isPopular: boolean
  categories: string[]   // category slugs, e.g. ['gluten-free', 'high-protein']
}

export interface Category {
  slug: string
  name: string
  description: string
  active: boolean
}

export interface RecipeProductRef {
  sku: string
  variant: string
  qty: number
}

export interface Recipe {
  slug: string
  title: string
  image: string
  description: string
  category: string
  prepTime: string
  cookTime: string
  ingredients: string[]
  content: string // Markdown
  recipeProducts: RecipeProductRef[]
  isPopular: boolean
  active: boolean
}

export interface CartItem {
  sku: string
  name: string
  image: string
  price: number
  variant: string
  qty: number
}

// ── SOLID Interfaces ────────────────────────────────────────────────────────

export interface BotProtector {
  verify(payload: any, context: { ip: string }): Promise<void>
}

export interface Notifier<T> {
  notify(payload: T): Promise<void>
}

export interface Validator<T> {
  validate(payload: Partial<T>): string | null
}

export interface Repository<T> {
  save(id: string, data: T): Promise<void>
}

// ── Data Fetching Contracts ─────────────────────────────────────────────────

export interface ProductRepository {
  getAll(): Promise<Product[]>
}

export interface RecipeRepository {
  getAll(): Promise<Recipe[]>
}

export interface CategoryRepository {
  getAll(): Promise<Category[]>
}
