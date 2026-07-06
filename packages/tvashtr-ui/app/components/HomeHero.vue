<template>
  <section aria-label="Hero Section" class="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Text -->
      <div class="space-y-6">
        <span
          v-if="subtitle"
          class="inline-block text-xs font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border"
          style="color: var(--accent); background-color: var(--accent-bg); border-color: var(--accent-border)"
        >
          {{ subtitle }}
        </span>
        <h1 class="font-serif text-5xl sm:text-6xl leading-[1.1] tracking-tight" style="color: var(--text-primary)" v-html="title">
        </h1>
        <p class="text-lg leading-relaxed max-w-md" style="color: var(--text-secondary)">
          {{ description }}
        </p>
        <div class="flex flex-wrap gap-3 pt-2">
          <NuxtLink
            v-if="ctaText && ctaLink"
            :to="ctaLink"
            class="bg-brand-500 hover:bg-brand-600 text-white font-medium px-7 py-3.5 rounded-full transition-colors text-sm"
          >
            {{ ctaText }}
          </NuxtLink>
        </div>
        <!-- Trust badges -->
        <div v-if="badges && badges.length" class="flex flex-wrap gap-5 pt-4">
          <div v-for="badge in badges" :key="badge.label" class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center">
              <span class="text-sm">{{ badge.icon }}</span>
            </span>
            <span class="text-xs font-medium" style="color: var(--text-secondary)">{{ badge.label }}</span>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class="relative h-96 lg:h-[500px]">
        <img
          :src="image"
          :alt="title"
          class="absolute inset-0 w-full h-full object-cover rounded-3xl"
          fetchpriority="high"
        />
        <!-- Floating card -->
        <div
          v-if="floatingLabel"
          class="absolute bottom-6 left-6 backdrop-blur-sm rounded-2xl p-4 shadow-lg flex items-center gap-3"
          style="background-color: color-mix(in srgb, var(--bg-surface) 95%, transparent)"
        >
          <div class="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
            <span class="text-lg">{{ floatingIcon }}</span>
          </div>
          <div>
            <p class="text-xs font-semibold" style="color: var(--text-primary)">{{ floatingLabel }}</p>
            <div class="flex gap-0.5 mt-0.5">
              <span v-for="i in 5" :key="i" class="text-accent-400 text-xs">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  description: string
  image: string
  ctaText?: string
  ctaLink?: string
  badges?: { icon: string; label: string }[]
  floatingLabel?: string
  floatingIcon?: string
}>()
</script>
