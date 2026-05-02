import { notFound } from 'next/navigation';
import { env } from '@/lib/env';
import { publicUrl } from '@/lib/r2';
import { createClient } from '@/lib/supabase/server';
import { PortfolioForm } from '../../PortfolioForm';
import { updateCollection, type State } from '../../actions';

export const metadata = { title: 'Edit collection · Admin' };

type CollectionRow = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string | null;
  summary: string | null;
  cover_image_alt: string | null;
  cover_image_key: string | null;
  order_index: number;
  published: boolean;
};

type ItemRow = {
  id: string;
  r2_key: string;
  file_name: string | null;
  size_bytes: number | null;
  alt: string | null;
};

export default async function EditPortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ upload_notice?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  let uploadNotice: string | null = null;
  if (typeof sp.upload_notice === 'string' && sp.upload_notice.length > 0) {
    try {
      uploadNotice = decodeURIComponent(sp.upload_notice);
    } catch {
      uploadNotice = sp.upload_notice;
    }
  }
  const supabase = await createClient();
  const { data: c } = await (supabase as any).from('portfolio_collections').select('*').eq('id', id).single();
  if (!c) notFound();
  const collection = c as CollectionRow;
  const { data: itemRows } = await (supabase as any)
    .from('portfolio_items')
    .select('id, r2_key, file_name, size_bytes, alt')
    .eq('collection_id', id)
    .order('order_index')
    .order('created_at');

  const bound = updateCollection.bind(null, id) as unknown as (
    prev: State,
    fd: FormData,
  ) => Promise<State>;

  return (
    <PortfolioForm
      action={bound}
      submitLabel="Save changes →"
      uploadNotice={uploadNotice}
      uploadsEnabled={env.hasR2()}
      coverUrl={collection.cover_image_key ? publicUrl(collection.cover_image_key) : null}
      publicBaseUrl={env.r2PublicBaseUrl() ?? null}
      items={((itemRows ?? []) as ItemRow[]).map((item) => ({
        id: item.id,
        r2_key: item.r2_key,
        file_name: item.file_name,
        size_bytes: item.size_bytes,
        alt: item.alt,
      }))}
      collection={{
        id: collection.id,
        slug: collection.slug,
        title: collection.title,
        eyebrow: collection.eyebrow ?? '',
        summary: collection.summary ?? '',
        cover_image_alt: collection.cover_image_alt ?? '',
        order_index: collection.order_index,
        published: collection.published,
      }}
    />
  );
}
