import type { CartItem, Product } from '@tvashtr/core'

const cart = ref<CartItem[]>([])
const CART_STORAGE_KEY = 'lot.cart.v1'
let hydrated = false

interface StoredCartItem {
  sku: string
  variant: string
  qty: number
}

function sanitize(items: CartItem[]): CartItem[] {
  return items.filter(
    (item) =>
      item &&
      typeof item.sku === 'string' &&
      item.sku.trim() !== '' &&
      typeof item.name === 'string' &&
      item.name.trim() !== '' &&
      typeof item.price === 'number' &&
      !isNaN(item.price) &&
      item.price >= 0 &&
      typeof item.qty === 'number' &&
      item.qty > 0
  )
}

function resolvePrice(product: Product, variant: string): number {
  const vp = product.variantPrices?.[variant]
  return vp !== undefined ? vp : product.price
}

function hydrateCart(products: Product[]) {
  if (!import.meta.client || hydrated) return
  if (products.length === 0) return

  const raw = localStorage.getItem(CART_STORAGE_KEY)
  if (!raw) {
    hydrated = true
    return
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      hydrated = true
      return
    }

    const productBySku = new Map(products.map((p) => [p.sku, p]))

    const restored: CartItem[] = (parsed as StoredCartItem[])
      .filter(
        (row) =>
          row &&
          typeof row.sku === 'string' &&
          row.sku.trim() !== '' &&
          typeof row.qty === 'number' &&
          row.qty > 0
      )
      .map((row): CartItem | null => {
        const product = productBySku.get(row.sku)
        if (!product) return null

        const hasVariant = (product.variants ?? []).includes(row.variant)
        const variant = hasVariant ? row.variant : (product.variants?.[0] ?? '')

        return {
          sku: product.sku,
          name: product.name,
          image: product.image,
          price: resolvePrice(product, variant),
          variant,
          qty: row.qty,
        }
      })
      .filter((item): item is CartItem => item !== null)

    cart.value = sanitize(restored)
    hydrated = true
  } catch {
    cart.value = []
    hydrated = true
  }
}

function persistCart() {
  if (!import.meta.client) return
  try {
    const compact: StoredCartItem[] = sanitize(cart.value).map((item) => ({
      sku: item.sku,
      variant: item.variant || '',
      qty: item.qty,
    }))
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compact))
  } catch {
    // Ignore storage quota or access errors
  }
}

export function useCart() {
  const { products } = useProducts()

  // Hydrate reactively: the first time products become non-empty we restore
  // the cart from localStorage. This handles full-page reloads where products
  // may not be available yet when useCart() is first called.
  watchEffect(() => {
    hydrateCart(products.value)
  })

  const count = computed(() => sanitize(cart.value).reduce((sum, i) => sum + i.qty, 0))
  const total = computed(() =>
    sanitize(cart.value).reduce((sum, i) => sum + i.price * i.qty, 0)
  )

  function add(item: CartItem) {
    if (!item || !item.sku || !item.name) return
    const existing = cart.value.find(
      (c) => c.sku === item.sku && c.variant === item.variant
    )
    if (existing) {
      existing.qty += item.qty > 0 ? item.qty : 1
    } else {
      cart.value.push({
        ...item,
        qty: item.qty > 0 ? item.qty : 1,
        variant: item.variant || '',
      })
    }
    cart.value = sanitize(cart.value)
    persistCart()
  }

  function updateQty(sku: string, variant: string, qty: number) {
    const item = cart.value.find((c) => c.sku === sku && c.variant === variant)
    if (!item) return
    if (qty <= 0) {
      remove(sku, variant)
    } else {
      item.qty = qty
      cart.value = sanitize(cart.value)
      persistCart()
    }
  }

  function remove(sku: string, variant: string) {
    cart.value = sanitize(
      cart.value.filter((c) => !(c.sku === sku && c.variant === variant))
    )
    persistCart()
  }

  function clear() {
    cart.value = []
    persistCart()
  }

  return { cart: readonly(cart), count, total, add, updateQty, remove, clear }
}
