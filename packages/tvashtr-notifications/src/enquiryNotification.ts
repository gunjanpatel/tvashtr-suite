import { sendBrevoEmail, type BrevoConfig } from './brevo'

export interface EnquiryPayload {
  name: string
  email: string
  message: string
}

/**
 * Sends enquiry notifications to the store owner and a confirmation to the customer.
 * siteName is injected so no store name is hardcoded in this package.
 */
export async function notifyEnquiry(
  config: BrevoConfig,
  payload: EnquiryPayload,
  siteName: string = 'Shop'
): Promise<void> {
  const adminSubject = `New Enquiry from ${payload.name}`
  const customerSubject = `Confirmation: Your enquiry to ${siteName}`

  const adminHtml = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #6d8c54;">New Enquiry Received</h2>
      <p><strong>From:</strong> ${payload.name} (${payload.email})</p>
      <p><strong>Message:</strong></p>
      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #6d8c54; margin: 10px 0;">
        ${payload.message.replace(/\n/g, '<br>')}
      </div>
    </div>
  `

  const customerHtml = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #6d8c54;">Thank you for your enquiry!</h2>
      <p>Hello ${payload.name},</p>
      <p>We've received your message and will get back to you as soon as possible.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p><strong>Copy of your message:</strong></p>
      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #6d8c54; margin: 10px 0;">
        ${payload.message.replace(/\n/g, '<br>')}
      </div>
      <p style="font-size: 12px; color: #999; margin-top: 30px;">
        This is an automated confirmation from ${siteName}.
      </p>
    </div>
  `

  await Promise.allSettled([
    sendBrevoEmail(config, {
      to: [{ email: config.senderEmail, name: config.senderName }],
      subject: adminSubject,
      htmlContent: adminHtml,
      replyTo: { email: payload.email, name: payload.name }
    }),
    sendBrevoEmail(config, {
      to: [{ email: payload.email, name: payload.name }],
      subject: customerSubject,
      htmlContent: customerHtml
    })
  ])
}
