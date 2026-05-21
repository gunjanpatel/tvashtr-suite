<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">
    <div class="mb-8">
      <p class="text-xs font-medium text-accent-400 uppercase tracking-widest mb-2">Almost There</p>
      <h1 class="font-serif text-4xl" style="color: var(--text-primary)">Checkout</h1>
    </div>

    <template v-if="!isPending">
      <!-- Dev mode banner -->
      <div v-if="isDevMode" class="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3.5">
        <span class="text-amber-400 text-lg leading-none mt-0.5">⚠</span>
        <div class="text-sm">
          <p class="font-medium text-amber-400">Dev mode — orders saved to local SQLite</p>
          <p class="mt-0.5" style="color: var(--text-muted)">
            Orders stored in <code class="bg-amber-500/10 px-1 py-0.5 rounded text-xs">.data/orders.db</code>.
            Set <code class="bg-amber-500/10 px-1 py-0.5 rounded text-xs">NUXT_PUBLIC_WORKER_URL</code> to use your Cloudflare Worker.
          </p>
        </div>
      </div>

      <!-- Empty cart -->
      <div v-if="safeCart.length === 0 && !orderSuccess" class="text-center py-20 space-y-4">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style="background-color: var(--bg-muted)">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" style="color: var(--text-muted)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.889-7.143a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
        <p class="text-sm" style="color: var(--text-secondary)">Your cart is empty.</p>
        <NuxtLink to="/products" class="inline-block bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-7 py-3 rounded-full transition-colors">Shop Now</NuxtLink>
      </div>

      <!-- Success -->
      <Transition name="fade">
        <div v-if="orderSuccess" class="text-center py-16 space-y-5">
          <div class="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 class="font-serif text-3xl" style="color: var(--text-primary)">Order Placed!</h2>
          <p class="text-sm" style="color: var(--text-secondary)">
            {{ isDevMode ? 'Dev-mode order — saved to .data/orders.db.' : "Thank you! We'll be in touch shortly." }}
          </p>
          <div class="rounded-2xl px-6 py-4 inline-block" style="background-color: var(--bg-muted)">
            <p class="text-xs mb-1" style="color: var(--text-muted)">Order ID</p>
            <p class="font-mono text-brand-500 font-semibold text-lg">{{ orderId }}</p>
          </div>
          <div class="pt-2">
            <NuxtLink to="/products" class="inline-block bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-7 py-3 rounded-full transition-colors">Continue Shopping</NuxtLink>
          </div>
        </div>
      </Transition>

      <!-- Form -->
      <div v-if="safeCart.length > 0 && !orderSuccess" class="space-y-6">
        <!-- Order summary -->
        <div class="rounded-2xl border p-6 space-y-4" style="background-color: var(--bg-surface); border-color: var(--border)">
          <h2 class="font-serif text-xl" style="color: var(--text-primary)">Order Summary</h2>
          <div class="space-y-1">
            <div v-for="item in safeCart" :key="`${item.sku}-${item.variant}`" class="flex items-center gap-4 py-3 border-b last:border-0" style="border-color: var(--border-muted)">
              <img :src="item.image" :alt="item.name" class="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate" style="color: var(--text-primary)">{{ item.name }}</p>
                <p v-if="item.variant" class="text-xs" style="color: var(--text-muted)">{{ item.variant }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-sm font-semibold" style="color: var(--text-primary)">DKK {{ (item.price * item.qty).toFixed(2) }}</p>
                <p class="text-xs" style="color: var(--text-muted)">× {{ item.qty }}</p>
              </div>
            </div>
          </div>
          <div class="pt-1 space-y-1.5 border-t" style="border-color: var(--border-muted)">
            <div class="flex justify-between items-center pt-2">
              <span class="text-sm" style="color: var(--text-secondary)">Subtotal</span>
              <span class="text-sm" style="color: var(--text-primary)">DKK {{ itemsTotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm" style="color: var(--text-secondary)">Delivery{{ selectedDelivery ? ` (${selectedDelivery.title})` : '' }}</span>
              <span class="text-sm flex items-center gap-1.5">
                <span v-if="selectedDelivery && (selectedDelivery.price === 0 || (qualifiesForFreeExpress && selectedDelivery.freeAboveThreshold))" class="text-xs font-medium px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500">Free</span>
                <span v-else style="color: var(--text-primary)">{{ selectedDelivery ? `DKK ${selectedDelivery.price.toFixed(2)}` : '—' }}</span>
              </span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t" style="border-color: var(--border-muted)">
              <span class="font-medium" style="color: var(--text-secondary)">Total</span>
              <span class="text-xl font-semibold text-brand-500">DKK {{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery options -->
        <div class="rounded-2xl border p-6 space-y-4" style="background-color: var(--bg-surface); border-color: var(--border)">
          <div class="flex items-start justify-between gap-4">
            <h2 class="font-serif text-xl" style="color: var(--text-primary)">Delivery</h2>
            <div v-if="!qualifiesForFreeExpress && amountUntilFree > 0" class="text-right flex-shrink-0">
              <p class="text-xs" style="color: var(--text-muted)">Add <span class="font-semibold text-accent-400">DKK {{ amountUntilFree.toFixed(0) }}</span> more for</p>
              <p class="text-xs font-medium text-brand-500">free express delivery</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-if="selectableOptions.length === 0" class="text-sm" style="color: var(--text-muted)">Loading delivery options…</div>
            <label
              v-for="option in selectableOptions"
              :key="option.id"
              class="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors"
              :class="selectedDelivery?.key === option.key ? 'border-brand-500 bg-brand-500/5' : 'border-stone-200 hover:border-stone-300'"
            >
              <input v-model="selectedDelivery" type="radio" :value="option" class="mt-0.5 accent-brand-500" @change="errors.delivery = ''" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium" style="color: var(--text-primary)">{{ option.title }}</p>
                    <span v-if="qualifiesForFreeExpress && option.freeAboveThreshold" class="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500">Complimentary</span>
                  </div>
                  <p class="text-sm font-semibold text-brand-500 flex-shrink-0">
                    {{ option.price === 0 || (qualifiesForFreeExpress && option.freeAboveThreshold) ? 'Free' : `DKK ${option.price.toFixed(2)}` }}
                  </p>
                </div>
                <p v-if="option.description" class="text-xs mt-0.5" style="color: var(--text-muted)">{{ option.description }}</p>
                <p v-if="option.time" class="text-xs mt-1 font-medium" style="color: var(--text-secondary)">🕐 {{ option.time }}</p>
              </div>
            </label>
          </div>
          <p v-if="errors.delivery" class="text-xs text-red-400">{{ errors.delivery }}</p>
        </div>

        <!-- Payment Method -->
        <div class="rounded-2xl border p-6 space-y-4" style="background-color: var(--bg-surface); border-color: var(--border)">
          <h2 class="font-serif text-xl" style="color: var(--text-primary)">Payment Method</h2>
          <label class="flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors" :class="paymentMethod === 'payment_on_delivery' ? 'border-brand-500 bg-brand-500/5' : 'border-stone-200 hover:border-stone-300'">
            <input v-model="paymentMethod" type="radio" value="payment_on_delivery" class="mt-0.5 accent-brand-500" />
            <div>
              <p class="text-sm font-medium" style="color: var(--text-primary)">Payment on Delivery</p>
              <p class="text-xs mt-0.5">Cash helps us grow! 💵 Please pay in cash on delivery if possible. 🙏</p>
            </div>
          </label>
        </div>

        <!-- Your details -->
        <div class="rounded-2xl border p-6 space-y-5" style="background-color: var(--bg-surface); border-color: var(--border)">
          <h2 class="font-serif text-xl" style="color: var(--text-primary)">Your Details</h2>
          <div class="space-y-1.5">
            <label class="text-sm font-medium" style="color: var(--text-secondary)" for="name">Full Name</label>
            <input id="name" v-model="form.name" type="text" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.name ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.name = ''" />
            <p v-if="errors.name" class="text-xs text-red-400">{{ errors.name }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium" style="color: var(--text-secondary)" for="email">Email Address</label>
            <input id="email" v-model="form.email" type="email" placeholder="you@example.com" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.email ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.email = ''" />
            <p v-if="errors.email" class="text-xs text-red-400">{{ errors.email }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium" style="color: var(--text-secondary)" for="phone">Phone Number</label>
            <div class="flex items-center rounded-xl border overflow-hidden transition-colors" style="background-color: var(--bg-muted)" :class="errors.phone ? 'border-red-400' : 'border-transparent focus-within:border-brand-500'">
              <span class="pl-4 pr-2 text-sm font-medium flex-shrink-0" style="color: var(--text-secondary)">{{ phoneFlag }} {{ phonePrefix }}</span>
              <input id="phone" v-model="form.phone" type="tel" :placeholder="phonePlaceholder" class="flex-1 px-2 py-3 text-sm outline-none bg-transparent" style="color: var(--text-primary)" :maxlength="phoneMaxLength" @input="onPhoneInput" />
            </div>
            <p v-if="errors.phone" class="text-xs text-red-400">{{ errors.phone }}</p>
            <p class="text-xs" style="color: var(--text-muted)">{{ phoneHint }}</p>
          </div>
        </div>

        <!-- Delivery address -->
        <div class="rounded-2xl border p-6 space-y-5" style="background-color: var(--bg-surface); border-color: var(--border)">
          <h2 class="font-serif text-xl" style="color: var(--text-primary)">Delivery Address</h2>
          <div class="space-y-1.5">
            <label class="text-sm font-medium" style="color: var(--text-secondary)" for="street">Street Address</label>
            <input id="street" v-model="address.street" type="text" placeholder="Bredgade 12, 2. tv" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.street ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.street = ''" />
            <p v-if="errors.street" class="text-xs text-red-400">{{ errors.street }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium" style="color: var(--text-secondary)" for="postcode">Postcode</label>
              <input id="postcode" v-model="address.postcode" type="text" placeholder="2100" maxlength="4" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.postcode ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.postcode = ''" />
              <p v-if="errors.postcode" class="text-xs text-red-400">{{ errors.postcode }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium" style="color: var(--text-secondary)" for="city">City</label>
              <input id="city" v-model="address.city" type="text" placeholder="København Ø" class="w-full px-4 py-3 rounded-xl border text-sm transition-colors outline-none" style="background-color: var(--bg-muted); color: var(--text-primary)" :class="errors.city ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-brand-500'" @input="errors.city = ''" />
              <p v-if="errors.city" class="text-xs text-red-400">{{ errors.city }}</p>
            </div>
          </div>
        </div>

        <!-- Turnstile -->
        <TurnstileWidget v-if="turnstileSiteKey && turnstileSiteKey !== 'MOCK'" :site-key="turnstileSiteKey" @verified="turnstileToken = $event" @error="turnstileToken = ''" />

        <!-- API error -->
        <div v-if="apiError" class="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-start gap-2">
          <span class="mt-0.5">✕</span>{{ apiError }}
        </div>

        <!-- Submit -->
        <button
          class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-full transition-colors flex items-center justify-center gap-2"
          :disabled="submitting || (!!turnstileSiteKey && turnstileSiteKey !== 'MOCK' && !turnstileToken)"
          @click="submitOrder"
        >
          <svg v-if="submitting" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ submitting ? 'Placing Order…' : isDevMode ? 'Place Order (Dev Mode)' : 'Place Order' }}
        </button>
        <p class="text-center text-xs" style="color: var(--text-muted)">By placing an order you agree to our terms of service.</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DeliveryOption } from '@tvashtr/checkout'

const appConfig = useAppConfig() as any
const phoneConfig = appConfig.tvashtr?.checkout ?? {}
const phonePrefix = phoneConfig.phonePrefix ?? '+45'
const phoneFlag = phoneConfig.phoneFlag ?? '🇩🇰'
const phoneDigits = phoneConfig.phoneDigits ?? 8
const phoneHint = phoneConfig.phoneHint ?? '8-digit Danish mobile or landline number'
const phonePlaceholder = phoneConfig.phonePlaceholder ?? '12 34 56 78'
const phoneMaxLength = phoneConfig.phoneMaxLength ?? 11
import { siteName } from '~~/store.config'

useHead({ title: `Checkout — ${siteName}` })

const config = useRuntimeConfig()
const workerUrl: string = config.public.workerUrl ?? 'MOCK'
const turnstileSiteKey: string = config.public.turnstileSiteKey ?? ''
const turnstileToken = ref('')
const isDevMode = import.meta.dev || !workerUrl || workerUrl === 'MOCK'

const { isAllowed, isPending } = useDenmarkOnly()

const isServiceMode = computed(() => config.public.enableServiceMode)
const isCheckoutEnabled = computed(() => config.public.enableCheckout)

if (!isCheckoutEnabled.value || isServiceMode.value) {
  navigateTo('/')
}

watch(isAllowed, (allowed) => {
  if (!isPending.value && !allowed) navigateTo('/')
}, { immediate: false })

watch(isPending, (pending) => {
  if (!pending && !isAllowed.value) navigateTo('/')
})

const { cart, clear } = useCart()
const safeCart = computed(() => cart.value.filter((item) => item && item.sku && item.name && item.price >= 0))

const { options: allDeliveryOptions } = useDelivery()
const FREE_DELIVERY_THRESHOLD = config.public.freeDeliveryThreshold as number

const itemsTotal = computed(() => safeCart.value.reduce((sum, i) => sum + i.price * i.qty, 0))
const qualifiesForFreeExpress = computed(() => itemsTotal.value >= FREE_DELIVERY_THRESHOLD)

const selectableOptions = computed(() => {
  return allDeliveryOptions.value.filter(o => {
    if (o.alwaysShow) return true
    if (qualifiesForFreeExpress.value) return o.freeAboveThreshold
    else return !o.freeAboveThreshold
  })
})

const selectedDelivery = ref<DeliveryOption | null>(null)

watch([qualifiesForFreeExpress, allDeliveryOptions], () => {
  const current = selectedDelivery.value
  const isValid = current && selectableOptions.value.some((o) => o.key === current.key)
  if (!isValid) selectedDelivery.value = selectableOptions.value[0] ?? null
}, { immediate: true })

const deliveryPrice = computed(() => {
  if (!selectedDelivery.value) return 0
  if (qualifiesForFreeExpress.value && selectedDelivery.value.freeAboveThreshold) return 0
  return selectedDelivery.value.price
})
const total = computed(() => itemsTotal.value + deliveryPrice.value)
const amountUntilFree = computed(() => Math.max(0, FREE_DELIVERY_THRESHOLD - itemsTotal.value))

const form = reactive({ name: '', email: '', phone: '' })
const address = reactive({ street: '', city: '', postcode: '' })
const errors = reactive({ name: '', email: '', phone: '', street: '', city: '', postcode: '', delivery: '' })
const paymentMethod = ref<'payment_on_delivery'>('payment_on_delivery')
const submitting = ref(false)
const apiError = ref('')
const orderSuccess = ref(false)
const orderId = ref('')

const STORAGE_KEY = 'checkout_details'

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (data.form) Object.assign(form, data.form)
      if (data.address) Object.assign(address, data.address)
    } catch (e) { console.error('Failed to load checkout details:', e) }
  }
})

watch([form, address], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, address }))
}, { deep: true })

