// Duration helpers for the CV page.
// A month is written as 'YYYY-MM'. Periods are inclusive of both the start
// and end month (LinkedIn style): Oct 2022 – Jul 2023 is 10 months.

export type Month = string; // 'YYYY-MM'

export interface Period {
  start: Month;
  end?: Month; // omitted = ongoing
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toIndex(m: Month): number {
  const [y, mo] = m.split('-').map(Number);
  return y * 12 + (mo - 1);
}

function nowIndex(now: Date): number {
  return now.getFullYear() * 12 + now.getMonth();
}

function range(p: Period, now: Date): [number, number] {
  return [toIndex(p.start), p.end ? toIndex(p.end) : nowIndex(now)];
}

export function monthsIn(p: Period, now: Date = new Date()): number {
  const [a, b] = range(p, now);
  return Math.max(0, b - a + 1);
}

/** Total months covered by a set of periods, counting overlapping months once. */
export function monthsCovered(periods: Period[], now: Date = new Date()): number {
  const seen = new Set<number>();
  for (const p of periods) {
    const [a, b] = range(p, now);
    for (let i = a; i <= b; i++) seen.add(i);
  }
  return seen.size;
}

export function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months || !years) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  return parts.join(', ');
}

function formatMonth(m: Month): string {
  const [y, mo] = m.split('-').map(Number);
  return `${MONTHS[mo - 1]} ${y}`;
}

export function formatPeriod(p: Period): string {
  if (p.end === p.start) return formatMonth(p.start);
  return `${formatMonth(p.start)} – ${p.end ? formatMonth(p.end) : 'Present'}`;
}
