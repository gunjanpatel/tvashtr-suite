# Tvashtr Suite

> [**Tvashtr**](https://www.npmjs.com/org/tvashtr) — The divine craftsman of Hindu beliefs. A modular, zero-cost framework for building production-ready multi-tenant e-commerce storefronts.

[![npm version](https://img.shields.io/npm/v/@tvashtr/checkout?label=%40tvashtr%2Fcheckout&color=blue)](https://www.npmjs.com/package/@tvashtr/checkout)
[![npm version](https://img.shields.io/npm/v/@tvashtr/core?label=%40tvashtr%2Fcore&color=purple)](https://www.npmjs.com/package/@tvashtr/core)
[![npm version](https://img.shields.io/npm/v/@tvashtr/google-sheets?label=%40tvashtr%2Fgoogle-sheets&color=gray)](https://www.npmjs.com/package/@tvashtr/google-sheets)
[![npm version](https://img.shields.io/npm/v/@tvashtr/notifications?label=%40tvashtr%2Fnotifications&color=red)](https://www.npmjs.com/package/@tvashtr/notifications)
[![npm version](https://img.shields.io/npm/v/@tvashtr/ui?label=%40tvashtr%2Fui&color=pink)](https://www.npmjs.com/package/@tvashtr/ui)
[![npm version](https://img.shields.io/npm/v/@tvashtr/cli?label=%40tvashtr%2Fcli&color=green)](https://www.npmjs.com/package/@tvashtr/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-orange)](https://pages.cloudflare.com)
[![Node.js 20+](https://img.shields.io/badge/Node.js-20%2B-brightgreen)](https://nodejs.org)

---

## 📖 Overview

**Tvashtr Suite** is a "Store-in-a-Box" monorepo framework. It decouples a generic, reusable e-commerce engine (`@tvashtr/*` packages) from individual store applications so you can spin up a fully configured, white-label storefront in seconds — not days.

Every store built on this suite runs at **$0/month** by leveraging free tiers:

| Service | Free Tier Limit |
| :--- | :--- |
| Cloudflare Pages | Unlimited sites, 500 builds/month |
| Cloudflare Workers | 100,000 requests/day |
| Cloudflare D1 | 5 GB storage, 25M row reads/day |
| Google Sheets | Unlimited (used as headless CMS) |

**See it in production:** [patel-flour](https://flour.dk) — a real organic flour store built entirely on this framework.

---

## 🏗️ Architecture

```
                ┌─────────────────────────────────┐
                │       Google Sheets CMS         │
                │  (Products, Recipes, Blog posts)│
                └────────────────┬────────────────┘
                        gviz API (real-time)
                                 ▼
         ┌────────────────────────────────────────────────┐
         │          Nuxt 4 SPA — Cloudflare Pages         │
         │   @tvashtr/ui · @tvashtr/core · store theme    │
         └───────────────────────┬────────────────────────┘
                  HTTPS POST (Turnstile-protected)
                                 ▼
         ┌────────────────────────────────────────────────┐
         │       Cloudflare Worker (Edge API)             │
         │   Rate limiting · Bot protection · Validation  │
         └──────────┬───────────────────┬─────────────────┘
                    │                   │
         ┌──────────▼──────┐   ┌────────▼──────────────┐
         │  Cloudflare D1  │   │  Notifications        │
         │  (Orders DB)    │   │  Telegram + Brevo SMTP│
         └─────────────────┘   └───────────────────────┘
```

### Monorepo Structure

```
tvashtr-suite/
├── apps/
│   ├── patel-flour/       ← Store: brand, theme, locale overrides
│   └── my-store/           ← Your new store (created by CLI)
│
└── packages/
    ├── @tvashtr/ui          ← Shared Vue components (NavBar, ProductCard, Cart…)
    ├── @tvashtr/checkout    ← Order/enquiry services, bot protection, notifiers
    ├── @tvashtr/core        ← Types, utilities, config patterns
    ├── @tvashtr/google-sheets ← Google Sheets gviz API parser
    ├── @tvashtr/notifications ← Telegram + Brevo email builders
    └── @tvashtr/cli         ← Scaffolding tool (`npx tvashtr create`)
```

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 🧱 **Feature Flags** | Toggle Checkout, Recipes, Blog, or Service Mode via `.env` — zero code changes |
| 🎨 **Dynamic Theming** | Tailwind v4 `@theme` tokens + CSS custom properties for complete brand control |
| 🛍️ **No-Code CMS** | Add/edit products in Google Sheets; changes appear in real-time |
| 🌍 **i18n Ready** | Built-in multi-language routing (English + Danish out of the box) |
| 🤖 **Bot Protection** | Cloudflare Turnstile + honeypot fields on all forms |
| 🚦 **Rate Limiting** | 5 requests per 10 min per IP on all Worker endpoints |
| 📱 **Instant Notifications** | Telegram + Brevo email on every order and enquiry |
| 🛒 **Persistent Cart** | `localStorage`-backed with variant pricing |
| 💳 **Variant Pricing** | Different prices per size/weight/flavour |
| 🧬 **Product Attributes** | Generic per-product data table driven by Google Sheets — Nutrition, Specs, Features, or any custom labels |
| 📦 **Cash on Delivery** | Full COD payment flow |
| 🔒 **Zero Secrets in Repo** | All sensitive keys stored as Cloudflare Worker secrets |
| 🇩🇰 **Geo-restriction** | Optionally hide checkout for visitors outside your target country |
| 🍜 **Recipes Module** | Google Sheets-driven recipes with "buy the ingredients" product links |
| 📰 **Blog Module** | Markdown-based blog via Google Docs / Sheets content |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Nuxt 4](https://nuxt.com) (SPA mode) | Full-stack Vue framework |
| **UI** | [Nuxt UI](https://ui.nuxt.com) + TailwindCSS v4 | Component library + styling |
| **i18n** | [@nuxtjs/i18n](https://i18n.nuxtjs.org/) | Multi-language routing |
| **CMS** | Google Sheets (gviz API) | Products, recipes, blog content |
| **Hosting** | [Cloudflare Pages](https://pages.cloudflare.com) | Static site + CI/CD |
| **API** | [Cloudflare Workers](https://workers.cloudflare.com) | Serverless order/enquiry endpoints |
| **Database** | [Cloudflare D1](https://developers.cloudflare.com/d1/) | SQLite at the edge |
| **Bot Protection** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) | CAPTCHA alternative |
| **Notifications** | Telegram Bot API + Brevo SMTP | Real-time alerts |

---

## 🚀 Quickstart (5 Minutes to Dev Server)

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Cloudflare account](https://cloudflare.com) (free)
- [Google account](https://google.com) (for Google Sheets CMS)

### 1. Clone the repo

```bash
git clone https://github.com/gunjanpatel/tvashtr-suite.git
cd tvashtr-suite
npm install
```

### 2. Scaffold your store

```bash
npx tvashtr create my-store
```

The interactive wizard will ask you for your store name, colors, phone format, and which modules you want. It writes everything directly into your config files.

### 3. Add a Google Sheet ID

Create a Google Sheet (see [Step 1 below](#step-1-google-sheets--product-catalogue)), share it as **Viewer**, then add the ID to `apps/my-store/.env`:

```env
NUXT_PUBLIC_SHEET_ID=your_sheet_id_here
```

### 4. Start the dev server

```bash
npm run dev -w my-store
# → http://localhost:3000
```

Your store is running! Now follow the full deployment guide below to go live.

---

## 📋 Full Deployment Guide

### Step 1: Google Sheets — Product Catalogue

**Create a new Google Sheet** with these exact headers in Row 1:

| Column | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `sku` | string | Unique product ID (no spaces) | `organic-wheat-1kg` |
| `name` | string | Display name | `Organic Whole Wheat Flour` |
| `categories` | string | Comma-separated list of category IDs | `baking,whole-wheat` |
| `price` | number | Default price | `45` |
| `image` | string | Image path from `/public` | `/images/wheat.webp` |
| `short` | string | Short tagline | `Stone-ground, locally sourced` |
| `desc` | string | Full description (Markdown ok) | `Rich in fibre...` |
| `variants` | string | Comma-separated sizes | `1 kg, 5 kg, 10 kg` |
| `variant_prices` | string | `variant:price` pairs | `1 kg:45, 5 kg:200` |
| `qtyDefault` | number | Default cart quantity | `1` |
| `is_popular` | boolean | Show on homepage | `TRUE` |
| `active` | boolean | Show in catalogue | `TRUE` |

**Share settings:** Google Sheets → Share → General Access → **Anyone with the link** → **Viewer**

**Get your Sheet ID:** Copy the long string from your sheet URL between `/d/` and `/edit`:
```
https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit
```

Add to `apps/my-store/.env`:
```env
NUXT_PUBLIC_SHEET_ID=your_sheet_id_here
```

---

### Step 2: Google Sheets — Recipes (Optional)

Enable with `NUXT_PUBLIC_ENABLE_RECIPES=true`. Create a second sheet with these columns:

| Column | Type | Description |
| :--- | :--- | :--- |
| `slug` | string | URL slug (e.g. `flatbread-recipe`) |
| `title` | string | Recipe title |
| `image` | string | Image path |
| `description` | string | Short intro |
| `category` | string | e.g. `Baking`, `Breakfast` |
| `prepTime` | string | e.g. `15 mins` |
| `cookTime` | string | e.g. `30 mins` |
| `ingredients` | string | Comma-separated list |
| `content` | string | Markdown cooking steps |
| `recipeProducts` | string | `sku:variant:qty` pairs for "buy ingredients" |
| `isPopular` | boolean | Show on homepage |
| `active` | boolean | `TRUE` or `FALSE` |

```env
NUXT_PUBLIC_RECIPE_SHEET_ID=your_recipe_sheet_id
NUXT_PUBLIC_ENABLE_RECIPES=true
```

### Step 2b: Google Sheets — Product Attributes (Optional)

A generic per-product data table. Patel Flour uses it for Nutrition Information. A lighting store might use it for electrical specs. A service company for service inclusions. The column names become the attribute labels — fully dynamic.

**Sheet layout:**

| `sku` | Calories | Protein | Carbohydrates | Fat | Fibre |
| :--- | :--- | :--- | :--- | :--- | :--- |
| organic-wheat-flour | 340 kcal | 13 g | 62 g | 2 g | 11 g |

- Column A header must be `sku` — this is the lookup key matched against the product SKU
- Columns B onwards — any label you want, they become the attribute names as-is
- Empty cells are automatically ignored — only populated values are shown
- SKUs with no row in this sheet simply show no section on their product page
- Add as many columns as needed — the UI adapts automatically

```env
NUXT_PUBLIC_PRODUCT_ATTRIBUTES_SHEET_ID=your_sheet_id_here
```

### Step 2c: Google Sheets — Product Categories Configuration

Create a separate Google Sheet tab or file to manage your dynamic categories and automatic navigation row splits.

**Sheet layout — Row 1 must be headers, freeze it via View → Freeze → 1 row:**

| `category` | `name` | `type` | `description` |
| --- | --- | --- | --- |
| `daily-staples` | Daily Staples | usage | Essential everyday flours used for making standard rotis chapatis and flatbreads |
| `gluten-free` | Gluten-Free | dietary | Naturally gluten-free flour options suitable for dietary restrictions |

* **Column A (`category`)**: The unique text slug used in your product data mapping (e.g., `daily-staples`).
* **Column B (`name`)**: The clean, customer-facing label displayed on the storefront filter pills.
* **Column C (`type`)**: Must be either **`dietary`** or **`usage`**. This value automatically assigns the category to its respective layout row without changing backend code.
* **Column D (`description`)**: Optional context describing the target category grouping.
* Share the sheet as **Anyone with the link → Viewer**

Add to `.env`:

```env
NUXT_PUBLIC_CATEGORIES_SHEET_ID=your_categories_sheet_id

```

**In your store's product page**, use the `useProductAttributes(sku)` composable and the generic `ProductAttributesTable` component from `@tvashtr/ui`, or create a store-specific styled component (e.g. `NutritionLabelA.vue`) that accepts the same props:

```vue
<ProductAttributesTable
  v-if="product"
  title="Nutrition Information"
  subtitle="Typical values per 100 g"
  :attributes="nutritionAttributes"
/>
```

```ts
const { attributes: nutritionAttributes } = useProductAttributes(sku)
```

---

### Step 3: Store Identity & Theme

#### `store.config.ts` — Your brand's source of truth

Open `apps/my-store/store.config.ts` (the CLI pre-fills this from your wizard answers):

```typescript
export const siteName = 'My Organic Store'
export const siteTagline = 'Fresh & Natural — Delivered'
export const logoLabel = 'My'
export const logoText = 'Store'

export const brandConfig = {
  name: 'My Organic Store',
  color: '#0284c7',       // Used in email templates
  colorLight: '#f0f9ff',
  colorAccent: '#0ea5e9',
}

export const checkoutPhoneConfig = {
  prefix: '+1',
  flag: '🇺🇸',
  digits: 10,
  hint: '10-digit US mobile number',
  placeholder: '201-555-0123',
  maxLength: 12,
}
```

#### CSS Theme — `app/assets/themes/default/main.css`

Define your color palette and light/dark CSS custom properties:

```css
@import "tailwindcss";
@import "@nuxt/ui";
@plugin "@tailwindcss/typography";

/* Required: tell Tailwind to scan shared UI package for classes */
@source "../../../../packages/tvashtr-ui/app/**/*.vue";
@source "../../../../packages/tvashtr-ui/app/**/*.ts";

@theme {
  --color-brand-50:  #f0f9ff;
  --color-brand-100: #e0f2fe;
  --color-brand-500: #0284c7;   /* ← your primary brand color */
  --color-brand-600: #0369a1;
  --color-brand-900: #0c4a6e;
}

:root {
  --bg-page:      #fafafa;
  --bg-surface:   #ffffff;
  --bg-muted:     #f4f4f5;
  --text-primary: #18181b;
  --text-secondary: #71717a;
  --border:       #e4e4e7;
}

.dark {
  --bg-page:      #09090b;
  --bg-surface:   #18181b;
  --bg-muted:     #27272a;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --border:       #27272a;
}
```

---

### Step 4: Cloudflare Worker + D1 Database

The Worker handles all order processing, bot protection, and notifications.

```bash
cd apps/my-store/cloudflare

# 1. Authenticate with Cloudflare
npx wrangler login

# 2. Create your D1 database
npx wrangler d1 create my-store-db
```

Wrangler will output something like:
```toml
[[d1_databases]]
binding = "DB"
database_name = "my-store-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** and paste it into `cloudflare/wrangler.toml`:
```toml
name = "my-store-worker"

[[d1_databases]]
binding = "DB"
database_name = "my-store-db"
database_id = "paste-your-id-here"

[vars]
ALLOWED_ORIGIN = "https://my-store.pages.dev"
```

```bash
# 3. Apply the database schema (creates the orders table)
npx wrangler d1 execute my-store-db --remote --file=schema.sql

# 4. Deploy the worker
npx wrangler deploy
```

Copy the worker URL from the output (e.g. `https://my-store-worker.yourname.workers.dev`) and add to `.env`:
```env
NUXT_PUBLIC_WORKER_URL=https://my-store-worker.yourname.workers.dev
```

---

### Step 5: Worker Secrets

These are injected securely into the Worker at runtime — **never commit them to `.env`**.

```bash
cd apps/my-store/cloudflare

# Cloudflare Turnstile (bot protection)
npx wrangler secret put TURNSTILE_SECRET_KEY

# Telegram notifications
npx wrangler secret put TELEGRAM_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID

# Brevo transactional email
npx wrangler secret put BREVO_API_KEY

# Email sender details
npx wrangler secret put BREVO_SENDER_EMAIL
npx wrangler secret put BREVO_SENDER_NAME
```

---

### Step 6: Cloudflare Turnstile (Bot Protection)

1. Cloudflare Dashboard → **Turnstile** → **Add Site**
2. Enter your domain (e.g. `mystore.com`), choose **Managed** widget type
3. Copy the **Site Key** → add to `apps/my-store/.env`:
   ```env
   NUXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
   ```
4. Copy the **Secret Key** → add as a Worker secret (Step 5 above)

---

### Step 7: Telegram Notifications

Every new order and enquiry sends an instant alert to your Telegram group.

1. Message **@BotFather** on Telegram → send `/newbot` → follow prompts → copy your **Bot Token**
2. Create a Telegram group and add your bot as a member
3. Send a message in the group, then call:
   ```bash
   curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
4. Find your `chat.id` in the response (group IDs are **negative**, e.g. `-1001234567890`)
5. Set both as Worker secrets (see Step 5)

---

### Step 8: Cloudflare Pages — Hosting

1. Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**
2. Select your GitHub repository
3. Configure the build settings:

| Setting | Value |
| :--- | :--- |
| **Project name** | `my-store` |
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Build command** | `npm run build -w my-store` |
| **Build output directory** | `apps/my-store/.output/public` |
| **Root directory** | `/` ← **keep as root** for monorepo workspace resolution |

4. Under **Environment Variables**, add all values from your `apps/my-store/.env` file
5. Click **Save and Deploy** — every `git push` triggers an automatic edge build

---

### Step 9: Custom Domain (Optional)

1. Cloudflare Dashboard → **Pages** → your project → **Custom domains** → Add domain
2. Update your Worker to accept requests from the new origin:
   ```toml
   # cloudflare/wrangler.toml
   [vars]
   ALLOWED_ORIGIN = "https://shop.mydomain.com"

   [[routes]]
   pattern = "api.mydomain.com/*"
   zone_name = "mydomain.com"
   ```
3. Redeploy the Worker:
   ```bash
   npx wrangler deploy
   ```
4. Update `.env`:
   ```env
   NUXT_PUBLIC_WORKER_URL=https://api.mydomain.com
   ```

---

## ⚙️ Feature Flags Reference

Toggle features by setting these in your `apps/my-store/.env`. No code changes needed.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NUXT_PUBLIC_ENABLE_CHECKOUT` | `true` | Full cart + checkout flow |
| `NUXT_PUBLIC_ENABLE_SERVICE_MODE` | `false` | When `true`, "Add to Cart" → "Send Enquiry" |
| `NUXT_PUBLIC_ENABLE_RECIPES` | `false` | Recipes module + nav link |
| `NUXT_PUBLIC_ENABLE_BLOG` | `false` | Blog module + nav link |
| `NUXT_PUBLIC_ENABLE_CART` | `true` | Cart icon and drawer |
| `NUXT_PUBLIC_ALLOWED_COUNTRY` | `DK` | ISO country code for geo-restriction (leave blank to disable) |
| `NUXT_PUBLIC_FREE_DELIVERY_THRESHOLD` | `399` | Order total for free delivery |
| `NUXT_PUBLIC_SHEET_ID` | *(required)* | Product catalogue Google Sheet ID |
| `NUXT_PUBLIC_DELIVERY_SHEET_ID` | — | Delivery options Google Sheet ID |
| `NUXT_PUBLIC_RECIPE_SHEET_ID` | — | Recipes Google Sheet ID |
| `NUXT_PUBLIC_CATEGORY_SHEET_ID` | — | Categories Google Sheet ID |
| `NUXT_PUBLIC_PRODUCT_ATTRIBUTES_SHEET_ID` | — | Optional per-product attributes sheet (Nutrition, Specs, Features, etc.) |
| `NUXT_PUBLIC_WORKER_URL` | `MOCK` | Cloudflare Worker URL (`MOCK` = dev-only simulation) |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | — | Cloudflare Turnstile site key |

---

## 💻 Local Development

```bash
# 1. Install all workspace dependencies
npm install

# 2. Copy and fill in environment variables
cp apps/my-store/.env.example apps/my-store/.env
# Edit .env — minimum: set NUXT_PUBLIC_SHEET_ID

# 3. Start the dev server
npm run dev -w my-store
# → http://localhost:3000

# 4. (Optional) Run the Cloudflare Worker locally
cd apps/my-store/cloudflare
npx wrangler dev
# → http://localhost:8787
```

> **Dev mode tip:** Set `NUXT_PUBLIC_WORKER_URL=MOCK` in your `.env` to simulate orders locally without a running Worker. Orders are saved to `apps/my-store/.data/orders.db`.

---

## 📁 Scaffolded Store Structure

After running `npx tvashtr create my-store`, you get:

```
apps/my-store/
├── .env                     ← Pre-filled from your wizard answers
├── .env.example             ← Committed template (no secrets)
├── store.config.ts          ← Brand identity, phone config, nav links
├── nuxt.config.ts           ← Nuxt 4 config (auto-extends @tvashtr/ui)
├── tailwind.config.ts       ← Tailwind configuration
├── app/
│   ├── app.config.ts        ← Nuxt UI component defaults (primary colour)
│   └── assets/
│       └── themes/
│           └── default/
│               └── main.css ← Your custom CSS theme (edit this!)
└── cloudflare/
    ├── worker.ts            ← Edge API (orders + enquiries + bot protection)
    ├── schema.sql           ← D1 database schema
    └── wrangler.toml        ← Cloudflare Worker config
```

---

## ✅ Deployment Checklist

Use this before going live:

```
Google Sheets
  [ ] Product sheet created with correct column headers
  [ ] Sheet shared as "Anyone with the link → Viewer"
  [ ] NUXT_PUBLIC_SHEET_ID added to .env and Cloudflare Pages env vars

Cloudflare Worker
  [ ] wrangler login completed
  [ ] D1 database created: npx wrangler d1 create <name>
  [ ] database_id copied to wrangler.toml
  [ ] schema.sql applied: npx wrangler d1 execute <name> --remote --file=schema.sql
  [ ] npx wrangler deploy succeeded
  [ ] NUXT_PUBLIC_WORKER_URL added to .env

Worker Secrets (via wrangler secret put)
  [ ] TURNSTILE_SECRET_KEY
  [ ] TELEGRAM_TOKEN
  [ ] TELEGRAM_CHAT_ID
  [ ] BREVO_API_KEY
  [ ] BREVO_SENDER_EMAIL
  [ ] BREVO_SENDER_NAME

Cloudflare Turnstile
  [ ] Site created in Turnstile dashboard
  [ ] NUXT_PUBLIC_TURNSTILE_SITE_KEY added to .env

Cloudflare Pages
  [ ] Project connected to GitHub repo
  [ ] Build command: npm run build -w my-store
  [ ] Build output: apps/my-store/.output/public
  [ ] All .env variables added to Pages environment variables
  [ ] First deploy succeeded

Optional
  [ ] Custom domain configured
  [ ] wrangler.toml ALLOWED_ORIGIN updated to custom domain
  [ ] .env.example committed (never commit .env itself)
```

---

## ❓ FAQ

**Q: Products aren't loading — I just see an empty page.**
Make sure `NUXT_PUBLIC_SHEET_ID` is set in `.env` and that your Google Sheet is shared as **"Anyone with the link → Viewer"**.

**Q: The checkout form submits but nothing happens.**
Set `NUXT_PUBLIC_WORKER_URL` to your deployed Worker URL. `MOCK` only simulates orders locally.

**Q: I get CORS errors when submitting the checkout.**
Your Worker's `ALLOWED_ORIGIN` env var must match your frontend URL exactly (including `https://`). Update `wrangler.toml` and redeploy.

**Q: I'm not receiving Telegram notifications.**
Double-check your `TELEGRAM_CHAT_ID`. Group chat IDs are **negative** numbers. Run `getUpdates` again to confirm.

**Q: How do I add a second language?**
Add a locale file to `apps/my-store/locales/` and register it in `nuxt.config.ts` under `i18n.locales`.

**Q: Can I use this without the Recipes or Blog modules?**
Yes — set `NUXT_PUBLIC_ENABLE_RECIPES=false` and `NUXT_PUBLIC_ENABLE_BLOG=false` in `.env`. Their nav links and pages are hidden automatically.

**Q: Where do I put product images?**
Add them to `apps/my-store/public/images/` and reference them in Google Sheets as `/images/yourimage.webp`. Run `npm run optimize-images` to generate WebP versions automatically.

---

## 📄 License

MIT — Built as a reference architecture for scalable, zero-cost e-commerce storefronts.