function onPhoneInput() {
  errors.phone = ''
  const digits = form.phone.replace(/\D/g, '').slice(0, phoneDigits)
  form.phone = digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

function validateDanishPhone(raw: string): boolean {
  return raw.replace(/\D/g, '').length === phoneDigits
}

function validateDanishPostcode(raw: string): boolean {
  const pc = raw.replace(/\s/g, '')
  if (!/^\d{4}$/.test(pc)) return false
  const n = parseInt(pc)
  return n >= 1000 && n <= 9999
}

function validate(): boolean {
  let valid = true
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ''))
  if (!form.name.trim() || form.name.trim().length < 2) { errors.name = 'Please enter your full name.'; valid = false }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim() || !emailRegex.test(form.email.trim())) { errors.email = 'Please enter a valid email address.'; valid = false }
  if (!validateDanishPhone(form.phone)) { errors.phone = 'Enter a valid 8-digit Danish phone number.'; valid = false }
  if (!address.street.trim() || address.street.trim().length < 3) { errors.street = 'Please enter your street address.'; valid = false }
  if (!address.city.trim() || address.city.trim().length < 2) { errors.city = 'Please enter your city.'; valid = false }
  if (!validateDanishPostcode(address.postcode)) { errors.postcode = 'Enter a valid Danish postcode (1000–9999).'; valid = false }
  if (!selectedDelivery.value) { errors.delivery = 'Please select a delivery option.'; valid = false }
  return valid
}

