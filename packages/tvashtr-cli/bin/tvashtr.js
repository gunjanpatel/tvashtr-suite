#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner,
  note,
  cancel,
  isCancel,
} from '@clack/prompts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templateDir = path.resolve(__dirname, '../template')

// ── Helpers ────────────────────────────────────────────────────────────────

function bail(message) {
  cancel(message)
  process.exit(0)
}

function checkCancel(value) {
  if (isCancel(value)) bail('Operation cancelled.')
  return value
}

/** Recursively replace every occurrence of a sentinel string in a file */
function replaceInFile(filePath, token, value) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf-8')
  if (!content.includes(token)) return
  fs.writeFileSync(filePath, content.replaceAll(token, value))
}

/** Apply replacements across a list of [filePath, token, value] tuples */
function applyReplacements(replacements) {
  for (const [file, token, value] of replacements) {
    replaceInFile(file, token, String(value))
  }
}

// ── Phone presets ─────────────────────────────────────────────────────────

const PHONE_PRESETS = {
  DK: { prefix: '+45', flag: '🇩🇰', digits: 8,  hint: '8-digit Danish number',  placeholder: '12 34 56 78', maxLength: 11 },
  US: { prefix: '+1',  flag: '🇺🇸', digits: 10, hint: '10-digit US number',      placeholder: '201-555-0123', maxLength: 14 },
  GB: { prefix: '+44', flag: '🇬🇧', digits: 10, hint: '10-digit UK number',       placeholder: '7911 123456', maxLength: 13 },
  IN: { prefix: '+91', flag: '🇮🇳', digits: 10, hint: '10-digit Indian number',   placeholder: '98765 43210', maxLength: 13 },
  AU: { prefix: '+61', flag: '🇦🇺', digits: 9,  hint: '9-digit Australian number',placeholder: '412 345 678', maxLength: 12 },
  DE: { prefix: '+49', flag: '🇩🇪', digits: 11, hint: '11-digit German number',   placeholder: '1512 3456789', maxLength: 14 },
  FR: { prefix: '+33', flag: '🇫🇷', digits: 9,  hint: '9-digit French number',    placeholder: '6 12 34 56 78', maxLength: 12 },
  CA: { prefix: '+1',  flag: '🇨🇦', digits: 10, hint: '10-digit Canadian number', placeholder: '416-555-0123', maxLength: 14 },
}

// ── Colour helpers for the post-scaffold checklist ────────────────────────

const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
}

// ── Main ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

if (args[0] !== 'create') {
  console.log(`\nUsage: ${c.cyan('npx tvashtr create')} ${c.dim('<store-name>')}\n`)
  process.exit(0)
}

console.clear()

intro(c.bold('🛕  Tvashtr Suite') + c.dim('  — Zero-cost production e-commerce'))

// ── Step 1: Store slug / directory name ───────────────────────────────────

let storeName = args[1]

if (!storeName) {
  storeName = checkCancel(await text({
    message: 'What is your store slug?',
    placeholder: 'my-organic-store',
    hint: 'Used for the directory name and worker name (lowercase, hyphens ok)',
    validate: (v) => {
      if (!v) return 'Store name is required.'
      if (!/^[a-z0-9-]+$/.test(v)) return 'Use only lowercase letters, numbers, and hyphens.'
      return undefined
    },
  }))
}

const targetDir = path.resolve(process.cwd(), storeName)

if (fs.existsSync(targetDir)) {
  bail(`Directory ${storeName} already exists. Choose a different name or path.`)
}

// ── Step 2: Branding ──────────────────────────────────────────────────────

const siteTitle = checkCancel(await text({
  message: 'What is your store\'s full name?',
  placeholder: 'My Organic Store',
  validate: (v) => (!v ? 'Required.' : undefined),
}))

const siteTagline = checkCancel(await text({
  message: 'One-line tagline for your store:',
  placeholder: 'Fresh & Natural — Delivered',
}))

const logoLabel = checkCancel(await text({
  message: 'Logo — bold first word:',
  placeholder: siteTitle.split(' ')[0] || 'MY',
  hint: 'e.g. "Patel" in "Patel Flour"',
}))

const logoText = checkCancel(await text({
  message: 'Logo — remaining text:',
  placeholder: siteTitle.split(' ').slice(1).join(' ') || 'Store',
  hint: 'e.g. "Flours" in "Patel Flour"',
}))

// ── Step 3: Brand colour ──────────────────────────────────────────────────

