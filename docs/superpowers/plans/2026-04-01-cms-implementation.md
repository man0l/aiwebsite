# CMS Implementation Plan: Strapi Content Types + Astro Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register Strapi 5 content types for global settings, home-page sections, and blog posts, then build Astro static pages that render content fetched from Strapi at build time.

**Architecture:** Strapi 5 serves as a build-time CMS — all data is fetched during `astro build`, producing fully static HTML. Strapi content type schemas are JSON files on disk; Strapi reads them on startup and registers the corresponding REST API endpoints automatically. The Astro frontend uses a thin `strapi.ts` client (already exists) and renders pages using Tailwind CSS matching the existing `index.html` brand.

**Tech Stack:** Strapi 5.40.0 (TypeScript), Astro 4 (static output), Tailwind CSS v3, PostgreSQL (via Docker), Docker Compose

---

## File Map

**New files — Strapi:**
- `strapi/src/components/sections/hero.json`
- `strapi/src/components/sections/case-study.json`
- `strapi/src/api/author/content-types/author/schema.json`
- `strapi/src/api/author/controllers/author.ts`
- `strapi/src/api/author/routes/author.ts`
- `strapi/src/api/author/services/author.ts`
- `strapi/src/api/category/content-types/category/schema.json`
- `strapi/src/api/category/controllers/category.ts`
- `strapi/src/api/category/routes/category.ts`
- `strapi/src/api/category/services/category.ts`
- `strapi/src/api/blog-post/content-types/blog-post/schema.json`
- `strapi/src/api/blog-post/controllers/blog-post.ts`
- `strapi/src/api/blog-post/routes/blog-post.ts`
- `strapi/src/api/blog-post/services/blog-post.ts`
- `strapi/src/api/global/content-types/global/schema.json`
- `strapi/src/api/global/controllers/global.ts`
- `strapi/src/api/global/routes/global.ts`
- `strapi/src/api/global/services/global.ts`
- `strapi/src/api/home-page/content-types/home-page/schema.json`
- `strapi/src/api/home-page/controllers/home-page.ts`
- `strapi/src/api/home-page/routes/home-page.ts`
- `strapi/src/api/home-page/services/home-page.ts`

**New files — Astro:**
- `web/tailwind.config.mjs`
- `web/src/components/Layout.astro`
- `web/src/pages/index.astro`
- `web/src/pages/blog/index.astro`
- `web/src/pages/blog/[slug].astro`
- `web/.env` (gitignored, created manually)

**Modified files — Astro:**
- `web/astro.config.mjs` — add Tailwind integration
- `web/package.json` — add `@astrojs/tailwind` + `tailwindcss`
- `web/src/lib/strapi.ts` — add `getHomePage()`

---

## Task 1: Strapi — sections components

**Files:**
- Create: `strapi/src/components/sections/hero.json`
- Create: `strapi/src/components/sections/case-study.json`

- [ ] **Step 1: Create `strapi/src/components/sections/` directory**

```bash
mkdir -p strapi/src/components/sections
```

- [ ] **Step 2: Create `hero.json`**

```json
{
  "collectionName": "components_sections_heroes",
  "info": {
    "displayName": "Hero",
    "icon": "star",
    "description": "Landing page hero section"
  },
  "options": {},
  "attributes": {
    "headline": {
      "type": "string",
      "required": true
    },
    "subHeadline": {
      "type": "string"
    },
    "ctaLabel": {
      "type": "string"
    },
    "ctaUrl": {
      "type": "string"
    }
  }
}
```

- [ ] **Step 3: Create `case-study.json`**

```json
{
  "collectionName": "components_sections_case_studies",
  "info": {
    "displayName": "Case Study",
    "icon": "briefcase",
    "description": "Client case study card"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "result": {
      "type": "string"
    },
    "industry": {
      "type": "string"
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add strapi/src/components/sections/
git commit -m "feat(strapi): add sections components (hero, case-study)"
```

---

## Task 2: Strapi — `author` collection type

**Files:**
- Create: `strapi/src/api/author/content-types/author/schema.json`
- Create: `strapi/src/api/author/controllers/author.ts`
- Create: `strapi/src/api/author/routes/author.ts`
- Create: `strapi/src/api/author/services/author.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p strapi/src/api/author/content-types/author
mkdir -p strapi/src/api/author/controllers
mkdir -p strapi/src/api/author/routes
mkdir -p strapi/src/api/author/services
```

- [ ] **Step 2: Create schema**

