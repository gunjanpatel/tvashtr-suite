/**
 * Pure email template builder.
 * Brand identity is injected via BrandConfig — no store name is hardcoded here.
 */

import type { OrderPayload } from './orderConfirmation'

export interface BrandConfig {
  name: string
  color: string
  colorLight: string
  colorAccent: string
  fontStack?: string
}

export interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
}

function formatCurrency(amount: number): string {
  return `DKK ${amount.toFixed(2)}`
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function buildOrderConfirmationEmail(
  orderId: string,
  payload: OrderPayload,
  brand: BrandConfig
): EmailTemplate {
  const fontStack = brand.fontStack ?? `'Helvetica Neue', Helvetica, Arial, sans-serif`
  const orderDate = formatDate(new Date().toISOString())
  const itemsTotal = payload.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryPrice = payload.delivery.price
  const grandTotal = itemsTotal + deliveryPrice
  const addr = payload.address
  const addressLine = `${addr.street}, ${addr.postcode} ${addr.city}`

  const itemRowsHtml = payload.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5ee;">
          <strong>${item.name}</strong>
          ${item.variant ? `<br><span style="color:#6b7280;font-size:13px;">${item.variant}</span>` : ''}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5ee;text-align:center;color:#374151;">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5ee;text-align:right;color:#374151;">${formatCurrency(item.price)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8f5ee;text-align:right;font-weight:600;color:#111827;">${formatCurrency(item.price * item.qty)}</td>
      </tr>`
    )
    .join('')

  const itemRowsText = payload.items
    .map(
      (item) =>
        `  • ${item.name}${item.variant ? ` (${item.variant})` : ''} × ${item.qty}  — ${formatCurrency(item.price * item.qty)}`
    )
    .join('\n')

  const htmlContent = `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmation — ${orderId}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:${fontStack};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:${brand.color};padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">${brand.name}</h1>
              <p style="margin:6px 0 0;color:#a7f3d0;font-size:14px;">Organic &amp; Natural Foods</p>
            </td>
          </tr>
          <tr>
            <td style="background:${brand.colorLight};padding:28px 40px;text-align:center;border-bottom:1px solid #d1fae5;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:${brand.color};">Thank you for your order! 🌿</p>
              <p style="margin:0;font-size:15px;color:#4b5563;">We've received your order and will be in touch shortly.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:8px;">
                    <span style="font-size:13px;color:#6b7280;text-transform:uppercase;">Order ID</span><br>
                    <strong style="font-size:18px;color:${brand.color};">${orderId}</strong>
                  </td>
                  <td style="padding-bottom:8px;text-align:right;">
                    <span style="font-size:13px;color:#6b7280;text-transform:uppercase;">Date</span><br>
                    <strong style="font-size:15px;color:#374151;">${orderDate}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;">
              <h2 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;color:#6b7280;">Delivery To</h2>
              <p style="margin:0;font-size:15px;color:#111827;line-height:1.7;">
                <strong>${payload.name}</strong><br>
                ${addressLine}<br>
                <a href="mailto:${payload.email}" style="color:${brand.color};text-decoration:none;">${payload.email}</a><br>
                ${payload.phone}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;">
              <h2 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;color:#6b7280;">Delivery Method</h2>
              <p style="margin:0;font-size:15px;color:#111827;">
                ${payload.delivery.title}
                ${payload.delivery.time ? `<span style="color:#6b7280;"> · ${payload.delivery.time}</span>` : ''}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <h2 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;color:#6b7280;">Your Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8f5ee;border-radius:8px;overflow:hidden;">
                <thead>
                  <tr style="background:${brand.colorLight};">
                    <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Product</th>
                    <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Qty</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Unit</th>
                    <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemRowsHtml}</tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#4b5563;font-size:14px;">Subtotal</td>
                  <td style="padding:6px 0;text-align:right;color:#374151;font-size:14px;">${formatCurrency(itemsTotal)}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#4b5563;font-size:14px;">Delivery (${payload.delivery.title})</td>
                  <td style="padding:6px 0;text-align:right;color:#374151;font-size:14px;">${formatCurrency(deliveryPrice)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:2px solid ${brand.colorAccent};padding-top:10px;"></td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:17px;font-weight:700;color:${brand.color};">Total</td>
                  <td style="padding:4px 0;text-align:right;font-size:17px;font-weight:700;color:${brand.color};">${formatCurrency(grandTotal)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;">
              <p style="margin:0;font-size:14px;color:#6b7280;">💳 <strong>Payment:</strong> Cash on delivery</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <div style="background:${brand.colorLight};border-left:4px solid ${brand.colorAccent};border-radius:6px;padding:16px 20px;">
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;">
                  We'll contact you soon to confirm your delivery details. If you have any questions, please reply to this email.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">© ${new Date().getFullYear()} ${brand.name} · Organic &amp; Natural Foods</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textContent = [
    `${brand.name} — Order Confirmation`,
    `${'─'.repeat(40)}`,
    ``,
    `Thank you for your order, ${payload.name}!`,
    ``,
    `Order ID : ${orderId}`,
    `Date     : ${orderDate}`,
    ``,
    `── Delivery To ──`,
    `${payload.name}`,
    `${addressLine}`,
    `${payload.email}`,
    `${payload.phone}`,
    ``,
    `── Delivery Method ──`,
    `${payload.delivery.title}${payload.delivery.time ? ` (${payload.delivery.time})` : ''}`,
    ``,
    `── Items ──`,
    itemRowsText,
    ``,
    `  Subtotal : ${formatCurrency(itemsTotal)}`,
    `  Delivery : ${formatCurrency(deliveryPrice)}`,
    `  Total    : ${formatCurrency(grandTotal)}`,
    ``,
    `Payment: Cash on delivery`,
    ``,
    `${'─'.repeat(40)}`,
    `We'll contact you soon to confirm your delivery details.`,
    `Reply to this email if you have any questions.`,
    ``,
    `© ${new Date().getFullYear()} ${brand.name}`,
  ].join('\n')

  return {
    subject: `Order Confirmed — ${orderId} | ${brand.name}`,
    htmlContent,
    textContent,
  }
}

export function buildOwnerOrderNotificationEmail(
  orderId: string,
  payload: OrderPayload,
  brand: BrandConfig
): EmailTemplate {
  const fontStack = brand.fontStack ?? `'Helvetica Neue', Helvetica, Arial, sans-serif`
  const orderDate = formatDate(new Date().toISOString())
  const itemsTotal = payload.items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0)
  const deliveryPrice = payload.delivery.price
  const grandTotal = itemsTotal + deliveryPrice
  const addr = payload.address
  const addressLine = `${addr.street}, ${addr.postcode} ${addr.city}`

  const itemRowsHtml = payload.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">
          <strong>${item.name}</strong>${item.variant ? ` <span style="color:#6b7280;">(${item.variant})</span>` : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;color:#374151;">${item.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;color:#374151;">${formatCurrency(item.price)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-weight:600;color:#111827;">${formatCurrency(item.price * item.qty)}</td>
      </tr>`
    )
    .join('')

  const itemRowsText = payload.items
    .map(
      (item: any) =>
        `  • ${item.name}${item.variant ? ` (${item.variant})` : ''} × ${item.qty} — ${formatCurrency(item.price * item.qty)}`
    )
    .join('\n')

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Order — ${orderId}</title>
</head>
<body style="margin:0;padding:16px 0;background:#f3f4f6;font-family:${fontStack};color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <tr>
      <td style="background:${brand.color};padding:14px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="color:#ffffff;font-size:16px;font-weight:700;">🛒 New Order Received</span>
              <span style="color:#d1fae5;font-size:13px;margin-left:8px;">${brand.name}</span>
            </td>
            <td style="text-align:right;">
              <span style="color:#ffffff;font-size:14px;font-weight:700;font-family:monospace;background:rgba(255,255,255,0.18);padding:3px 8px;border-radius:4px;">${orderId}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
          <tr>
            <td width="50%" style="vertical-align:top;padding-right:10px;">
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;min-height:100px;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">👤 Customer Info</div>
                <div style="font-size:14px;font-weight:600;color:#111827;">${payload.name}</div>
                <div style="font-size:13px;color:#374151;margin-top:2px;">
                  <a href="tel:${payload.phone}" style="color:${brand.color};text-decoration:none;font-weight:500;">📞 ${payload.phone}</a>
                </div>
                <div style="font-size:13px;color:#4b5563;margin-top:2px;">
                  <a href="mailto:${payload.email}" style="color:${brand.color};text-decoration:none;">✉️ ${payload.email}</a>
                </div>
              </div>
            </td>
            <td width="50%" style="vertical-align:top;padding-left:10px;">
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;min-height:100px;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:6px;">🚚 Delivery &amp; Address</div>
                <div style="font-size:13px;font-weight:600;color:#111827;">${addressLine}</div>
                <div style="font-size:12px;color:#4b5563;margin-top:4px;">
                  <strong>Method:</strong> ${payload.delivery.title}${payload.delivery.time ? ` (${payload.delivery.time})` : ''}
                </div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px;">
                  <strong>Date:</strong> ${orderDate}
                </div>
              </div>
            </td>
          </tr>
        </table>

        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">📦 Order Items</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;border-collapse:collapse;margin-bottom:14px;">
          <thead>
            <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Item</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;color:#6b7280;text-transform:uppercase;">Qty</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Unit</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRowsHtml}</tbody>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
          <tr>
            <td style="padding:3px 0;font-size:13px;color:#4b5563;">Subtotal</td>
            <td style="padding:3px 0;text-align:right;font-size:13px;color:#374151;">${formatCurrency(itemsTotal)}</td>
          </tr>
          <tr>
            <td style="padding:3px 0;font-size:13px;color:#4b5563;">Delivery (${payload.delivery.title})</td>
            <td style="padding:3px 0;text-align:right;font-size:13px;color:#374151;">${formatCurrency(deliveryPrice)}</td>
          </tr>
          <tr>
            <td colspan="2" style="border-top:1px solid #e5e7eb;padding-top:6px;"></td>
          </tr>
          <tr>
            <td style="font-size:15px;font-weight:700;color:${brand.color};">Grand Total</td>
            <td style="text-align:right;font-size:15px;font-weight:700;color:${brand.color};">${formatCurrency(grandTotal)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;font-size:12px;color:#6b7280;">
              💳 Payment: Cash on delivery
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:10px 20px;text-align:center;">
        <span style="font-size:12px;color:#9ca3af;">Internal Order Notification · ${brand.name}</span>
      </td>
    </tr>
  </table>
</body>
</html>`

  const textContent = [
    `[NEW ORDER] ${orderId} — ${brand.name}`,
    `────────────────────────────────────────`,
    `Customer: ${payload.name}`,
    `Phone:    ${payload.phone}`,
    `Email:    ${payload.email}`,
    `Address:  ${addressLine}`,
    `Delivery: ${payload.delivery.title}${payload.delivery.time ? ` (${payload.delivery.time})` : ''}`,
    `Date:     ${orderDate}`,
    ``,
    `Items:`,
    itemRowsText,
    ``,
    `Subtotal: ${formatCurrency(itemsTotal)}`,
    `Delivery: ${formatCurrency(deliveryPrice)}`,
    `Total:    ${formatCurrency(grandTotal)}`,
    `Payment:  Cash on delivery`,
  ].join('\n')

  return {
    subject: `🛒 New Order ${orderId} — ${payload.name} (${formatCurrency(grandTotal)})`,
    htmlContent,
    textContent,
  }
}

