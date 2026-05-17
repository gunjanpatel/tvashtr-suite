#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templateDir = path.resolve(__dirname, '../template')

const args = process.argv.slice(2)
if (args[0] !== 'create' || !args[1]) {
  console.error('Usage: npx tvashtr create <project-name>')
  process.exit(1)
}

const projectName = args[1]
// We assume this is run from the root of the tvashtr-suite monorepo
const targetDir = path.resolve(process.cwd(), 'apps', projectName)

if (fs.existsSync(targetDir)) {
  console.error(`Error: Directory apps/${projectName} already exists.`)
  process.exit(1)
}

console.log(`\n🚀 Creating new Tvashtr Store: ${projectName}\n`)

// 1. Copy Template
fs.cpSync(templateDir, targetDir, { recursive: true })

// 2. Personalize the template
const packageJsonPath = path.join(targetDir, 'package.json')
let pkg = fs.readFileSync(packageJsonPath, 'utf-8')
pkg = pkg.replace(/"name": "store-template"/, `"name": "${projectName}"`)
fs.writeFileSync(packageJsonPath, pkg)

const envPath = path.join(targetDir, '.env.example')
const targetEnvPath = path.join(targetDir, '.env')
if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, targetEnvPath)
}

console.log(`✅ Scaffolded store in apps/${projectName}`)
console.log(`\nNext steps:`)
console.log(`  cd apps/${projectName}`)
console.log(`  npm run dev\n`)
