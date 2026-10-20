// Husköpskalkyl — ren beräkningsmodul utan DOM-beroenden.
// Alla belopp i kronor. Avrundning sker bara vid visning.

import { kr } from './format.ts';

// Påhittade exempelvärden. Fält som börjar med "r" är regler/konstanter som
// användaren kan ändra i gruppen "Regler".
export const DEFAULTS = {
  // Köp
  price: 4_800_000,
  area: 120,
  lagfart: 1.5,
  pantex: 500_000,
  reno: 50_000,
  driftyr: 38_000,
  evextra: 0,
  fastavg: 9_000,
  // Prisreglaget
  mv: 4_700_000,
  vhigh: 4_950_000,
  max: 4_900_000,
  // Försäljning
  sale: 3_400_000,
  mv42: 3_350_000,
  loan: 1_900_000,
  mak: 2,
  extra: 480_000,
  buy: 2_600_000,
  impr: 100_000,
  // Ränta och inkomst
  rate: 3.5,
  stress: 6.5,
  gross1: 52_000,
  net1: 38_500,
  gross2: 46_000,
  net2: 35_000,
  othercap: 0,
  // Inkomstbortfall
  lossWho: 1,
  lossType: 1,
  lossMonths: 12,
  cutPct: 20,
  notice: 3,
  ins1: 0,
  ins2: 0,
  sjPct1: 0,
  sjMon1: 3,
  sjPct2: 0,
  sjMon2: 3,
  kskatt: 32,
  expenses: 20_000,
  cashbuf: 50_000,
  // Monte Carlo
  mcHouse: 3,
  mcHouseVol: 7,
  mcStock: 6.5,
  mcStockVol: 16,
  mcCorr: 0.3,
  mcTax: 1,
  mcSave: 0,
  // ISK
  isk1: 400_000,
  isk2: 600_000,
  // Regler (riktvärden hösten 2026)
  rTak: 90,
  rSkuldkvot: 4.5,
  rAmLtvHi: 70,
  rAmHi: 2,
  rAmLtvLo: 50,
  rAmLo: 1,
  rDedLo: 30,
  rDedCap: 100_000,
  rDedHi: 21,
  rCapTax: 30,
  rLagFee: 825,
  rPantPct: 2,
  rPantFee: 375,
  rGainTax: 22,
  rLossShare: 50,
  rMoveGreen: 6,
  rMoveYellow: 9,
  rHp: 10,
  rSkikt: 643_100,
  rGa: 25_000,
  rStateTax: 20,
  rAkTak: 34_000,
  rInsTak: 100_000,
  rAk1: 80,
  rAk2: 70,
  rAk3: 65,
  rAk4: 60,
  rAk5: 55,
  rSjFactor: 77.6,
  rSjTak: 49_333,
};

export const RULES_DATE = '2026-10';
export const DAYS_PER_MONTH = 21.75;
export const LOAN_MARGIN = 300_000;
export const EXTRA_SHARE = 0.1;
export const MC_SEED = 20261018;
export const MC_PATHS = 1000;

export type NumKey = keyof typeof DEFAULTS;
export type Inputs = Record<NumKey, number> & { selling: boolean };
export type Level = 'good' | 'mid' | 'bad';

export function defaultInputs(): Inputs {
  return { ...DEFAULTS, selling: true };
}

const fin = (v: number) => (Number.isFinite(v) ? v : 0);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const div = (a: number, b: number) => (b !== 0 && Number.isFinite(a / b) ? a / b : 0);

// Rensar bort NaN och nollar försäljningen när användaren inte säljer något.
export function effective(raw: Inputs): Inputs {
  const x = { ...raw };
  for (const k of Object.keys(DEFAULTS) as NumKey[]) x[k] = fin(Number(x[k]));
  if (!x.selling) {
    x.sale = 0;
    x.mv42 = 0;
    x.loan = 0;
    x.mak = 0;
    x.buy = 0;
    x.impr = 0;
  }
  return x;
}

