# AGENT.md — Tvashtr Suite

Read this before making any change to the codebase.
Full architecture and deployment docs: `README.md`

---

## What this is

A monorepo framework for zero-cost, Google Sheets-backed Nuxt storefronts deployed on Cloudflare Pages + Workers. Production example instance: [flour.dk](https://flour.dk)

---

## Package map

| Package | Responsibility |
| :--- | :--- |
| `@tvashtr/core` | Types and interfaces only — zero logic, zero runtime |
| `@tvashtr/google-sheets` | gviz API client + concrete repository implementations |
| `@tvashtr/ui` | Vue components, composables, Nuxt plugins |
| `@tvashtr/checkout` | Order/enquiry services, bot protection, validators |
| `@tvashtr/notifications` | Telegram + Brevo email builders |
| `@tvashtr/cli` | Scaffolding CLI + store template (`/template`) |

---

## Principles

### SOLID

Follow SOLID, always when possible.

- **`@tvashtr/core` is interface-only.** No logic, no imports from other packages. Every new data type gets both a data interface and a repository interface here before any implementation is written.
- **Explicit `implements`.** Any class that has a matching interface in core must declare `implements <Interface>`. Structural typing alone is not sufficient — the declaration is the contract.
- **Open for extension.** Adding a new data source means creating a new repository class, not modifying existing ones.
- **Depend on abstractions.** Consumers (plugins, composables, pages) depend on interfaces from `@tvashtr/core`, not on concrete Google Sheets classes.

### DRY

Follow DRY, always when possible.

- **Plugin logic is centralised in `createSheetPlugin()`.** This factory in `@tvashtr/ui/app/utils/createSheetPlugin.ts` owns the full lifecycle: sheetId guard, image manifest fetch, `getAll()`, `provide()`, error key, logging. Do not inline this logic in individual plugins.
- **Search and filter logic is centralised in `useProductFilters()`.** This composable in `@tvashtr/ui/app/composables/useProductFilters.ts` owns search state, category filter state, URL query-param syncing, and computed filtered results. Do not re-implement any of this logic in tenant pages — call the composable.
- **Shared parsing patterns** — use these exact forms, never ad-hoc variations:
  - CSV columns: `raw.split(',').map(s => s.trim()).filter(Boolean)`
  - Boolean sheet cells: `val === true || String(val).toUpperCase() === 'TRUE'`
  - Variant/price pairs: `key:value` with `lastIndexOf(':')` split (supports colons in keys)

### Design-first

- Agree on schema and interaction model before writing any code.
- For any UI feature: settle data shape, edge cases, and empty states in discussion first.

---

## Layer rules

| Layer | Rule |
| :--- | :--- |
| `@tvashtr/core` | Types and interfaces only. No imports from any other package. |
| `@tvashtr/google-sheets` | Implements core interfaces. Depends on core only. |
| `@tvashtr/ui` | Consumes core types. Imports from google-sheets only in plugins. |
| `@tvashtr/checkout` | Backend logic only. No Vue, no Nuxt, no browser APIs. |
| `@tvashtr/notifications` | Pure functions. No side effects outside of their `notify()` call. |
| `cloudflare/worker.ts` | Entry point only — orchestrates services, owns no business logic. |

---

## UI conventions

- **Mobile-first.** Design and test at 375px before desktop.
- **Colors via CSS custom properties only.** Never hardcode hex in components. Use `var(--text-primary)`, `var(--bg-surface)`, `var(--border)`, `var(--color-brand-500)` etc.
- **Tailwind for spacing and layout. CSS vars for color and theme tokens.**
- **`scrollbar-hide` + right-edge CSS fade** for any horizontal scroll container.
- **URL state** for any filterable or paginated list — `useRoute` / `router.replace`. Prefer `useProductFilters()` over manual query-param management for product pages.
- **Global search state** is shared via `useState('search-query')`. NavBar writes it; `useProductFilters` reads and syncs it with `?q=`. Never create a separate search state in a page.
- **Mobile search** is exposed directly in the topbar via a magnifying-glass icon toggle, not inside the hamburger menu.
- **Empty states must offer a recovery action** — never just a message.
- **Transitions** use the existing `btn-swap` pattern (`out-in`, 150ms) for in-place state changes.

---

## Google Sheets conventions

| Data type | Sheet format |
| :--- | :--- |
| Boolean | `TRUE` / `FALSE` (case-insensitive) |
| CSV list | Comma-separated, whitespace-trimmed |
| Slug / ID | Lowercase kebab-case, unique per sheet |
| Variant prices | `label:price` pairs, comma-separated |
| Images | Root-relative path from `/public` (e.g. `/images/product.webp`) |

Column headers are normalised to lowercase with underscores stripped before lookup — `variantPrices`, `variant_prices`, and `variantprices` all resolve to the same column.

---

## Hard rules

- No logic in `@tvashtr/core`.
- No bespoke plugin lifecycle — use `createSheetPlugin()`. Exception: plugins with genuinely custom data parsing that have no repo class (e.g. `delivery.client.ts`).
- No `class Foo {` without `implements FooInterface` when an interface exists in core.
- No hardcoded colors in Vue components.
- No `any` outside of gviz API bridge code. If used, add an inline comment explaining why.
- No code before schema and UX are agreed.
- No manual search or filter state in tenant pages — use `useProductFilters(products, categories)` and destructure what you need.
