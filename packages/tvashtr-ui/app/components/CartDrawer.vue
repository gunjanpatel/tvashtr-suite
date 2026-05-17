<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="cartOpen"
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        @click.self="cartOpen = false"
      />
    </Transition>

    <Transition name="slide-right">
      <aside
        v-if="cartOpen"
        class="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md shadow-2xl flex flex-col transition-colors duration-200"
        style="background-color: var(--bg-page)"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b" style="border-color: var(--border)">
          <h2 class="font-serif text-xl" style="color: var(--text-primary)">Your Cart</h2>
          <button
            class="p-2 rounded-full transition-colors hover:opacity-70"
            aria-label="Close cart"
            @click="cartOpen = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" :style="`color: var(--text-muted)`" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="safeCart.length === 0" class="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <div class="w-20 h-20 rounded-full flex items-center justify-center" style="background-color: var(--bg-muted)">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-9 h-9" :style="`color: var(--text-muted)`" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.889-7.143a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <p class="text-sm" style="color: var(--text-muted)">Your cart is empty.</p>
          <NuxtLink
            to="/products"
            class="text-sm font-medium text-brand-500 underline underline-offset-2"
            @click="cartOpen = false"
          >
            Browse Products
          </NuxtLink>
        </div>

        <!-- Cart items -->
        <div v-else class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div
            v-for="item in safeCart"
            :key="`${item.sku}-${item.variant}`"
            class="flex gap-4 rounded-2xl p-4 border"
            style="background-color: var(--bg-surface); border-color: var(--border)"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              loading="lazy"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate" style="color: var(--text-primary)">{{ item.name }}</p>
              <p v-if="item.variant" class="text-xs mt-0.5" style="color: var(--text-muted)">{{ item.variant }}</p>
              <p class="text-brand-500 font-semibold text-sm mt-1">DKK {{ (item.price * item.qty).toFixed(2) }}</p>
              <div class="flex items-center gap-2 mt-2">
                <button
                  class="w-7 h-7 rounded-full border flex items-center justify-center transition-colors text-lg leading-none"
                  style="border-color: var(--border); color: var(--text-secondary)"
                  @click="updateQty(item.sku, item.variant, item.qty - 1)"
                >−</button>
                <span class="text-sm font-medium w-5 text-center" style="color: var(--text-primary)">{{ item.qty }}</span>
                <button
                  class="w-7 h-7 rounded-full border flex items-center justify-center transition-colors text-lg leading-none"
                  style="border-color: var(--border); color: var(--text-secondary)"
                  @click="updateQty(item.sku, item.variant, item.qty + 1)"
                >+</button>
                <button
                  class="ml-auto p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  aria-label="Remove item"
                  @click="remove(item.sku, item.variant)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="safeCart.length > 0" class="border-t px-6 py-5 space-y-4" style="border-color: var(--border)">
          <div class="flex justify-between items-center">
            <span class="text-sm" style="color: var(--text-secondary)">Subtotal</span>
            <span class="font-semibold text-lg" style="color: var(--text-primary)">DKK {{ total.toFixed(2) }}</span>
          </div>
          <NuxtLink
            to="/checkout"
            class="block w-full text-center bg-brand-500 hover:bg-brand-600 text-white font-medium py-3.5 rounded-full transition-colors"
            @click="cartOpen = false"
          >
            Proceed to Checkout
          </NuxtLink>
          <button
            class="block w-full text-center text-sm transition-colors"
            style="color: var(--text-muted)"
            @click="clear"
          >
            Clear cart
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const cartOpen = useState('cart-open', () => false)
const { cart, total, updateQty, remove, clear } = useCart()
const safeCart = computed(() => cart.value.filter(
  (item) => item && item.sku && item.name && item.price >= 0
))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
</style>
