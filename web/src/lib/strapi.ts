const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

interface RequestOptions {
  endpoint: string;
  params?: Record<string, string>;
  wrap?: boolean;
}

async function fetchApi<T>({ endpoint, params = {}, wrap = true }: RequestOptions): Promise<T> {
  const url = new URL(`${STRAPI_URL}/api${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status} ${res.statusText} for ${endpoint}`);
  }

  const json = await res.json();
  return wrap ? (json.data as T) : (json as unknown as T);
}

export async function getPages(params?: Record<string, string>) {
  return fetchApi<any[]>({ endpoint: '/pages', params });
}

export async function getPage(slug: string, params?: Record<string, string>) {
  return fetchApi<any>({
    endpoint: `/pages`,
    params: { 'filters[slug][$eq]': slug, populate: '*', ...params },
  });
}

export async function getBlogPosts(params?: Record<string, string>) {
  return fetchApi<any[]>({ endpoint: '/blog-posts', params: { populate: '*', ...params } });
}

export async function getBlogPost(slug: string, params?: Record<string, string>) {
  return fetchApi<any>({
    endpoint: `/blog-posts`,
    params: { 'filters[slug][$eq]': slug, populate: '*', ...params },
  });
}

export async function getGlobal() {
  return fetchApi<any>({ endpoint: '/global', params: { populate: '*' } });
}

export async function getHomePage() {
  // Build query string manually to avoid URLSearchParams double-encoding brackets
  const qs = [
    'populate[hero][populate]=*',
    'populate[calculator]=*',
    'populate[logoMarquee][populate][logos]=*',
    'populate[caseStudies]=*',
    'populate[systemsTabs][populate][tabs][populate]=*',
    'populate[processTimeline][populate][steps][populate]=*',
    'populate[whoItIsFor][populate][cards]=*',
    'populate[resultsChart][populate][dataPoints]=*',
    'populate[faq]=*',
    'populate[ctaSection]=*',
  ].join('&');
  const res = await fetch(`${STRAPI_URL}/api/home-page?${qs}`, {
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Strapi API error: ${res.status} ${res.statusText} for /home-page`);
  const json = await res.json();
  return json.data as any;
}

export { STRAPI_URL };
