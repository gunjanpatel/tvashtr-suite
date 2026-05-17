import type { OrderPayload } from './orderHandler'
import { sendTelegramMessage, type TelegramConfig } from './telegram'
import { sendBrevoEmail, type BrevoConfig } from './brevo'
import { buildOrderConfirmationEmail, type BrandConfig } from './emailTemplates'

export type { TelegramConfig, BrevoConfig, BrandConfig }

// Re-export OrderPayload so emailTemplates can import it
export type { OrderPayload }

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
