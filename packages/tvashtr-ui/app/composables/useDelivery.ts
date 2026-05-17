import type { DeliveryOption } from '@tvashtr/checkout'

export function useDelivery() {
  const nuxtApp = useNuxtApp()
  const options = computed<DeliveryOption[]>(() => nuxtApp.$deliveryOptions as DeliveryOption[] ?? [])
  const error = computed<string | null>(() => nuxtApp.$deliveryError as string | null ?? null)
  return { options, error }
}
