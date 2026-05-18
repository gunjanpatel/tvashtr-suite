# @tvashtr/ui

> A rich, high-performance Nuxt 4 UI Layer providing reusable e-commerce components, reactive state composables, and client-side plugins.

`@tvashtr/ui` is the frontend core of the Tvashtr Suite. Built as a native **Nuxt 4 Layer**, it automatically injects generic storefront components, reactive cart state managers, shipping threshold calculators, and geolocation boundary helpers into any tenant store application extending it.

---

## 📦 Installation

This package is designed to be used internally within the Tvashtr Suite monorepo npm workspace:

```json
{
  "dependencies": {
    "@tvashtr/ui": "*"
  }
}
```

### 🔌 Extending the Layer in your Store
To enable `@tvashtr/ui` inside an app, extend the package path inside your tenant's `nuxt.config.ts`:

```typescript
// apps/your-store-name/nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    '@tvashtr/ui' // Auto-imports all components, composables, and plugins!
  ],
  future: {
    compatibilityVersion: 4 // Requires Nuxt 4 architecture compatibility
  }
})
```

---

## 🧱 Reusable Storefront Components

All UI components are built using **Nuxt UI** and **TailwindCSS v4**, utilizing dynamic brand parameters specified inside each tenant store's `store.config.ts`.

### 🛒 Cart & Navigation
- **`NavBar.vue`**: Elegant, responsive navigation bar supporting custom logos, category listings, and a dynamic cart badge.
- **`CartDrawer.vue`**: Flyout side panel showing items in the cart, item quantities, variant options, shipping thresholds, and the checkout form with Turnstile forms embedded.
- **`FooterBar.vue`**: Clean, modular footer containing brand links, support contacts, and license labels.

### 🏷️ Product Cards & Sliders
- **`ProductCard.vue`**: Card component featuring high-quality images, interactive variant selectors, pricing, and "Add to Cart" triggers.
- **`ProductSlider.vue` & `HomeProductSlider.vue`**: Responsive sliders that display product arrays (e.g. popular items) in a clean, scrollable card line.

### 🍳 Recipe Hub
- **`RecipeCard.vue`**: Clean grids displaying recipe categories, prep times, and image covers.
- **`RecipeSection.vue`**: Full-page details listing markdown steps, bulleted ingredient check-boxes, and an interactive section letting customers add all matching ingredients to their shopping cart in a single click.

### 🛡️ Bot Security
- **`TurnstileWidget.vue`**: Standard wrapper component that mounts Cloudflare Turnstile's captcha client, emitting verification tokens securely upon human checks.

---

## 🧪 Reactive Composables

The package exports robust state engines to drive client-side actions:

### 🛍️ `useCart()`
Handles reactive shopping cart state, syncing choices to LocalStorage or client Cookies:
```typescript
const { cart, add, remove, updateQty, totalItems, totalPrice, clear } = useCart()

// Add item to shopping cart
add({
  sku: 'FLOUR-001',
  name: 'Wheat Flour',
  image: '/assets/flour.jpg',
  price: 4.99,
  variant: '1kg',
  qty: 1
})
```

### 🚚 `useDelivery()`
Manages delivery calculations, threshold limits, and free-shipping boundaries.
```typescript
const { selectedDelivery, deliveryOptions, subtotal, totalWithDelivery } = useDelivery()
```

### 📍 `useGeoRestriction()`
Prevents shipping submissions outside delivery perimeters (e.g., restricting postcodes to Danish region bounds `1000`-`9999` or specific local zones).
```typescript
const { isRestricted, checkPostcode } = useGeoRestriction()
```

---

## 🏗️ Design System & Theming

`@tvashtr/ui` does not lock you into a single aesthetic. It abstracts colors and fonts into Tailwind variables, letting storefronts create completely unique brand identities:

```css
/* apps/your-store-name/app/assets/main.css */
@theme {
  --color-primary-50: var(--ui-color-amber-50);
  --color-primary-500: var(--ui-color-amber-500);
  --color-primary-950: var(--ui-color-amber-950);
  
  --font-sans: 'Outfit', sans-serif;
}
```

---

## 🚀 Hydration Plugins (`app/plugins/`)

The UI layer automatically boots plugins to hydrate store data from sheet endpoints:
1. **`products.client.ts`**: Populates products state in the application during early initialization.
2. **`recipes.client.ts`**: Safely loads and parses sheet recipe lists.
3. **`delivery.client.ts`**: Validates initial cookie states for addresses and postcodes.
