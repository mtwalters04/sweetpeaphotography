import { PhotographerForm } from '../PhotographerForm';
import { createPhotographer } from '../actions';

export const metadata = { title: 'New photographer · Admin' };

export default function NewPhotographerPage() {
  return (
    <PhotographerForm
      action={createPhotographer}
      submitLabel="Create →"
      photographer={{
        id: null,
        public_name: '',
        public_bio: '',
        order_index: 0,
        active: true,
      }}
    />
  );
}
