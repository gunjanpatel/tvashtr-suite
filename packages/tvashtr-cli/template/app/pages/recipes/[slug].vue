<template>
  <div v-if="recipe" class="min-h-screen pt-24 pb-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <NuxtLink to="/recipes" class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors mb-10 group">
        <span class="text-xl transition-transform group-hover:-translate-x-1">←</span>
        Back to Recipes
      </NuxtLink>

      <header class="mb-12">
        <div class="flex items-center gap-4 mb-6">
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20">
            {{ recipe.category }}
          </span>
          <span class="text-[10px] font-bold uppercase tracking-widest" style="color: var(--text-muted)">Artisanal Recipe</span>
        </div>
        <h1 class="font-serif text-5xl sm:text-7xl mb-8 leading-tight" style="color: var(--text-primary)">{{ recipe.title }}</h1>
        <div class="aspect-[16/9] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl shadow-stone-900/10 border border-stone-200/10">
          <img :src="recipe.image" :alt="recipe.title" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-wrap items-center gap-10 py-8 border-y" style="border-color: var(--border)">
          <div v-if="recipe.prepTime" class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-muted)">Prep Time</span>
            <span class="text-lg font-medium" style="color: var(--text-primary)">{{ recipe.prepTime }}</span>
          </div>
          <div v-if="recipe.cookTime" class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-muted)">Cook Time</span>
            <span class="text-lg font-medium" style="color: var(--text-primary)">{{ recipe.cookTime }}</span>
          </div>
          <div v-if="linkedProduct" class="flex flex-col">
            <span class="text-[10px] font-bold uppercase tracking-widest mb-1" style="color: var(--text-muted)">Main Product</span>
            <span class="text-lg font-medium" style="color: var(--text-primary)">{{ linkedProduct.name }}</span>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div class="lg:col-span-8">
          <div class="prose prose-lg max-w-none prose-brand recipe-content" v-html="renderedContent" />
          <div v-if="linkedProducts.length > 0" class="mt-16 p-10 rounded-[3rem] text-center relative overflow-hidden group border transition-colors" style="background-color: var(--bg-surface); border-color: var(--border)">
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style="background-color: var(--bg-muted)" />
            <div class="relative z-10">
              <span class="text-xs font-bold text-brand-500 uppercase tracking-[0.2em] mb-4 block">Stock your pantry</span>
              <h3 class="font-serif text-3xl mb-4" style="color: var(--text-primary)">Ready to bake this?</h3>
              <p class="mb-8 text-lg max-w-sm mx-auto" style="color: var(--text-secondary)">Get all the artisanal ingredients delivered to your door in one go.</p>
              <div class="flex flex-col items-center gap-4">
                <button @click="buyAll" class="inline-flex items-center gap-4 px-12 py-5 bg-brand-500 text-white rounded-full font-bold shadow-xl shadow-brand-500/20 hover:scale-105 transition-all active:scale-95">
                  Buy All Ingredients
                  <span class="text-xl">🛒</span>
                </button>
                <p class="text-xs font-medium" style="color: var(--text-muted)">Including: {{ linkedProducts.map(p => p.product.name).join(', ') }}</p>
              </div>
            </div>
          </div>
        </div>

        <aside class="lg:col-span-4">
          <div class="sticky top-32 p-10 rounded-[2.5rem] border shadow-sm" style="background-color: var(--bg-surface); border-color: var(--border)">
            <h3 class="font-serif text-2xl mb-8" style="color: var(--text-primary)">Ingredients</h3>
            <ul class="space-y-6">
              <li v-for="(ingredient, i) in recipe.ingredients" :key="i" class="flex items-start gap-4 text-sm leading-relaxed" style="color: var(--text-secondary)">
                <span class="flex-shrink-0 w-2 h-2 rounded-full bg-brand-500 mt-1.5" />
                {{ ingredient }}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center pt-24 pb-20">
    <div class="text-center">
      <div class="text-6xl mb-6">🔍</div>
      <h2 class="text-2xl font-serif mb-4" style="color: var(--text-primary)">Recipe not found</h2>
      <NuxtLink to="/recipes" class="text-brand-500 font-bold hover:underline">Back to all recipes</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { Recipe, Product } from '@tvashtr/core'

const config = useRuntimeConfig()
if (config.public.enableRecipes === false) {
  navigateTo('/')
}

const route = useRoute()
const router = useRouter()
const { $recipes, $products } = useNuxtApp()
const cart = useCart()

const slug = route.params.slug as string
const recipe = computed(() => ($recipes as Recipe[]).find(r => r.slug === slug))

const renderedContent = computed(() => {
  if (!recipe.value?.content) return ''
  return marked.parse(recipe.value.content)
})

const linkedProducts = computed(() => {
  if (!recipe.value?.recipeProducts) return []
  return recipe.value.recipeProducts.map(item => {
    const product = ($products as Product[]).find(p => p.sku === item.sku)
    if (!product) return null
    const resolvedVariant = item.variant || product.variants[0] || 'Default'
    const price = product.variantPrices[resolvedVariant] || product.price
    return { product, variant: resolvedVariant, qty: item.qty, price }
  }).filter((p): p is any => p !== null)
})

const linkedProduct = computed(() => linkedProducts.value[0]?.product ?? null)

function buyAll() {
  if (linkedProducts.value.length === 0) return
  for (const item of linkedProducts.value) {
    cart.add({
      sku: item.product.sku,
      name: item.product.name,
      variant: item.variant,
      price: item.price,
      image: item.product.image,
      qty: item.qty
    })
  }
  router.push('/checkout')
}

import { siteName } from '~~/store.config'

useHead({
  title: recipe.value ? `${recipe.value.title} | ${siteName}` : `Recipe | ${siteName}`,
  meta: [{ name: 'description', content: recipe.value?.description || '' }]
})
</script>

<style scoped>
.recipe-content :deep(h2) { font-family: 'DM Serif Display', Georgia, serif; color: var(--text-primary); font-size: 1.875rem; margin-top: 2em; margin-bottom: 0.8em; font-weight: normal; }
.recipe-content :deep(h3) { font-family: 'DM Serif Display', Georgia, serif; color: var(--text-primary); font-size: 1.5rem; margin-top: 1.5em; margin-bottom: 0.6em; font-weight: normal; }
.recipe-content :deep(p) { color: var(--text-secondary); line-height: 1.8; margin-bottom: 1.5em; }
.recipe-content :deep(ol), .recipe-content :deep(ul) { margin-bottom: 2em; }
.recipe-content :deep(li) { color: var(--text-secondary); margin-bottom: 0.8em; line-height: 1.6; }
.recipe-content :deep(strong) { color: var(--text-primary); font-weight: 600; }
.recipe-content :deep(li::marker) { color: var(--color-primary-500); font-weight: bold; }
</style>
