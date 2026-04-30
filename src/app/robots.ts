import type { MetadataRoute } from 'next';
import { STUDIO } from '@/lib/content/studio';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/account', '/admin', '/api'] },
    ],
    sitemap: `${STUDIO.url}/sitemap.xml`,
  };
}
