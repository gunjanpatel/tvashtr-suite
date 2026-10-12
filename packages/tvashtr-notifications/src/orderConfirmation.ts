export interface OrderItem {
  sku: string
  name: string
  variant?: string
  qty: number
  price: number
}

export interface DeliveryOption {
  title: string
  price: number
  time?: string
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
  payment_method?: string
}

import { sendTelegramMessage, type TelegramConfig } from './telegram'
import { sendBrevoEmail, type BrevoConfig } from './brevo'
import {
  buildOrderConfirmationEmail,
  buildOwnerOrderNotificationEmail,
  type BrandConfig,
} from './emailTemplates'

export type { TelegramConfig, BrevoConfig, BrandConfig }


export async function notifyOwnerViaTelegram(
  config: TelegramConfig,
  orderId: string,
  payload: OrderPayload
): Promise<void> {
  const items = payload.items
    .map(
      (i) =>
        `  • ${i.name}${i.variant ? ` (${i.variant})` : ''} × ${i.qty} — DKK ${(i.price * i.qty).toFixed(2)}`
    )
    .join('\n')

  const addr = payload.address
  const addressLine = `${addr.street}, ${addr.postcode} ${addr.city}`
  const itemsTotal = payload.items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const text = [
    `🛒 *New Order — ${orderId}*`,
    ``,
    `👤 *Customer:* ${payload.name}`,
    `📧 *Email:* ${payload.email}`,
    `📞 *Phone:* ${payload.phone}`,
    `📍 *Address:* ${addressLine}`,
    ``,
    `🚚 *Delivery:* ${payload.delivery.title}${payload.delivery.time ? ` (${payload.delivery.time})` : ''} — DKK ${payload.delivery.price.toFixed(2)}`,
    ``,
    `*Items:*`,
    items,
    ``,
    `  Subtotal: DKK ${itemsTotal.toFixed(2)}`,
    `  Delivery: DKK ${payload.delivery.price.toFixed(2)}`,
    `💰 *Total: DKK ${payload.total.toFixed(2)}*`,
  ].join('\n')

  await sendTelegramMessage(config, text)
}

export async function notifyCustomerViaEmail(
  config: BrevoConfig,
  orderId: string,
  payload: OrderPayload,
  brand: BrandConfig
): Promise<void> {
  const { subject, htmlContent, textContent } = buildOrderConfirmationEmail(orderId, payload, brand)

  await sendBrevoEmail(config, {
    to: [{ email: payload.email, name: payload.name }],
    subject,
    htmlContent,
    textContent,
  })
}

export async function notifyOwnerViaEmail(
  config: BrevoConfig,
  ownerEmail: string,
  orderId: string,
  payload: OrderPayload,
  brand: BrandConfig
): Promise<void> {
  if (!ownerEmail) return

  const { subject, htmlContent, textContent } = buildOwnerOrderNotificationEmail(orderId, payload, brand)

  await sendBrevoEmail(config, {
    to: [{ email: ownerEmail, name: brand.name }],
    subject,
    htmlContent,
    textContent,
    replyTo: { email: payload.email, name: payload.name },
  })
}

