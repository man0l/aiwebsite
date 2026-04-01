import type { Core } from '@strapi/strapi';
import { writeFileSync } from 'fs';

const TOKEN_FILE = '/app/seed-token.txt';
const WRITE_TOKEN_FILE = '/app/write-token.txt';
const PUBLIC_ROLE_ID = 2; // from up_roles: id=2, type=public

const PUBLIC_ACTIONS = [
  'api::author.author.find',
  'api::author.author.findOne',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::global.global.find',
  'api::home-page.home-page.find',
];

export async function seed({ strapi }: { strapi: Core.Strapi }) {
  console.log('[seed] Starting...');
  const knex = (strapi.db as any).connection;

  // ── 1. Refresh API token ──────────────────────────────────────────────────
  const tokenService = strapi.service('admin::api-token' as any) as any;
  const existing = await knex('strapi_api_tokens').where({ name: 'astro-build' }).select('id');
  for (const t of existing) {
    try { await tokenService.revoke(t.id); } catch {}
  }
  const created = await tokenService.create({
    name: 'astro-build',
    description: 'Read-only token for Astro SSG build',
    type: 'read-only',
    lifespan: null,
    permissions: [],
  });
  writeFileSync(TOKEN_FILE, created.accessKey);
  console.log('[seed] ✅ API token written to', TOKEN_FILE);

  // ── 1b. Full-access token for E2E tests ───────────────────────────────────
  const existingWrite = await knex('strapi_api_tokens').where({ name: 'e2e-write' }).select('id');
  for (const t of existingWrite) {
    try { await tokenService.revoke(t.id); } catch {}
  }
  const createdWrite = await tokenService.create({
    name: 'e2e-write',
    description: 'Full-access token for Playwright E2E CMS change tests',
    type: 'full-access',
    lifespan: null,
    permissions: [],
  });
  writeFileSync(WRITE_TOKEN_FILE, createdWrite.accessKey);
  console.log('[seed] ✅ Write token written to', WRITE_TOKEN_FILE);

  // ── 2. Set Public role permissions via raw SQL ────────────────────────────
  for (const action of PUBLIC_ACTIONS) {
    const existing = await knex('up_permissions').where({ action }).first();
    let permId: number;
    if (!existing) {
      const now = new Date();
      const docId = `seed-${action.replace(/[^a-z0-9]/gi, '-')}`;
      const [row] = await knex('up_permissions')
        .insert({ document_id: docId, action, created_at: now, updated_at: now, published_at: now })
        .returning('id');
      permId = row.id;
    } else {
      permId = existing.id;
    }
    // Link to public role if not already linked
    const linked = await knex('up_permissions_role_lnk')
      .where({ permission_id: permId, role_id: PUBLIC_ROLE_ID })
      .first();
    if (!linked) {
      await knex('up_permissions_role_lnk').insert({
        permission_id: permId,
        role_id: PUBLIC_ROLE_ID,
        permission_ord: permId,
      });
    }
  }
  console.log('[seed] ✅ Public permissions set for', PUBLIC_ACTIONS.length, 'actions');

  // ── 3. Seed content (idempotent) ─────────────────────────────────────────
  const docs = strapi.documents;

  // Author
  const authors = await (docs as any)('api::author.author').findMany({});
  let authorDocId: string | undefined;
  if (authors.length === 0) {
    const a = await (docs as any)('api::author.author').create({
      data: { name: 'FlowCraft Team', bio: 'AI automation experts helping agencies scale.' },
    });
    authorDocId = a.documentId;
    console.log('[seed] Created author:', a.name);
  } else {
    authorDocId = authors[0].documentId;
    console.log('[seed] Author exists, skipping');
  }

  // Category
  const categories = await (docs as any)('api::category.category').findMany({});
  let categoryDocId: string | undefined;
  if (categories.length === 0) {
    const c = await (docs as any)('api::category.category').create({
      data: { name: 'AI Automation', slug: 'ai-automation' },
    });
    categoryDocId = c.documentId;
    console.log('[seed] Created category:', c.name);
  } else {
    categoryDocId = categories[0].documentId;
    console.log('[seed] Category exists, skipping');
  }

  // Blog post
  const posts = await (docs as any)('api::blog-post.blog-post').findMany({});
  if (posts.length === 0) {
    await (docs as any)('api::blog-post.blog-post').create({
      data: {
        title: 'How AI Outreach Tripled Our Agency Revenue',
        slug: 'ai-outreach-tripled-revenue',
        excerpt: "We replaced manual cold outreach with a fully automated AI pipeline. Here's exactly what we built and the results after 90 days.",
        content: '<p>Starting an AI outreach campaign doesn\'t have to be hard. In this post we walk through the exact stack we used.</p><h2>The Stack</h2><p>Multi-channel sequencing combined with a fine-tuned model to personalise every email at scale.</p><h2>Results After 90 Days</h2><p>3× booked calls, 2× close rate, 40% lower CAC.</p>',
        readingTime: 5,
        author: authorDocId,
        categories: [categoryDocId],
        seo: {
          metaTitle: 'How AI Outreach Tripled Our Revenue',
          metaDescription: 'A 90-day case study on replacing manual cold outreach with an AI pipeline.',
        },
      },
      status: 'published',
    });
    console.log('[seed] Created + published blog post');
  } else {
    console.log('[seed] Blog posts exist, skipping');
  }

  // Global
  const globalDoc = await (docs as any)('api::global.global').findFirst({});
  if (!globalDoc) {
    await (docs as any)('api::global.global').create({
      data: {
        siteName: 'FlowCraft Pro',
        nav: [
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: 'FAQ', href: '/#faq' },
        ],
        socialLinks: [{ platform: 'linkedin', url: 'https://linkedin.com' }],
      },
    });
    console.log('[seed] Created Global');
  } else {
    console.log('[seed] Global exists, skipping');
  }

  // Home Page
  const homeDoc = await (docs as any)('api::home-page.home-page').findFirst({});
  if (!homeDoc) {
    await (docs as any)('api::home-page.home-page').create({
      data: {
        hero: {
          headline: 'Turn Cold Leads Into Booked Calls With AI',
          subHeadline: 'We build fully-automated AI outreach systems for agencies that want to grow without adding headcount.',
          ctaLabel: 'Book a Strategy Call',
          ctaUrl: 'https://calendly.com',
        },
        caseStudies: [
          {
            title: 'Marketing Agency — 3× Pipeline in 60 Days',
            description: 'Replaced manual LinkedIn outreach with an AI agent. Same team, triple the pipeline.',
            result: '+312% booked calls',
            industry: 'Marketing Agency',
          },
          {
            title: 'E-commerce Brand — 40% Lower CAC',
            description: 'AI-personalised email sequences cut cost-per-acquisition by nearly half.',
            result: '-40% CAC',
            industry: 'E-Commerce',
          },
        ],
        faq: [
          {
            question: 'How quickly can the system be set up?',
            answer: '<p>Most clients are live within <strong>14 days</strong>. We handle all technical setup including domain warm-up, copy, and AI agent configuration.</p>',
          },
          {
            question: 'Do I need a big email list to start?',
            answer: '<p>No. We build your target list from scratch using verified data sources. You just define the ideal client profile.</p>',
          },
        ],
      },
    });
    console.log('[seed] Created Home Page');
  } else {
    console.log('[seed] Home Page exists, skipping');
  }

  console.log('[seed] ✅ Done');
}
