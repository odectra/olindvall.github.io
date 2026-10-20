// Svenska talformat: mellanslag som tusentalsavgränsare, decimalkomma.
// Hårt mellanslag (U+00A0) så att belopp inte bryts över två rader.
const NB = ' ';
const MINUS = '−';

function group(intDigits: string): string {
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, NB);
}

export function num(v: number, decimals = 0): string {
  if (!Number.isFinite(v)) return '–';
  const neg = v < 0 && Math.abs(v) >= 0.5 / 10 ** decimals;
  const [i, d] = Math.abs(v).toFixed(decimals).split('.');
  return (neg ? MINUS : '') + group(i) + (d ? ',' + d : '');
}

export const kr = (v: number) => `${num(v)}${NB}kr`;
export const krSigned = (v: number) => (Math.round(v) > 0 ? '+' : '') + kr(v);
export const mkr = (v: number, decimals = 2) => `${num(v / 1e6, decimals)}${NB}Mkr`;
export const pct = (fraction: number, decimals = 0) => `${num(fraction * 100, decimals)}${NB}%`;
export const krPerMonth = (v: number) => `${kr(v)}/mån`;

// Avrundar till närmaste tusental för "ca"-belopp.
export const krApprox = (v: number) => `ca ${kr(Math.round(v / 1000) * 1000)}`;

// Läser in "4 800 000", "3,5" eller "−200 000" som tal. Tomt fält blir 0.
export function parseNum(raw: string): number {
  const s = raw.replace(/[\s  ]/g, '').replace(MINUS, '-').replace(',', '.');
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
}

// Format för talfältens innehåll (utan enhet).
export function fieldValue(v: number): string {
  if (!Number.isFinite(v)) return '0';
  const decimals = Number.isInteger(v) ? 0 : Math.min(3, (String(v).split('.')[1] ?? '').length);
  return num(v, decimals).replace(/ /g, ' ');
}
