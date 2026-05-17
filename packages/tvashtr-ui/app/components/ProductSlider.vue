<template>
  <div class="relative">
    <div
      ref="sliderRef"
      class="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory items-stretch"
      @scroll="onScroll"
    >
      <div
        v-for="product in products"
        :key="product.sku"
        class="flex-shrink-0 w-56 snap-start flex flex-col"
      >
        <ProductCard :product="product" class="h-full" />
      </div>
    </div>

    <!-- Left arrow: only when there's content scrolled off to the left -->
    <Transition name="arrow-fade">
      <button
        v-if="canScrollLeft"
        class="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border shadow-sm items-center justify-center transition-colors hidden md:flex"
        style="background-color: var(--bg-surface); border-color: var(--border); color: var(--text-secondary)"
        aria-label="Scroll left"
        @click="scroll(-1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
    </Transition>

    <!-- Right arrow: only when more content exists to the right -->
    <Transition name="arrow-fade">
      <button
        v-if="canScrollRight"
        class="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border shadow-sm items-center justify-center transition-colors hidden md:flex"
        style="background-color: var(--bg-surface); border-color: var(--border); color: var(--text-secondary)"
        aria-label="Scroll right"
        @click="scroll(1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@tvashtr/core'

defineProps<{ products: Product[] }>()

const sliderRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateArrows() {
  const el = sliderRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function onScroll() { updateArrows() }

function scroll(direction: -1 | 1) {
  if (!sliderRef.value) return
  sliderRef.value.scrollBy({ left: direction * 260, behavior: 'smooth' })
}

onMounted(() => {
  updateArrows()
  setTimeout(updateArrows, 300)
  window.addEventListener('resize', updateArrows)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateArrows)
})
</script>

<style scoped>
.arrow-fade-enter-active,
.arrow-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.arrow-fade-enter-from,
.arrow-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.8);
}
</style>
