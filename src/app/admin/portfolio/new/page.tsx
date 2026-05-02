import { PortfolioForm } from '../PortfolioForm';
import { createCollection } from '../actions';

export const metadata = { title: 'New collection · Admin' };

export default function NewPortfolioPage() {
  return (
    <PortfolioForm
      action={createCollection}
      submitLabel="Create →"
      uploadsEnabled={false}
      coverUrl={null}
      publicBaseUrl={null}
      items={[]}
      collection={{
        id: null,
        slug: '',
        title: '',
        eyebrow: '',
        summary: '',
        cover_image_alt: '',
        order_index: 0,
        published: false,
      }}
    />
  );
}