async function submitOrder() {
  if (!validate() || !isAllowed.value) return
  submitting.value = true
  apiError.value = ''

  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: `${phonePrefix} ${form.phone.trim()}`,
    address: { street: address.street.trim(), city: address.city.trim(), postcode: address.postcode.replace(/\s/g, '') },
    delivery: selectedDelivery.value!,
    items: safeCart.value.map((i) => ({ sku: i.sku, name: i.name, variant: i.variant, qty: i.qty, price: i.price })),
    total: total.value,
    payment_method: paymentMethod.value,
    turnstile_token: turnstileToken.value,
  }

  try {
    if (isDevMode) {
      const res = await $fetch<{ success: boolean; orderId: string }>('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload })
      if (res.success) { orderId.value = res.orderId; orderSuccess.value = true; clear() }
      else apiError.value = 'Something went wrong. Please try again.'
      return
    }
    const res = await $fetch<{ success: boolean; orderId: string }>(`${workerUrl}/order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload })
    if (res.success) { orderId.value = res.orderId; orderSuccess.value = true; clear() }
    else apiError.value = 'Something went wrong. Please try again.'
  } catch (e: any) {
    console.error('[checkout] error:', e)
    apiError.value = e?.data?.error ?? e?.message ?? 'Failed to reach the server. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
