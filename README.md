# Tvashtr Suite

> **Tvashtr** — The divine craftsman in Hindu beliefs. Within its realms lies a highly scalable monorepo framework designed to streamline the creation of multiple independent, production-ready e-commerce storefronts.

## 📖 Overview

Tvashtr Suite provides a "Store-in-a-Box" architecture. It completely decouples the generic e-commerce engine (UI, checkout logic, and notifications) from the individual store's identity, allowing you to spin up fully configured, white-label e-commerce applications in seconds.

All storefronts built on this suite are designed to be extremely cost-effective, typically operating at **$0/month** by leveraging the free tiers of the Cloudflare ecosystem (Pages, Workers, D1) and using Google Sheets as a headless CMS.

---

## 🏗️ Monorepo Architecture

Tvashtr Suite uses an npm workspace monorepo to manage shared logic (`packages/`) and independent store tenants (`apps/`).

```text
tvashtr-suite/
├── apps/
│   ├── patel-flours/       # Store 1 (Custom branding, Nuxt config)
│   └── omcare/             # Store 2 (Custom branding, Nuxt config)
│
├── packages/
│   ├── tvashtr-ui/         # Shared UI Components (Buttons, Cards, Inputs)
│   ├── tvashtr-checkout/   # Core Business Logic (Cart, Orders, Notifications)
│   ├── tvashtr-core/       # Core utilities and config patterns
│   └── tvashtr-cli/        # Local CLI tool (npx tvashtr create <store>)
```

### Flow Architecture

- **Frontend:** Each store runs as a Nuxt 4 SPA deployed to **Cloudflare Pages**. It imports shared components from `@tvashtr/ui`.
- **Backend:** Serverless API endpoints deployed as **Cloudflare Workers** handle order processing securely, utilizing logic from `@tvashtr/checkout`.
- **Database:** **Cloudflare D1** provides SQLite at the edge for storing orders.
- **CMS:** Product catalogs, recipes, and blog posts are fetched in real-time from **Google Sheets** (via gviz API).

---

## 🚀 Getting Started

### 1. Scaffold a New Store
Because the engine is decoupled from the identity, you can spin up a new store instantly from the repository root:

```bash
npx tvashtr create <your-store-name>
```

This generates a fully configured Nuxt 4 app inside `apps/<your-store-name>` with all boilerplate configuration files (`nuxt.config.ts`, `store.config.ts`, `tailwind.config.ts`, etc.).

### 2. Update Store Identity
Open `apps/<your-store-name>/store.config.ts`. This file acts as the **single source of truth** for your brand:
- Update `siteName`, `logoLabel`, and `checkoutPhoneConfig`.
- Define your custom CSS theme variables in `apps/<your-store-name>/app/assets/main.css` using Tailwind v4's `@theme` directive.

### 3. Setup Infrastructure
Configure your new store's Cloudflare backend:
1. Update `apps/<your-store-name>/cloudflare/wrangler.toml` with your identifiers.
2. Setup your Google Sheets for products.
3. Add API secrets for Turnstile, Telegram, and Brevo via `wrangler secret put`.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Nuxt 4 (SPA mode) |
| **UI** | Nuxt UI + TailwindCSS v4 |
| **CMS** | Google Sheets (gviz API) |
| **Frontend Hosting** | Cloudflare Pages |
| **Backend API** | Cloudflare Workers |
| **Database** | Cloudflare D1 |
| **Bot Protection** | Cloudflare Turnstile |
| **Notifications** | Telegram Bot API + Brevo SMTP |

---

## ✨ Features

- 🧱 **Feature Flags**: Toggle Checkout, Recipes, Blog, or Service Mode via `.env`.
- 🎨 **Dynamic Theming**: Create completely unique brand identities by simply changing CSS variables.
- 🛍️ **No-Code Product Management**: Add and edit products directly in Google Sheets without deploying.
- 🌍 **Multi-language**: Built-in support for i18n routing (e.g., English and Danish).
- 🤖 **Bot Protection**: Integrated Cloudflare Turnstile and honeypot forms.
- 📱 **Real-time Notifications**: Get instant alerts on Telegram and via email for orders and enquiries.
- 🔒 **Zero Secrets in Repo**: All sensitive values are stored securely in Cloudflare Worker secrets.

---

## 📄 License

This repository is built as a reference architecture for scalable, zero-cost e-commerce storefronts.
