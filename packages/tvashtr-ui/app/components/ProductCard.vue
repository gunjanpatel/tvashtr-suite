<template>
  <div
    class="rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 group flex flex-col h-full"
    :class="product.active ? 'hover:shadow-md' : 'opacity-60'"
    style="background-color: var(--bg-surface); border-color: var(--border)"
  >
    <!-- Image -->
    <NuxtLink :to="`/product/${product.sku}`" class="block overflow-hidden aspect-square relative" style="background-color: var(--bg-muted)">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <span
        v-if="!product.active"
        class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-800/85 text-white text-[10px] font-semibold tracking-wide uppercase"
      >
        {{ $t('product.discontinued') }}
      </span>
    </NuxtLink>

    <!-- Body -->
    <div class="p-4 flex flex-col flex-1">
      <NuxtLink :to="`/product/${product.sku}`" class="hover:text-brand-500 transition-colors">
        <h3 class="font-serif text-base leading-tight mb-1" style="color: var(--text-primary)">{{ product.name }}</h3>
      </NuxtLink>
      <p class="text-xs mb-3 leading-relaxed line-clamp-3" style="color: var(--text-muted)">{{ product.short }}</p>

      <!-- Variant chips -->
      <div v-if="hasVariants" class="flex flex-wrap gap-1.5 mb-3">
        <button
          v-for="v in product.variants"
          :key="v"
          class="px-2.5 py-1 rounded-full text-xs border transition-colors leading-none"
          :class="selectedVariant === v ? 'bg-brand-500 text-white border-brand-500' : 'hover:border-brand-400'"
          :style="selectedVariant !== v ? `background-color: var(--bg-muted); color: var(--text-secondary); border-color: var(--border)` : ''"
          @click.prevent="selectedVariant = v"
        >
          {{ v }}
        </button>
      </div>

      <!-- Price row — Add button only shown for allowed visitors -->
      <div class="flex items-center justify-between mt-auto">
        <span class="text-brand-500 font-semibold text-base">
          DKK {{ displayPrice.toFixed(2) }}
        </span>

        <button
          v-if="isAllowed && (isCheckoutEnabled || isServiceMode)"
          class="text-white text-xs font-medium px-3.5 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 min-w-[72px] justify-center"
          :class="[
            !product.active ? 'bg-stone-400 cursor-not-allowed' :
            added ? 'bg-brand-600 scale-95' : 'bg-brand-500 hover:bg-brand-600'
          ]"
          :disabled="!product.active"
          @click.prevent="handleAction"
        >
          <Transition name="btn-swap" mode="out-in">
            <span v-if="added" key="added" class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {{ $t('product.added') }}
            </span>
            <span v-else key="add" class="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {{ isServiceMode ? $t('common.sendEnquiry') : $t('product.add') }}
            </span>
          </Transition>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@tvashtr/core'

const props = defineProps<{ product: Product }>()
const { add } = useCart()
const { isAllowed } = useGeoRestriction()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const isServiceMode = computed(() => config.public.enableServiceMode)
const isCheckoutEnabled = computed(() => config.public.enableCheckout)

const hasVariants = computed(() => props.product.variants.length > 0)
const selectedVariant = ref(props.product.variants[0] ?? '')
const added = ref(false)

watch(() => props.product.variants, (variants) => {
  if (variants.length && !variants.includes(selectedVariant.value)) {
    selectedVariant.value = variants[0]
  }
})

const displayPrice = computed(() => {
  const vp = props.product.variantPrices[selectedVariant.value]
  return vp !== undefined ? vp : props.product.price
})

function handleAction() {
  if (!props.product.active || added.value || !isAllowed.value) return

  if (isServiceMode.value) {
    navigateTo(localePath({
      path: '/enquire',
      query: { sku: props.product.sku, variant: selectedVariant.value }
    }))
    return
  }

  add({
    sku: props.product.sku,
    name: props.product.name,
    image: props.product.image,
    price: displayPrice.value,
    variant: selectedVariant.value,
    qty: props.product.qtyDefault ?? 1,
  })
  added.value = true
  setTimeout(() => { added.value = false }, 1800)
}
</script>

<style scoped>
.btn-swap-enter-active, .btn-swap-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.btn-swap-enter-from { opacity: 0; transform: translateY(4px); }
.btn-swap-leave-to   { opacity: 0; transform: translateY(-4px); }
</style>
