<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-14">
    <div class="mb-10 text-center md:text-left">
      <p class="text-xs font-medium text-accent-400 uppercase tracking-widest mb-2">Say Hello</p>
      <h1 class="font-serif text-4xl sm:text-5xl mb-3" style="color: var(--text-primary)">Get in Touch</h1>
      <p class="max-w-md" style="color: var(--text-secondary)">We'd love to hear from you — questions about an order, a product, or just a chat about organic food.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-16">
      <!-- Contact Info -->
      <div class="lg:col-span-4 space-y-8">
        <div class="space-y-6">
          <div v-for="info in contactInfo" :key="info.label" class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <span class="text-xl">{{ info.icon }}</span>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide mb-1" style="color: var(--text-muted)">{{ info.label }}</p>
              <p class="text-base font-medium" style="color: var(--text-primary)">{{ info.value }}</p>
            </div>
          </div>
        </div>

        <div class="pt-8 border-t" style="border-color: var(--border)">
          <p class="text-xs font-medium uppercase tracking-wide mb-4" style="color: var(--text-muted)">Hours</p>
          <div class="space-y-2 text-sm" style="color: var(--text-secondary)">
            <p>Mon–Fri: 9am – 6pm CET</p>
            <p>Sat: 10am – 3pm CET</p>
            <p class="text-stone-400">Sun: Closed</p>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="lg:col-span-8">
        <div v-if="success" class="bg-brand-500/10 border border-brand-500/30 rounded-3xl p-10 text-center space-y-4">
          <div class="w-16 h-16 bg-brand-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
          <h2 class="font-serif text-2xl" style="color: var(--text-primary)">Message Sent!</h2>
          <p style="color: var(--text-secondary)">Thank you for reaching out. We've sent a copy of your enquiry to your email and will get back to you shortly.</p>
          <button @click="success = false" class="text-brand-500 font-medium hover:underline">Send another message</button>
        </div>

        <form v-else @submit.prevent="submit" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label class="text-sm font-medium" style="color: var(--text-secondary)" for="name">Your Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Your Name"
                required
                class="w-full px-4 py-3.5 rounded-xl border border-transparent focus:border-brand-500 outline-none text-sm transition-colors"
                style="background-color: var(--bg-muted); color: var(--text-primary)"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" style="color: var(--text-secondary)" for="email">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="email@example.com"
                required
                class="w-full px-4 py-3.5 rounded-xl border border-transparent focus:border-brand-500 outline-none text-sm transition-colors"
                style="background-color: var(--bg-muted); color: var(--text-primary)"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium" style="color: var(--text-secondary)" for="message">Message</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="5"
              placeholder="How can we help you?"
              required
              class="w-full px-4 py-3.5 rounded-xl border border-transparent focus:border-brand-500 outline-none text-sm transition-colors resize-none"
              style="background-color: var(--bg-muted); color: var(--text-primary)"
            ></textarea>
          </div>

          <!-- Honeypot (hidden from humans) -->
          <div class="hidden" aria-hidden="true">
            <input v-model="form.fax" type="text" name="fax" tabindex="-1" autocomplete="off" />
          </div>

          <!-- Bot protection -->
          <div class="pt-2">
            <TurnstileWidget
              v-if="turnstileSiteKey"
              :site-key="turnstileSiteKey"
              @verified="turnstileToken = $event"
              @error="turnstileToken = ''"
            />
          </div>

          <div v-if="error" class="text-sm text-red-500 flex items-center gap-2">
            <span>✕</span> {{ error }}
          </div>

          <button
            type="submit"
            class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm shadow-brand-500/20"
            :disabled="loading || (!!turnstileSiteKey && !turnstileToken)"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ loading ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { siteName } from '~~/store.config'

useHead({ title: `Contact — ${siteName}` })

const config = useRuntimeConfig()
const turnstileSiteKey = config.public.turnstileSiteKey
const workerUrl = config.public.workerUrl
const isDevMode = computed(() => !workerUrl || workerUrl === 'MOCK')

const contactInfo = [
  { icon: '✉️', label: 'Email', value: 'contact@example.com' },
]

const form = reactive({
  name: '',
  email: '',
  message: '',
  fax: '' // Honeypot field
})

const turnstileToken = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function submit() {
  if (loading.value) return
  loading.value = true
  error.value = ''

  const endpoint = (isDevMode.value || workerUrl === 'MOCK') ? '/api/enquiry' : `${workerUrl}/enquiry`

  try {
    const res = await $fetch<{ success: boolean }>(endpoint, {
      method: 'POST',
      body: {
        ...form,
        turnstile_token: turnstileToken.value
      }
    })

    if (res.success) {
      success.value = true
      form.name = ''
      form.email = ''
      form.message = ''
      form.fax = ''
      turnstileToken.value = ''
    }
  } catch (e: any) {
    console.error('[contact] submit error:', e)
    error.value = e.data?.message ?? 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
