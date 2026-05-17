import { siteName, siteTagline, logoLabel, logoText, brandConfig, navLinks, checkoutPhoneConfig } from './store.config'

export default defineAppConfig({
  ui: {
    primary: 'blue',
    neutral: 'slate',
  },

  tvashtr: {
    siteName,
    siteTagline,
    logoLabel,
    logoText,
    navLinks,
    emailBrand: brandConfig,

    checkout: {
      phonePrefix: checkoutPhoneConfig.prefix,
      phoneFlag: checkoutPhoneConfig.flag,
      phoneDigits: checkoutPhoneConfig.digits,
      phoneHint: checkoutPhoneConfig.hint,
      phonePlaceholder: checkoutPhoneConfig.placeholder,
      phoneMaxLength: checkoutPhoneConfig.maxLength,
    },
  },
})
