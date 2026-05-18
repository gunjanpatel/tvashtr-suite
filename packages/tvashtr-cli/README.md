# tvashtr-cli

> Local developer scaffolding CLI to spin up fully configured, white-label e-commerce storefronts in seconds.

`tvashtr-cli` is the command-line utility for the Tvashtr Suite monorepo. It automates the creation of new tenant storefronts, copying a boilerplate template and pre-configuring names and environment variables so you can focus entirely on branding and catalog sheets.

---

## 🚀 Scaffolding a New Store

You can execute the CLI tool directly from the root of the monorepo workspace:

```bash
npx tvashtr create <your-store-name>
```

---

## 🛠️ How it Works under the Hood

When you execute `create <project-name>`, the CLI script (`bin/tvashtr.js`) automates these standard setup tasks:

1. **Safety Boundary**: Verifies if `apps/<your-store-name>` already exists, preventing accidental directory overwrites.
2. **Template Replication**: Recursively copies files from the `packages/tvashtr-cli/template` directory into the new `apps/<your-store-name>` workspace.
3. **Identity Setup**: Parses `package.json` in the newly scaffolded app, dynamically replacing the generic `"name": "store-template"` value with your chosen `<your-store-name>`.
4. **Environment Initialization**: Automatically copies `.env.example` into a local `.env` file, allowing you to configure backend secrets instantly.

---

## 📁 Scaffolded Template Structure

The boilerplate template contains everything needed to run a production-grade store on Cloudflare Pages and Workers:

```text
apps/<your-store-name>/
├── app/
│   ├── assets/
│   │   └── main.css         # Custom Tailwind v4 styling variables
│   └── app.vue              # Entrypoint layout
│
├── cloudflare/
│   ├── schema.sql           # D1 Database SQLite schema definition
│   └── wrangler.toml        # Cloudflare pages deployment configurations
│
├── .env.example             # Template environment variables
├── app.config.ts            # Nuxt App options
├── nuxt.config.ts           # Nuxt 4 configs extending @tvashtr/ui Layer
├── store.config.ts          # Store Branding Single Source of Truth
└── tailwind.config.ts       # Store Tailwind overrides
```

---

## 🛠️ Next Steps After Scaffolding

Once scaffolded, launch your store using simple shell commands:

```bash
# 1. Enter the app directory
cd apps/<your-store-name>

# 2. Run the development server
npm run dev
```

---

## 🏗️ Design Philosophy

1. **Zero External Dependencies**: The CLI employs only native Node.js core libraries (`fs`, `path`, `url`), keeping execution fast, safe, and independent of external package installations.
2. **Deterministic Boilerplates**: Scaffolds standard config patterns that seamlessly link to the `@tvashtr/ui` layer, ensuring any platform updates immediately apply to all tenant stores.
3. **No-Code Brand Configuration**: Standardizes custom styling around the `store.config.ts` and `app/assets/main.css` files, separating e-commerce logic from storefront branding.
