<template>
  <NuxtLink
    :to="`/recipes/${recipe.slug}`"
    class="group block bg-white rounded-3xl overflow-hidden border border-transparent hover:border-brand-500/20 transition-all hover:shadow-xl hover:shadow-brand-500/5 h-full flex flex-col"
    style="background-color: var(--bg-surface)"
  >
    <div class="relative aspect-[4/3] overflow-hidden">
      <img
        :src="recipe.image"
        :alt="recipe.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div class="absolute top-4 left-4">
        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-brand-600 shadow-sm">
          {{ recipe.category }}
        </span>
      </div>
    </div>

    <div class="p-6 flex flex-col flex-1">
      <div class="flex items-center gap-3 mb-3 text-[10px] font-medium uppercase tracking-widest" style="color: var(--text-muted)">
        <span v-if="recipe.prepTime">Prep: {{ recipe.prepTime }}</span>
        <span v-if="recipe.prepTime && recipe.cookTime" class="w-1 h-1 rounded-full bg-stone-300" />
        <span v-if="recipe.cookTime">Cook: {{ recipe.cookTime }}</span>
      </div>

      <h3 class="font-serif text-xl mb-2 group-hover:text-brand-500 transition-colors" style="color: var(--text-primary)">
        {{ recipe.title }}
      </h3>

      <p class="text-sm line-clamp-2 flex-1" style="color: var(--text-secondary)">
        {{ recipe.description }}
      </p>

      <div class="mt-6 flex items-center text-xs font-bold text-brand-500 uppercase tracking-widest gap-2">
        Read Recipe
        <span class="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Recipe } from '@tvashtr/core'
defineProps<{ recipe: Recipe }>()
</script>
