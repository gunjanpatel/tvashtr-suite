import type { BrandConfig } from '@tvashtr/notifications'

export const siteName = '__SITE_NAME__'
export const siteTagline = '__SITE_TAGLINE__'
export const logoLabel = '__LOGO_LABEL__'
export const logoText = '__LOGO_TEXT__'

export const brandConfig: BrandConfig = {
  name: '__SITE_NAME__',
  color: '__BRAND_COLOR__',
  colorLight: '__BRAND_COLOR_LIGHT__',
  colorAccent: '__BRAND_COLOR_ACCENT__',
}

export const checkoutPhoneConfig = {
  prefix: '__PHONE_PREFIX__',
  flag: '__PHONE_FLAG__',
  digits: __PHONE_DIGITS__,
  hint: '__PHONE_HINT__',
  placeholder: '__PHONE_PLACEHOLDER__',
  maxLength: __PHONE_MAX_LENGTH__,
}

export const navLinks = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.products', to: '/products' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.contact', to: '/contact' },
]
