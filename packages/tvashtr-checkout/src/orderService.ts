import type { Notifier, BotProtector } from '@tvashtr/core'
import type { OrderPayload, OrderDb } from './orderHandler'
import { generateId, validate as defaultValidate } from './orderHandler'
import {
  notifyOwnerViaTelegram,
  notifyCustomerViaEmail,
  type TelegramConfig,
  type BrevoConfig,
  type BrandConfig,
} from '@tvashtr/notifications'

export class OrderService {
  constructor(
    private db: OrderDb,
    private notifiers: Notifier<{ orderId: string; payload: OrderPayload }>[],
    private protector?: BotProtector
  ) {}

  async process(payload: Partial<OrderPayload> & { turnstile_token?: string }, context: { ip: string }) {
    if (this.protector) {
      await this.protector.verify(payload, context)
    }

    const validationError = defaultValidate(payload)
    if (validationError) {
      const err = new Error(validationError)
      ;(err as any).statusCode = 422
      throw err
    }

    const orderId = generateId()
    const createdAt = new Date().toISOString()
    const itemsTotal = payload.items!.reduce((sum, i) => sum + i.price * i.qty, 0)
    const deliveryPrice = payload.delivery!.price
    const total = itemsTotal + deliveryPrice

    const itemsJson = JSON.stringify(payload.items)
    const addressJson = JSON.stringify(payload.address)

    await this.db.save(
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

    const notificationPayload = { orderId, payload: payload as OrderPayload }
    await Promise.allSettled(this.notifiers.map((n) => n.notify(notificationPayload)))

    return { orderId, total }
  }
}

export class TelegramOrderNotifier implements Notifier<{ orderId: string; payload: OrderPayload }> {
  constructor(private config: TelegramConfig) {}
  async notify(data: { orderId: string; payload: OrderPayload }): Promise<void> {
    await notifyOwnerViaTelegram(this.config, data.orderId, data.payload)
  }
}

export class BrevoOrderNotifier implements Notifier<{ orderId: string; payload: OrderPayload }> {
  constructor(private config: BrevoConfig, private brand: BrandConfig) {}
  async notify(data: { orderId: string; payload: OrderPayload }): Promise<void> {
    await notifyCustomerViaEmail(this.config, data.orderId, data.payload, this.brand)
  }
}
