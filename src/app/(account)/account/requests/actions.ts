'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';

export async function withdrawRequest(requestId: string): Promise<void> {
  const { supabase, userId } = await requireUser();
  await supabase
    .from('custom_requests')
    .update({ status: 'withdrawn', withdrawn_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('customer_id', userId);
  revalidatePath('/account/requests');
  revalidatePath(`/account/requests/${requestId}`);
}
