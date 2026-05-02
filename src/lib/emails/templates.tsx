import { EmailShell, styles } from './shell';
import { fmtDateAndTime, fmtFullDate } from '../dates';
import { formatUsd } from '../money';

// ── Booking ────────────────────────────────────────────────

export function BookingConfirmedEmail({
  customerName,
  sessionTypeName,
  startsAt,
  amountCents,
  depositCents,
  manageUrl,
}: {
  customerName: string;
  sessionTypeName: string;
  startsAt: string;
  amountCents: number;
  depositCents: number;
  manageUrl: string;
}) {
  return (
    <EmailShell preview={`Your ${sessionTypeName} is confirmed.`}>
      <h1 style={styles.h1}>Your session is on the calendar.</h1>
      <p style={styles.body}>
        Hi {customerName}, thank you for booking. Here are the details to keep close.
      </p>
      <div style={styles.card}>
        <p style={styles.meta}>{sessionTypeName}</p>
        <p style={{ ...styles.body, fontSize: '20px', margin: '4px 0 16px' }}>
          {fmtDateAndTime(startsAt)}
        </p>
        <p style={styles.meta}>
          Deposit paid: {formatUsd(depositCents)} · Balance due:{' '}
          {formatUsd(amountCents - depositCents)}
        </p>
      </div>
      <p style={styles.body}>
        We will be in touch a week before with the location, what to wear, and what to expect. If
        anything changes, just reply to this email.
      </p>
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={manageUrl} style={styles.button}>
          View my booking
        </a>
      </p>
    </EmailShell>
  );
}

export function AdminNewBookingEmail({
  customerName,
  customerEmail,
  sessionTypeName,
  startsAt,
  amountCents,
  depositCents,
  adminUrl,
}: {
  customerName: string;
  customerEmail: string;
  sessionTypeName: string;
  startsAt: string;
  amountCents: number;
  depositCents: number;
  adminUrl: string;
}) {
  return (
    <EmailShell preview={`New booking — ${customerName}`}>
      <h1 style={styles.h1}>New booking.</h1>
      <p style={styles.body}>
        {customerName} ({customerEmail}) just confirmed a {sessionTypeName} for{' '}
        {fmtDateAndTime(startsAt)}.
      </p>
      <div style={styles.card}>
        <p style={styles.meta}>Deposit: {formatUsd(depositCents)}</p>
        <p style={styles.meta}>Total: {formatUsd(amountCents)}</p>
        <p style={styles.meta}>Balance: {formatUsd(amountCents - depositCents)}</p>
      </div>
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={adminUrl} style={styles.button}>
          Open in admin
        </a>
      </p>
    </EmailShell>
  );
}

export function ShootReminderEmail({
  customerName,
  sessionTypeName,
  startsAt,
  manageUrl,
}: {
  customerName: string;
  sessionTypeName: string;
  startsAt: string;
  manageUrl: string;
}) {
  return (
    <EmailShell preview={`A week out — your ${sessionTypeName} is on ${fmtFullDate(startsAt)}.`}>
      <h1 style={styles.h1}>A week to go.</h1>
      <p style={styles.body}>
        Hi {customerName}, just a quiet note that your {sessionTypeName} is in seven days —{' '}
        {fmtDateAndTime(startsAt)}.
      </p>
      <p style={styles.body}>
        We will reach out in the next day or two with the final details. If you have questions
        before then, reply to this email.
      </p>
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={manageUrl} style={styles.button}>
          View my booking
        </a>
      </p>
    </EmailShell>
  );
}

export function GalleryDeliveredEmail({
  customerName,
  galleryUrl,
}: {
  customerName: string;
  galleryUrl: string;
}) {
  return (
    <EmailShell preview="Your photographs are ready.">
      <h1 style={styles.h1}>Your photographs are ready.</h1>
      <p style={styles.body}>Hi {customerName}, the gallery from your session is delivered.</p>
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={galleryUrl} style={styles.button}>
          Open my gallery
        </a>
      </p>
      <p style={{ ...styles.meta, marginTop: '24px' }}>
        Download links expire after 30 days. You can regenerate from your account anytime.
      </p>
    </EmailShell>
  );
}

