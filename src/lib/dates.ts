// All date formatting in one place so the UI voice stays consistent.

const FULL_DATE: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const SHORT_DATE: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

export const fmtFullDate = (d: Date | string | null | undefined): string =>
  d ? new Date(d).toLocaleDateString('en-US', FULL_DATE) : '—';

export const fmtShortDate = (d: Date | string | null | undefined): string =>
  d ? new Date(d).toLocaleDateString('en-US', SHORT_DATE) : '—';

export const fmtTime = (d: Date | string | null | undefined): string =>
  d ? new Date(d).toLocaleTimeString('en-US', TIME) : '—';

export const fmtDateAndTime = (d: Date | string | null | undefined): string => {
  if (!d) return '—';
  const date = new Date(d);
  return `${date.toLocaleDateString('en-US', FULL_DATE)} · ${date.toLocaleTimeString('en-US', TIME)}`;
};

// Returns { year, month: 0-11, day }
export const ymd = (d: Date) => ({
  year: d.getFullYear(),
  month: d.getMonth(),
  day: d.getDate(),
});
