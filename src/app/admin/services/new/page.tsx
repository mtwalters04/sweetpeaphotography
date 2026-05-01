import { ServiceForm } from '../ServiceForm';
import { createService } from '../actions';

export const metadata = { title: 'New service · Admin' };

export default function NewServicePage() {
  return (
    <ServiceForm
      action={createService}
      submitLabel="Create →"
      service={{
        id: null,
        slug: '',
        name: '',
        eyebrow: '',
        summary: '',
        description: '',
        duration_minutes: 60,
        starting_at_dollars: 0,
        deposit_pct: 0.3,
        includes: '',
        order_index: 0,
        active: true,
      }}
    />
  );
}
