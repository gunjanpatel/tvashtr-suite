# @tvashtr/google-sheets

> Zero-dependency headless CMS engine using Google Sheets via the Visualization API (gviz), supporting optimized image mapping and core catalog repositories.

`@tvashtr/google-sheets` lets you turn any standard Google Sheet into a fast, real-time e-commerce database for **$0/month**. It retrieves products and recipe data in real-time, parsing them into standard `@tvashtr/core` domain models.

---

## 📦 Installation

This package is designed to be used internally within the Tvashtr Suite monorepo npm workspace:

```json
{
  "dependencies": {
    "@tvashtr/google-sheets": "*"
  }
}
```

---

## 🚀 How it Works

Rather than requiring heavy, authenticated Google APIs or service account keys, this package queries sheets using the **Google Visualization API (`gviz/tq`)**.

1. It requests the public JSON query endpoint: `https://docs.google.com/spreadsheets/d/{sheetId}/gviz/tq?tqx=out:json`
2. It parses the custom JSONP-like response into a standard JavaScript object.
3. It maps the column headers dynamically (ignoring case, spaces, and underscores), letting sheet creators name columns descriptively (e.g. `is_popular`, `qtyDefault`, `Variant Prices`).

---

## 🛠️ Key Modules

### 1. Google Sheets Client (`googleSheets.ts`)
Fetches and structures spreadsheet rows into a format with clean data retrieval helpers:
```typescript
import { fetchGoogleSheetRows } from '@tvashtr/google-sheets'

const rows = await fetchGoogleSheetRows('YOUR_PUBLIC_SHEET_ID')

const firstRowSku = rows[0].$get('sku') // Get string representation
const isActive = rows[0].$getRaw('active') // Get raw boolean/number representation
```

### 2. Catalog Repositories (`repositories.ts`)
Implements `@tvashtr/core` repository contracts to map spreadsheet rows directly to fully-typed domain models:

#### `GoogleSheetsProductRepository`
Pulls product listings. It dynamically decodes variant pricing systems (e.g., standard price or comma-separated variant lists with prices like `Small:10, Large:15`):
```typescript
import { GoogleSheetsProductRepository } from '@tvashtr/google-sheets'

const productRepo = new GoogleSheetsProductRepository(sheetId, optimizedImagesSet)
const products = await productRepo.getAll()
```

#### `GoogleSheetsRecipeRepository`
Pulls recipes. It automatically splits ingredient lists by line breaks, strips bullets/dashes, and parses associated product links formatted as `sku:variant:qty`:
```typescript
import { GoogleSheetsRecipeRepository } from '@tvashtr/google-sheets'

const recipeRepo = new GoogleSheetsRecipeRepository(sheetId, optimizedImagesSet)
const recipes = await recipeRepo.getAll()
```

### 3. Image Resolver (`imageResolver.ts`)
When storefront images are optimized and exported to Cloudflare Pages (or static directories), this module matches original sheet images to their optimized static versions using a hash-mapped manifest file.
```typescript
import { resolveOptimizedImage } from '@tvashtr/google-sheets'

const imagePath = resolveOptimizedImage('/assets/original-flour.jpg', optimizedImagesSet)
// Returns the optimized hash-named path if it exists, or the fallback path
```

---

## 📊 Spreadsheet Formats

To successfully map rows to models, configure your Google Sheet tabs with these header names (column order does not matter):

### 🛍️ Products Tab
* `sku` — Unique identifier (e.g. `FLOUR-001`).
* `name` — Product display name.
* `price` — Baseline numerical price.
* `image` — Image URL or asset filename.
* `short` — Brief list-view description.
* `desc` — Detailed product details.
* `variants` — Comma-separated list (e.g. `1kg, 2kg`). Optional if `variant_prices` is structured as a mapping.
* `variant_prices` — Variant mapping (e.g. `1kg: 4.99, 2kg: 8.99`).
* `qty_default` — Default quantity when adding to cart.
* `active` — `TRUE` or `FALSE` (determines visibility).
* `is_popular` — `TRUE` or `FALSE` (renders inside slider).

### 🍳 Recipes Tab
* `slug` — Unique URL slug (e.g. `classic-sourdough`).
* `title` — Recipe title.
* `image` — Recipe cover image URL.
* `description` — Brief recipe hook.
* `category` — Recipe tag (e.g. `Bread`, `Pastry`).
* `prep_time` — Preparation time (e.g. `30 mins`).
* `cook_time` — Cooking time (e.g. `45 mins`).
* `ingredients` — List of ingredients (one per line, bullets optional).
* `content` — Complete instructions in Markdown.
* `recipe_products` — Associated product items to buy (e.g. `FLOUR-001:1kg:1, YEAST-002::2`).
* `active` — `TRUE` or `FALSE`.
* `is_popular` — `TRUE` or `FALSE`.

---

## 🏗️ Design Philosophy

1. **Native Web APIs**: Built entirely on standard fetch APIs, meaning it compiles perfectly on browser pages, standard server microservices, and edge runtimes (Cloudflare Workers).
2. **Zero Dependencies**: Zero dependencies (like `googleapis` or heavy HTTP parsers) ensure negligible bundle sizes and lightning-fast load times.
3. **Graceful Fault Tolerance**: Skips corrupted rows automatically instead of crashing, ensuring maximum storefront uptime even if non-technical administrators make input mistakes on the spreadsheet.
