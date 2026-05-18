# @tvashtr/notifications

> Dynamic multi-channel notification service (Brevo, Telegram) and responsive email template builders.

`@tvashtr/notifications` provides decoupled messaging engines for sending real-time store alerts to both merchants (via Telegram) and customers (via Brevo email) upon successful checkout or contact enquiry submissions.

---

## 📦 Installation

This package is designed to be used internally within the Tvashtr Suite monorepo npm workspace:

```json
{
  "dependencies": {
    "@tvashtr/notifications": "*"
  }
}
```

---

## 🚀 Key Drivers

This package contains low-level wrappers around third-party notification APIs, exposing standard, typed functions:

### ✉️ Brevo (Email Driver)
A lightweight client that communicates with the Brevo SMTP API using native `fetch`.
```typescript
import { sendBrevoEmail } from '@tvashtr/notifications'

await sendBrevoEmail({
  apiKey: 'YOUR_BREVO_API_KEY',
  sender: { name: 'Store Admin', email: 'no-reply@store.com' },
  to: [{ email: 'customer@email.com' }],
  subject: 'Your Order Confirmation',
  htmlContent: '<p>Thank you for your order!</p>'
})
```

### 🤖 Telegram (Chat Driver)
Allows instant, zero-cost merchant notification pushes directly to your phone using Telegram Bots.
```typescript
import { sendTelegramMessage } from '@tvashtr/notifications'

await sendTelegramMessage({
  botToken: 'TELEGRAM_BOT_TOKEN',
  chatId: 'TELEGRAM_CHAT_ID',
  text: '🔔 New Order Received!'
})
```

---

## 🎨 HTML Email Template Builder

The package features a dedicated engine to construct beautiful, responsive HTML emails. It utilizes `emailTemplates.ts` to build:
- **Order Confirmations**: Displays ordered products in a structured table, handles delivery/payment details, and includes customizable branding elements.
- **Enquiry Notifications**: Constructs messages sent from store contact/enquiry forms.

### Brand Customization Schema
You can completely white-label the email design via a `BrandConfig` payload:
```typescript
export interface BrandConfig {
  siteName: string
  siteUrl: string
  logoUrl?: string
  primaryColor?: string   // Hex color code (e.g. #D97706)
  supportEmail?: string
  supportPhone?: string
}
```

---

## 🔔 Integrated Service Endpoints

For standard flows, high-level automation wrappers compile content and invoke drivers automatically:

### 🛍️ Order Confirmation Flow
Sends a detailed Markdown alert to the store owner's Telegram channel, and a responsive HTML confirmation to the customer's email.
```typescript
import { notifyOwnerViaTelegram, notifyCustomerViaEmail } from '@tvashtr/notifications'

// Notify owner via Telegram
await notifyOwnerViaTelegram({
  order: orderPayload,
  config: { botToken, chatId }
})

// Email confirmation to customer
await notifyCustomerViaEmail({
  order: orderPayload,
  brand: brandConfig,
  config: { apiKey, sender }
})
```

### 💬 Contact Enquiry Flow
Formats a user contact enquiry and pushes it to both the merchant's Telegram and custom email boxes.
```typescript
import { notifyEnquiry } from '@tvashtr/notifications'

await notifyEnquiry({
  enquiry: { name, email, phone, message },
  brand: brandConfig,
  emailConfig: { apiKey, sender, recipientEmail },
  telegramConfig: { botToken, chatId }
})
```

---

## 🏗️ Design Philosophy

1. **Lightweight & Edge-Ready**: All network calls utilize native `fetch` (with no thick dependencies like Axios or Nodemailer), making this library perfectly optimized for serverless runtimes like **Cloudflare Workers**.
2. **Robust Formatting**: Handles Markdown and HTML generation safely, formatting currencies, dates, and order tables in a clean, professional aesthetic.
3. **Decoupled from Frameworks**: The notification logic is entirely vanilla TypeScript, allowing it to be called from a backend API, a Nuxt server route, or standalone cron scripts.