// 10 % av köpesumman, avrundat till närmaste 1 000 kr.
export function autoExtra(price: number): number {
  return Math.round((fin(price) * EXTRA_SHARE) / 1000) * 1000;
}

export interface Monthly {
  rate: number;
  i: number;
  a: number;
  drift: number;
  tot: number;
  ded: number;
  net: number;
}

export function monthly(x: Inputs, nl: number, rate: number, ar: number, drift: number): Monthly {
  const i = (nl * rate) / 100 / 12;
  const a = (nl * ar) / 100 / 12;
  const iy = i * 12;
  const cap = x.rDedCap;
  const ded = ((Math.min(iy, cap) * x.rDedLo) / 100 + (Math.max(iy - cap, 0) * x.rDedHi) / 100) / 12;
  const tot = i + a + drift;
  return { rate, i, a, drift, tot, ded, net: tot - ded };
}

export function capTax(x: Inputs, net: number): number {
  if (net >= 0) return (net * x.rCapTax) / 100;
  const d = -net;
  return -((Math.min(d, x.rDedCap) * x.rDedLo) / 100 + (Math.max(d - x.rDedCap, 0) * x.rDedHi) / 100);
}

export interface Base {
  x: Inputs;
  gross: number;
  net: number;
  drift: number;
  sellNet: number;
  makCost: number;
  gain: number;
  tax: number;
  cash: number;
  E: number;
  lag: number;
  nl: number;
  pant: number;
  newPant: number;
  costs: number;
  down: number;
  ltv: number;
  sk: number;
  ar: number;
  m: Monthly;
  ms: Monthly;
  left: number;
  leftStress: number;
  sqm: number;
}

// Kärnan: försäljning, köpkostnader, lån och månadskostnad.
export function compute(raw: Inputs): Base {
  const x = effective(raw);
  const gross = x.gross1 + x.gross2;
  const net = x.net1 + x.net2;
  const drift = (x.driftyr + x.evextra + x.fastavg) / 12;

  const sellNet = x.sale * (1 - x.mak / 100);
  const gain = sellNet - x.buy - x.impr;
  const tax = gain > 0 ? (gain * x.rGainTax) / 100 : 0;
  const cash = sellNet - x.loan + x.extra - tax;

  const E = Math.max(x.pantex, 0);
  const lag = (x.price * x.lagfart) / 100 + x.rLagFee;
  const p = x.rPantPct / 100;
  const nl0 = Math.max(0, x.price + lag - cash);
  let nl = nl0;
  let pant = 0;
  if (nl0 > E) {
    nl = Math.max(0, div(x.price + lag + x.rPantFee - cash - p * E, 1 - p));
    pant = p * Math.max(0, nl - E) + x.rPantFee;
  }
  const costs = nl === 0 ? lag : lag + pant;
  const ltv = x.price > 0 ? nl / x.price : 0;
  const sk = gross > 0 ? nl / (gross * 12) : 0;
  const ar = ltv > x.rAmLtvHi / 100 ? x.rAmHi : ltv > x.rAmLtvLo / 100 ? x.rAmLo : 0;

  const m = monthly(x, nl, x.rate, ar, drift);
  const ms = monthly(x, nl, x.stress, ar, drift);

  return {
    x,
    gross,
    net,
    drift,
    sellNet,
    makCost: x.sale - sellNet,
    gain,
    tax,
    cash,
    E,
    lag,
    nl,
    pant: nl === 0 ? 0 : pant,
    newPant: Math.max(0, nl - E),
    costs,
    down: x.price - nl,
    ltv,
    sk,
    ar,
    m,
    ms,
    left: net - m.net,
    leftStress: net - ms.net,
    sqm: x.area > 0 ? Math.round(x.price / x.area / 10) * 10 : 0,
  };
}

