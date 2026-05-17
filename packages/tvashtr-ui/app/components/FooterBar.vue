<template>
  <footer class="mt-20 border-t transition-colors duration-200" style="background-color: var(--bg-surface); border-color: var(--border)">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
      <!-- Brand -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center">
            <span class="text-white text-xs font-serif font-bold">{{ logoLabel }}</span>
          </span>
          <span class="font-serif text-xl" style="color: var(--text-primary)">{{ logoText }}</span>
        </div>
        <p class="text-sm leading-relaxed" style="color: var(--text-muted)">
          {{ $t('footer.brandDesc') }}
        </p>
      </div>
      <div class="space-y-4">
        <h4 class="font-medium mb-4" style="color: var(--text-primary)">{{ $t('footer.freshTitle') }}</h4>
        <p class="text-sm leading-relaxed" style="color: var(--text-muted)">
          {{ $t('footer.freshDesc') }}
        </p>
      </div>

      <!-- Quick links -->
      <div class="space-y-4">
        <h4 class="font-medium mb-4" style="color: var(--text-primary)">{{ $t('footer.quickLinks') }}</h4>
        <ul class="space-y-2.5">
          <li v-for="link in filteredNavLinks" :key="link.to">
            <NuxtLink :to="localePath(link.to)" class="text-sm transition-colors hover:text-brand-500" style="color: var(--text-muted)">
              {{ $t(link.key) }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t py-5 text-center text-xs" style="border-color: var(--border); color: var(--text-muted)">
      © {{ new Date().getFullYear() }} {{ siteName }}. {{ $t('footer.rights') }}
    </div>
  </footer>
</template>

<script setup lang="ts">
const appConfig = useAppConfig() as any
const navLinks = computed(() => appConfig.tvashtr?.navLinks ?? [])
const siteName = computed(() => appConfig.tvashtr?.siteName ?? '')
const logoLabel = computed(() => appConfig.tvashtr?.logoLabel ?? 'Logo')
const logoText = computed(() => appConfig.tvashtr?.logoText ?? siteName.value)

const localePath = useLocalePath()
const config = useRuntimeConfig()
const isRecipesEnabled = computed(() => config.public.enableRecipes !== false)
const isBlogEnabled = computed(() => config.public.enableBlog === true)

const filteredNavLinks = computed(() => {
  return navLinks.value.filter((link: any) => {
    if (link.to === '/recipes' && !isRecipesEnabled.value) return false
    if (link.to === '/blog' && !isBlogEnabled.value) return false
    return true
  })
})
</script>
