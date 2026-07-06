<template>
  <HomeHero
    v-if="product"
    :title="resolvedProps.title"
    :subtitle="resolvedProps.subtitle"
    :description="resolvedProps.description"
    :image="resolvedProps.image"
    :cta-text="resolvedProps.ctaText"
    :cta-link="resolvedProps.ctaLink"
    :badges="resolvedProps.badges"
    :floating-label="resolvedProps.floatingLabel"
    :floating-icon="resolvedProps.floatingIcon"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  sku: string
  title?: string
  subtitle?: string
  description?: string
  image?: string
  ctaText?: string
  ctaLink?: string
  badges?: { icon: string; label: string }[]
  floatingLabel?: string
  floatingIcon?: string
}>()

const { products } = useProducts()
const product = computed(() => products.value.find((p) => p.sku === props.sku))

const resolvedProps = computed(() => {
  const p = product.value

  return {
    title: props.title ?? p?.name ?? '',
    subtitle: props.subtitle,
    description: props.description ?? p?.short ?? '',
    image: props.image ?? p?.image ?? '',
    ctaText: props.ctaText ?? 'Shop Now',
    ctaLink: props.ctaLink ?? `/product/${props.sku}`,
    badges: props.badges,
    floatingLabel: props.floatingLabel,
    floatingIcon: props.floatingIcon,
  }
})
</script>
