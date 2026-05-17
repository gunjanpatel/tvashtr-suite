export default defineNuxtConfig({
  routeRules: {
    '/**': { ssr: false },
  },

  extends: ['@tvashtr/ui'],

  build: {
    transpile: [
      '@tvashtr/core',
      '@tvashtr/google-sheets',
      '@tvashtr/notifications',
      '@tvashtr/checkout',
    ],
  },

  runtimeConfig: {
    public: {
      theme: process.env.NUXT_PUBLIC_THEME || 'default',
      enableCheckout: process.env.NUXT_PUBLIC_ENABLE_CHECKOUT !== 'false',
      enableServiceMode: process.env.NUXT_PUBLIC_ENABLE_SERVICE_MODE === 'true',
      enableRecipes: process.env.NUXT_PUBLIC_ENABLE_RECIPES !== 'false',
      enableBlog: process.env.NUXT_PUBLIC_ENABLE_BLOG === 'true',

      sheetId: process.env.NUXT_PUBLIC_SHEET_ID || 'MOCK',
      deliverySheetId: process.env.NUXT_PUBLIC_DELIVERY_SHEET_ID || '',
      workerUrl: process.env.NUXT_PUBLIC_WORKER_URL || 'MOCK',
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      freeDeliveryThreshold: Number(process.env.NUXT_PUBLIC_FREE_DELIVERY_THRESHOLD) || 399,
      recipeSheetId: process.env.NUXT_PUBLIC_RECIPE_SHEET_ID || '',
      allowedCountry: process.env.NUXT_PUBLIC_ALLOWED_COUNTRY || 'DK',
    },
  },

  modules: ['@nuxt/ui', '@nuxtjs/i18n', '@nuxt/content'],
  css: [process.env.NUXT_THEME_CSS || '~/assets/themes/default/main.css'],

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', flag: '🇬🇧', file: 'en.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: true,
    langDir: 'locales',
  },

  colorMode: {
    preference: 'system',
  },

  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
})
