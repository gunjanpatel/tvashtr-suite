<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-8">
      <button
        class="flex items-center gap-1.5 text-sm mb-6 transition-colors hover:text-brand-500"
        style="color: var(--text-muted)"
        @click="$router.back()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        {{ $t('enquire.back') }}
      </button>

      <p class="text-xs font-medium text-accent-400 uppercase tracking-widest mb-2">{{ $t('enquire.subtitle') }}</p>
      <h1 class="font-serif text-4xl" style="color: var(--text-primary)">{{ $t('enquire.title') }}</h1>
    </div>

    <!-- Success -->
    <Transition name="fade">
      <div v-if="success" class="text-center py-16 space-y-5">
        <div class="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 class="font-serif text-3xl" style="color: var(--text-primary)">{{ $t('enquire.successTitle') }}</h2>
        <p class="text-sm" style="color: var(--text-secondary)">
          {{ $t('enquire.successDesc') }}
        </p>
        <div class="pt-2">
          <NuxtLink :to="localePath('/products')" class="inline-block bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-7 py-3 rounded-full transition-colors">{{ $t('enquire.back') }}</NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Form -->
    <div v-if="!success" class="space-y-6">
      
      <!-- Product Context -->
      <div v-if="productContext" class="rounded-2xl border p-6 flex items-center gap-4" style="background-color: var(--bg-surface); border-color: var(--border)">
        <div class="flex-1 min-w-0 space-y-1">
          <p class="text-xs font-medium uppercase tracking-widest" style="color: var(--text-muted)">{{ $t('enquire.productInfo') }}</p>
          <p class="text-base font-serif" style="color: var(--text-primary)">{{ productContext.sku }}</p>
          <p v-if="productContext.variant" class="text-sm" style="color: var(--text-secondary)">{{ $t('product.size') }}: {{ productContext.variant }}</p>
          <p v-if="productContext.qty" class="text-sm" style="color: var(--text-secondary)">{{ $t('product.quantity') }}: {{ productContext.qty }}</p>
        </div>
      </div>

      <!-- Your details -->
      <div class="rounded-2xl border p-6 space-y-5" style="background-color: var(--bg-surface); border-color: var(--border)">
        <div class="space-y-1.5">
          <label class="text-sm font-medium" style="color: var(--text-secondary)" for="name">{{ $t('enquire.name') }}</label>
          <input id="name" v-model="form.name" type="text" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.name ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.name = ''" />
          <p v-if="errors.name" class="text-xs text-red-400">{{ errors.name }}</p>
        </div>
        
        <div class="space-y-1.5">
          <label class="text-sm font-medium" style="color: var(--text-secondary)" for="email">{{ $t('enquire.email') }}</label>
          <input id="email" v-model="form.email" type="email" placeholder="you@example.com" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.email ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.email = ''" />
          <p v-if="errors.email" class="text-xs text-red-400">{{ errors.email }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium" style="color: var(--text-secondary)" for="phone">{{ $t('enquire.phone') }}</label>
          <input id="phone" v-model="form.phone" type="tel" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.phone ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.phone = ''" />
        </div>
        
        <div class="space-y-1.5">
          <label class="text-sm font-medium" style="color: var(--text-secondary)" for="message">{{ $t('enquire.message') }}</label>
          <textarea id="message" v-model="form.message" rows="4" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none resize-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.message ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.message = ''"></textarea>
          <p v-if="errors.message" class="text-xs text-red-400">{{ errors.message }}</p>
        </div>
      </div>

      <!-- Turnstile -->
      <TurnstileWidget v-if="turnstileSiteKey" :site-key="turnstileSiteKey" @verified="turnstileToken = $event" @error="turnstileToken = ''" />

      <!-- API error -->
      <div v-if="apiError" class="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
        <span class="mt-0.5">✕</span>{{ apiError }}
      </div>

      <!-- Submit -->
      <button
        class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-full transition-colors flex items-center justify-center gap-2"
        :disabled="submitting || (!!turnstileSiteKey && !turnstileToken)"
        @click="submitEnquiry"
      >
        <svg v-if="submitting" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ submitting ? $t('enquire.submitting') : $t('enquire.submit') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const route = useRoute()

useHead({ title: `${t('enquire.title')} — ${config.public.theme}` })

const turnstileSiteKey = config.public.turnstileSiteKey as string
const turnstileToken = ref('')

const isServiceMode = computed(() => config.public.enableServiceMode)

// If service mode is off, redirect to home
if (!isServiceMode.value) {
  navigateTo('/')
}

const productContext = computed(() => {
  if (!route.query.sku) return null
  return {
    sku: route.query.sku as string,
    variant: route.query.variant as string,
    qty: route.query.qty as string
  }
})

const form = reactive({ name: '', email: '', phone: '', message: '' })
const errors = reactive({ name: '', email: '', message: '' })
const submitting = ref(false)
const apiError = ref('')
const success = ref(false)

function validate(): boolean {
  let valid = true
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ''))
  
  if (!form.name.trim() || form.name.trim().length < 2) { 
    errors.name = 'Please enter your full name.'
    valid = false 
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim() || !emailRegex.test(form.email.trim())) { 
    errors.email = 'Please enter a valid email address.'
    valid = false 
  }

  if (!form.message.trim()) {
    errors.message = 'Please provide a message.'
    valid = false
  }

  return valid
}

async function submitEnquiry() {
  if (!validate()) return
  
  submitting.value = true
  apiError.value = ''

  let fullMessage = form.message.trim()
  if (productContext.value) {
    fullMessage += `\n\n--- Product Details ---\nSKU: ${productContext.value.sku}`
    if (productContext.value.variant) fullMessage += `\nVariant: ${productContext.value.variant}`
    if (productContext.value.qty) fullMessage += `\nQty: ${productContext.value.qty}`
  }

  if (form.phone.trim()) {
    fullMessage += `\nPhone: ${form.phone.trim()}`
  }

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    message: fullMessage,
    fax: '', // Honeypot
    turnstile_token: turnstileToken.value
  }

  try {
    const res = await $fetch<{ success: boolean }>('/api/enquiry', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: payload 
    })
    if (res.success) {
      success.value = true
    } else {
      apiError.value = 'Something went wrong. Please try again.'
    }
  } catch (e: any) {
    console.error('[enquire] error:', e)
    apiError.value = e?.data?.message ?? 'Failed to send enquiry. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
