import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts}',
    '../../packages/tvashtr-ui/app/**/*.{vue,js,ts}',
    '../../packages/tvashtr-checkout/app/**/*.{vue,js,ts}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
