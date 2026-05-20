<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
    <!-- Back -->
    <button
      class="flex items-center gap-1.5 text-sm mb-8 transition-colors hover:text-brand-500"
      style="color: var(--text-muted)"
      @click="$router.back()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      {{ $t('enquire.back') }}
    </button>

    <!-- Not found -->
    <div v-if="!product" class="text-center py-24 space-y-4">
      <p class="font-serif text-2xl" style="color: var(--text-muted)">{{ $t('product.notFound') }}</p>
      <NuxtLink :to="localePath('/products')" class="text-sm text-brand-500 underline underline-offset-2">{{ $t('product.browseAll') }}</NuxtLink>
    </div>

    <!-- Product detail -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <!-- Image -->
      <div class="rounded-3xl overflow-hidden aspect-square" style="background-color: var(--bg-muted)">
        <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
      </div>

      <!-- Info -->
      <div class="space-y-6 lg:pt-4">
        <div>
          <p class="text-xs font-medium text-accent-400 uppercase tracking-widest mb-2">{{ product.sku }}</p>
          <h1 class="font-serif text-4xl leading-tight mb-3" style="color: var(--text-primary)">{{ product.name }}</h1>
          <p class="leading-relaxed" style="color: var(--text-secondary)">{{ product.desc || product.short }}</p>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-2">
          <p class="text-3xl font-semibold text-brand-500">
            DKK {{ displayPrice.toFixed(2) }}
          </p>
          <span v-if="hasVariantPrices && selectedVariant" class="text-sm" style="color: var(--text-muted)">
            for {{ selectedVariant }}
          </span>
        </div>

        <!-- Variants -->
        <div v-if="product.variants && product.variants.length > 0" class="space-y-2">
          <label class="text-sm font-medium" style="color: var(--text-secondary)">{{ $t('product.size') }}</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in product.variants"
              :key="v"
              class="px-4 py-2 rounded-full text-sm border transition-colors"
              :class="selectedVariant === v ? 'bg-brand-500 text-white border-brand-500' : 'hover:border-brand-400'"
              :style="selectedVariant !== v ? `background-color: var(--bg-surface); color: var(--text-secondary); border-color: var(--border)` : ''"
              @click="selectedVariant = v"
            >
              {{ v }}
              <span v-if="product.variantPrices[v] !== undefined" class="ml-1 opacity-70">
                · DKK {{ product.variantPrices[v].toFixed(2) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div v-if="isCheckoutEnabled || isServiceMode" class="space-y-2">
          <label class="text-sm font-medium" style="color: var(--text-secondary)">{{ $t('product.quantity') }}</label>
          <div class="flex items-center gap-3">
            <button
              class="w-10 h-10 rounded-full border flex items-center justify-center transition-colors text-xl leading-none"
              style="border-color: var(--border); color: var(--text-secondary)"
              @click="qty = Math.max(1, qty - 1)"
            >−</button>
            <span class="w-8 text-center font-medium" style="color: var(--text-primary)">{{ qty }}</span>
            <button
              class="w-10 h-10 rounded-full border flex items-center justify-center transition-colors text-xl leading-none"
              style="border-color: var(--border); color: var(--text-secondary)"
              @click="qty++"
            >+</button>
          </div>
        </div>

        <!-- Add to cart -->
        <button
          v-if="isCheckoutEnabled || isServiceMode"
          class="w-full text-white font-medium py-4 rounded-full transition-colors flex items-center justify-center gap-2"
          :class="product.active ? 'bg-brand-500 hover:bg-brand-600' : 'bg-stone-500 cursor-not-allowed'"
          :disabled="!product.active"
          @click="handleAction"
        >
          <svg v-if="!isServiceMode" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.889-7.143a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <span v-if="isServiceMode">{{ $t('common.sendEnquiry') }}</span>
          <span v-else>{{ $t('product.addToCart') }} — DKK {{ (displayPrice * qty).toFixed(2) }}</span>
        </button>

        <!-- Added feedback -->
        <Transition name="fade">
          <div v-if="addedFeedback" class="flex items-center gap-2 text-sm text-brand-500 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {{ $t('product.addedFeedback') }}
          </div>
        </Transition>

        <!-- Features -->
        <div v-if="isCheckoutEnabled" class="border-t pt-6 grid grid-cols-2 gap-4" style="border-color: var(--border)">
          <div v-for="f in productFeatures" :key="f.label" class="flex items-center gap-2.5">
            <span class="text-base">{{ f.icon }}</span>
            <span class="text-xs" style="color: var(--text-muted)">{{ f.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@tvashtr/core'

import { siteName } from '~~/store.config'

const route = useRoute()
const sku = computed(() => route.params.sku as string)
const { products } = useProducts()
const { add } = useCart()
const cartOpen = useState('cart-open', () => false)
const localePath = useLocalePath()

const config = useRuntimeConfig()
const isServiceMode = computed(() => config.public.enableServiceMode)
const isCheckoutEnabled = computed(() => config.public.enableCheckout)

const product = computed(() =>
  (products.value as Product[]).find((p) => p.sku === sku.value) ?? null
)

useHead({
  title: product.value ? `${product.value.name} — ${siteName}` : `Product — ${siteName}`,
})

const selectedVariant = ref('')
const qty = ref(1)
const addedFeedback = ref(false)

const hasVariantPrices = computed(() =>
  product.value ? Object.keys(product.value.variantPrices).length > 0 : false
)

const displayPrice = computed(() => {
  if (!product.value) return 0
  const vp = product.value.variantPrices[selectedVariant.value]
  return vp !== undefined ? vp : product.value.price
})

watch(product, (p) => {
  if (!p) return
  qty.value = p.qtyDefault ?? 1
  selectedVariant.value = p.variants.length > 0 ? p.variants[0] : ''
}, { immediate: true })

function handleAction() {
  if (!product.value || !product.value.active) return

  if (isServiceMode.value) {
    navigateTo(localePath({
      path: '/enquire',
      query: { sku: product.value.sku, variant: selectedVariant.value, qty: qty.value }
    }))
    return
  }

  add({
    sku: product.value.sku,
    name: product.value.name,
    image: product.value.image,
    price: displayPrice.value,
    variant: selectedVariant.value,
    qty: qty.value,
  })
  addedFeedback.value = true
  setTimeout(() => {
    addedFeedback.value = false
    cartOpen.value = true
  }, 800)
}

const freeDeliveryThreshold = config.public.freeDeliveryThreshold as number

const productFeatures = [
  { icon: '🚚', label: `Free Neighborhood Delivery over DKK ${freeDeliveryThreshold}` },
]
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