`strapi/src/api/author/content-types/author/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "authors",
  "info": {
    "singularName": "author",
    "pluralName": "authors",
    "displayName": "Author"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "bio": {
      "type": "text"
    },
    "avatar": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"]
    }
  }
}
```

- [ ] **Step 3: Create controller**

`strapi/src/api/author/controllers/author.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::author.author');
```

- [ ] **Step 4: Create routes**

`strapi/src/api/author/routes/author.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::author.author');
```

- [ ] **Step 5: Create service**

`strapi/src/api/author/services/author.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::author.author');
```

- [ ] **Step 6: Commit**

```bash
git add strapi/src/api/author/
git commit -m "feat(strapi): add author collection type"
```

---

## Task 3: Strapi — `category` collection type

**Files:**
- Create: `strapi/src/api/category/content-types/category/schema.json`
- Create: `strapi/src/api/category/controllers/category.ts`
- Create: `strapi/src/api/category/routes/category.ts`
- Create: `strapi/src/api/category/services/category.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p strapi/src/api/category/content-types/category
mkdir -p strapi/src/api/category/controllers
mkdir -p strapi/src/api/category/routes
mkdir -p strapi/src/api/category/services
```

- [ ] **Step 2: Create schema**

`strapi/src/api/category/content-types/category/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    }
  }
}
```

- [ ] **Step 3: Create controller**

`strapi/src/api/category/controllers/category.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::category.category');
```

- [ ] **Step 4: Create routes**

`strapi/src/api/category/routes/category.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::category.category');
```

- [ ] **Step 5: Create service**

`strapi/src/api/category/services/category.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::category.category');
```

- [ ] **Step 6: Commit**

```bash
git add strapi/src/api/category/
git commit -m "feat(strapi): add category collection type"
```

---

## Task 4: Strapi — `blog-post` collection type

**Files:**
- Create: `strapi/src/api/blog-post/content-types/blog-post/schema.json`
- Create: `strapi/src/api/blog-post/controllers/blog-post.ts`
- Create: `strapi/src/api/blog-post/routes/blog-post.ts`
- Create: `strapi/src/api/blog-post/services/blog-post.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p strapi/src/api/blog-post/content-types/blog-post
mkdir -p strapi/src/api/blog-post/controllers
mkdir -p strapi/src/api/blog-post/routes
mkdir -p strapi/src/api/blog-post/services
```

- [ ] **Step 2: Create schema**

`strapi/src/api/blog-post/content-types/blog-post/schema.json`:
```json
{
  "kind": "collectionType",
  "collectionName": "blog_posts",
  "info": {
    "singularName": "blog-post",
    "pluralName": "blog-posts",
    "displayName": "Blog Post"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "excerpt": {
      "type": "text"
    },
    "content": {
      "type": "richtext"
    },
    "coverImage": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"]
    },
    "readingTime": {
      "type": "integer"
    },
    "author": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::author.author"
    },
    "categories": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::category.category"
    },
    "seo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo"
    }
  }
}
```

- [ ] **Step 3: Create controller**

`strapi/src/api/blog-post/controllers/blog-post.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::blog-post.blog-post');
```

- [ ] **Step 4: Create routes**

`strapi/src/api/blog-post/routes/blog-post.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::blog-post.blog-post');
```

- [ ] **Step 5: Create service**

`strapi/src/api/blog-post/services/blog-post.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::blog-post.blog-post');
```

- [ ] **Step 6: Commit**

```bash
git add strapi/src/api/blog-post/
git commit -m "feat(strapi): add blog-post collection type"
```

---

## Task 5: Strapi — `global` single type

**Files:**
- Create: `strapi/src/api/global/content-types/global/schema.json`
- Create: `strapi/src/api/global/controllers/global.ts`
- Create: `strapi/src/api/global/routes/global.ts`
- Create: `strapi/src/api/global/services/global.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p strapi/src/api/global/content-types/global
mkdir -p strapi/src/api/global/controllers
mkdir -p strapi/src/api/global/routes
mkdir -p strapi/src/api/global/services
```

- [ ] **Step 2: Create schema**

`strapi/src/api/global/content-types/global/schema.json`:
```json
{
  "kind": "singleType",
  "collectionName": "global",
  "info": {
    "singularName": "global",
    "pluralName": "globals",
    "displayName": "Global"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "siteName": {
      "type": "string",
      "required": true
    },
    "nav": {
      "type": "component",
      "repeatable": true,
      "component": "shared.nav-item"
    },
    "socialLinks": {
      "type": "component",
      "repeatable": true,
      "component": "shared.social-link"
    }
  }
}
```

