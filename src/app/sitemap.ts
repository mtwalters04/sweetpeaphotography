import type { MetadataRoute } from 'next';
import { PORTFOLIO } from '@/lib/content/portfolio';
import { SERVICES } from '@/lib/content/services';
import { STUDIO } from '@/lib/content/studio';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base: MetadataRoute.Sitemap = [
    { url: `${STUDIO.url}/`, lastModified: now, priority: 1 },
    { url: `${STUDIO.url}/portfolio`, lastModified: now, priority: 0.8 },
    { url: `${STUDIO.url}/services`, lastModified: now, priority: 0.8 },
    { url: `${STUDIO.url}/about`, lastModified: now, priority: 0.6 },
    { url: `${STUDIO.url}/contact`, lastModified: now, priority: 0.6 },
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
  return [...base, ...portfolio, ...services];
}
