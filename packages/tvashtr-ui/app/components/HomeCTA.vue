<template>
  <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
    <div class="bg-brand-500 rounded-3xl px-8 py-12 text-center space-y-5 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%);" />
      <h2 class="font-serif text-3xl sm:text-4xl text-white relative">{{ title }}</h2>
      <p v-if="description" class="text-brand-100 text-sm max-w-md mx-auto relative">{{ description }}</p>
      <NuxtLink
        v-if="ctaText && ctaLink"
        :to="ctaLink"
        class="inline-block bg-white text-brand-700 font-medium px-8 py-3.5 rounded-full hover:bg-stone-50 transition-colors text-sm relative"
      >
        {{ ctaText }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  ctaText?: string
  ctaLink?: string
}>()
</script>
