import { createClient } from '@/lib/supabase/server';
import { STUDIO } from '@/lib/content/studio';

export const revalidate = 300;

const escape = (s: string | null | undefined) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, dek, body_md, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map((p) => {
      const url = `${STUDIO.url}/journal/${p.slug}`;
      const pub = p.published_at ? new Date(p.published_at).toUTCString() : '';
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${escape(url)}</link>
      <guid isPermaLink="true">${escape(url)}</guid>
      <pubDate>${pub}</pubDate>
      <description>${escape(p.dek ?? '')}</description>
      <content:encoded><![CDATA[${p.body_md}]]></content:encoded>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escape(STUDIO.name)} — Journal</title>
    <link>${escape(STUDIO.url)}/journal</link>
    <description>${escape(STUDIO.tagline)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
