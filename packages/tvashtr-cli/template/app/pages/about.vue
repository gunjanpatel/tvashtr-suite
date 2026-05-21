<template>
  <div>
    <!-- Hero -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <div class="space-y-6">
          <p class="text-xs font-medium text-accent-400 uppercase tracking-widest">Our Story</p>
          <h1 class="font-serif text-5xl leading-tight" style="color: var(--text-primary)">Where freshness matters more than profit</h1>
          <p class="leading-relaxed" style="color: var(--text-secondary)">
            It is not a business — it's a small personal setup started to help friends and community members enjoy truly exceptional products without any commercial markup or complexity. What began as a simple hobby at home naturally grew into a shared community convenience: small-batch products, crafted only when needed, with clean ingredients and no shortcuts.
          </p>
          <p class="leading-relaxed" style="color: var(--text-secondary)">
            We do not aim to scale, expand, or turn this into a profit‑driven operation. We keep things small so the quality stays high, the process stays simple, and everyone gets products that feel personal and made with care.
          </p>
        </div>
        <div class="rounded-3xl overflow-hidden aspect-[4/3]">
          <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=85" alt="Organic farm" class="w-full h-full object-cover" />
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="py-16 transition-colors duration-200" style="background-color: var(--bg-muted)">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 class="font-serif text-3xl text-center mb-12" style="color: var(--text-primary)">What we aim for</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div v-for="value in values" :key="value.title" class="text-center space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto">
              <span class="text-3xl">{{ value.icon }}</span>
            </div>
            <h3 class="font-serif text-xl" style="color: var(--text-primary)">{{ value.title }}</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-muted)">{{ value.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <h2 class="font-serif text-3xl mb-10" style="color: var(--text-primary)">Meet the team</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div
          v-for="member in team" :key="member.name"
          class="rounded-2xl border p-6 space-y-3 shadow-sm transition-colors duration-200"
          style="background-color: var(--bg-surface); border-color: var(--border)"
        >
          <img :src="member.photo" :alt="member.name" class="w-16 h-16 rounded-full object-cover" />
          <div>
            <p class="font-serif text-lg" style="color: var(--text-primary)">{{ member.name }}</p>
            <p class="text-xs text-accent-400 font-medium">{{ member.role }}</p>
          </div>
          <p class="text-sm leading-relaxed" style="color: var(--text-muted)">{{ member.bio }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { siteName } from '~~/store.config'

useHead({ title: `About Us — ${siteName}` })

const values = [
  { icon: '🍃', title: 'Quality First', desc: 'Each batch is prepared on demand so you always get the product at its peak taste, texture, and quality.' },
  { icon: '🪟', title: 'Simplicity & Transparency', desc: 'No complicated systems. No hidden additives. Just clean ingredients, freshly prepared — exactly as you choose.' },
  { icon: '🤝', title: 'Care in Every Step', desc: 'This is a small, friend‑circle operation. Orders are handled personally, and quality is checked at every step.' },
]

const team = [
  { name: 'John Doe', role: 'Founder', photo: 'https://gravatar.com/avatar/a71d5c71e4c2236145ec0b8058bf9508', bio: 'Creates every product with hands-on care, treating each order like a small piece of craft.' },
]
</script>
