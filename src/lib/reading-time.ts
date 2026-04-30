import readingTime from 'reading-time';

export function readingTimeLabel(text: string): string {
  const stat = readingTime(text);
  const minutes = Math.max(1, Math.round(stat.minutes));
  return `${minutes} min read`;
}
