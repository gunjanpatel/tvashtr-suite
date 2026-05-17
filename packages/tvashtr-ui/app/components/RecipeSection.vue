<template>
  <section v-if="featuredRecipes.length > 0" class="py-20 overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div class="max-w-xl text-center md:text-left">
          <p v-if="subtitle" class="text-xs font-bold text-brand-500 uppercase tracking-[0.2em] mb-3">{{ subtitle }}</p>
          <h2 class="font-serif text-4xl sm:text-5xl" style="color: var(--text-primary)">{{ title }}</h2>
        </div>
        <NuxtLink to="/recipes" class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors mx-auto md:mx-0">
          View All Recipes <span class="text-lg">→</span>
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RecipeCard v-for="recipe in featuredRecipes" :key="recipe.slug" :recipe="recipe" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Recipe } from '@tvashtr/core'
const props = defineProps<{ title: string; subtitle?: string; recipes?: Recipe[] }>()
const { $recipes } = useNuxtApp()
const allRecipes = ($recipes as Recipe[]) || []
const featuredRecipes = computed(() => {
  if (props.recipes) return props.recipes
  return [...allRecipes].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)).slice(0, 3)
})
</script>