- [ ] **Step 3: Create controller**

`strapi/src/api/global/controllers/global.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::global.global');
```

- [ ] **Step 4: Create routes**

`strapi/src/api/global/routes/global.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::global.global');
```

- [ ] **Step 5: Create service**

`strapi/src/api/global/services/global.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::global.global');
```

- [ ] **Step 6: Commit**

```bash
git add strapi/src/api/global/
git commit -m "feat(strapi): add global single type"
```

---

## Task 6: Strapi — `home-page` single type

**Files:**
- Create: `strapi/src/api/home-page/content-types/home-page/schema.json`
- Create: `strapi/src/api/home-page/controllers/home-page.ts`
- Create: `strapi/src/api/home-page/routes/home-page.ts`
- Create: `strapi/src/api/home-page/services/home-page.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p strapi/src/api/home-page/content-types/home-page
mkdir -p strapi/src/api/home-page/controllers
mkdir -p strapi/src/api/home-page/routes
mkdir -p strapi/src/api/home-page/services
```

- [ ] **Step 2: Create schema**

`strapi/src/api/home-page/content-types/home-page/schema.json`:
```json
{
  "kind": "singleType",
  "collectionName": "home_page",
  "info": {
    "singularName": "home-page",
    "pluralName": "home-pages",
    "displayName": "Home Page"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "hero": {
      "type": "component",
      "repeatable": false,
      "component": "sections.hero"
    },
    "caseStudies": {
      "type": "component",
      "repeatable": true,
      "component": "sections.case-study"
    },
    "faq": {
      "type": "component",
      "repeatable": true,
      "component": "shared.faq-item"
    }
  }
}
```

- [ ] **Step 3: Create controller**

`strapi/src/api/home-page/controllers/home-page.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::home-page.home-page');
```

- [ ] **Step 4: Create routes**

`strapi/src/api/home-page/routes/home-page.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::home-page.home-page');
```

- [ ] **Step 5: Create service**

`strapi/src/api/home-page/services/home-page.ts`:
```ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::home-page.home-page');
```

- [ ] **Step 6: Commit**

```bash
git add strapi/src/api/home-page/
git commit -m "feat(strapi): add home-page single type"
```

---

## Task 7: Start Strapi + generate API token + seed content

This task is manual — it requires running Docker and using the Strapi admin UI.

- [ ] **Step 1: Start Strapi + DB**

```bash
cd /path/to/aiwebsite
docker-compose up --build
```

Wait for the log line: `Strapi started successfully` (usually ~30s on first run).

- [ ] **Step 2: Create admin account**

Open `http://localhost:1337/admin` in a browser. Complete the first-run setup (create admin email + password).

- [ ] **Step 3: Verify all content types appear**

In the Strapi admin left sidebar under **Content Manager**, confirm these appear:
- Collection types: Author, Blog Post, Category
- Single types: Global, Home Page

If any are missing, check the terminal for Strapi startup errors and verify the JSON schema files match the format in Tasks 1–6.

- [ ] **Step 4: Set API permissions**

Go to **Settings → Users & Permissions → Roles → Public**.

Enable `find` and `findOne` for: `Author`, `Blog-Post`, `Category`, `Global`, `Home-Page`.

Click **Save**.

- [ ] **Step 5: Generate an API token**

Go to **Settings → API Tokens → Create new API Token**.

- Name: `astro-build`
- Token type: `Read-only`
- Token duration: Unlimited

Copy the generated token — it is only shown once.

- [ ] **Step 6: Create `.env` for Astro**

Create `web/.env` (this file is gitignored — do NOT commit it):
```
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=<paste token here>
```

- [ ] **Step 7: Seed sample content**

In Strapi admin, add at minimum:
- 1 Author entry
- 1 Category entry
- 1 Blog Post (published)
- Fill in the Global single type (siteName + at least 1 nav item)
- Fill in the Home Page single type (hero headline, 1 case study, 1 FAQ)

---

## Task 8: Astro — add Tailwind CSS

**Files:**
- Modify: `web/package.json`
- Modify: `web/astro.config.mjs`
- Create: `web/tailwind.config.mjs`

- [ ] **Step 1: Install Tailwind dependencies**

```bash
cd web
npm install -D @astrojs/tailwind tailwindcss
```

- [ ] **Step 2: Update `astro.config.mjs`**

`web/astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
});
```

