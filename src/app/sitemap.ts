import type { MetadataRoute } from 'next';
import { PORTFOLIO } from '@/lib/content/portfolio';
import { SERVICES } from '@/lib/content/services';
import { STUDIO } from '@/lib/content/studio';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${STUDIO.url}/`, lastModified: now, priority: 1 },
    { url: `${STUDIO.url}/portfolio`, lastModified: now, priority: 0.8 },
    { url: `${STUDIO.url}/services`, lastModified: now, priority: 0.8 },
    { url: `${STUDIO.url}/about`, lastModified: now, priority: 0.6 },
    { url: `${STUDIO.url}/contact`, lastModified: now, priority: 0.6 },
    { url: `${STUDIO.url}/journal`, lastModified: now, priority: 0.7 },
  ];
  const portfolio = PORTFOLIO.map((c) => ({
    url: `${STUDIO.url}/portfolio/${c.slug}`,
    lastModified: now,
    priority: 0.7,
  }));
  const services = SERVICES.map((s) => ({
    url: `${STUDIO.url}/services/${s.slug}`,
    lastModified: now,
    priority: 0.7,
  }));

  let posts: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, tags')
      .eq('status', 'published');
    if (data) {
      const postEntries: MetadataRoute.Sitemap = data.map((p) => ({
        url: `${STUDIO.url}/journal/${p.slug}`,
        lastModified: new Date(p.updated_at),
        priority: 0.6,
      }));
      const tagSet = new Set<string>();
      for (const p of data) for (const t of p.tags) tagSet.add(t);
      const tagEntries: MetadataRoute.Sitemap = Array.from(tagSet).map((t) => ({
        url: `${STUDIO.url}/journal/tag/${encodeURIComponent(t)}`,
        lastModified: now,
        priority: 0.4,
      }));
      posts = [...postEntries, ...tagEntries];
    }
  } catch {
    // Sitemap gracefully degrades if DB is unreachable.
  }

  return [...base, ...portfolio, ...services, ...posts];
}