const brandColor = checkCancel(await text({
  message: 'Primary brand colour (hex):',
  placeholder: '#0284c7',
  hint: 'Used in email templates and headings',
  validate: (v) => {
    if (!v) return 'Required.'
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) return 'Must be a valid 6-digit hex colour, e.g. #0284c7'
    return undefined
  },
}))

// Derive a light tint and accent automatically
const hex = brandColor.slice(1)
const r = parseInt(hex.slice(0, 2), 16)
const g = parseInt(hex.slice(2, 4), 16)
const b = parseInt(hex.slice(4, 6), 16)
const lighten = (ch) => Math.min(255, Math.floor(ch + (255 - ch) * 0.85)).toString(16).padStart(2, '0')
const darken  = (ch) => Math.max(0, Math.floor(ch * 0.85)).toString(16).padStart(2, '0')
const brandColorLight  = `#${lighten(r)}${lighten(g)}${lighten(b)}`
const brandColorAccent = `#${darken(r)}${darken(g)}${darken(b)}`

// ── Step 4: Phone configuration ───────────────────────────────────────────

const countryChoice = checkCancel(await select({
  message: 'Which country are your customers in?',
  options: [
    { value: 'DK', label: '🇩🇰  Denmark  (+45)' },
    { value: 'US', label: '🇺🇸  United States  (+1)' },
    { value: 'GB', label: '🇬🇧  United Kingdom  (+44)' },
    { value: 'IN', label: '🇮🇳  India  (+91)' },
    { value: 'AU', label: '🇦🇺  Australia  (+61)' },
    { value: 'DE', label: '🇩🇪  Germany  (+49)' },
    { value: 'FR', label: '🇫🇷  France  (+33)' },
    { value: 'CA', label: '🇨🇦  Canada  (+1)' },
  ],
}))

const phone = PHONE_PRESETS[countryChoice]

// ── Step 5: Feature flags ─────────────────────────────────────────────────

const enableCheckout = checkCancel(await confirm({
  message: 'Enable full checkout (cart + order flow)?',
  initialValue: true,
}))

const enableServiceMode = enableCheckout
  ? false
  : checkCancel(await confirm({
      message: 'Use "Service mode" (show "Send Enquiry" instead of "Add to Cart")?',
      initialValue: false,
    }))

const enableRecipes = checkCancel(await confirm({
  message: 'Enable the Recipes module?',
  initialValue: false,
}))

const enableBlog = checkCancel(await confirm({
  message: 'Enable the Blog module?',
  initialValue: false,
}))

// ── Scaffold ───────────────────────────────────────────────────────────────

const s = spinner()
s.start('Scaffolding your store…')

// 1. Copy template
fs.cpSync(templateDir, targetDir, { recursive: true })

// 2. Build full list of replacements
const files = {
  pkg:     path.join(targetDir, 'package.json'),
  store:   path.join(targetDir, 'store.config.ts'),
  wrangler:path.join(targetDir, 'cloudflare', 'wrangler.toml'),
  env:     path.join(targetDir, '.env'),
  envEx:   path.join(targetDir, '.env.example'),
}

const replacements = [
  // package.json
  [files.pkg,      '__STORE_SLUG__',         storeName],

  // store.config.ts
  [files.store,    '__SITE_NAME__',           siteTitle],
  [files.store,    '__SITE_TAGLINE__',        siteTagline || `${siteTitle} — Quality you can taste`],
  [files.store,    '__LOGO_LABEL__',          logoLabel || siteTitle.split(' ')[0]],
  [files.store,    '__LOGO_TEXT__',           logoText  || siteTitle.split(' ').slice(1).join(' ')],
  [files.store,    '__BRAND_COLOR__',         brandColor],
  [files.store,    '__BRAND_COLOR_LIGHT__',   brandColorLight],
  [files.store,    '__BRAND_COLOR_ACCENT__',  brandColorAccent],
  [files.store,    '__PHONE_PREFIX__',        phone.prefix],
  [files.store,    '__PHONE_FLAG__',          phone.flag],
  [files.store,    '__PHONE_DIGITS__',        String(phone.digits)],
  [files.store,    '__PHONE_HINT__',          phone.hint],
  [files.store,    '__PHONE_PLACEHOLDER__',   phone.placeholder],
  [files.store,    '__PHONE_MAX_LENGTH__',    String(phone.maxLength)],

  // wrangler.toml
  [files.wrangler, '__STORE_SLUG__',          storeName],
]

applyReplacements(replacements)

