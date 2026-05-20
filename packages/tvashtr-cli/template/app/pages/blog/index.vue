<template>
  <div class="min-h-screen pt-24 pb-20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <header class="text-center mb-16">
        <h1 class="font-serif text-5xl sm:text-6xl mb-6" style="color: var(--text-primary)">{{ $t('blog.title') }}</h1>
        <p class="text-lg max-w-2xl mx-auto" style="color: var(--text-secondary)">
          {{ $t('blog.subtitle') }}
        </p>
      </header>

      <div v-if="posts && posts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <NuxtLink
          v-for="article in posts"
          :key="article.path"
          :to="localePath(article.path)"
          class="rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
          style="background-color: var(--bg-surface); border-color: var(--border)"
        >
          <!-- Image -->
          <div class="aspect-[16/10] overflow-hidden relative bg-stone-100 dark:bg-stone-800">
            <img
              v-if="article.meta?.image"
              :src="article.meta.image"
              :alt="article.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div v-if="article.meta?.category" class="absolute top-4 left-4">
              <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500 text-white shadow-sm">
                {{ article.meta.category }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 flex flex-col flex-1">
            <h3 class="font-serif text-2xl mb-3 leading-snug group-hover:text-brand-500 transition-colors" style="color: var(--text-primary)">
              {{ article.title }}
            </h3>
            <p class="text-sm leading-relaxed mb-6 line-clamp-3" style="color: var(--text-secondary)">
              {{ article.description }}
            </p>
            
            <div class="mt-auto pt-4 border-t flex items-center justify-between" style="border-color: var(--border)">
              <span class="text-xs font-medium" style="color: var(--text-muted)">
                {{ article.meta?.date }}
              </span>
              <span class="text-sm font-bold text-brand-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                {{ $t('blog.readMore') }} <span class="text-lg leading-none">→</span>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-6">📝</div>
        <h2 class="text-2xl font-serif mb-2" style="color: var(--text-primary)">{{ $t('blog.noPosts') }}</h2>
        <p style="color: var(--text-secondary)">{{ $t('blog.comingSoon') }}</p>
        <NuxtLink :to="localePath('/')" class="mt-8 inline-block px-8 py-3 bg-brand-500 text-white rounded-full font-bold">{{ $t('blog.goHome') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
if (!config.public.enableBlog) {
  navigateTo('/')
}

const localePath = useLocalePath()

const { data: posts } = await useAsyncData('blog-list', () => {
  return queryCollection('blog').all()
})

useHead({
  title: `Blog | ${config.public.theme}`,
  meta: [{ name: 'description', content: 'News, stories, and deep dives into our artisanal process.' }]
})
</script>
