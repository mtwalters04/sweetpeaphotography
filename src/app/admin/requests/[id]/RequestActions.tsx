'use client';

import { useActionState, useState } from 'react';
import { decline, postQuote, addInternalNote, type State } from '../actions';

const initial: State = { error: null, saved: false };

type ServiceOpt = { value: string; label: string };
type PhotographerOpt = { value: string; label: string };

export function RequestActions({
  requestId,
  status,
  services,
  photographers,
}: {
  requestId: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined' | 'withdrawn' | 'converted';
  services: readonly ServiceOpt[];
  photographers: readonly PhotographerOpt[];
}) {
  const [tab, setTab] = useState<'quote' | 'decline' | 'note'>('quote');
  const quoteAction = postQuote.bind(null, requestId) as unknown as (
    p: State,
    fd: FormData,
  ) => Promise<State>;
  const declineAction = decline.bind(null, requestId) as unknown as (
    p: State,
    fd: FormData,
  ) => Promise<State>;
  const noteAction = addInternalNote.bind(null, requestId) as unknown as (
    p: State,
    fd: FormData,
  ) => Promise<State>;

  const canQuote = status === 'pending' || status === 'quoted';
  const canDecline = status === 'pending' || status === 'quoted';

  return (
    <div>
      <div className="flex gap-4 text-t-12 eyebrow-label border-b border-mist mb-6">
        {canQuote && (
          <Tab active={tab === 'quote'} onClick={() => setTab('quote')}>
            Quote
          </Tab>
        )}
        {canDecline && (
          <Tab active={tab === 'decline'} onClick={() => setTab('decline')}>
            Decline
          </Tab>
        )}
        <Tab active={tab === 'note'} onClick={() => setTab('note')}>
          Internal note
        </Tab>
      </div>

      {tab === 'quote' && canQuote && (
        <QuoteForm action={quoteAction} services={services} photographers={photographers} />
      )}
      {tab === 'decline' && canDecline && <DeclineForm action={declineAction} />}
      {tab === 'note' && <NoteForm action={noteAction} />}
    </div>
  );
}

function Tab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-3 ${active ? 'border-b-2 border-ink -mb-px text-ink' : 'text-ash hover:text-ink'}`}
    >
      {children}
    </button>
  );
}

function QuoteForm({
  action,
  services,
  photographers,
}: {
  action: (p: State, fd: FormData) => Promise<State>;
  services: readonly ServiceOpt[];
  photographers: readonly PhotographerOpt[];
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="space-y-6">
      <SimpleSelect label="Service" name="session_type_id" options={services} required />
      <SimpleSelect label="Photographer" name="photographer_id" options={photographers} />
      <SimpleField label="Slot start (date and time)" name="starts_at" type="datetime-local" required />
      <SimpleField label="Duration (minutes)" name="duration_minutes" type="number" defaultValue="60" />
      <SimpleField label="Quote total (USD)" name="amount_dollars" type="number" required />
      <SimpleField label="Message to customer (optional)" name="message" textarea />
      {state.error && <p role="alert" className="text-t-14 text-red-700">{state.error}</p>}
      {state.saved && <p className="text-t-14 text-ink">Quote sent.</p>}
      <button
        type="submit"
        disabled={pending}
        className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send quote →'}
      </button>
    </form>
  );
}

function DeclineForm({ action }: { action: (p: State, fd: FormData) => Promise<State> }) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="space-y-6">
      <SimpleField label="Reason (shared with customer)" name="reason" textarea />
      {state.error && <p role="alert" className="text-t-14 text-red-700">{state.error}</p>}
      {state.saved && <p className="text-t-14 text-ink">Declined.</p>}
      <button
        type="submit"
        disabled={pending}
        className="text-t-12 eyebrow-label text-red-700 border-b border-red-700 pb-1 hover:underline disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Decline →'}
      </button>
    </form>
  );
}

function NoteForm({ action }: { action: (p: State, fd: FormData) => Promise<State> }) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className="space-y-6">
      <SimpleField label="Internal note (not shared with customer)" name="body" textarea required />
      {state.error && <p role="alert" className="text-t-14 text-red-700">{state.error}</p>}
      {state.saved && <p className="text-t-14 text-ink">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="text-t-12 eyebrow-label text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Add note'}
      </button>
    </form>
  );
}

function SimpleField({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 eyebrow-label mb-3">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          rows={3}
          className="w-full bg-transparent border border-mist focus:border-ink p-3 text-t-14 outline-none font-light"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-14 outline-none font-light"
        />
      )}
    </div>
  );
}

function SimpleSelect({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-ash text-t-12 eyebrow-label mb-3">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        className="w-full bg-transparent border-b border-ink/30 focus:border-ink py-3 text-t-14 outline-none font-light"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
