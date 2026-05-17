<template>
  <section class="py-16 transition-colors duration-200" :style="{ backgroundColor: bgColor || 'transparent' }">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p v-if="subtitle" class="text-xs font-medium text-accent-400 uppercase tracking-widest mb-2">{{ subtitle }}</p>
          <h2 class="font-serif text-3xl sm:text-4xl" style="color: var(--text-primary)">{{ title }}</h2>
        </div>
        <NuxtLink v-if="viewAllLink" :to="viewAllLink" class="text-sm font-medium text-brand-500 hover:text-brand-400 underline underline-offset-2 hidden sm:block">
          {{ viewAllText || 'View all' }}
        </NuxtLink>
      </div>
      <ProductSlider :products="products" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '@tvashtr/core'

defineProps<{
  title: string
  subtitle?: string
  products: Product[]
  viewAllLink?: string
  viewAllText?: string
  bgColor?: string
}>()
</script>
