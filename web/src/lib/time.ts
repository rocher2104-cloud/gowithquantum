/** ISO-8601 timestamps everywhere in state (what a backend will send);
 * humanize only at render time. */

export function nowIso(): string {
  return new Date().toISOString();
}

export function minutesAgoIso(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

export function timeAgo(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso; // tolerate legacy display strings
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? "1 hour ago" : `${hr} hours ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? "yesterday" : `${day} days ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return wk === 1 ? "1 week ago" : `${wk} weeks ago`;
  return new Date(then).toLocaleDateString();
}