// Reavinstförlust: återbäring via deklarationen.
export function refundCalc(b: Base): { deductible: number; refund: number } {
  if (b.gain >= 0) return { deductible: 0, refund: 0 };
  const x = b.x;
  const ded = (-b.gain * x.rLossShare) / 100;
  const interest = b.m.i * 12;
  const without = x.othercap - interest;
  const withLoss = without - ded;
  return { deductible: ded, refund: capTax(x, without) - capTax(x, withLoss) };
}

export function loanPromise(b: Base): { ask: number; maxPant: number; maxP: number } {
  const x = b.x;
  const ask = Math.ceil((b.nl + LOAN_MARGIN * (1 - x.mak / 100)) / 100_000) * 100_000;
  const p = x.rPantPct / 100;
  const maxPant = ask > b.E ? p * (ask - b.E) + x.rPantFee : 0;
  const maxP = div(ask - maxPant + b.cash - x.rLagFee, 1 + x.lagfart / 100);
  return { ask, maxPant, maxP };
}

// ---------- Inkomstbortfall ----------

export function salTax(x: Inputs, g: number): number {
  const skikt = x.rSkikt / 12;
  return (x.kskatt / 100) * g + (x.rStateTax / 100) * Math.max(0, g - skikt);
}

export function benTax(x: Inputs, b: number): number {
  const skikt = x.rSkikt / 12;
  const ga = x.rGa / 12;
  return (x.kskatt / 100) * Math.max(0, b - ga) + (x.rStateTax / 100) * Math.max(0, b - skikt);
}

export function akassa(x: Inputs, gross: number, dayStart: number, insDays: number): number {
  const b34 = Math.min(gross, x.rAkTak);
  const b100 = Math.max(b34, Math.min(gross, x.rInsTak));
  const dayEnd = dayStart + DAYS_PER_MONTH;
  const phases: [number, number, number][] = [
    [0, 100, x.rAk1 / 100],
    [100, 200, x.rAk2 / 100],
    [200, 300, x.rAk3 / 100],
    [300, 400, x.rAk4 / 100],
    [400, 500, x.rAk5 / 100],
  ];
  let sum = 0;
  for (const [from, to, share] of phases) {
    const o = Math.max(0, Math.min(to, dayEnd) - Math.max(from, dayStart));
    const oi = Math.max(0, Math.min(to, insDays, dayEnd) - Math.max(from, dayStart));
    sum += (b34 * share * o) / DAYS_PER_MONTH + ((b100 - b34) * share * oi) / DAYS_PER_MONTH;
  }
  return sum;
}

export function sickPay(x: Inputs, g: number, month: number, sjPct: number, sjMon: number): number {
  let ben = (x.rSjFactor / 100) * Math.min(g, x.rSjTak);
  if (sjPct > 0 && month <= sjMon) ben = Math.max(ben, (sjPct / 100) * g);
  return ben;
}

export interface SimRow {
  m: number;
  inc: number;
  cost: number;
  bal: number;
  buf: number;
  room: number;
}

export interface Sim {
  rows: SimRow[];
  out: number | null;
  end: number;
  first: number | null;
  draw: number;
  start: number;
}

export function startBuffer(b: Base): number {
  const x = b.x;
  return x.isk1 + x.isk2 - x.extra + x.cashbuf - x.reno;
}

export function lossMonths(x: Inputs): number {
  return clamp(Math.round(x.lossMonths) || 1, 1, 18);
}