Note: The `vite.define` block is removed — Astro reads `STRAPI_URL` and `STRAPI_API_TOKEN` from `.env` via `import.meta.env` automatically.

- [ ] **Step 3: Create `tailwind.config.mjs`**

`web/tailwind.config.mjs`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#111111',
        'brand-lime': '#BEF264',
        'brand-light': '#F0F0F0',
        'brand-gray': '#AAAAAA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
    },
  },
};
```

- [ ] **Step 4: Verify Astro starts**

```bash
cd web
npm run dev
```

Expected: server starts at `http://localhost:4321` with no errors (will show 404 — no pages yet, that's fine).

- [ ] **Step 5: Commit**

```bash
git add web/package.json web/package-lock.json web/astro.config.mjs web/tailwind.config.mjs
git commit -m "feat(astro): add Tailwind CSS with brand color config"
```

---

## Task 9: Astro — update `strapi.ts` + create `Layout.astro`

**Files:**
- Modify: `web/src/lib/strapi.ts`
- Create: `web/src/components/Layout.astro`

- [ ] **Step 1: Add `getHomePage()` to `strapi.ts`**

`web/src/lib/strapi.ts` — add after the `getGlobal` function (before the `export { STRAPI_URL }` line):

```ts
export async function getHomePage() {
  return fetchApi<any>({ endpoint: '/home-page', params: { populate: 'deep' } });
}
```

The full file should now end with:
```ts
export async function getGlobal() {
  return fetchApi<any>({ endpoint: '/global', params: { populate: 'deep' } });
}

export async function getHomePage() {
  return fetchApi<any>({ endpoint: '/home-page', params: { populate: 'deep' } });
}

export { STRAPI_URL };
```

- [ ] **Step 2: Create `web/src/components/` directory**

```bash
mkdir -p web/src/components
```

- [ ] **Step 3: Create `Layout.astro`**

`web/src/components/Layout.astro`:
```astro
---
interface Props {
  title: string;
  description?: string;
  image?: string;
  nav?: Array<{ label: string; href: string }>;
}

const { title, description, image, nav = [] } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
  {image && <meta property="og:image" content={image} />}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet" />
</head>
<body class="bg-brand-dark text-brand-light font-sans">
  <header class="bg-brand-dark/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <a href="/">
          <span class="text-white font-display font-bold text-xl">FlowCraft Pro</span>
        </a>
        {nav.length > 0 && (
          <nav class="hidden md:flex items-center gap-8">
            {nav.map((item) => (
              <a href={item.href} class="text-brand-gray hover:text-white font-medium transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  </header>

  <slot />

  <footer class="border-t border-gray-800 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-brand-gray text-sm">
      <p>&copy; {new Date().getFullYear()} FlowCraft Pro. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>
```

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/strapi.ts web/src/components/Layout.astro
git commit -m "feat(astro): add getHomePage() and Layout component"
```

---

## Task 10: Astro — `index.astro` (landing page)

**Files:**
- Create: `web/src/pages/index.astro`

- [ ] **Step 1: Create `web/src/pages/` directory**

```bash
mkdir -p web/src/pages
```

- [ ] **Step 2: Create `index.astro`**

`web/src/pages/index.astro`:
```astro
---
import Layout from '../components/Layout.astro';
import { getHomePage, getGlobal } from '../lib/strapi.ts';

const [homePage, global] = await Promise.all([getHomePage(), getGlobal()]);

const hero = homePage?.attributes?.hero ?? {};
const caseStudies: any[] = homePage?.attributes?.caseStudies ?? [];
const faq: any[] = homePage?.attributes?.faq ?? [];
const nav: any[] = global?.attributes?.nav ?? [];
---
<Layout
  title={global?.attributes?.siteName ?? 'FlowCraft Pro'}
  description={hero.subHeadline}
  nav={nav.map((n: any) => ({ label: n.label, href: n.href }))}
