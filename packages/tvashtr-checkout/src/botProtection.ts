import type { BotProtector } from '@tvashtr/core'

/**
 * Cloudflare Turnstile verification strategy.
 */
export class TurnstileProtector implements BotProtector {
  constructor(private secret: string) {}

  async verify(payload: any, context: { ip: string }): Promise<void> {
    const token = payload.turnstile_token

    if (!this.secret || this.secret === 'MOCK') return
    if (!token) throw this.createError('Human verification missing.')

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: this.secret, response: token, remoteip: context.ip }),
    })

    const data = await res.json() as { success: boolean }
    if (!data.success) {
      throw this.createError('Human verification failed. Please try again.')
    }
  }

  private createError(message: string) {
    const err = new Error(message)
    ;(err as any).statusCode = 403
    return err
  }
}

/**
 * Honeypot field check strategy.
 */
export class HoneypotProtector implements BotProtector {
  constructor(private fieldName: string = 'fax') {}

  async verify(payload: any): Promise<void> {
    if (payload[this.fieldName]) {
      console.warn(`[bot] Honeypot field "${this.fieldName}" filled.`)
      const err = new Error('Bot detected')
      ;(err as any).isBot = true
      throw err
    }
  }
}

/**
 * Composite protector — runs multiple strategies in sequence.
 */
export class CompositeBotProtector implements BotProtector {
  constructor(private protectors: BotProtector[]) {}

  async verify(payload: any, context: { ip: string }): Promise<void> {
    for (const protector of this.protectors) {
      await protector.verify(payload, context)
    }
  }
}