// ── Custom requests ─────────────────────────────────────

export function RequestReceivedEmail({
  customerName,
  manageUrl,
}: {
  customerName: string;
  manageUrl: string;
}) {
  return (
    <EmailShell preview="We received your request.">
      <h1 style={styles.h1}>Thank you.</h1>
      <p style={styles.body}>
        Hi {customerName}, we have your request and will reply within two business days with a
        quote or a question.
      </p>
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={manageUrl} style={styles.button}>
          View my request
        </a>
      </p>
    </EmailShell>
  );
}

export function AdminNewRequestEmail({
  customerName,
  customerEmail,
  customerPhone,
  preferredDate,
  message,
  adminUrl,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  preferredDate: string | null;
  message: string;
  adminUrl: string;
}) {
  return (
    <EmailShell preview={`New request — ${customerName}`}>
      <h1 style={styles.h1}>New custom request.</h1>
      <p style={styles.body}>
        {customerName} ({customerEmail})
        {preferredDate ? ` is asking about ${fmtFullDate(preferredDate)}.` : '.'}
      </p>
      {customerPhone && <p style={styles.meta}>Phone: {customerPhone}</p>}
      <div style={styles.card}>
        <p style={{ ...styles.body, fontSize: '15px', whiteSpace: 'pre-wrap' }}>{message}</p>
      </div>
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={adminUrl} style={styles.button}>
          Open in admin
        </a>
      </p>
    </EmailShell>
  );
}

export function RequestQuotedEmail({
  customerName,
  amountCents,
  message,
  acceptUrl,
}: {
  customerName: string;
  amountCents: number;
  message: string | null;
  acceptUrl: string;
}) {
  return (
    <EmailShell preview="Your quote is ready.">
      <h1 style={styles.h1}>Your quote is ready.</h1>
      <p style={styles.body}>
        Hi {customerName}, we have prepared a quote for your request.
      </p>
      <div style={styles.card}>
        <p style={styles.meta}>Total session</p>
        <p style={{ ...styles.body, fontSize: '28px', margin: '4px 0' }}>
          {formatUsd(amountCents)}
        </p>
        <p style={styles.meta}>
          A 30% deposit will confirm the date. The balance is due on the day of the shoot.
        </p>
      </div>
      {message && <p style={{ ...styles.body, whiteSpace: 'pre-wrap' }}>{message}</p>}
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={acceptUrl} style={styles.button}>
          Accept and pay deposit
        </a>
      </p>
    </EmailShell>
  );
}

export function RequestDeclinedEmail({
  customerName,
  reason,
}: {
  customerName: string;
  reason: string | null;
}) {
  return (
    <EmailShell preview="A note about your request.">
      <h1 style={styles.h1}>About your request.</h1>
      <p style={styles.body}>
        Hi {customerName}, thank you for reaching out — unfortunately we will not be able to take
        this one on.
      </p>
      {reason && (
        <div style={styles.card}>
          <p style={{ ...styles.body, fontSize: '15px', whiteSpace: 'pre-wrap' }}>{reason}</p>
        </div>
      )}
      <p style={styles.body}>
        We hope to work together another time. You are always welcome to send another request.
      </p>
    </EmailShell>
  );
}

// ── Credits ────────────────────────────────────────────

export function CreditIssuedEmail({
  customerName,
  amountCents,
  reason,
  accountUrl,
}: {
  customerName: string;
  amountCents: number;
  reason: string;
  accountUrl: string;
}) {
  return (
    <EmailShell preview={`A studio credit of ${formatUsd(amountCents)} is on your account.`}>
      <h1 style={styles.h1}>A credit is on your account.</h1>
      <p style={styles.body}>
        Hi {customerName}, we have added {formatUsd(amountCents)} as studio credit. {reason}
      </p>
      <p style={styles.body}>It does not expire and applies to any future booking.</p>
      <p style={{ ...styles.body, marginTop: '24px' }}>
        <a href={accountUrl} style={styles.button}>
          View account
        </a>
      </p>
    </EmailShell>
  );
}