>
  <!-- Hero -->
  <section class="relative py-24 md:py-32 bg-brand-dark">
    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 class="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
        {hero.headline ?? 'Grow Your Agency With AI'}
      </h1>
      {hero.subHeadline && (
        <p class="mt-6 text-xl text-brand-gray max-w-2xl mx-auto">{hero.subHeadline}</p>
      )}
      {hero.ctaLabel && hero.ctaUrl && (
        <a
          href={hero.ctaUrl}
          class="mt-10 inline-block bg-brand-lime text-black font-bold px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
        >
          {hero.ctaLabel}
        </a>
      )}
    </div>
  </section>

  <!-- Case Studies -->
  {caseStudies.length > 0 && (
    <section class="py-20 bg-gray-900 border-t border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-display font-bold text-white text-center mb-12">Case Studies</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((cs: any) => (
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              {cs.industry && (
                <span class="text-brand-lime font-bold text-xs uppercase tracking-wide">{cs.industry}</span>
              )}
              <h3 class="mt-2 text-xl font-bold text-white">{cs.title}</h3>
              {cs.description && <p class="mt-2 text-brand-gray text-sm">{cs.description}</p>}
              {cs.result && (
                <p class="mt-4 text-brand-lime font-semibold text-sm">{cs.result}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )}

  <!-- FAQ -->
  {faq.length > 0 && (
    <section id="faq" class="py-20 bg-gray-900 border-t border-gray-800">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-display font-bold text-white text-center mb-12">FAQ</h2>
        <div class="space-y-0">
          {faq.map((item: any) => (
            <details class="border-b border-gray-800 group">
              <summary class="flex justify-between items-center py-6 cursor-pointer text-white font-medium list-none">
                {item.question}
                <span class="text-brand-lime text-2xl font-light ml-4 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div class="pb-6 pr-8 text-brand-gray" set:html={item.answer} />
            </details>
          ))}
        </div>
      </div>
    </section>
  )}
</Layout>
```

- [ ] **Step 3: Verify the page builds**

With Strapi running and `web/.env` populated:
```bash
cd web
npm run build
```

Expected: build completes with `dist/index.html` generated, no errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/pages/index.astro
git commit -m "feat(astro): add landing page (index.astro) with CMS-driven hero, case studies, FAQ"
```

---

## Task 11: Astro — `blog/index.astro` (blog listing)

**Files:**
- Create: `web/src/pages/blog/index.astro`

- [ ] **Step 1: Create directory**

```bash
mkdir -p web/src/pages/blog
```

- [ ] **Step 2: Create `blog/index.astro`**

`web/src/pages/blog/index.astro`:
```astro
---
import Layout from '../../components/Layout.astro';
import { getBlogPosts, getGlobal, STRAPI_URL } from '../../lib/strapi.ts';

const [posts, global] = await Promise.all([getBlogPosts(), getGlobal()]);
const nav: any[] = global?.attributes?.nav ?? [];
---
<Layout
  title={`Blog — ${global?.attributes?.siteName ?? 'FlowCraft Pro'}`}
  description="Insights on AI automation and agency growth"
  nav={nav.map((n: any) => ({ label: n.label, href: n.href }))}
>
  <section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl md:text-5xl font-display font-bold text-white text-center mb-12">Blog</h1>

      {posts.length === 0 && (
        <p class="text-brand-gray text-center">No posts published yet.</p>
      )}

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => {
          const attrs = post.attributes;
          const coverUrl = attrs.coverImage?.data?.attributes?.url
            ? `${STRAPI_URL}${attrs.coverImage.data.attributes.url}`
            : null;
          const categories: string[] = attrs.categories?.data?.map((c: any) => c.attributes.name) ?? [];
          const date = attrs.publishedAt
            ? new Date(attrs.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : '';

          return (
            <a href={`/blog/${attrs.slug}`} class="group block bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-brand-lime transition-colors">
              {coverUrl && (
                <img src={coverUrl} alt={attrs.title} class="w-full h-48 object-cover" />
              )}
              <div class="p-6">
                {categories.length > 0 && (
                  <div class="flex gap-2 mb-3">
                    {categories.map((cat) => (
                      <span class="text-brand-lime text-xs font-bold uppercase tracking-wide">{cat}</span>
                    ))}
                  </div>
                )}
                <h2 class="text-xl font-bold text-white group-hover:text-brand-lime transition-colors">{attrs.title}</h2>
                {attrs.excerpt && <p class="mt-2 text-brand-gray text-sm line-clamp-3">{attrs.excerpt}</p>}
                <div class="mt-4 flex items-center gap-3 text-xs text-brand-gray">
                  {date && <span>{date}</span>}
                  {attrs.readingTime && <span>· {attrs.readingTime} min read</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  </section>
</Layout>
```

- [ ] **Step 3: Verify build**

```bash
cd web
npm run build
```

Expected: `dist/blog/index.html` exists, no errors.

- [ ] **Step 4: Commit**

```bash
git add web/src/pages/blog/index.astro
git commit -m "feat(astro): add blog listing page"
```

---

## Task 12: Astro — `blog/[slug].astro` (single post)

**Files:**
- Create: `web/src/pages/blog/[slug].astro`

- [ ] **Step 1: Create `[slug].astro`**

`web/src/pages/blog/[slug].astro`:
```astro
---
import Layout from '../../components/Layout.astro';
import { getBlogPosts, getGlobal, STRAPI_URL } from '../../lib/strapi.ts';

export async function getStaticPaths() {
  const posts = await getBlogPosts();
  return posts.map((post: any) => ({
    params: { slug: post.attributes.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const attrs = post.attributes;

const global = await getGlobal();
const nav: any[] = global?.attributes?.nav ?? [];

const coverUrl = attrs.coverImage?.data?.attributes?.url
  ? `${STRAPI_URL}${attrs.coverImage.data.attributes.url}`
  : null;

const authorName: string = attrs.author?.data?.attributes?.name ?? '';
const authorAvatarUrl: string | null = attrs.author?.data?.attributes?.avatar?.data?.attributes?.url
  ? `${STRAPI_URL}${attrs.author.data.attributes.avatar.data.attributes.url}`
  : null;

const categories: string[] = attrs.categories?.data?.map((c: any) => c.attributes.name) ?? [];

const date = attrs.publishedAt
  ? new Date(attrs.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : '';

const seo = attrs.seo ?? {};
---
<Layout
  title={seo.metaTitle ?? attrs.title}
  description={seo.metaDescription ?? attrs.excerpt}
  image={seo.metaImage?.data?.attributes?.url ? `${STRAPI_URL}${seo.metaImage.data.attributes.url}` : coverUrl ?? undefined}
  nav={nav.map((n: any) => ({ label: n.label, href: n.href }))}
>
  <article class="py-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Categories -->
      {categories.length > 0 && (
        <div class="flex gap-2 mb-4">
          {categories.map((cat) => (
            <span class="text-brand-lime text-xs font-bold uppercase tracking-wide">{cat}</span>
          ))}
        </div>
      )}

      <!-- Title -->
      <h1 class="text-4xl md:text-5xl font-display font-bold text-white leading-tight">{attrs.title}</h1>

      <!-- Meta -->
      <div class="mt-6 flex items-center gap-4 text-brand-gray text-sm">
        {authorAvatarUrl && (
          <img src={authorAvatarUrl} alt={authorName} class="w-8 h-8 rounded-full object-cover" />
        )}
        {authorName && <span>{authorName}</span>}
        {date && <span>· {date}</span>}
        {attrs.readingTime && <span>· {attrs.readingTime} min read</span>}
      </div>

      <!-- Cover image -->
      {coverUrl && (
        <img src={coverUrl} alt={attrs.title} class="mt-8 w-full rounded-2xl object-cover max-h-96" />
      )}

      <!-- Content -->
      {attrs.content && (
        <div
          class="mt-10 prose prose-invert prose-lg max-w-none prose-headings:font-display prose-a:text-brand-lime"
          set:html={attrs.content}
        />
      )}

      <!-- Back link -->
      <div class="mt-16 pt-8 border-t border-gray-800">
        <a href="/blog" class="text-brand-lime hover:underline text-sm font-medium">← Back to Blog</a>
      </div>
    </div>
  </article>
</Layout>
```

- [ ] **Step 2: Install `@tailwindcss/typography` for prose styles**

```bash
cd web
npm install -D @tailwindcss/typography
```

Add the plugin to `web/tailwind.config.mjs`:
```js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#111111',
        'brand-lime': '#BEF264',
        'brand-light': '#F0F0F0',
        'brand-gray': '#AAAAAA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
};
```

- [ ] **Step 3: Verify full build**

```bash
cd web
npm run build
```

Expected: `dist/blog/<slug>/index.html` generated for each published post, no errors.

- [ ] **Step 4: Preview the build**

```bash
cd web
npm run preview
```

Open `http://localhost:4321`, `http://localhost:4321/blog`, and `http://localhost:4321/blog/<your-slug>`. Verify pages render with content from Strapi.

- [ ] **Step 5: Commit**

```bash
git add web/src/pages/blog/[slug].astro web/tailwind.config.mjs web/package.json web/package-lock.json
git commit -m "feat(astro): add blog post page with typography plugin"
```

---

## Done

All Strapi content types are registered and all Astro pages are built. The site is fully static — run `npm run build` in `web/` (with Strapi running) to regenerate HTML whenever content changes.
