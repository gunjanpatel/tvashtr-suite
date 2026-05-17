import { notifyEnquiry, type EnquiryPayload } from '@tvashtr/notifications'
import type { BotProtector, Notifier } from '@tvashtr/core'
import type { BrevoConfig } from '@tvashtr/notifications'

export type { EnquiryPayload }

export class BrevoEnquiryNotifier implements Notifier<EnquiryPayload> {
  constructor(private config: BrevoConfig, private siteName: string = 'Shop') {}
  async notify(payload: EnquiryPayload): Promise<void> {
    await notifyEnquiry(this.config, payload, this.siteName)
  }
}

export class EnquiryService {
  constructor(
    private protector: BotProtector,
    private notifier: Notifier<EnquiryPayload>
  ) {}

  async process(payload: any, context: { ip: string }) {
    if (!payload.name || !payload.email || !payload.message) {
      const err = new Error('All fields are required.')
      ;(err as any).statusCode = 400
      throw err
    }

    try {
      await this.protector.verify(payload, context)
    } catch (e: any) {
      if (e.isBot) return { success: true }
      throw e
    }

    await this.notifier.notify({
      name: payload.name,
      email: payload.email,
      message: payload.message
    })

    return { success: true }
  }
}

export async function processEnquiry(
  payload: any,
  config: {
    brevoApiKey: string
    brevoSenderEmail: string
    brevoSenderName: string
    turnstileSecret: string
    siteName: string
    ip: string
  }
) {
  const { TurnstileProtector, HoneypotProtector, CompositeBotProtector } = await import('./botProtection')

  const protector = new CompositeBotProtector([
    new HoneypotProtector('fax'),
    new TurnstileProtector(config.turnstileSecret)
  ])

  const notifier = new BrevoEnquiryNotifier(
    {
      apiKey: config.brevoApiKey,
      senderEmail: config.brevoSenderEmail,
      senderName: config.brevoSenderName
    },
    config.siteName
  )

  const service = new EnquiryService(protector, notifier)
  return await service.process(payload, { ip: config.ip })
}
