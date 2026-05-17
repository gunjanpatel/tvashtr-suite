/**
 * @tvashtr/notifications
 * Notification channels (Brevo, Telegram) and email template builder.
 */

export { sendBrevoEmail } from './brevo'
export type { BrevoConfig, BrevoRecipient, BrevoEmailPayload } from './brevo'

export { sendTelegramMessage } from './telegram'
export type { TelegramConfig } from './telegram'

export { buildOrderConfirmationEmail } from './emailTemplates'
export type { EmailTemplate, BrandConfig } from './emailTemplates'

export { notifyOwnerViaTelegram, notifyCustomerViaEmail } from './orderConfirmation'

export { notifyEnquiry } from './enquiryNotification'
export type { EnquiryPayload } from './enquiryNotification'