export function sim(b: Base, who: number, type: number, N: number, pause: boolean): Sim {
  const x = b.x;
  const housing = pause ? b.m.net - b.m.a : b.m.net;
  const start = startBuffer(b);
  let buf = start;
  let out: number | null = null;
  let first: number | null = null;
  let draw = 0;
  const rows: SimRow[] = [];
  const people = [
    { g: x.gross1, n: x.net1, ins: x.ins1, sjPct: x.sjPct1, sjMon: x.sjMon1 },
    { g: x.gross2, n: x.net2, ins: x.ins2, sjPct: x.sjPct2, sjMon: x.sjMon2 },
  ];
  for (let month = 1; month <= N; month++) {
    let inc = 0;
    people.forEach((pp, idx) => {
      const p = idx + 1;
      const lost = who === p || who === 3;
      const { g, n } = pp;
      if (!lost) {
        inc += n;
        return;
      }
      if (type === 3) {
        const g2 = g * (1 - x.cutPct / 100);
        inc += n - (g - g2) + (salTax(x, g) - salTax(x, g2));
        return;
      }
      if (type === 1 && month <= x.notice) {
        inc += n;
        return;
      }
      let ben = 0;
      if (type === 1) ben = akassa(x, g, (month - 1 - x.notice) * DAYS_PER_MONTH, pp.ins);
      if (type === 2) ben = sickPay(x, g, month, pp.sjPct, pp.sjMon);
      inc += ben - benTax(x, ben);
    });
    const cost = housing + x.expenses;
    const bal = inc - cost;
    buf += bal;
    if (buf < 0 && out === null) out = month;
    if (bal < 0) {
      draw -= bal;
      if (first === null) first = month;
    }
    rows.push({ m: month, inc, cost, bal, buf, room: inc - housing });
  }
  return { rows, out, end: buf, first, draw, start };
}

export type SimVerdict = 'ok' | 'pause' | 'fail';

export function simVerdict(b: Base, who: number, type: number, N: number): { s: Sim; p: Sim; verdict: SimVerdict } {
  const s = sim(b, who, type, N, false);
  const p = sim(b, who, type, N, true);
  const verdict: SimVerdict = s.out === null ? 'ok' : p.out === null ? 'pause' : 'fail';
  return { s, p, verdict };
}

export function simLevel(s: Sim): Level {
  if (s.draw <= 0) return 'good';
  return s.out === null ? 'mid' : 'bad';
}

// ---------- Tillgångar före och efter ----------

export interface NWSide {
  hus: number;
  spar: number;
  skuld: number;
  isk1: number;
  isk2: number;
  shared: number;
  p1: number;
  p2: number;
  total: number;
}

function nwSide(hus: number, spar: number, skuld: number, isk1: number, isk2: number): NWSide {
  const shared = hus + spar - skuld;
  return { hus, spar, skuld, isk1, isk2, shared, p1: shared / 2 + isk1, p2: shared / 2 + isk2, total: shared + isk1 + isk2 };
}

export function renderNW(b: Base) {
  const x = b.x;
  const before = nwSide(x.mv42, x.cashbuf, x.loan, x.isk1, x.isk2);
  const after = nwSide(x.mv, x.cashbuf - x.reno, b.nl, x.isk1 - x.extra / 2, x.isk2 - x.extra / 2);
  const parts = [
    { key: 'overpris', label: 'Överpris mot din värdering', value: -(x.price - x.mv) },
    { key: 'costs', label: 'Köpkostnader (lagfart och pantbrev)', value: -b.costs },
    { key: 'mak', label: 'Mäklararvode', value: -b.makCost },
    { key: 'salevsmv', label: 'Försäljningspris mot marknadsvärde', value: x.sale - x.mv42 },
    { key: 'tax', label: 'Reavinstskatt', value: -b.tax },
    { key: 'reno', label: 'Renovering', value: -x.reno },
  ];
  return { before, after, parts, change: after.total - before.total };
}

