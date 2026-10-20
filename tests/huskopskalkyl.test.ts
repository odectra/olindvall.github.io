// Enhetstester för Husköpskalkylens beräkningsmodul.
// Kör med: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  autoExtra,
  checks,
  compute,
  defaultInputs,
  loanPromise,
  moveCost,
  priceScale,
  rateTable,
  refundCalc,
  renderNW,
  runMC,
  scenarioRows,
  matrix,
  sim,
  simVerdict,
  zone,
  type Inputs,
} from '../src/lib/huskopskalkyl/calc.ts';
import { kr, mkr, pct } from '../src/lib/huskopskalkyl/format.ts';

const r = Math.round;
const base = () => compute(defaultInputs());

test('försäljning', () => {
  const b = base();
  assert.equal(r(b.makCost), 68_000);
  assert.equal(r(b.gain), 632_000);
  assert.equal(r(b.tax), 139_040);
  assert.equal(r(b.cash), 1_772_960);
});

test('köpkostnader och lån', () => {
  const b = base();
  assert.equal(r(b.lag), 72_825);
  assert.equal(r(b.pant), 53_441);
  assert.equal(r(b.costs), 126_266);
  assert.equal(r(b.down), 1_646_694);
  assert.equal(r(b.cash - b.costs), 1_646_694);
  assert.equal(r(b.nl), 3_153_306);
  assert.equal(b.ltv.toFixed(4), '0.6569');
  assert.equal(r(b.ltv * 100), 66);
  assert.equal(b.ar, 1);
  assert.equal(r(b.m.a), 2_628);
});

test('månadskostnad', () => {
  const b = base();
  assert.equal(r(b.drift), 3_917);
  assert.equal(r(b.m.tot), 15_742);
  assert.equal(r(b.m.net), 13_060);
  assert.equal(r(b.ms.i), 17_080);
  assert.equal(r(b.ms.tot), 23_625);
  assert.equal(r(b.ms.net), 19_288);
  const t = rateTable(b);
  assert.deepEqual(t.map((x) => [r(x.m.tot), r(x.m.net)]), [
    [15_742, 13_060],
    [18_369, 15_136],
    [20_997, 17_212],
    [23_625, 19_288],
  ]);
  assert.equal(r(b.left), 60_440);
  assert.equal(r(b.leftStress), 54_212);
});

test('skuldkvot och lånelöfte', () => {
  const b = base();
  assert.equal(b.sk.toFixed(1), '2.7');
  const lp = loanPromise(b);
  assert.equal(lp.ask, 3_500_000);
  assert.equal(r(lp.maxP), 5_134_739);
});

test('prisreglage och bedömning', () => {
  const x = defaultInputs();
  const b = compute(x);
  assert.equal(b.sqm, 40_000);
  assert.equal(zone(x), 'mid');
  assert.equal(x.price - x.mv, 100_000);
  assert.equal(x.max - x.price, 100_000);
  const s = priceScale(x);
  assert.equal(s.lo, 3_500_000);
  assert.equal(s.hi, 6_250_000);
  assert.equal(s.step, 250_000);
});

test('flyttkostnad', () => {
  const mc = moveCost(base());
  assert.equal(r(mc.total), 383_306);
  assert.equal((mc.pct * 100).toFixed(1), '8.2');
  assert.equal(mc.level, 'mid');
});

test('Är affären bra?', () => {
  const b = base();
  const mc = runMC(b, 10);
  const c = checks(b, mc.probBelowPrice);
  const lv = Object.fromEntries(c.list.map((x) => [x.id, x.level]));
  assert.deepEqual(lv, {
    price: 'mid',
    move: 'mid',
    ltv: 'good',
    stress: 'good',
    one: 'good',
    both: 'good',
    buffer: 'good',
    hp: 'good',
    risk: 'mid',
  });
  const d = Object.fromEntries(c.list.map((x) => [x.id, x.data]));
  assert.equal(r(d.hp.hp), 480_000);
  assert.equal(d.buffer.months.toFixed(1), '15.7');
  assert.equal(r(d.stress.balStress), 34_212);
  assert.equal(r(d.risk.prob * 100), 12);
  assert.equal(c.summary, 'mid');
  assert.equal(c.counts.mid, 3);
});

test('inkomstbortfall', () => {
  const s = sim(base(), 1, 1, 12, false);
  assert.equal(s.draw, 0);
  assert.equal(s.out, null);
  assert.equal(r(s.rows[0].bal), 40_440);
  assert.equal(r(s.rows[11].bal), 18_791);
  assert.equal(r(s.end), 821_064);
});

