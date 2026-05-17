/**
 * @tvashtr/checkout
 * Backend order/enquiry processing, validation, and bot protection.
 * Used by Nitro server routes and the Cloudflare Worker.
 */

export { TurnstileProtector, HoneypotProtector, CompositeBotProtector } from './botProtection'

export {
  generateId,
  validate,
  processOrder,
  INSERT_ORDER_SQL,
  OrderValidationError,
} from './orderHandler'
export type {
  OrderItem,
  PaymentMethod,
  DeliveryOption,
  DeliveryAddress,
  OrderPayload,
  OrderDb,
} from './orderHandler'

export { OrderService, TelegramOrderNotifier, BrevoOrderNotifier } from './orderService'

export { EnquiryService, BrevoEnquiryNotifier, processEnquiry } from './enquiryHandler'
