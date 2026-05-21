<template>
  <div>
    <template v-for="(section, idx) in homeSections" :key="idx">
      <HomeHero
        v-if="section.type === 'hero'"
        v-bind="section.props"
      />

      <HomeProductSlider
        v-else-if="section.type === 'products'"
        v-bind="section.props"
        :products="popularProducts"
      />

      <RecipeSection
        v-else-if="section.type === 'recipes'"
        v-bind="section.props"
        :recipes="featuredRecipes"
      />

      <HomeFeatures
        v-else-if="section.type === 'features'"
        v-bind="section.props"
      />

      <HomeCTA
        v-else-if="section.type === 'cta'"
        v-bind="section.props"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { buildHomeConfig } from '~/store/home.config'
import { siteName, siteTagline } from '~~/store.config'

useHead({ title: `${siteName} — ${siteTagline}` })

const config = useRuntimeConfig()
const FREE_DELIVERY_THRESHOLD = config.public.freeDeliveryThreshold as number
const { popularProducts } = useProducts()

const { $recipes } = useNuxtApp()
const featuredRecipes = computed(() => {
  return (($recipes as any) || [])
    .filter((r: any) => r.isPopular)
    .slice(0, 3)
})

const homeSections = computed(() => buildHomeConfig(FREE_DELIVERY_THRESHOLD))
</script>
