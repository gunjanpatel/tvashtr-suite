/**
 * Shared order processing logic.
 * Used by both the local Nitro server route and the Cloudflare Worker.
 */

export interface OrderItem {
  sku: string
  name: string
  variant: string
  qty: number
  price: number
}

export type PaymentMethod = 'payment_on_delivery'

export interface DeliveryOption {
  id: string
  key?: string
  title: string
  description: string
  price: number
  time: string
  freeAboveThreshold: boolean
  alwaysShow: boolean
}

export interface DeliveryAddress {
  street: string
  city: string
  postcode: string
}

export interface OrderPayload {
  name: string
  email: string
  phone: string
  address: DeliveryAddress
  delivery: DeliveryOption
  items: OrderItem[]
  total: number
  payment_method: PaymentMethod
}

/** Minimal DB abstraction — implemented differently per runtime (SQLite vs D1). */
export interface OrderDb {
  save(
    id: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    deliveryTitle: string,
    deliveryPrice: number,
    itemsJson: string,
    total: number,
    paymentMethod: string,
    createdAt: string
  ): Promise<void>
}

/** Shared SQL — identical to cloudflare/schema.sql table definition. */
export const INSERT_ORDER_SQL =
  `INSERT INTO orders (id, name, email, phone, address, delivery_title, delivery_price, items, total, payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

const PHONE_RE = /^\+?[0-9\s\-().]{8,15}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function generateId(): string {
  return 'DY-' + Math.random().toString(36).slice(2, 10).toUpperCase()
}

export function validate(payload: Partial<OrderPayload>): string | null {
  if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
    return 'Name is required (min 2 characters).'
  }
  const email = payload.email ?? ''
  if (!email.trim() || !EMAIL_RE.test(email.trim())) {
    return 'A valid email address is required.'
  }
  const phone = payload.phone ?? ''
  const digits = phone.replace(/\D/g, '')
  if (!PHONE_RE.test(phone.trim()) || digits.length < 8 || digits.length > 15) {
    return 'A valid phone number is required (8–15 digits).'
  }
  const addr = payload.address
  if (!addr || !addr.street?.trim() || addr.street.trim().length < 3) {
    return 'A valid street address is required.'
  }
  if (!addr.city?.trim() || addr.city.trim().length < 2) {
    return 'City is required.'
  }
  const pc = (addr.postcode ?? '').replace(/\s/g, '')
  if (!/^\d{4}$/.test(pc) || parseInt(pc) < 1000 || parseInt(pc) > 9999) {
    return 'A valid Danish postcode (1000–9999) is required.'
  }
  if (!payload.delivery || !payload.delivery.id || !payload.delivery.title) {
    return 'Please select a delivery option.'
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return 'Order must contain at least one item.'
  }
  if (payload.payment_method !== 'payment_on_delivery') {
    return 'Please select a payment method.'
  }
  for (const item of payload.items) {
    if (!item.sku || !item.name || typeof item.qty !== 'number' || item.qty < 1) {
      return 'One or more items are invalid.'
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return 'Item price is invalid.'
    }
  }
  return null
}

export class OrderValidationError extends Error {
  readonly statusCode = 422
  constructor(message: string) {
    super(message)
    this.name = 'OrderValidationError'
  }
}

export async function processOrder(
  payload: Partial<OrderPayload>,
  db: OrderDb
): Promise<{ orderId: string; total: number }> {
  const validationError = validate(payload)
  if (validationError) throw new OrderValidationError(validationError)

  const orderId = generateId()
  const createdAt = new Date().toISOString()
  const itemsTotal = payload.items!.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryPrice = payload.delivery!.price
  const total = itemsTotal + deliveryPrice
  const itemsJson = JSON.stringify(payload.items)
  const addressJson = JSON.stringify(payload.address)

  await db.save(
    orderId,
    payload.name!.trim(),
    payload.email!.trim(),
    payload.phone!.trim(),
    addressJson,
    payload.delivery!.title,
    deliveryPrice,
    itemsJson,
    total,
    payload.payment_method!,
    createdAt
  )

  return { orderId, total }
}
