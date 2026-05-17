/**
 * Low-level Brevo (Sendinblue) Transactional Email API v3 client.
 */

export interface BrevoConfig {
  apiKey: string
  senderEmail: string
  senderName: string
}

export interface BrevoRecipient {
  email: string
  name?: string
}

export interface BrevoEmailPayload {
  to: BrevoRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
  replyTo?: BrevoRecipient
}

export async function sendBrevoEmail(
  config: BrevoConfig,
  payload: BrevoEmailPayload
): Promise<void> {
  if (!config.apiKey || config.apiKey === 'MOCK') {
    console.info(`[Mock] Brevo Email to ${payload.to.map((t) => t.email).join(', ')} skipped.`)
    return
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      sender: { email: config.senderEmail, name: config.senderName },
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      textContent: payload.textContent,
      replyTo: payload.replyTo,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '(no body)')
    throw new Error(`Brevo API error ${res.status}: ${body}`)
  }
}
