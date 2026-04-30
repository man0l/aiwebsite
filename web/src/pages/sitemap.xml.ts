import type { APIRoute } from 'astro';
import { getBlogPosts } from '../lib/strapi';

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/lead-generation-for-marketing-agencies', priority: '0.7', changefreq: 'monthly' },
  { path: '/outsourced-appointment-setting', priority: '0.7', changefreq: 'monthly' },
  { path: '/best-lead-generation-companies-for-marketing-agencies', priority: '0.7', changefreq: 'monthly' },
  { path: '/white-label-lead-generation', priority: '0.7', changefreq: 'monthly' },
  { path: '/cold-email-case-study', priority: '0.7', changefreq: 'monthly' },
  { path: '/outsourced-sdr', priority: '0.7', changefreq: 'monthly' },
  { path: '/outsourced-lead-generation-for-agencies', priority: '0.7', changefreq: 'monthly' },
  { path: '/fractional-sdr', priority: '0.7', changefreq: 'monthly' },
];

function urlElement(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = (site?.toString().replace(/\/$/, '')) || 'https://flowcraftpro.com';

  let posts: any[] = [];
  try {
    posts = await getBlogPosts();
  } catch (e: any) {
    console.warn('[sitemap] Strapi unavailable, building with 0 blog posts:', e.message);
  }

  const today = new Date().toISOString().split('T')[0];

  const entries: string[] = [];

  for (const page of STATIC_PAGES) {
    entries.push(urlElement(`${siteUrl}${page.path}`, today, page.changefreq, page.priority));
  }

  for (const post of posts) {
    const lastmod = post.publishedAt
      ? new Date(post.publishedAt).toISOString().split('T')[0]
      : today;
    entries.push(urlElement(`${siteUrl}/blog/${post.slug}`, lastmod, 'monthly', '0.6'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
