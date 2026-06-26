<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-8">
      <p class="text-xs font-medium text-accent-400 uppercase tracking-widest mb-2">Our Varieties</p>
      <h1 class="font-serif text-4xl sm:text-5xl mb-3" style="color: var(--text-primary)">All Products</h1>
      <p class="max-w-lg" style="color: var(--text-secondary)">Small-batch, premium quality items — made on demand for our community. Each order is prepared individually to ensure freshness, purity, and great taste.</p>
    </div>

    <!-- Error states -->
    <div v-if="productsError === 'SHEET_ID_MISSING'" class="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center space-y-3">
      <p class="font-medium text-red-400">Google Sheet ID not configured</p>
      <p class="text-sm text-red-400/80">Add <code class="bg-red-500/20 px-1.5 py-0.5 rounded">NUXT_PUBLIC_SHEET_ID=your_sheet_id</code> to your <code class="bg-red-500/20 px-1.5 py-0.5 rounded">.env</code> file and restart the dev server.</p>
    </div>
    <div v-else-if="productsError === 'FETCH_FAILED'" class="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center space-y-3">
      <p class="font-medium text-red-400">Could not load products</p>
      <p class="text-sm text-red-400/80">Make sure the sheet is shared as <strong>Anyone with the link → Viewer</strong> and the Sheet ID is correct.</p>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="pending">
      <!-- Filter bar skeleton -->
      <div class="flex gap-2 mb-8 overflow-hidden">
        <div v-for="i in 5" :key="i" class="h-9 rounded-full animate-pulse flex-shrink-0" :style="`width: ${60 + i * 15}px; background-color: var(--bg-surface)`" />
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        <div v-for="i in 8" :key="i" class="rounded-2xl h-72 animate-pulse border" style="background-color: var(--bg-surface); border-color: var(--border)" />
      </div>
    </div>

    <template v-else>
      <!-- Category filter bar — only render if categories exist -->
      <div v-if="categories.length > 0" class="relative mb-8">
        <!-- Scroll fade right edge -->
        <div class="absolute right-0 top-0 bottom-0 w-10 pointer-events-none z-10" style="background: linear-gradient(to right, transparent, var(--bg-page, #0d0d0d))" />

        <div
          ref="pillBarRef"
          class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          style="-webkit-overflow-scrolling: touch; scroll-snap-type: x proximity"
        >
          <!-- All pill -->
          <button
            class="filter-pill flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap"
            :class="activeFilters.size === 0 ? 'filter-pill--active' : 'filter-pill--idle'"
            @click="clearFilters"
          >
            All
            <span class="text-xs opacity-70 tabular-nums">{{ products.length }}</span>
          </button>

          <!-- Category pills -->
          <button
            v-for="cat in categories"
            :key="cat.slug"
            class="filter-pill flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap"
            :class="activeFilters.has(cat.slug) ? 'filter-pill--active' : 'filter-pill--idle'"
            @click="toggleFilter(cat.slug)"
          >
            {{ cat.name }}
            <span class="text-xs opacity-70 tabular-nums">{{ countForCategory(cat.slug) }}</span>
          </button>
        </div>
      </div>

      <!-- No products at all -->
      <div v-if="products.length === 0" class="text-center py-24 text-sm" style="color: var(--text-muted)">
        No products found in your sheet.
      </div>

      <template v-else>
        <!-- Zero results for active filters -->
        <div v-if="activeFilters.size > 0 && filteredProducts.length === 0" class="mb-10">
          <div class="rounded-2xl border px-6 py-8 text-center space-y-3" style="border-color: var(--border); background-color: var(--bg-surface)">
            <p class="font-medium" style="color: var(--text-primary)">No flours match all selected filters</p>
            <p class="text-sm" style="color: var(--text-muted)">Try removing a filter or browse everything below.</p>
            <button
              class="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-400 transition-colors font-medium"
              @click="clearFilters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          </div>

          <!-- Divider: show all products below -->
          <div class="flex items-center gap-3 mt-10 mb-6">
            <div class="flex-1 border-t" style="border-color: var(--border)" />
            <span class="text-xs font-medium uppercase tracking-widest" style="color: var(--text-muted)">All Products</span>
            <div class="flex-1 border-t" style="border-color: var(--border)" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <ProductCard v-for="product in products" :key="product.sku" :product="product" />
          </div>
        </div>

        <!-- Normal filtered grid -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          <ProductCard v-for="product in filteredProducts" :key="product.sku" :product="product" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { siteName } from '~~/store.config'

useHead({ title: `Products — ${siteName}` })

const nuxtApp = useNuxtApp()
const { products } = useProducts()
const { categories } = useCategories()
const productsError = computed(() => nuxtApp.$productsError as string | null)
const pending = ref(true)
onMounted(() => { pending.value = false })

// ── URL-synced filter state ────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()

const activeFilters = ref<Set<string>>(new Set(
  route.query.categories
    ? String(route.query.categories).split(',').filter(Boolean)
    : []
))

function toggleFilter(slug: string) {
  const next = new Set(activeFilters.value)
  next.has(slug) ? next.delete(slug) : next.add(slug)
  activeFilters.value = next
  syncUrl()
}

function clearFilters() {
  activeFilters.value = new Set()
  syncUrl()
}

function syncUrl() {
  const cats = [...activeFilters.value]
  router.replace({
    query: cats.length ? { ...route.query, categories: cats.join(',') } : { ...route.query, categories: undefined }
  })
}

// ── Filtered products (AND logic) ──────────────────────────────────────────
const filteredProducts = computed(() => {
  if (activeFilters.value.size === 0) return products.value
  return products.value.filter(p =>
    [...activeFilters.value].every(slug => p.categories.includes(slug))
  )
})

// ── Count per category (from all products, not filtered) ───────────────────
function countForCategory(slug: string): number {
  return products.value.filter(p => p.categories.includes(slug)).length
}

const pillBarRef = ref<HTMLElement | null>(null)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.filter-pill--active {
  background-color: var(--color-brand-500, #5b8a3c);
  color: #fff;
  border-color: transparent;
}

.filter-pill--idle {
  background-color: var(--bg-surface);
  color: var(--text-secondary);
  border-color: var(--border);
}

.filter-pill--idle:hover {
  border-color: var(--color-brand-500, #5b8a3c);
  color: var(--text-primary);
}
</style>
