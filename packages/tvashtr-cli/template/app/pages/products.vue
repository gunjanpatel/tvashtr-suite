<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-10">
      <p class="text-xs font-medium text-accent-400 uppercase tracking-widest mb-2">Our Varieties</p>
      <h1 class="font-serif text-4xl sm:text-5xl mb-3" style="color: var(--text-primary)">All Products</h1>
      <p class="max-w-lg" style="color: var(--text-secondary)">Small-batch, premium quality items — made on demand for our community. Each order is prepared individually to ensure freshness, purity, and great taste. </p>
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
    <div v-else-if="pending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="i in 8" :key="i"
        class="rounded-2xl h-72 animate-pulse border"
        style="background-color: var(--bg-surface); border-color: var(--border)"
      />
    </div>

    <!-- Empty -->
    <div v-else-if="products.length === 0" class="text-center py-24 text-sm" style="color: var(--text-muted)">
      No products found in your sheet.
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <ProductCard v-for="product in products" :key="product.sku" :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { siteName } from '~~/store.config'

useHead({ title: `Products — ${siteName}` })
const nuxtApp = useNuxtApp()
const { products } = useProducts()
const productsError = computed(() => nuxtApp.$productsError as string | null)
const pending = ref(true)
onMounted(() => { pending.value = false })
</script>
