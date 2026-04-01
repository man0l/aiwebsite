# CMS Design: Strapi + Astro

**Date:** 2026-04-01  
**Branch:** feature/cms  
**Status:** Approved

## Overview

Add CMS capability to the aiwebsite project using Strapi (already scaffolded) as the backend and Astro (already scaffolded in `web/`) as the static frontend. The goal is two-fold:

1. Make key landing page sections (hero, case studies, FAQ) editable via Strapi admin without touching code.
2. Add a fully-featured blog powered by Strapi.

The Astro frontend is statically generated at build time — Strapi is a build-time data source, not a runtime dependency.

---

## Strapi Content Types

### Single Types

#### `global`
Site-wide data used on every page.

| Field | Type | Notes |
|-------|------|-------|
| `siteName` | String | Required |
| `nav` | Component (repeatable): `shared.nav-item` | label + url |
| `socialLinks` | Component (repeatable): `shared.social-link` | platform + url |

#### `home-page`
Controls the editable sections of the landing page.

| Field | Type | Notes |
|-------|------|-------|
| `hero` | Component (single): `sections.hero` | headline, subHeadline, ctaLabel, ctaUrl |
| `caseStudies` | Component (repeatable): `sections.case-study` | title, description, result, industry |
| `faq` | Component (repeatable): `shared.faq-item` | question + richtext answer |

New components needed in `strapi/src/components/sections/`:
- `hero.json` — headline (string, required), subHeadline (string), ctaLabel (string), ctaUrl (string)
- `case-study.json` — title (string, required), description (text), result (string), industry (string)

### Collection Types

#### `blog-post`

| Field | Type | Notes |
|-------|------|-------|
| `title` | String | Required |
| `slug` | String (unique) | Required |
| `excerpt` | Text | |
| `content` | Rich Text | |
| `coverImage` | Media (single image) | |
| `readingTime` | Integer | Minutes |
| `author` | Relation → `author` | Many-to-one |
| `categories` | Relation → `category` | Many-to-many |
| `seo` | Component: `shared.seo` | metaTitle, metaDescription, metaImage, keywords |

Strapi's built-in `publishedAt` field handles publish state (Draft/Published).

#### `author`

| Field | Type |
|-------|------|
| `name` | String (required) |
| `bio` | Text |
| `avatar` | Media (single image) |

#### `category`

| Field | Type |
|-------|------|
| `name` | String (required) |
| `slug` | String (unique, required) |

---

## Astro Pages

All pages use `output: 'static'` (already configured). Data is fetched at build time.

### File Structure

```
web/src/
├── pages/
│   ├── index.astro          ← landing page (home-page + global)
│   ├── blog/
│   │   ├── index.astro      ← blog listing (all blog-posts)
│   │   └── [slug].astro     ← single post (getStaticPaths)
├── components/
│   └── Layout.astro         ← shared layout with nav + SEO head
└── lib/
    └── strapi.ts            ← add getHomePage(), update getGlobal()
```

### Data Flow

- `index.astro`: calls `getHomePage()` + `getGlobal()`. Renders static HTML with Strapi values injected into hero, case studies, and FAQ sections. Surrounding layout/design stays hardcoded in Astro.
- `blog/index.astro`: calls `getBlogPosts()`. Renders a card grid (title, excerpt, cover image, date, categories).
- `blog/[slug].astro`: uses `getStaticPaths()` to call `getBlogPosts()` and generate one route per post. Renders full article: cover image, content (rich text), author, categories.
- `Layout.astro`: accepts `title`, `description`, `image` props for `<head>` SEO tags. Nav links come from `global`.

### Styling

Plain HTML + Tailwind CSS, consistent with `index.html` conventions. No component library.

---

## strapi.ts Updates

Add one function to `web/src/lib/strapi.ts`:

```ts
export async function getHomePage() {
  return fetchApi<any>({ endpoint: '/home-page', params: { populate: 'deep' } });
}
```

Strapi v4 single types return `{ data: { id, attributes } }`, same shape as collection types, so `wrap: true` (the default) applies. `getGlobal()` already exists and is correct.

---

## Out of Scope

- Comments, search, pagination (can be added later)
- Runtime SSR — build-time static only
- Image optimization beyond Strapi media URLs
- Authentication / preview mode