test('tillgångar före och efter', () => {
  const nw = renderNW(base());
  assert.equal(r(nw.before.total), 2_500_000);
  assert.equal(r(nw.after.total), 2_066_694);
  assert.equal(r(nw.change), -433_306);
  assert.equal(r(nw.before.shared), 1_500_000);
  assert.equal(r(nw.after.shared), 1_546_694);
  assert.equal(r(nw.before.isk1 + nw.before.isk2), 1_000_000);
  assert.equal(r(nw.after.isk1 + nw.after.isk2), 520_000);
  const sum = nw.parts.reduce((s, p) => s + p.value, 0);
  assert.equal(r(sum), r(nw.change));
});

test('Monte Carlo 10 år', () => {
  const b = base();
  const mc = runMC(b, 10);
  const y = mc.years[10];
  assert.equal(r(y.nw.p50), 4_182_990);
  assert.equal(r(y.nw.p10), 2_537_864);
  assert.equal(r(y.nw.p90), 6_670_633);
  assert.equal(r(y.H.p10), 4_717_055);
  assert.equal(r(y.H.p50), 6_167_220);
  assert.equal(r(y.H.p90), 8_278_205);
  assert.equal(r(y.I.p10), 407_372);
  assert.equal(r(y.I.p50), 795_462);
  assert.equal(r(y.I.p90), 1_518_828);
  assert.equal(r(y.debt), 2_837_976);
  assert.equal(r(mc.nw0), 2_066_694);
  assert.equal(r(mc.probBelowPrice * 100), 12);
  // Samma indata ger samma resultat.
  assert.equal(runMC(b, 10).years[10].nw.p50, y.nw.p50);
});

test('10 %-regeln för insatsen', () => {
  assert.equal(autoExtra(4_800_000), 480_000);
  assert.equal(autoExtra(4_812_400), 481_000);
});

test('reavinstförlust ger återbäring', () => {
  const b = compute({ ...defaultInputs(), buy: 3_600_000 });
  assert.ok(b.gain < 0);
  assert.equal(b.tax, 0);
  const rf = refundCalc(b);
  assert.ok(rf.refund > 0);
  assert.equal(refundCalc(base()).refund, 0);
});

test('svenska format', () => {
  assert.equal(kr(4_800_000), '4 800 000 kr');
  assert.equal(mkr(4_800_000), '4,80 Mkr');
  assert.equal(pct(0.0816, 1), '8,2 %');
  assert.equal(kr(-433_306), '−433 306 kr');
});

function allFinite(v: unknown, path = ''): void {
  if (typeof v === 'number') assert.ok(Number.isFinite(v), `icke-ändligt tal i ${path}`);
  else if (Array.isArray(v)) v.forEach((e, i) => allFinite(e, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, e] of Object.entries(v)) allFinite(e, `${path}.${k}`);
}

function everything(x: Inputs) {
  const b = compute(x);
  const mc = runMC(b, 10);
  const N = 12;
  return {
    b: { ...b, x: undefined },
    lp: loanPromise(b),
    rf: refundCalc(b),
    mv: moveCost(b),
    nw: renderNW(b),
    mc: { ...mc },
    ck: checks(b, mc.probBelowPrice),
    rt: rateTable(b),
    sc: scenarioRows(x),
    mx: matrix(x),
    sims: [1, 2, 3].flatMap((w) => [1, 2, 3].map((t) => simVerdict(b, w, t, N))),
    sc0: priceScale(x),
  };
}

test('inga NaN eller Infinity vid nollade fält och utan försäljning', () => {
  allFinite(everything({ ...defaultInputs(), selling: false }), 'utan försäljning');
  const zero = defaultInputs();
  for (const k of Object.keys(zero) as (keyof Inputs)[]) if (k !== 'selling') (zero as Record<string, unknown>)[k] = 0;
  allFinite(everything(zero), 'allt noll');
  allFinite(everything({ ...zero, selling: false }), 'allt noll utan försäljning');
  allFinite(everything({ ...defaultInputs(), price: 0, area: 0, gross1: 0, gross2: 0 }), 'pris, yta och lön noll');
  allFinite(everything({ ...defaultInputs(), price: NaN, mv: NaN } as Inputs), 'NaN in');
});

test('utan försäljning gäller bara sparandet som insats', () => {
  const b = compute({ ...defaultInputs(), selling: false });
  assert.equal(b.cash, 480_000);
  assert.equal(b.tax, 0);
  assert.equal(b.makCost, 0);
  const nw = renderNW(b);
  assert.equal(nw.before.hus, 0);
  assert.equal(nw.before.skuld, 0);
});
