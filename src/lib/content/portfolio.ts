import { createClient } from '@/lib/supabase/server';
import { publicUrl } from '@/lib/r2';

export type PortfolioImage = {
  id: string;
  src: string;
  alt: string;
  orientation: 'portrait' | 'landscape' | 'square';
};

export type PortfolioCollection = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  cover: PortfolioImage;
  images: readonly PortfolioImage[];
};

type CollectionRow = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string | null;
  summary: string | null;
  cover_image_key: string | null;
  cover_image_alt: string | null;
};

type ItemRow = {
  id: string;
  collection_id: string;
  r2_key: string;
  alt: string | null;
  orientation: 'portrait' | 'landscape' | 'square';
};

function urlFromKey(key: string): string {
  return publicUrl(key) ?? '/images/hero-home-estate.png';
}

function mapCollection(row: CollectionRow, images: readonly ItemRow[]): PortfolioCollection {
  const mappedImages = images.map((image) => ({
    id: image.id,
    src: urlFromKey(image.r2_key),
    alt: image.alt ?? row.title,
    orientation: image.orientation,
  }));
  const coverFromItem = mappedImages[0] ?? null;
  const cover = row.cover_image_key
    ? {
        id: `cover-${row.id}`,
        src: urlFromKey(row.cover_image_key),
        alt: row.cover_image_alt ?? row.title,
        orientation: coverFromItem?.orientation ?? 'landscape',
      }
    : (coverFromItem ?? {
        id: `cover-${row.id}`,
        src: '/images/hero-home-estate.png',
        alt: row.title,
        orientation: 'landscape',
      });
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    eyebrow: row.eyebrow ?? '',
    summary: row.summary ?? '',
    cover,
    images: mappedImages,
  };
}

export async function getPortfolioCollections(): Promise<PortfolioCollection[]> {
  const supabase = await createClient();
  const { data: collections } = await (supabase as any)
    .from('portfolio_collections')
    .select('id, slug, title, eyebrow, summary, cover_image_key, cover_image_alt')
    .eq('published', true)
    .order('order_index')
    .order('created_at', { ascending: false });
  if (!collections || collections.length === 0) return [];

  const ids = collections.map((c: CollectionRow) => c.id);
  const { data: items } = await (supabase as any)
    .from('portfolio_items')
    .select('id, collection_id, r2_key, alt, orientation')
    .in('collection_id', ids)
    .order('order_index')
    .order('created_at');
  const byCollection = new Map<string, ItemRow[]>();
  for (const item of (items ?? []) as ItemRow[]) {
    byCollection.set(item.collection_id, [...(byCollection.get(item.collection_id) ?? []), item]);
  }

  return (collections as CollectionRow[]).map((row) => mapCollection(row, byCollection.get(row.id) ?? []));
}

export async function getPortfolioCollection(slug: string): Promise<PortfolioCollection | null> {
  const all = await getPortfolioCollections();
  return all.find((collection) => collection.slug === slug) ?? null;
}
