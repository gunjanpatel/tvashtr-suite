<template>
  <div class="min-h-screen pt-24 pb-20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <header class="text-center mb-16">
        <h1 class="font-serif text-5xl sm:text-6xl mb-6" style="color: var(--text-primary)">Recipes & Stories</h1>
        <p class="text-lg max-w-2xl mx-auto" style="color: var(--text-secondary)">
          Discover ways to use our artisanal products, from traditional favorites to contemporary treats.
        </p>
      </header>
      <div v-if="allRecipes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <RecipeCard v-for="recipe in allRecipes" :key="recipe.slug" :recipe="recipe" />
      </div>
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-6">🫓</div>
        <h2 class="text-2xl font-serif mb-2" style="color: var(--text-primary)">No recipes found yet</h2>
        <p style="color: var(--text-secondary)">We're currently baking up some new content. Check back soon!</p>
        <NuxtLink to="/" class="mt-8 inline-block px-8 py-3 bg-brand-500 text-white rounded-full font-bold">Go Home</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '@tvashtr/core'

const config = useRuntimeConfig()
if (config.public.enableRecipes === false) {
  navigateTo('/')
}

const { $recipes } = useNuxtApp()
const allRecipes = ($recipes as Recipe[]) || []
import { siteName } from '~~/store.config'

useHead({ title: `Recipes | ${siteName}`, meta: [{ name: 'description', content: 'Explore our collection of artisanal recipes using our premium ingredients.' }] })
</script>
