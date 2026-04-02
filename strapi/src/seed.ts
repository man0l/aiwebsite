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
  'api::landing-page.landing-page.find',
  'api::landing-page.landing-page.findOne',
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

  // Global — ALWAYS UPSERT
  const globalDoc = await (docs as any)('api::global.global').findFirst({});
  const globalData = {
    siteName: 'FlowCraft Pro',
    nav: [
      { label: 'Systems', href: '/#systems' },
      { label: 'Process', href: '/#process' },
      { label: 'Results', href: '/#results' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Blog', href: '/blog' },
    ],
    socialLinks: [{ platform: 'linkedin', url: 'https://linkedin.com' }],
  };
  if (!globalDoc) {
    await (docs as any)('api::global.global').create({ data: globalData });
    console.log('[seed] Created Global');
  } else {
    await (docs as any)('api::global.global').update({ documentId: globalDoc.documentId, data: globalData });
    console.log('[seed] Updated Global nav');
  }

  // Home Page — ALWAYS UPSERT (update if exists, create if not)
  const homeDoc = await (docs as any)('api::home-page.home-page').findFirst({});
  const homeData = {
    hero: {
      headline: 'Stop Hiring Expensive SDRs. Automate 20-30 Qualified Meetings Per Month.',
      subHeadline: "Manual prospecting burnout ends here. We build the AI-first acquisition infrastructure—domains procured and warmed, multi-channel orchestration, and a \"first 5 meetings booked or you don't pay\" guarantee.",
      ctaLabel: 'Book 5 Meetings — Free Strategy Call',
      ctaUrl: 'https://calendly.com/manolt/15min',
      bgImage: 'https://aiaccelerator.bg/wp-content/uploads/2025/10/Gemini_Generated_Image_t3aczkt3aczkt3ac.png',
      complianceBadges: [{ label: 'HIPAA Compliant' }, { label: 'GDPR Compliant' }],
      founderQuote: "First 5 meetings booked or you don't pay.",
      founderName: 'Manol T., Founder',
      founderCredential: '17 years of engineering, $100k+ scaling track record',
      founderAvatarUrl: 'https://aiaccelerator.bg/wp-content/uploads/2025/12/avatar-upwork.png',
      howItWorksTitle: 'How It Works (90-Second Snapshot)',
      howItWorksSteps: [
        { number: '1.', text: 'Domains procured & warmed; AI agent loads your offers and case studies.' },
        { number: '2.', text: 'Multi-channel sequences fire (email, LinkedIn, AI follow-up) with niche pain points.' },
        { number: '3.', text: 'Calendar-ready, qualified meetings flow in—first 5 booked before you pay.' },
      ],
      pipelineTitle: 'Pipeline Visualization',
      pipelineBars: [
        { leftLabel: 'Cold outreach', rightLabel: 'Inbox ready', widthPct: 85, color: 'brand-lime' },
        { leftLabel: 'Replies nurtured', rightLabel: 'Qualified', widthPct: 65, color: 'lime-400' },
        { leftLabel: 'Booked meetings', rightLabel: 'Calendar', widthPct: 45, color: 'emerald-400' },
      ],
    },
    calculator: {
      eyebrow: 'The Cost of Silence',
      heading: 'See What 20 Missed Meetings Cost Every Month',
      subheading: "Drag the sliders to quantify the revenue lost when 20 qualified appointments aren't on your calendar.",
      defaultDealValue: 3000,
      defaultCloseRate: 20,
      ctaUrl: 'https://calendly.com/manolt/15min',
      guaranteeText: "First 5 meetings booked or you don't pay.",
    },
    logoMarquee: {
      heading: 'Trusted by Industry-Leading Agencies & Brands',
      logos: [
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo3.png', alt: 'Client Logo 1' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo2.png', alt: 'Client Logo 2' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo5.png', alt: 'Client Logo 3' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo13.png', alt: 'Client Logo 4' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo11.png', alt: 'Client Logo 5' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo1.png', alt: 'Client Logo 6' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo4.png', alt: 'Client Logo 7' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo6.png', alt: 'Client Logo 8' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo12.png', alt: 'Client Logo 9' },
        { url: 'https://aiaccelerator.bg/wp-content/uploads/2024/09/Logo14-2.png', alt: 'Client Logo 10' },
      ],
    },
    caseStudies: [
      { industry: 'AI AUTOMATION AGENCY', title: '3.1% Positive Response Rate', description: 'Built a hyper-personalized outreach system using AI site-crawling and manual lead-scrubbing to book high-intent meetings with SEO & PPC founders.', result: '3.1% positive response rate' },
      { industry: 'E-COMMERCE BUSINESS', title: '$25,000/mo Profit Increase', description: 'Overhauled fulfillment and inventory workflows in just 4 months, drastically reducing costs.', result: '$25,000/mo profit increase' },
      { industry: 'IT OUTSOURCING CO.', title: '$100k+ ARR Stabilized', description: 'Systematized their entire service delivery process, enabling consistent scaling for two consecutive years.', result: '$100k+ ARR stabilized' },
      { industry: 'NEW LINKEDIN ACCOUNT', title: '30,000+ Impressions', description: 'Built an AI-powered content system that generated significant authority from scratch in only 3 months.', result: '30,000+ impressions' },
      { industry: 'KLAVIYO EMAIL AGENCY', title: '100% Admin Automation', description: 'Eliminated a 60-minute manual onboarding bottleneck by engineering a 3-tier n8n workflow connecting ClickUp, GDrive, and Slack.', result: '100% admin automation' },
      { industry: 'CLICKROI · CONSTRUCTION', title: 'No-Burnout Lead Engine', description: 'Gatekeeper-bypass cold outreach for general contractors, delivering a steady pipeline without manual prospecting burnout.', result: 'No-burnout lead engine' },
      { industry: 'LOCAL CLICK STUDIO · MED SPAS', title: '24/7 Patient Intake', description: 'AI-assisted nurturing to fix speed-to-lead for Med Spas, capturing inquiries instantly and boosting booked consults.', result: '24/7 patient intake' },
    ],
    systemsTabs: {
      heading: 'Your AI-Powered Client Acquisition System',
      subheading: 'Built for PPC, SEO, and digital agencies serving local businesses. Each component tackles the biggest blockers to scaling fulfillment-heavy, service-based models.',
      tabs: [
        {
          tabId: 'email',
          emoji: '✉️',
          label: 'Niche Outreach',
          title: 'Niche-Specific Decision Maker Outreach',
          body: "Bypass gatekeepers and land in owners' inboxes with AI-personalized outreach tied to vertical pain (missed calls, rising CPL).",
          bullets: [
            { title: 'Decision-Maker Sourcing', text: 'Data-backed lists of owners and partners—not generic front-desk contacts—so outreach never stalls with gatekeepers.' },
            { title: 'Pain-Point Personalization', text: 'Sequences reference vertical-specific problems (e.g., 20% missed new-patient calls, rising HVAC lead costs) to drive replies.' },
          ],
          miniCaseStudyLabel: 'ClickROI · Construction',
          miniCaseStudyText: 'Used this inbox-ready system to bypass manual prospecting and book contractor meetings without burning out their team.',
        },
        {
          tabId: 'linkedin',
          emoji: '🔗',
          label: 'Authority',
          title: 'Vertical Authority Positioning',
          body: 'Own your niche on LinkedIn so sales calls start with trust, not price pressure.',
          bullets: [
            { title: 'Niche Positioning', text: 'Profiles rewritten to signal relevance to contractors, legal, dental, and hospitality owners.' },
            { title: 'Automated Warm-Up', text: 'Safe, steady outreach to 500+ decision-makers monthly so sales calls start with trust, not skepticism.' },
          ],
          miniCaseStudyLabel: null,
          miniCaseStudyText: null,
        },
        {
          tabId: 'content',
          emoji: '🤖',
          label: 'Educational Assets',
          title: 'Pain-Point Educational Assets',
          body: 'AI-assisted content that tackles immediate threats (AI search, patient loss) and nurtures leads before the call.',
          bullets: [
            { title: 'AI Drafting, Human Proof', text: 'Expert editors refine AI drafts into authoritative guides that win trust.' },
            { title: 'Multi-Channel Nurture', text: 'Assets shipped across email, LinkedIn, and retargeting to warm outbound prospects and shorten sales cycles.' },
          ],
          miniCaseStudyLabel: 'Local Click Studio · Med Spas',
          miniCaseStudyText: 'Deployed AI-assisted nurture to fix speed-to-lead, capturing patient inquiries instantly and increasing booked consults.',
        },
      ],
    },
    processTimeline: {
      eyebrow: 'How We Build & Scale',
      heading: 'One Clear Path to 20-30 Qualified Meetings',
      subheading: 'Asset build, launch, and scale in one streamlined timeline—backed by the First 5 Meetings Guarantee.',
      steps: [
        {
          number: '1',
          title: 'Asset Build',
          dateRange: 'Days 1-14',
          description: 'Dedicated domains procured and warmed; 24/7 AI agent loaded with your offers and case studies; compliance baked in (HIPAA/GDPR).',
          cards: [
            { title: 'Infrastructure', text: 'Domains + inboxes warmed, DKIM/SPF/DMARC set, SISR sharding for inbox placement.' },
            { title: 'Targeting', text: 'ICP + lookalikes from your best wins (Construction, Med Spa, Legal).' },
          ],
        },
        {
          number: '2',
          title: 'Launch',
          dateRange: 'Days 15-45',
          description: 'Multi-channel orchestration: email, LinkedIn, and AI follow-ups tuned to niche pain points (missed calls, high CPL, compliance risk).',
          cards: [
            { title: 'Messaging', text: 'PAS-driven sequences tied to vertical pains; AI personalization; reply routing to calendar.' },
            { title: 'Volume Control', text: 'High-ticket niches: 5-10 enterprise consults. High-volume niches: 20-30 patient/intake appointments.' },
          ],
        },
        {
          number: '3',
          title: 'Scale',
          dateRange: 'Days 46-90',
          description: "Optimize on reply data; automated follow-up captures the 60% of responses after touch two; no-lead-lost ops while you focus on fulfillment.",
          cards: [
            { title: 'Qualification', text: 'BANT-style filtering: Budget, Authority, Need, Timing matched to ICP before booking.' },
            { title: 'Guarantee', text: "First 5 meetings booked before you pay; ongoing target 20-30 meetings/month once ramped." },
          ],
        },
      ],
    },
    whoItIsFor: {
      heading: 'Built for Local-Focused Agencies',
      subheading: 'For PPC, SEO, and digital marketing agencies stuck in the feast-or-famine cycle and ready to productize acquisition.',
      cards: [
        { title: 'Who We Target', text: 'Practice owners, partners, and contractors—roofers, MedSpas, dental groups, law firms, restaurants, and hospitality operators.' },
        { title: 'Core Pain We Solve', text: 'Unpredictable referrals, high churn, and manual fulfillment that keeps you from scaling beyond a handful of retainers.' },
        { title: 'Why It Works', text: 'Gatekeeper-bypass outreach, niche authority positioning, and educational assets that pre-sell before the first call.' },
      ],
    },
    resultsChart: {
      heading: 'Data-Backed Growth',
      subheading: "Below is an example of a typical agency's pipeline growth.",
      dataPoints: [
        { label: 'Month 1', value: 1 },
        { label: 'Month 2', value: 3 },
        { label: 'Month 3', value: 5 },
        { label: 'Month 4', value: 7 },
      ],
    },
    faq: [
      {
        question: 'What is the results guarantee?',
        answer: '<p>A full money-back guarantee is provided. If the system does not generate a minimum of 5 qualified sales opportunities on your calendar by the end of the 90-day program, you will receive a 100% refund of the service fee.</p>',
      },
      {
        question: 'How long until we see results?',
        answer: '<p>Most clients see the first qualified meetings booked within 3-4 weeks of launch. The system is expected to be generating a consistent flow of 5+ calls per month within 90 days.</p>',
      },
      {
        question: 'Is this a fit for new agencies?',
        answer: "<p>This system works best for established agencies that already have case studies and a clear, validated offer. If you're pre-revenue or haven't proven your service delivery, it may be too early.</p>",
      },
      {
        question: 'What time commitment is needed?',
        answer: '<p>Minimal. Your input is required during the initial strategy phase (2-3 hours total). After that, 99% of the work is handled. You just need to show up to the sales calls.</p>',
      },
    ],
    ctaSection: {
      heading: 'Ready to Build Your Growth Engine?',
      subheading: "Stop waiting for referrals. Build a predictable system that brings your ideal clients to you. Book a free, no-obligation strategy call to see if it's a good fit.",
      ctaLabel: 'Book Your Free Strategy Call',
      ctaUrl: 'https://calendly.com/manolt/15min',
      guaranteeText: "Risk-Free Guarantee: Full refund if the 5+ lead goal isn't met in 90 days.",
    },
  };

  if (!homeDoc) {
    await (docs as any)('api::home-page.home-page').create({ data: homeData, status: 'published' });
    console.log('[seed] Created Home Page');
  } else {
    await (docs as any)('api::home-page.home-page').update({ documentId: homeDoc.documentId, data: homeData });
    console.log('[seed] Updated Home Page (upsert)');
  }

  // Landing pages
  const landingPages = await (docs as any)('api::landing-page.landing-page').findMany({});
  const coldEmailExists = landingPages.some((p: any) => p.slug === 'cold-email-case-study');
  if (!coldEmailExists) {
    await (docs as any)('api::landing-page.landing-page').create({
      data: {
        slug: 'cold-email-case-study',
        title: 'The Cold Email Resurrection: How We Got a 3%+ Reply Rate for a Struggling Agency',
        hero: {
          headline: 'The Cold Email Resurrection',
          subHeadline: 'How We Got a 3%+ Reply Rate for a Struggling Agency',
          ctaLabel: 'Get the Same System for Your Agency',
          ctaUrl: 'https://calendly.com/manolt/15min',
        },
        stats: [
          { value: '3%+', label: 'Positive Reply Rate' },
          { value: '300+', label: 'Qualified Leads Generated' },
          { value: '20+', label: 'Meetings Booked Per Month' },
        ],
        phases: [
          {
            title: 'Phase 1: Infrastructure & Targeting (Week 1-2)',
            items: [
              'Dedicated sending domains procured, warmed, and authenticated (DKIM/SPF/DMARC)',
              'Hand-scraped list of 500+ SEO & PPC agency founders — verified emails only',
              'AI agent loaded with client\'s case studies and unique value proposition',
            ],
          },
          {
            title: 'Phase 2: Outreach & Optimization (Week 3-12)',
            items: [
              'Multi-touch sequences: initial email + 2 follow-ups tuned to reply data',
              'AI-personalized first lines referencing each prospect\'s site and recent work',
              'Weekly reply analysis to optimize subject lines and CTAs',
            ],
          },
        ],
        proofPoints: [
          '3.1% positive reply rate on cold email (industry average: 0.5-1%)',
          '20+ calendar-ready meetings booked per month within 60 days of launch',
        ],
        ctaSection: {
          heading: 'Want the Same System for Your Agency?',
          subheading: 'We\'ll build your AI outreach infrastructure and guarantee 5 qualified meetings before you pay a cent.',
          ctaLabel: 'Book a Free Strategy Call',
          ctaUrl: 'https://calendly.com/manolt/15min',
          guaranteeText: 'First 5 meetings booked or you don\'t pay.',
        },
      },
      status: 'published',
    });
    console.log('[seed] Created landing page: cold-email-case-study');
  } else {
    console.log('[seed] Landing page exists, skipping');
  }

  console.log('[seed] ✅ Done');
}
