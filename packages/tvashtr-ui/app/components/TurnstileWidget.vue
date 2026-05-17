<template>
  <div ref="container" />
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'verified', token: string): void; (e: 'error'): void }>()
const props = defineProps<{ siteKey: string }>()
const container = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!document.getElementById('cf-turnstile-script')) {
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  const render = () => {
    if (!container.value || !(window as any).turnstile) return
    ;(window as any).turnstile.render(container.value, {
      sitekey: props.siteKey,
      callback: (token: string) => emit('verified', token),
      'error-callback': () => emit('error'),
      theme: 'auto',
    })
  }

  if ((window as any).turnstile) {
    render()
  } else {
    const interval = setInterval(() => {
      if ((window as any).turnstile) { clearInterval(interval); render() }
    }, 100)
  }
})
</script>