// 3. Write feature flags into .env (copy from .env.example first)
if (fs.existsSync(files.envEx)) {
  let env = fs.readFileSync(files.envEx, 'utf-8')
  env = env
    .replace(/NUXT_PUBLIC_ENABLE_CHECKOUT=.*/,    `NUXT_PUBLIC_ENABLE_CHECKOUT=${enableCheckout}`)
    .replace(/NUXT_PUBLIC_ENABLE_SERVICE_MODE=.*/, `NUXT_PUBLIC_ENABLE_SERVICE_MODE=${enableServiceMode}`)
    .replace(/NUXT_PUBLIC_ENABLE_RECIPES=.*/,      `NUXT_PUBLIC_ENABLE_RECIPES=${enableRecipes}`)
    .replace(/NUXT_PUBLIC_ENABLE_BLOG=.*/,         `NUXT_PUBLIC_ENABLE_BLOG=${enableBlog}`)
  fs.writeFileSync(files.env, env)
}

// 4. Write CSS brand colour and Tailwind sources into the theme file
const themeFile = path.join(targetDir, 'app', 'assets', 'themes', 'default', 'main.css')
if (fs.existsSync(themeFile)) {
  let css = fs.readFileSync(themeFile, 'utf-8')
  css = css.replaceAll('__BRAND_COLOR__', brandColor)
  css = css.replaceAll('__BRAND_COLOR_ACCENT__', brandColorAccent)
  
  // If we are scaffolding inside the cloned tvashtr-suite monorepo apps/ dir, point to local packages.
  // Otherwise, point to node_modules for standalone usage.
  const isMonorepo = fs.existsSync(path.resolve(targetDir, '..', '..', 'packages', 'tvashtr-ui'))
  
  if (isMonorepo) {
    css = css.replaceAll('__TAILWIND_SOURCE_UI__', '../../../../../packages/tvashtr-ui/app/**/*.{vue,ts}')
    css = css.replaceAll('__TAILWIND_SOURCE_CHECKOUT__', '../../../../../packages/tvashtr-checkout/app/**/*.vue')
  } else {
    css = css.replaceAll('__TAILWIND_SOURCE_UI__', '../../../../node_modules/@tvashtr/ui/app/**/*.{vue,ts}')
    css = css.replaceAll('__TAILWIND_SOURCE_CHECKOUT__', '../../../../node_modules/@tvashtr/checkout/app/**/*.vue')
  }
  
  fs.writeFileSync(themeFile, css)
}

// 5. Rename gitignore
const gitignoreSrc = path.join(targetDir, 'gitignore')
if (fs.existsSync(gitignoreSrc)) {
  fs.renameSync(gitignoreSrc, path.join(targetDir, '.gitignore'))
}

s.stop(c.green('Store scaffolded!'))

// ── Post-scaffold checklist ───────────────────────────────────────────────

const checklist = `
${c.bold('📋  What to do next:')}

  ${c.cyan('1.')} ${c.bold('Set up your Google Sheet')} (see README → Step 1)
     Create a sheet with the required columns, share as Viewer, then:
     ${c.dim(`echo "NUXT_PUBLIC_SHEET_ID=your_id" >> ${storeName}/.env`)}

  ${c.cyan('2.')} ${c.bold('Start the dev server')}
     ${c.dim(`cd ${storeName}`)}
     ${c.dim('npm install')}
     ${c.dim('npm run dev')}
     ${c.dim('→ http://localhost:3000')}

  ${c.cyan('3.')} ${c.bold('Deploy your Cloudflare Worker + D1 database')}
     ${c.dim(`cd ${storeName}/cloudflare`)}
     ${c.dim('npx wrangler login')}
     ${c.dim(`npx wrangler d1 create ${storeName}-db`)}
     ${c.dim(`npx wrangler d1 execute ${storeName}-db --remote --file=schema.sql`)}
     ${c.dim('npx wrangler deploy')}

  ${c.cyan('4.')} ${c.bold('Add your Worker secrets')}
     ${c.dim('npx wrangler secret put TURNSTILE_SECRET_KEY')}
     ${c.dim('npx wrangler secret put TELEGRAM_TOKEN')}
     ${c.dim('npx wrangler secret put TELEGRAM_CHAT_ID')}
     ${c.dim('npx wrangler secret put BREVO_API_KEY')}

  ${c.cyan('5.')} ${c.bold('Deploy to Cloudflare Pages')}
     Build command:  ${c.dim(`npm run build`)}
     Output dir:     ${c.dim(`.output/public`)}
     Root dir:       ${c.dim('/')}

${c.dim('Full guide: https://github.com/gunjanpatel/tvashtr-suite#-full-deployment-guide')}
`

note(checklist, `✅  ${storeName} is ready`)

outro(c.green(`Happy selling! 🛒`))
