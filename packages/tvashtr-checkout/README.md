# @tvashtr/checkout

> Decoupled backend business logic engine for order and enquiry validation, database persistence, bot protection, and post-checkout notifications.

`@tvashtr/checkout` is the transactional core of the Tvashtr Suite. It validates order payloads and customer enquiries, runs active bot protection checks (Honeypot, Cloudflare Turnstile), stores successful actions into SQLite-compatible engines (like Cloudflare D1), and triggers multi-channel notifications.

---

## 📦 Installation

This package is designed to be used internally within the Tvashtr Suite monorepo npm workspace:

```json
{
  "dependencies": {
    "@tvashtr/checkout": "*"
  }
}
```

---

## 🛡️ Bot Protection Strategies

The package provides multiple, composable `BotProtector` strategies to defend backend API endpoints from automated crawlers and spam submissions:

- **`HoneypotProtector`**: A zero-cost trap that checks if a hidden, CSS-invisible form field (like `fax`) is filled by a bot.
- **`TurnstileProtector`**: A strategy validating Cloudflare Turnstile human verification tokens via Cloudflare's secure verify endpoints.
- **`CompositeBotProtector`**: Combines multiple strategies, running them sequentially.

```typescript
import { TurnstileProtector, HoneypotProtector, CompositeBotProtector } from '@tvashtr/checkout'

const protector = new CompositeBotProtector([
  new HoneypotProtector('fax'),
  new TurnstileProtector('CLOUDFLARE_TURNSTILE_SECRET_KEY')
])

// Verifies request token or honeypot values. Throws 403 error on failure.
await protector.verify(requestBody, { ip: requestClientIp })
```

---

## 🛍️ Transactional Order Handler

Orders are processed safely through standard rules and persisted to SQL databases.

### 📐 SQL Order Schema
The engine shares a standard, relational SQLite database table with the storefront schema definition:
```sql
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,         -- JSON stringified street, city, postcode
  delivery_title TEXT NOT NULL,
  delivery_price REAL NOT NULL,
  items TEXT NOT NULL,           -- JSON stringified list of products bought
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

### 📋 Order Validation Criteria (`validate()`)
Before saving to the database, payloads must satisfy strict validations:
1. **Name**: Required, minimum 2 characters.
2. **Email**: Required, matching standard email regex.
3. **Phone**: Required, matching international phone format (8–15 digits).
4. **Street**: Required, minimum 3 characters.
5. **City**: Required, minimum 2 characters.
6. **Postcode**: Required, matching valid Danish postcodes (`1000` to `9999`).
7. **Items**: At least 1 item containing valid `sku`, `qty` (>= 1), and `price` (>= 0).
8. **Payment Method**: Must be `'payment_on_delivery'`.

```typescript
import { validate, processOrder } from '@tvashtr/checkout'

// Validate order payload (returns string error if invalid, or null if ok)
const error = validate(orderPayload)

if (error) {
  throw new Error(error)
}

// Or run standard processing and DB saving
const { orderId, total } = await processOrder(orderPayload, databaseDriver)
```

---

## ⚙️ Orchestration Services

Instead of manual controller setups, you can instantiate high-level services to run validation, protection, storage, and notification dispatching in a unified promise pipeline:

### 🛍️ `OrderService`
```typescript
import { OrderService, TelegramOrderNotifier, BrevoOrderNotifier } from '@tvashtr/checkout'

const orderService = new OrderService(
  databaseDriver, // Implements OrderDb
  [
    new TelegramOrderNotifier(telegramConfig),
    new BrevoOrderNotifier(brevoConfig, brandConfig)
  ],
  botProtector // Turnstile / Honeypot protector
)

// Process checkout, verify bots, save, and notify customer & owner
const result = await orderService.process(orderPayload, { ip: clientIp })
console.log(`Order ${result.orderId} processed!`)
```

### 💬 `EnquiryService`
Coordinates standard customer form enquiries, validating fields and sending notifications to the merchant.
```typescript
import { EnquiryService, BrevoEnquiryNotifier } from '@tvashtr/checkout'

const enquiryService = new EnquiryService(
  [new BrevoEnquiryNotifier(emailConfig, brandConfig)],
  botProtector
)

await enquiryService.process(enquiryPayload, { ip: clientIp })
```

---

## 🏗️ Design Philosophy

1. **Edge Compatible**: Employs no runtime-specific dependencies, ensuring complete compatibility with **Cloudflare Workers**, Node.js 18+, or standard server-side routers.
2. **Dependency Inversion**: Operates on a minimal database abstract contract (`OrderDb`), keeping SQL engine configurations fully independent of the core domain logic.
3. **Fail-Fast Mechanics**: Thorough validation checks run first, aborting early before triggering external API alerts or expensive database operations.