// ---------- Monte Carlo ----------

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function percentile(sorted: number[], q: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const i = (n - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export interface Pct {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

function pcts(values: number[]): Pct {
  const s = values.slice().sort((a, b) => a - b);
  return { p10: percentile(s, 0.1), p25: percentile(s, 0.25), p50: percentile(s, 0.5), p75: percentile(s, 0.75), p90: percentile(s, 0.9) };
}

export interface MCYear {
  t: number;
  debt: number;
  nw: Pct;
  H: Pct;
  I: Pct;
}

export interface MC {
  Y: number;
  years: MCYear[];
  nw0: number;
  probUp: number;
  probBelowPrice: number;
  person1: Pct;
  person2: Pct;
}

export function runMC(b: Base, Y = 10): MC {
  const x = b.x;
  Y = clamp(Math.round(Y) || 1, 1, 30);
  const rnd = mulberry32(MC_SEED);
  const gauss = () => {
    const u = Math.max(rnd(), 1e-12);
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const vh = x.mcHouseVol / 100;
  const vs = x.mcStockVol / 100;
  const rho = clamp(x.mcCorr, -1, 1);
  const muH = Math.log(Math.max(1e-9, 1 + x.mcHouse / 100)) - (vh * vh) / 2;
  const muS = Math.log(Math.max(1e-9, 1 + x.mcStock / 100)) - (vs * vs) / 2;
  const tax = x.mcTax / 100;
  const save = x.mcSave * 12;
  const i1 = x.isk1 - x.extra / 2;
  const i2 = x.isk2 - x.extra / 2;
  const I0 = i1 + i2;
  const sh1 = I0 > 0 ? i1 / I0 : 0.5;
  const cash = x.cashbuf - x.reno;
  const am = b.m.a * 12;
  const nw0 = x.mv + cash + I0 - b.nl;
  const rr = Math.sqrt(1 - rho * rho);

  const H = new Array<number>(MC_PATHS).fill(x.mv);
  const I = new Array<number>(MC_PATHS).fill(I0);
  const years: MCYear[] = [];
  let probUp = 0;
  let probBelowPrice = 0;
  let person1: Pct = pcts([0]);
  let person2: Pct = pcts([0]);

  for (let t = 0; t <= Y; t++) {
    const d = Math.max(0, b.nl - am * t);
    const nw = H.map((h, p) => h + cash + I[p] - d);
    years.push({ t, debt: d, nw: pcts(nw), H: pcts(H), I: pcts(I) });
    if (t === Y) {
      person1 = pcts(H.map((h, p) => (h + cash - d) / 2 + I[p] * sh1));
      person2 = pcts(H.map((h, p) => (h + cash - d) / 2 + I[p] * (1 - sh1)));
      probUp = nw.filter((v) => v > nw0).length / MC_PATHS;
      probBelowPrice = H.filter((h) => h < x.price).length / MC_PATHS;
    } else {
      for (let p = 0; p < MC_PATHS; p++) {
        const z1 = gauss();
        const z2 = gauss();
        const zs = rho * z1 + rr * z2;
        H[p] *= Math.exp(muH + vh * z1);
        I[p] = I[p] * (Math.exp(muS + vs * zs) - tax) + save;
      }
    }
  }
  return { Y, years, nw0, probUp, probBelowPrice, person1, person2 };
}

// ---------- Prisreglaget ----------

export function zone(x: Inputs, price = x.price): Level {
  if (price <= x.mv) return 'good';
  if (price <= x.vhigh) return 'mid';
  return 'bad';
}

export function priceScale(raw: Inputs): { lo: number; hi: number; step: number; ticks: number[] } {
  const x = effective(raw);
  const S = 250_000;
  // Max finns med i nedre änden så att maxmarkören alltid syns även om den
  // sätts långt under priset.
  const lo = Math.max(0, Math.floor(Math.min(x.mv - 1_200_000, x.price - 400_000, x.max - 400_000) / S) * S);
  const hi = Math.max(lo + S, Math.ceil(Math.max(x.vhigh + 1_100_000, x.max + 400_000, x.price + 400_000) / S) * S);
  const step = hi - lo <= 3_000_000 ? 250_000 : 500_000;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1; v += step) ticks.push(v);
  return { lo, hi, step, ticks };
}

// ---------- Är affären bra? ----------

export interface MoveCost {
  lag: number;
  pant: number;
  mak: number;
  under: number;
  reno: number;
  tax: number;
  total: number;
  pct: number;
  level: Level;
  greenLimit: number;
  needCut: number;
  actions: { key: string; label: string; save: number }[];
  afterActions: number;
  afterPct: number;
}

export function moveCost(b: Base): MoveCost {
  const x = b.x;
  const under = Math.max(0, x.mv42 - x.sale);
  const tax = Math.max(0, b.tax);
  const total = b.costs + b.makCost + under + x.reno + tax;
  const pct = div(total, x.mv);
  const level: Level =
    x.mv <= 0 ? 'bad' : pct <= x.rMoveGreen / 100 ? 'good' : pct <= x.rMoveYellow / 100 ? 'mid' : 'bad';
  const greenLimit = (x.mv * x.rMoveGreen) / 100;

  // Åtgärder: sänk mäklararvodet 0,5 pe, sälj till marknadsvärdet, halvera
  // renoveringen och kontrollera antalet pantbrev.
  const actions: { key: string; label: string; save: number }[] = [];
  if (x.selling && x.sale > 0) {
    const makSave = (x.sale * Math.min(0.5, x.mak)) / 100;
    actions.push({ key: 'mak', label: 'Förhandla ned mäklararvodet med 0,5 procentenhet', save: makSave });
    actions.push({ key: 'sale', label: 'Sälj till marknadsvärdet i stället för under', save: under });
  }
  actions.push({ key: 'reno', label: 'Håll renoveringen före tillträdet till hälften', save: x.reno / 2 });
  // Pantbrev: vad det skulle spara om bostaden har pantbrev på ytterligare
  // 10 % av köpesumman (avrundat) utöver det du angett.
  const pantDelta = Math.max(100_000, Math.round((x.price * 0.1) / 100_000) * 100_000);
  const alt = b.pant > 0 ? compute({ ...x, pantex: x.pantex + pantDelta }) : null;
  actions.push({
    key: 'pant',
    label: `Kontrollera antalet pantbrev via gravationsbevis (exempel: ${kr(pantDelta)} mer i befintliga pantbrev)`,
    save: alt ? Math.max(0, b.pant - alt.pant) : 0,
  });
  const saved = actions.reduce((s, a) => s + a.save, 0);
  const afterActions = total - saved;
  return {
    lag: b.lag,
    pant: b.costs - b.lag,
    mak: b.makCost,
    under,
    reno: x.reno,
    tax,
    total,
    pct,
    level,
    greenLimit,
    needCut: Math.max(0, total - greenLimit),
    actions,
    afterActions,
    afterPct: div(afterActions, x.mv),
  };
}

export interface Check {
  id: string;
  level: Level;
  data: Record<string, number>;
}

export function worst(levels: Level[]): Level {
  if (levels.includes('bad')) return 'bad';
  if (levels.includes('mid')) return 'mid';
  return 'good';
}

export function checks(b: Base, probBelowPrice10: number): { list: Check[]; summary: Level; counts: Record<Level, number> } {
  const x = b.x;
  const N = lossMonths(x);
  const list: Check[] = [];

  list.push({
    id: 'price',
    level: x.price <= x.mv ? 'good' : x.price <= x.max ? 'mid' : 'bad',
    data: { over: Math.max(0, x.price - x.mv), toMax: x.max - x.price },
  });

  const mc = moveCost(b);
  list.push({ id: 'move', level: mc.level, data: { move: mc.total, pct: mc.pct } });

  list.push({
    id: 'ltv',
    level: b.ltv <= 0.8 ? 'good' : b.ltv <= x.rTak / 100 ? 'mid' : 'bad',
    data: { ltv: b.ltv },
  });

  const balStress = b.net - b.ms.net - x.expenses;
  const balOwn = b.net - b.m.net - x.expenses;
  list.push({ id: 'stress', level: balStress >= 0 ? 'good' : 'bad', data: { balStress, balOwn } });

  const s1 = sim(b, 1, 1, N, false);
  const s2 = sim(b, 2, 1, N, false);
  list.push({
    id: 'one',
    level: worst([simLevel(s1), simLevel(s2)]),
    data: { N, draw1: s1.draw, draw2: s2.draw, out1: s1.out ?? 0, out2: s2.out ?? 0, end1: s1.end, end2: s2.end, l1: lvlNum(simLevel(s1)), l2: lvlNum(simLevel(s2)) },
  });

  const s3 = sim(b, 3, 1, N, false);
  list.push({ id: 'both', level: simLevel(s3), data: { N, draw: s3.draw, out: s3.out ?? 0, end: s3.end } });

  const buf = startBuffer(b);
  const out = b.m.net + x.expenses;
  const months = out > 0 ? buf / out : buf > 0 ? 99 : 0;
  list.push({ id: 'buffer', level: months >= 6 ? 'good' : months >= 3 ? 'mid' : 'bad', data: { buf, out, months } });

  const hp = (x.price * x.rHp) / 100;
  list.push({
    id: 'hp',
    level: hp <= x.extra ? 'good' : hp <= x.isk1 + x.isk2 ? 'mid' : 'bad',
    data: { hp, extra: x.extra, isk: x.isk1 + x.isk2 },
  });

  list.push({
    id: 'risk',
    level: probBelowPrice10 <= 0.1 ? 'good' : probBelowPrice10 <= 0.25 ? 'mid' : 'bad',
    data: { prob: probBelowPrice10 },
  });

  const counts: Record<Level, number> = { good: 0, mid: 0, bad: 0 };
  for (const c of list) counts[c.level]++;
  return { list, summary: worst(list.map((c) => c.level)), counts };
}

function lvlNum(l: Level): number {
  return l === 'good' ? 0 : l === 'mid' ? 1 : 2;
}

// ---------- Tabeller ----------

export function rateTable(b: Base) {
  const x = b.x;
  const rates = [
    { label: 'Vald ränta', rate: x.rate },
    { label: '+1 procentenhet', rate: x.rate + 1 },
    { label: '+2 procentenheter', rate: x.rate + 2 },
    { label: 'Bankens schablon', rate: x.stress },
  ];
  return rates.map((r) => {
    const m = monthly(x, b.nl, r.rate, b.ar, b.drift);
    return { ...r, m, noAmort: m.net - m.a, left: b.net - m.net };
  });
}

export function scenarioPrices(x: Inputs): number[] {
  const { lo, hi } = priceScale(x);
  let step = 250_000;
  while ((hi - lo) / step > 40) step *= 2;
  const set = new Set<number>();
  for (let v = lo; v <= hi + 1; v += step) set.add(v);
  set.add(x.price);
  return [...set].sort((a, c) => a - c);
}

export function scenarioRows(raw: Inputs) {
  const x = effective(raw);
  return scenarioPrices(x).map((price) => {
    const b = compute({ ...x, price });
    return { price, selected: price === x.price, nl: b.nl, ltv: b.ltv, housing: b.m.net, left: b.left, overTak: b.ltv > x.rTak / 100 };
  });
}

export function matrix(raw: Inputs) {
  const x = effective(raw);
  const sales = x.selling ? [-400_000, -200_000, 0, 200_000, 400_000].map((d) => x.sale + d).filter((v) => v >= 0) : [0];
  const prices = [-800_000, -400_000, 0, 400_000, 800_000].map((d) => x.price + d).filter((v) => v >= 0);
  const rows = sales.map((sale) => ({
    sale,
    selected: sale === x.sale,
    cells: prices.map((price) => {
      const b = compute({ ...x, sale, price });
      return { price, nl: b.nl, ltv: b.ltv, overTak: b.ltv > x.rTak / 100, selected: sale === x.sale && price === x.price };
    }),
  }));
  return { prices, rows };
}
