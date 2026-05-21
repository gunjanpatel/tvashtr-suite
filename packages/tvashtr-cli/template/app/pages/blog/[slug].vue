<template>
  <div class="min-h-screen pt-24 pb-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <NuxtLink :to="localePath('/blog')" class="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors mb-10 group">
        <span class="text-xl transition-transform group-hover:-translate-x-1">←</span>
        {{ $t('blog.backToBlog') }}
      </NuxtLink>

      <article v-if="doc">
        <header class="mb-12 text-center">
          <div v-if="doc.meta?.category" class="mb-6">
            <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20">
              {{ doc.meta.category }}
            </span>
          </div>
          <h1 class="font-serif text-4xl sm:text-6xl mb-6 leading-tight" style="color: var(--text-primary)">
            {{ doc.title }}
          </h1>
          <p v-if="doc.meta?.date" class="text-sm font-medium" style="color: var(--text-muted)">
            {{ doc.meta.date }}
          </p>
        </header>

        <div v-if="doc.meta?.image" class="aspect-[16/9] rounded-[2rem] overflow-hidden mb-12 shadow-xl shadow-stone-900/5">
          <img :src="doc.meta.image" :alt="doc.title" class="w-full h-full object-cover" />
        </div>

        <div class="prose prose-lg max-w-none prose-brand blog-content">
          <ContentRenderer v-if="doc" :value="doc" />
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
if (!config.public.enableBlog) {
  navigateTo('/')
}

const route = useRoute()
const localePath = useLocalePath()

const { data: doc } = await useAsyncData(`blog-${route.path}`, () => {
  return queryCollection('blog').path(route.path).first()
})

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}
</script>

<style scoped>
.blog-content :deep(h1), .blog-content :deep(h2), .blog-content :deep(h3), .blog-content :deep(h4) {
  font-family: 'DM Serif Display', Georgia, serif;
  color: var(--text-primary);
  font-weight: normal;
}
.blog-content :deep(h2) { font-size: 2rem; margin-top: 2em; margin-bottom: 0.8em; }
.blog-content :deep(h3) { font-size: 1.5rem; margin-top: 1.5em; margin-bottom: 0.6em; }
.blog-content :deep(p) { color: var(--text-secondary); line-height: 1.8; margin-bottom: 1.5em; }
.blog-content :deep(ol), .blog-content :deep(ul) { margin-bottom: 2em; color: var(--text-secondary); }
.blog-content :deep(li) { margin-bottom: 0.8em; line-height: 1.6; }
.blog-content :deep(strong) { color: var(--text-primary); font-weight: 600; }
.blog-content :deep(li::marker) { color: var(--color-primary-500); font-weight: bold; }
.blog-content :deep(a) { color: var(--color-primary-500); text-decoration: underline; text-underline-offset: 4px; }
.blog-content :deep(blockquote) { 
  border-left: 4px solid var(--color-primary-500);
  padding-left: 1.5em;
  font-style: italic;
  color: var(--text-secondary);
  margin-y: 2em;
}
</style>
