# @tvashtr/core

> Shared TypeScript domain models and SOLID interfaces for the Tvashtr Suite monorepo.

`@tvashtr/core` acts as the foundational package of the Tvashtr Suite. It contains only zero-runtime shared TypeScript interfaces, contracts, and type definitions. Every other package in the monorepo depends on `@tvashtr/core`.

---

## 📦 Installation

This package is designed to be used internally within the Tvashtr Suite monorepo npm workspace:

```json
{
  "dependencies": {
    "@tvashtr/core": "*"
  }
}
```

---

## 🛠️ Domain Models

This package defines the standard schemas for e-commerce entities, aligning the frontend UI layer with headless CMS structures (like Google Sheets):

### 🛍️ `Product`
Defines a standard product in the storefront catalog.
```typescript
export interface Product {
  sku: string
  name: string
  price: number
  image: string
  short: string
  desc: string
  variants: string[]
  variantPrices: Record<string, number>
  qtyDefault: number
  active: boolean
  isPopular: boolean
}
```

### 🍳 `Recipe`
Enables seamless content-commerce integration (recipes referencing products in the store).
```typescript
export interface Recipe {
  slug: string
  title: string
  image: string
  description: string
  category: string
  prepTime: string
  cookTime: string
  ingredients: string[]
  content: string // Markdown instructions
  recipeProducts: RecipeProductRef[]
  isPopular: boolean
  active: boolean
}

export interface RecipeProductRef {
  sku: string
  variant: string
  qty: number
}
```

### 🛒 `CartItem`
Standardizes the shopping cart payload structure.
```typescript
export interface CartItem {
  sku: string
  name: string
  image: string
  price: number
  variant: string
  qty: number
}
```

---

## 📐 SOLID Architecture Interfaces

To enforce decoupling and the Dependency Inversion Principle, `@tvashtr/core` defines standard interface contracts for crucial engine functions:

### 🛡️ `BotProtector`
Interface for verification strategies (e.g. Honeypot, Cloudflare Turnstile).
```typescript
export interface BotProtector {
  verify(payload: any, context: { ip: string }): Promise<void>
}
```

### 📣 `Notifier<T>`
Enables decoupled messaging (e.g. Brevo SMTP, Telegram API).
```typescript
export interface Notifier<T> {
  notify(payload: T): Promise<void>
}
```

### 🔍 `Validator<T>`
Standard validation interface for domain actions.
```typescript
export interface Validator<T> {
  validate(payload: Partial<T>): string | null
}
```

### 💾 `Repository<T>`
Centralizes persistence definitions.
```typescript
export interface Repository<T> {
  save(id: string, data: T): Promise<void>
}
```

### 🗃️ Data Fetching Repositories
Contracts implemented by the headless CMS layer (like `@tvashtr/google-sheets`):
```typescript
export interface ProductRepository {
  getAll(): Promise<Product[]>
}

export interface RecipeRepository {
  getAll(): Promise<Recipe[]>
}
```

---

## 🏗️ Design Philosophy

1. **Zero Runtime Overhead**: This package contains purely type declarations and interfaces. It compiles down to zero bytes in the production build.
2. **Strict Separation of Concerns**: By defining generic repository and notifier contracts here, backend engine code does not need to know whether notifications are sent via Telegram or email, nor does it need to know how products are stored.
3. **Deterministic Typings**: Ensures type safety across both frontend Nuxt apps and serverless backend workers in the monorepo.
