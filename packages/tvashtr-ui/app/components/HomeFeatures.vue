<template>
  <section aria-label="Features Section" class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div v-for="feature in features" :key="feature.title" class="text-center space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto">
          <span class="text-2xl">{{ feature.icon }}</span>
        </div>
        <h3 class="font-serif text-base" style="color: var(--text-primary)">{{ feature.title }}</h3>
        <p class="text-xs leading-relaxed" style="color: var(--text-muted)">{{ feature.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  features: { icon: string; title: string; desc: string }[]
}>()
</script>
