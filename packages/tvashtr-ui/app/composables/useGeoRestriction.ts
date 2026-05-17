/**
 * useGeoRestriction
 * Generic IP-based country gate.
 * The allowed country is read from runtimeConfig.public.allowedCountry.
 * Set NUXT_PUBLIC_ALLOWED_COUNTRY=DK  → Denmark-only (patel-flours default)
 * Set NUXT_PUBLIC_ALLOWED_COUNTRY=*   → allow all (service stores like OmCare)
 * Omit the env var                    → defaults to '*' (allow all)
 *
 * Returns:
 *   isAllowed  — true once confirmed allowed country (or country=*)
 *   isPending  — true while the geo-check is in flight
 *   isBlocked  — true if visitor is from a blocked country
 *   country    — the detected country name
 *
 * @deprecated alias useDenmarkOnly() is kept for backwards compatibility
 */

type Status = 'pending' | 'allowed' | 'blocked' | 'fail'

const status = ref<Status>('pending')
const country = ref('')
let checked = false

export function useGeoRestriction() {
  if (import.meta.client && !checked) {
    checked = true
    const config = useRuntimeConfig()
    const allowedCountry = (config.public.allowedCountry as string | undefined) ?? '*'
    const isMock = config.public.turnstileSiteKey === 'MOCK'

    if (isMock || allowedCountry === '*') {
      status.value = 'allowed'
    } else {
      fetch('http://ip-api.com/json/?fields=16387')
        .then((r) => r.json())
        .then((data: any) => {
          country.value = data.country ?? 'unknown'
          status.value = data.countryCode === allowedCountry ? 'allowed' : 'blocked'
        })
        .catch(() => {
          // On error, allow through — don't punish users for network issues
          status.value = 'allowed'
        })
    }
  }

  const isPending = computed(() => status.value === 'pending')
  const isAllowed = computed(() => status.value === 'allowed')
  const isBlocked = computed(() => status.value === 'blocked' || status.value === 'fail')

  return { isPending, isAllowed, isBlocked, country }
}

/** @deprecated Use useGeoRestriction() instead */
export const useDenmarkOnly = useGeoRestriction
