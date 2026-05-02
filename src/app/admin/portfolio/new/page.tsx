import { env } from '@/lib/env';
import { PortfolioCreateForm } from '../PortfolioCreateForm';

export const metadata = { title: 'New collection · Admin' };

export default async function NewPortfolioPage() {
  return <PortfolioCreateForm uploadsEnabled={env.hasR2()} />;
}
