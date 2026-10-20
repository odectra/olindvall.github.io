// Husköpskalkyl — gränssnittet. Läser fälten, anropar calc.ts och ritar resultaten.
// Inget skickas någonstans; sparande sker bara i localStorage om användaren slår på det.
import {
  DEFAULTS,
  autoExtra,
  checks,
  compute,
  defaultInputs,
  div,
  loanPromise,
  lossMonths,
  matrix,
  moveCost,
  priceScale,
  rateTable,
  refundCalc,
  renderNW,
  runMC,
  scenarioRows,
  sim,
  simVerdict,
  startBuffer,
  zone,
  type Base,
  type Inputs,
  type Level,
  type MC,
  type NumKey,
} from './calc.ts';
import { drawChart } from './charts.ts';
import { fieldValue, kr, krApprox, krSigned, mkr, num, parseNum, pct } from './format.ts';

const STORE_KEY = 'huskopskalkyl:v1';
const PRICE_STEP = 25_000;
const PRICE_STEP_BIG = 100_000;

let state: Inputs = defaultInputs();
let lossOn = false;
let years = 10;
let saveOn = false;
let frozenScale: ReturnType<typeof priceScale> | null = null;
let queued = false;
const views: Record<string, 'chart' | 'table'> = { inc: 'chart', mc: 'chart' };

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const keys = Object.keys(DEFAULTS) as NumKey[];

// ---------- Små byggstenar ----------

const ICON: Record<Level, string> = { good: '✓', mid: '!', bad: '✕' };
const LAMP: Record<Level, string> = { good: 'Grönt ljus', mid: 'Gult ljus', bad: 'Rött ljus' };

function pill(level: Level, text: string): string {
  return `<span class="pill pill-${level}"><span aria-hidden="true">${ICON[level]}</span>${text}</span>`;
}

function rows(items: [string, string, string?][]): string {
  return `<dl class="rows">${items
    .map(([dt, dd, cls]) => `<dt class="${cls ?? ''}">${dt}</dt><dd class="${cls ?? ''}">${dd}</dd>`)
    .join('')}</dl>`;
}

function table(head: string[], body: string[][], rowClass: (i: number) => string = () => '', caption?: string): string {
  return `<div class="table-wrap"><table>${caption ? `<caption class="sr-only">${caption}</caption>` : ''}<thead><tr>${head
    .map((h) => `<th scope="col">${h}</th>`)
    .join('')}</tr></thead><tbody>${body
    .map((r, i) => `<tr class="${rowClass(i)}">${r.map((c, j) => (j === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}

const kpi = (label: string, value: string, sub = '') =>
  `<div class="kpi"><span class="kpi-label">${label}</span><span class="kpi-value">${value}</span>${sub ? `<span class="kpi-sub">${sub}</span>` : ''}</div>`;

const neg = (v: number) => (Math.round(v) < 0 ? `<span class="neg">${kr(v)}</span>` : kr(v));
const minus = (v: number) => (Math.round(v) === 0 ? kr(0) : kr(-Math.abs(v)));
const months = (n: number) => `${num(n)} ${n === 1 ? 'månad' : 'månader'}`;
const WHO = ['', 'Person 1', 'Person 2', 'Båda'];
const TYPE = ['', 'uppsagd', 'sjukskriven', 'lägre lön'];

function set(id: string, html: string) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// ---------- Fält ----------

function inputFor(key: NumKey) {
  return document.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-key="${key}"]`);
}

function setField(key: NumKey, value: number) {
  state[key] = value;
  const el = inputFor(key);
  if (el) el.value = el instanceof HTMLSelectElement ? String(value) : fieldValue(value);
  const range = document.querySelector<HTMLInputElement>(`[data-range-for="${key}"]`);
  if (range) range.value = String(value);
}

function setPrice(value: number) {
  setField('price', value);
  setField('extra', autoExtra(value));
  schedule();
}

function bindFields() {
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-key]').forEach((el) => {
    const key = el.dataset.key as NumKey;
    const evt = el instanceof HTMLSelectElement ? 'change' : 'input';
    el.addEventListener(evt, () => {
      state[key] = parseNum(el.value);
      const range = document.querySelector<HTMLInputElement>(`[data-range-for="${key}"]`);
      if (range) range.value = String(state[key]);
      if (key === 'price') setField('extra', autoExtra(state.price));
      schedule();
    });
    if (el instanceof HTMLInputElement) {
      el.addEventListener('blur', () => (el.value = fieldValue(state[key])));
    }
  });
  document.querySelectorAll<HTMLInputElement>('[data-range-for]').forEach((range) => {
    const key = range.dataset.rangeFor as NumKey;
    range.addEventListener('input', () => {
      const v = Number(range.value);
      if (key === 'price') setPrice(v);
      else {
        setField(key, v);
        schedule();
      }
    });
  });

  const selling = $<HTMLInputElement>('selling');
  selling.addEventListener('change', () => {
    state.selling = selling.checked;
    applySelling();
    schedule();
  });

  document.querySelectorAll<HTMLDetailsElement>('details.hk-more:not(.hk-rules)').forEach((d) => {
    const n = d.dataset.count;
    const summary = d.querySelector('summary')!;
    d.addEventListener('toggle', () => (summary.textContent = d.open ? `Dölj ${n} fält` : `Visa ${n} fler fält`));
  });
  const allDetails = () => document.querySelectorAll<HTMLDetailsElement>('.hk-inputs details');
  $('btn-open-all').addEventListener('click', () => allDetails().forEach((d) => (d.open = true)));
  $('btn-close-all').addEventListener('click', () => allDetails().forEach((d) => (d.open = false)));

  $<HTMLInputElement>('loss-toggle').addEventListener('change', (e) => {
    lossOn = (e.target as HTMLInputElement).checked;
    schedule();
  });

  const yr = $<HTMLInputElement>('mc-years');
  yr.addEventListener('input', () => {
    years = Number(yr.value);
    $('mc-years-out').textContent = String(years);
    schedule();
  });

  document.querySelectorAll<HTMLButtonElement>('.hk-view').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.viewFor!;
      views[k] = views[k] === 'chart' ? 'table' : 'chart';
      btn.textContent = views[k] === 'chart' ? 'Visa som tabell' : 'Visa diagram';
      btn.setAttribute('aria-pressed', String(views[k] === 'table'));
      $(`ch-${k}`).hidden = views[k] === 'table';
      $(`tb-${k}`).hidden = views[k] === 'chart';
      schedule();
    });
  });

  const toggle = $<HTMLInputElement>('save-toggle');
  toggle.addEventListener('change', () => {
    saveOn = toggle.checked;
    if (saveOn) persist();
    else removeStored();
    status(saveOn ? 'Dina inmatningar sparas i den här webbläsaren.' : 'Sparade inmatningar har raderats.');
  });
  $('btn-clear').addEventListener('click', () => {
    removeStored();
    saveOn = false;
    toggle.checked = false;
    state = defaultInputs();
    for (const k of keys) setField(k, DEFAULTS[k]);
    $<HTMLInputElement>('selling').checked = true;
    applySelling();
    status('Allt är rensat. Exempelvärdena är återställda.');
    schedule();
  });
}

function applySelling() {
  const body = document.querySelector<HTMLElement>('[data-group-body="salj"]')!;
  body.hidden = !state.selling;
  $('selling-off-note').hidden = state.selling;
}

// ---------- Spara lokalt (valfritt) ----------

function status(text: string) {
  $('save-status').textContent = text;
}

function persist() {
  if (!saveOn) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ values: state }));
  } catch {
    status('Kunde inte spara i den här webbläsaren.');
  }
}

function removeStored() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ingen lagring tillgänglig */
  }
}

function restore() {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORE_KEY);
  } catch {
    return;
  }
  if (!raw) return;
  try {
    const saved = JSON.parse(raw)?.values ?? {};
    for (const k of keys) if (typeof saved[k] === 'number' && Number.isFinite(saved[k])) setField(k, saved[k]);
    state.selling = saved.selling !== false;
    $<HTMLInputElement>('selling').checked = state.selling;
    saveOn = true;
    $<HTMLInputElement>('save-toggle').checked = true;
    status('Dina sparade inmatningar är inlästa.');
  } catch {
    removeStored();
  }
}

// ---------- Prisreglaget ----------

function scale() {
  return frozenScale ?? priceScale(state);
}

function frac(v: number, s = scale()) {
  return Math.min(1, Math.max(0, div(v - s.lo, s.hi - s.lo)));
}

function valueAt(clientX: number): number {
  const band = $('pc-band');
  const rect = band.getBoundingClientRect();
  const s = scale();
  const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return Math.round((s.lo + f * (s.hi - s.lo)) / PRICE_STEP) * PRICE_STEP;
}

function bindPriceSlider() {
  const band = $('pc-band');
  const knob = $('pc-knob');
  const maxEl = $('pc-max');
  let dragging: 'price' | 'max' | null = null;

  const start = (what: 'price' | 'max', e: PointerEvent) => {
    e.preventDefault();
    dragging = what;
    frozenScale = priceScale(state);
    band.setPointerCapture(e.pointerId);
    (what === 'price' ? knob : maxEl).focus({ preventScroll: true });
    move(e);
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    const v = valueAt(e.clientX);
    if (dragging === 'price') {
      if (v !== state.price) setPrice(v);
    } else if (v !== state.max) {
      setField('max', v);
      schedule();
    }
  };
  const end = () => {
    if (!dragging) return;
    dragging = null;
    frozenScale = null;
    schedule();
  };
  maxEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    start('max', e);
  });
  band.addEventListener('pointerdown', (e) => start('price', e));
  band.addEventListener('pointermove', move);
  band.addEventListener('pointerup', end);
  band.addEventListener('pointercancel', end);
  band.addEventListener('lostpointercapture', end);

  const keyStep = (e: KeyboardEvent): number | null => {
    const big = e.shiftKey ? PRICE_STEP_BIG : PRICE_STEP;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') return -big;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') return big;
    if (e.key === 'PageDown') return -PRICE_STEP_BIG;
    if (e.key === 'PageUp') return PRICE_STEP_BIG;
    return null;
  };
  knob.addEventListener('keydown', (e) => {
    const d = keyStep(e);
    if (d === null) return;
    e.preventDefault();
    setPrice(Math.max(0, Math.round((state.price + d) / PRICE_STEP) * PRICE_STEP));
  });
  maxEl.addEventListener('keydown', (e) => {
    const d = keyStep(e);
    if (d === null) return;
    e.preventDefault();
    setField('max', Math.max(0, Math.round((state.max + d) / PRICE_STEP) * PRICE_STEP));
    schedule();
  });
}

const ZONE_TEXT: Record<Level, string> = { good: 'Bra (en deal)', mid: 'Medel (skäligt)', bad: 'Dålig (överpris)' };
const sqmOf = (v: number, area: number) => (area > 0 ? `${kr(Math.round(v / area / 10) * 10)}/m²` : '– kr/m²');

function renderPriceCard(b: Base) {
  const x = b.x;
  const s = scale();
  const P = (v: number) => `${(frac(v, s) * 100).toFixed(3)}%`;
  const z = zone(x);

  $('pc-price').textContent = kr(x.price);
  $('pc-sqm').textContent = sqmOf(x.price, x.area);
  set('pc-zone', pill(z, ZONE_TEXT[z]));

  const fm = frac(Math.max(s.lo, x.mv), s);
  const fh = Math.max(fm, frac(x.vhigh, s));
  const good = $('pc-z-good');
  const mid = $('pc-z-mid');
  const bad = $('pc-z-bad');
  good.style.left = '0%';
  good.style.width = `${fm * 100}%`;
  mid.style.left = `${fm * 100}%`;
  mid.style.width = `${(fh - fm) * 100}%`;
  bad.style.left = `${fh * 100}%`;
  bad.style.width = `${(1 - fh) * 100}%`;
  good.style.borderRadius = fm >= 1 ? '999px' : '';
  bad.style.borderRadius = fh <= 0 ? '999px' : '';

  $('pc-mv').style.left = P(x.mv);
  const maxEl = $('pc-max');
  maxEl.style.left = P(x.max);
  maxEl.setAttribute('aria-valuemin', String(s.lo));
  maxEl.setAttribute('aria-valuemax', String(s.hi));
  maxEl.setAttribute('aria-valuenow', String(x.max));
  maxEl.setAttribute('aria-valuetext', `Max ${mkr(x.max)}`);
  const knob = $('pc-knob');
  knob.style.left = P(x.price);
  knob.setAttribute('aria-valuemin', String(s.lo));
  knob.setAttribute('aria-valuemax', String(s.hi));
  knob.setAttribute('aria-valuenow', String(x.price));
  knob.setAttribute('aria-valuetext', `${mkr(x.price)}, ${ZONE_TEXT[z]}`);

  // Tickmarkeringar, glesade så att de inte trängs på smal skärm.
  const width = $('pc-band').clientWidth || 600;
  const maxLabels = Math.max(3, Math.floor(width / 48));
  const every = Math.max(1, Math.ceil(s.ticks.length / maxLabels));
  const dec = s.step < 500_000 ? 2 : 1;
  set(
    'pc-ticks',
    s.ticks
      .filter((_, i) => i % every === 0)
      .map((t) => `<span style="left:${P(t)}">${num(t / 1e6, dec)}</span>`)
      .join(''),
  );

  // Etiketter: Värdering och Max får aldrig ligga över varandra.
  const lMv = $('pc-lbl-mv');
  const lMax = $('pc-lbl-max');
  lMv.innerHTML = `<b>Värdering</b>${mkr(x.mv)}`;
  lMax.innerHTML = `<b>Max</b>${mkr(x.max)}`;
  placeLabels(width, frac(x.mv, s) * width, frac(x.max, s) * width, lMv, lMax);

  set(
    'pc-legend',
    [
      `<span><i style="background:color-mix(in oklch, var(--hk-good) 55%, transparent)"></i>Bra upp till ${mkr(x.mv)}</span>`,
      `<span><i style="background:color-mix(in oklch, var(--hk-mid) 60%, transparent)"></i>Medel upp till ${mkr(x.vhigh)}</span>`,
      `<span><i style="background:color-mix(in oklch, var(--hk-bad) 55%, transparent)"></i>Dålig över ${mkr(x.vhigh)}</span>`,
      `<span><i style="background:var(--color-text);width:4px"></i>Max ${mkr(x.max)} (${sqmOf(x.max, x.area)})</span>`,
      `<span><i style="border-left:2px dashed var(--color-text-muted);width:0;height:0.8rem;border-radius:0"></i>Värdering ${mkr(x.mv)} (${sqmOf(x.mv, x.area)})</span>`,
    ].join(''),
  );

  const diffMv = x.price - x.mv;
  const diffMax = x.max - x.price;
  const mvText = diffMv === 0 ? 'Precis på din värdering' : diffMv > 0 ? `${kr(diffMv)} över din värdering` : `${kr(-diffMv)} under din värdering`;
  const maxText = diffMax === 0 ? 'Precis på ditt max' : diffMax > 0 ? `${kr(diffMax)} under ditt max` : `Över ditt max på ${kr(-diffMax)}`;
  set('pc-verdict', `${pill(z, ZONE_TEXT[z])}<span class="num">${mvText}</span><span class="num">${maxText}</span>`);
}

function placeLabels(W: number, xa: number, xb: number, a: HTMLElement, b: HTMLElement) {
  const wa = a.offsetWidth;
  const wb = b.offsetWidth;
  const near = Math.abs(xa - xb) < Math.max(0.26 * W, (wa + wb) / 2 + 8);
  let la: number;
  let lb: number;
  if (!near) {
    la = xa - wa / 2;
    lb = xb - wb / 2;
  } else if (xa <= xb) {
    la = xa - wa - 4;
    lb = xb + 4;
  } else {
    la = xa + 4;
    lb = xb - wb - 4;
  }
  const pad = 12; // etiketterna får sticka ut i pc-scales inre marginal (12 px)
  la = Math.min(Math.max(-pad, la), W + pad - wa);
  lb = Math.min(Math.max(-pad, lb), W + pad - wb);
  // Efter att etiketterna hållits inom bandet: skjut isär om de fortfarande överlappar.
  const [left, right, lw, rw] = la <= lb ? [la, lb, wa, wb] : [lb, la, wb, wa];
  let L = left;
  let R = right;
  if (L + lw + 8 > R) {
    const need = L + lw + 8 - R;
    R += need;
    if (R + rw > W + pad) {
      const back = R + rw - (W + pad);
      R -= back;
      L -= back;
    }
  }
  if (la <= lb) {
    la = L;
    lb = R;
  } else {
    lb = L;
    la = R;
  }
  a.style.left = `${la}px`;
  b.style.left = `${lb}px`;
}

// ---------- Resultat ----------

function renderKpis(b: Base) {
  const x = b.x;
  const N = lossMonths(x);
  const s = sim(b, x.lossWho, x.lossType, N, false);
  const avg = (f: (r: (typeof s.rows)[number]) => number) => s.rows.reduce((t, r) => t + f(r), 0) / Math.max(1, s.rows.length);
  const leftValue = lossOn ? avg((r) => r.room) : b.left;
  set(
    'r-kpi',
    `<div class="kpis">${kpi('Nytt lån', kr(b.nl), `belåning ${pct(b.ltv)} av priset`)}${kpi(
      'Boende per månad',
      kr(b.m.net),
      `efter ränteavdrag, varav amortering ${kr(b.m.a)} (sparande)`,
    )}${kpi(
      'Kvar av nettolön per månad',
      neg(leftValue),
      lossOn ? `efter boende, snitt under ${months(N)} bortfall` : 'efter boende, före övriga utgifter',
    )}</div>`,
  );
  set(
    'r-kpi-loss',
    lossOn
      ? `<div class="kpis">${kpi(`Inkomst vid bortfall (snitt)`, kr(avg((r) => r.inc)), `${WHO[x.lossWho]}, ${TYPE[x.lossType]}, ${months(N)}`)}${kpi(
          'Balans per månad (snitt)',
          neg(avg((r) => r.bal)),
          `efter boende och övriga utgifter (${kr(x.expenses)})`,
        )}${kpi('Uttag ur sparandet', kr(s.draw), s.out ? `bufferten tar slut månad ${s.out}` : `kvar efter perioden: ${kr(s.end)}`)}</div>`
      : '',
  );
}

function renderDeal(b: Base, mc10: MC) {
  const x = b.x;
  const c = checks(b, mc10.probBelowPrice);
  const by = Object.fromEntries(c.list.map((k) => [k.id, k]));
  const mv = moveCost(b);
  const lvlText = (l: Level, good: string, mid: string, bad: string) => (l === 'good' ? good : l === 'mid' ? mid : bad);

  const summaryText =
    c.summary === 'good'
      ? 'Alla 9 kontroller klaras.'
      : c.summary === 'mid'
        ? `${c.counts.mid} av 9 kontroller klaras bara med förbehåll.`
        : `${c.counts.bad} av 9 kontroller klaras inte${c.counts.mid ? `, och ${c.counts.mid} bara med förbehåll` : ''}.`;

  const item = (title: string, level: Level, pillText: string, value: string, text: string, extra = '') =>
    `<li class="check"><div class="check-head"><span class="check-title">${title}</span><span class="check-value">${value}</span>${pill(level, pillText)}</div><p>${text}</p>${extra}</li>`;

  const p = by.price;
  const priceText =
    `Överpris mot din värdering: ${kr(p.data.over)}. ` +
    (p.data.toMax >= 0 ? `Du har ${kr(p.data.toMax)} kvar till ditt max.` : `Du är ${kr(-p.data.toMax)} över ditt max.`);

  const moveBreak = `<details><summary>Vad flytten kostar: uppdelning och vägar till grönt</summary>${rows([
    ['Lagfart', kr(mv.lag)],
    ['Pantbrev', kr(mv.pant)],
    ['Mäklararvode vid försäljningen', kr(mv.mak)],
    ['Försäljning under värdering', kr(mv.under)],
    ['Renovering', kr(mv.reno)],
    ['Reavinstskatt', kr(mv.tax)],
    ['Summa', `${kr(mv.total)} (${pct(mv.pct, 1)})`, 'strong'],
    [`Gräns för grönt (${num(x.rMoveGreen)} %)`, `${kr(mv.greenLimit)}${mv.needCut > 0 ? `, sänk med ${kr(mv.needCut)}` : ', klaras'}`],
  ])}${table(
    ['Åtgärd', 'Sparar'],
    [...mv.actions.map((a) => [a.label, kr(a.save)]), ['Efter alla åtgärder', `${kr(mv.afterActions)} (${pct(mv.afterPct, 1)})`]],
    (i) => (i === mv.actions.length ? 'sum' : ''),
    'Åtgärder som sänker flyttkostnaden',
  )}<p class="hk-text">Reavinstskatten och försäljningspriset beror på marknaden. Pantbrevens antal ser du i gravationsbeviset, som mäklaren kan ta fram.</p></details>`;

  const one = by.one;
  const lv = (n: number): Level => (n === 0 ? 'good' : n === 1 ? 'mid' : 'bad');
  const oneLine = (who: number, draw: number, out: number, l: number) =>
    `${WHO[who]}: ${draw <= 0 ? 'inget uttag' : out ? `bufferten tar slut månad ${out}` : `uttag ${kr(draw)}`} (${lvlText(lv(l), 'räcker', 'räcker med uttag', 'räcker inte')})`;
  const both = by.both;
  const buf = by.buffer;
  const hp = by.hp;

  set(
    'r-deal',
    `<div class="lamp lamp-${c.summary}" role="status"><span class="lamp-dot" aria-hidden="true">${ICON[c.summary]}</span><div><strong>${LAMP[c.summary]}</strong><br><span class="hk-text">${summaryText}</span></div></div>
    <ol class="checks">
      ${item('1. Pris mot värde', p.level, lvlText(p.level, 'Under värdering', 'Inom ditt max', 'Över ditt max'), mkr(x.price), priceText)}
      ${item(
        '2. Vad flytten kostar',
        mv.level,
        lvlText(mv.level, 'Låg', 'Hög', 'Mycket hög'),
        `${kr(mv.total)} · ${pct(mv.pct, 1)}`,
        `Köpkostnader, mäklararvode, försäljning under värdering, renovering och reavinstskatt i procent av marknadsvärdet. Tumregel, inte en officiell siffra: upp till ${num(x.rMoveGreen)} % grönt, upp till ${num(x.rMoveYellow)} % gult.`,
        moveBreak,
      )}
      ${item(
        '3. Belåning',
        by.ltv.level,
        lvlText(by.ltv.level, 'Marginal', 'Nära taket', 'Över taket'),
        pct(b.ltv),
        `Tumregel: upp till 80 % ger marginal om priserna faller. Bolånetaket är ${num(x.rTak)} % av köpesumman.`,
      )}
      ${item(
        `4. Ränta på bankens schablon (${num(x.stress, 1)} %)`,
        by.stress.level,
        lvlText(by.stress.level, 'Går ihop', '', 'Går inte ihop'),
        `${krSigned(by.stress.data.balStress)}/mån`,
        `Nettolön minus boende (${kr(b.ms.net)}/mån efter ränteavdrag) och övriga utgifter. Vid din ränta: ${krSigned(by.stress.data.balOwn)}/mån.`,
      )}
      ${item(
        `5. En av er uppsagd i ${months(one.data.N)}`,
        one.level,
        lvlText(one.level, 'Räcker', 'Kräver uttag', 'Räcker inte'),
        '',
        `${oneLine(1, one.data.draw1, one.data.out1, one.data.l1)}. ${oneLine(2, one.data.draw2, one.data.out2, one.data.l2)}. Med uppsägningstid, a-kassa och eventuell inkomstförsäkring enligt dina fält.`,
      )}
      ${item(
        `6. Båda uppsagda i ${months(both.data.N)}`,
        both.level,
        lvlText(both.level, 'Räcker', 'Kräver uttag', 'Räcker inte'),
        both.data.draw > 0 ? `uttag ${kr(both.data.draw)}` : 'inget uttag',
        both.data.out ? `Bufferten tar slut månad ${both.data.out}.` : `Kvar i bufferten efter perioden: ${kr(both.data.end)}.`,
      )}
      ${item(
        '7. Buffert efter affären',
        buf.level,
        lvlText(buf.level, 'Minst 6 mån', '3–6 mån', 'Under 3 mån'),
        buf.data.months >= 99 ? 'över 99 mån' : `${num(buf.data.months, 1)} mån`,
        `Sparande kvar efter insats och renovering (${kr(buf.data.buf)}) delat med boende och övriga utgifter (${kr(buf.data.out)}/mån). Tumregel: minst sex månader.`,
      )}
      ${item(
        '8. Handpenning',
        hp.level,
        lvlText(hp.level, 'Täcks av insatsen', 'Täcks av ISK', 'Räcker inte'),
        kr(hp.data.hp),
        `Tumregel: ${num(x.rHp)} % av köpesumman betalas när kontraktet skrivs, ofta innan försäljningen gett pengar. Insats från sparandet: ${kr(hp.data.extra)}. ISK totalt: ${kr(hp.data.isk)}.`,
      )}
      ${item(
        '9. Prisrisk på 10 år',
        by.risk.level,
        lvlText(by.risk.level, 'Låg', 'Märkbar', 'Hög'),
        pct(by.risk.data.prob),
        'Andel av 1 000 simuleringar där bostaden efter 10 år är värd mindre än köpesumman. Beror helt på antagandena i Framtidsscenariot. Tumregel: upp till 10 % grönt, upp till 25 % gult.',
      )}
    </ol>`,
  );
}

function renderControls(b: Base) {
  const x = b.x;
  const ltvLevel: Level = b.ltv > x.rTak / 100 ? 'bad' : 'good';
  const skLevel: Level = b.sk > x.rSkuldkvot ? 'mid' : 'good';
  set(
    'r-ctrl',
    rows([
      ['Belåningsgrad', `${pct(b.ltv)} (tak ${num(x.rTak)} %) ${pill(ltvLevel, ltvLevel === 'good' ? 'Inom taket' : 'Över taket')}`],
      ['Kontantinsats', kr(b.down)],
      ['Skuldkvot (lån delat med bruttoårsinkomst)', `${num(b.sk, 1)} ggr ${pill(skLevel, skLevel === 'good' ? `Högst ${num(x.rSkuldkvot, 1)}` : `Över ${num(x.rSkuldkvot, 1)}`)}`],
      ['Amortering', `${num(b.ar)} % per år = ${kr(b.m.a)}/mån`],
      [
        b.gain >= 0 ? 'Reavinst på bostaden du säljer' : 'Förlust på bostaden du säljer',
        b.gain >= 0 ? `${kr(b.gain)}, skatt ${kr(b.tax)}` : `${kr(b.gain)}, ingen skatt`,
      ],
      [`Bankens kalkyl vid ${num(x.stress, 1)} %`, `boende ${kr(b.ms.net)}/mån, kvar ${neg(b.leftStress)}`],
    ]) +
      `<p class="hk-text">Amorteringen räknas enligt reglerna: över ${num(x.rAmLtvHi)} % belåning ${num(x.rAmHi)} % per år, över ${num(x.rAmLtvLo)} % ${num(x.rAmLo)} % per år. Den ingår i boendekostnaden men är ett sparande. Skuldkvot över ${num(x.rSkuldkvot, 1)} markeras gult; kontrollera vad din bank kräver.</p>`,
  );
}

function renderPromise(b: Base) {
  const x = b.x;
  const lp = loanPromise(b);
  set(
    'r-promise',
    rows([
      ['Köpesumma', kr(x.price)],
      ['Kontantinsats', kr(b.down)],
      ['Lånebehov', kr(b.nl)],
      ['Be om lånelöfte på', kr(lp.ask), 'strong'],
      ['Lånelöftet räcker till köpesumma upp till', kr(lp.maxP), 'strong'],
      ['Befintligt bolån (löses vid försäljningen)', kr(x.loan)],
      ['Hushållets bruttoinkomst', `${kr(b.gross)}/mån (${kr(b.gross * 12)}/år)`],
      ['Skuldkvot', `${num(b.sk, 1)} ggr`],
      ['Boendekostnad per månad', `${kr(b.m.net)} efter ränteavdrag (${kr(b.m.tot)} före)`],
    ]) +
      `<p class="hk-text">Lånelöftet är lånebehovet plus en marginal på ${kr(300_000)} för budgivningen, avrundat uppåt till hela 100 000 kr. Banken gör sin egen bedömning.</p>`,
  );
}

function renderIsk(b: Base) {
  const x = b.x;
  const hp = (x.price * x.rHp) / 100;
  const each = x.extra / 2;
  const left = (v: number) => {
    const l: Level = v < 0 ? 'bad' : v < 300_000 ? 'mid' : 'good';
    return `${neg(v)} ${pill(l, l === 'good' ? 'OK' : l === 'mid' ? 'Under 300 000 kr' : 'Räcker inte')}`;
  };
  const hpLevel: Level = hp > x.extra ? 'mid' : 'good';
  set(
    'r-isk',
    rows([
      [`Handpenning (${num(x.rHp)} %)`, `${kr(hp)} ${pill(hpLevel, hpLevel === 'good' ? 'Täcks av insatsen' : 'Större än insatsen')}`],
      ['Insats per person', kr(each)],
      ['Kvar i ISK, person 1', left(x.isk1 - each)],
      ['Kvar i ISK, person 2', left(x.isk2 - each)],
    ]) + '<p class="hk-text">Insatsen tas till hälften från vardera person. Gränsen 300 000 kr kvar är en tumregel för en egen buffert.</p>',
  );
}

function renderCash(b: Base) {
  const x = b.x;
  const toBuy = b.cash - b.costs;
  const leftover = Math.max(0, toBuy - x.price);
  const items: [string, string, string?][] = [];
  if (x.selling) {
    items.push(['Försäljningspris', kr(x.sale)], ['Mäklararvode', minus(b.makCost)], ['Nuvarande lån', minus(x.loan)]);
  }
  items.push(['Extra eget kapital (insats från sparande)', kr(x.extra)]);
  if (x.selling) items.push(['Reavinstskatt', minus(b.tax)]);
  items.push(
    ['Tillgängliga kontanter', neg(b.cash), 'strong'],
    ['Lagfart', minus(b.lag)],
    ['Pantbrev', minus(b.pant)],
    ['Satsas på köpet', neg(Math.min(toBuy, x.price)), 'strong'],
  );
  if (leftover > 0) items.push(['Över efter köpet', kr(leftover)]);
  items.push(['Renovering ur sparandet', minus(x.reno)]);
  set(
    'r-cash',
    rows(items) +
      `<p class="hk-text">Reavinstskatten betalas via deklarationen året efter försäljningen men räknas av här, så att pengarna finns kvar när den ska betalas.${
        b.cash < 0 ? ' Tillgängliga kontanter är negativa: försäljningen räcker inte till att lösa lånet.' : ''
      }</p>`,
  );
}

function renderRefund(b: Base) {
  if (!b.x.selling) {
    set('r-refund', '<p class="hk-text">Du säljer ingen bostad, så det finns ingen vinst eller förlust.</p>');
    return;
  }
  if (b.gain >= 0) {
    set('r-refund', `<p class="hk-text">Ingen förlust: vinsten är ${kr(b.gain)}, så det blir ingen återbäring. Reavinstskatt: ${kr(b.tax)}.</p>`);
    return;
  }
  const rf = refundCalc(b);
  set(
    'r-refund',
    rows([
      ['Förlust', kr(b.gain)],
      [`Avdragsgill del (${num(b.x.rLossShare)} %)`, kr(rf.deductible)],
      ['Ränteutgifter första året', kr(b.m.i * 12)],
      ['Återbäring', krApprox(rf.refund), 'strong'],
    ]) +
      '<p class="hk-text">Förlusten dras av mot kapitalinkomster tillsammans med ränteutgifterna. Återbäringen kommer senare, via deklarationen året efter försäljningen. Förenklad beräkning: kontrollera med Skatteverket.</p>',
  );
}

function renderRates(b: Base) {
  const t = rateTable(b);
  const head = ['', ...t.map((r, i) => `${num(r.rate, 1)} %<br><span class="hk-help">${['vald', '+1 pe', '+2 pe', 'banken'][i]}</span>`)];
  const line = (label: string, f: (r: (typeof t)[number]) => string) => [label, ...t.map(f)];
  set(
    'r-rates',
    table(
      head,
      [
        line('Ränta', (r) => kr(r.m.i)),
        line('Amortering', (r) => kr(r.m.a)),
        line('Drift och fastighetsavgift', (r) => kr(r.m.drift)),
        line('Summa', (r) => kr(r.m.tot)),
        line('Efter ränteavdrag', (r) => kr(r.m.net)),
        line('varav amortering (sparande)', (r) => kr(r.m.a)),
        line('Boende utan amortering', (r) => kr(r.noAmort)),
        line('Kvar av nettolön', (r) => neg(r.left)),
      ],
      (i) => (i === 4 ? 'sum' : ''),
      'Månadskostnad vid fyra räntor',
    ) + '<p class="hk-text">Kronor per månad. Ränteavdraget är 30 % på räntor upp till 100 000 kr per år och 21 % över det (enligt Regler).</p>',
  );
}

function renderScenarios() {
  const r = scenarioRows(state);
  set(
    'r-scen',
    table(
      ['Köpesumma', 'Nytt lån', 'Belåning', 'Boende/mån', 'Kvar av nettolön'],
      r.map((s) => [kr(s.price), kr(s.nl), s.overTak ? `<span class="over">${pct(s.ltv)}</span>` : pct(s.ltv), kr(s.housing), neg(s.left)]),
      (i) => (r[i].selected ? 'sel' : ''),
      'Köpesummor i steg',
    ) + '<p class="hk-text">Samma köpesummor som prisreglagets skala. Övriga värden som nu, även insatsen. Raden för valt pris är markerad. Rött: belåning över taket.</p>',
  );
}

function renderMatrix() {
  const m = matrix(state);
  const head = ['Försäljning \\ köp', ...m.prices.map((p) => mkr(p))];
  const body = m.rows.map((r) => [
    state.selling ? mkr(r.sale) : 'Ingen försäljning',
    ...r.cells.map((c) => {
      const txt = `${mkr(c.nl)} · ${c.overTak ? `<span class="over">${pct(c.ltv)}</span>` : pct(c.ltv)}`;
      return c.selected ? `<strong>${txt}</strong>` : txt;
    }),
  ]);
  set(
    'r-matrix',
    table(head, body, (i) => (m.rows[i].selected ? 'sel' : ''), 'Nytt lån och belåning för olika försäljningspris och köpesummor') +
      '<p class="hk-text">Varje cell: nytt lån · belåning. Rader: försäljningspris. Kolumner: köpesumma. Den markerade raden är ditt försäljningspris.</p>',
  );
}

function renderIncome(b: Base) {
  const x = b.x;
  const N = lossMonths(x);
  const { s, p, verdict } = simVerdict(b, x.lossWho, x.lossType, N);
  const r1 = s.rows[0];
  const who = WHO[x.lossWho];
  let sentence: string;
  if (verdict === 'ok' && s.draw <= 0) sentence = `Inkomsten täcker boende och övriga utgifter varje månad. Bufferten efter ${months(N)}: ${kr(s.end)}.`;
  else if (verdict === 'ok') sentence = `Ni behöver ta ${kr(s.draw)} ur sparandet (första gången månad ${s.first}), men bufferten räcker. Kvar efter ${months(N)}: ${kr(s.end)}.`;
  else if (verdict === 'pause') sentence = `Bufferten tar slut månad ${s.out}. Med amorteringspaus räcker den: kvar ${kr(p.end)}. Fråga banken om amorteringsuppehåll är möjligt.`;
  else sentence = `Bufferten tar slut månad ${s.out}, även med amorteringspaus (månad ${p.out}). Affären klarar inte det här bortfallet utan andra åtgärder.`;

  set(
    'r-inc',
    `<p class="hk-text">${who}, ${TYPE[x.lossType]}, i ${months(N)}. Startbuffert: ${kr(startBuffer(b))} (ISK och sparkonto efter insats och renovering).</p>
    <div class="kpis">${kpi('Inkomst månad 1', kr(r1.inc))}${kpi('Balans månad 1', neg(r1.bal), 'inkomst minus boende och övriga utgifter')}${kpi(
      'Uttag ur sparandet',
      kr(s.draw),
      `totalt under ${months(N)}`,
    )}</div><p><strong>${sentence}</strong></p>`,
  );

  const xs = s.rows.map((r) => r.m);
  if (views.inc === 'chart') {
    drawChart($('ch-inc'), {
      xs,
      xTick: (m) => `mån ${m}`,
      series: [
        { name: 'Utan paus', values: s.rows.map((r) => r.bal), color: 'var(--hk-s1)' },
        { name: 'Med amorteringspaus', values: p.rows.map((r) => r.bal), color: 'var(--hk-s2)', dash: '6 4' },
      ],
      zeroLine: true,
      yTick: (v) => `${num(v / 1000)} tkr`,
      ariaLabel: `Linjediagram: månadsbalans under ${months(N)} med och utan amorteringspaus`,
      tooltip: (i) =>
        `<strong>Månad ${xs[i]}</strong><br><i style="background:var(--hk-s1)"></i>Utan paus: ${kr(s.rows[i].bal)}<br><i style="background:var(--hk-s2)"></i>Med paus: ${kr(p.rows[i].bal)}<br>Buffert: ${kr(s.rows[i].buf)}`,
    });
  } else {
    set(
      'tb-inc',
      table(
        ['Månad', 'Inkomst', 'Kostnad', 'Balans', 'Med paus', 'Buffert'],
        s.rows.map((r, i) => [String(r.m), kr(r.inc), kr(r.cost), neg(r.bal), neg(p.rows[i].bal), neg(r.buf)]),
        () => '',
        'Månadsbalans vid inkomstbortfall',
      ),
    );
  }

  const combos: string[][] = [];
  const PILL: Record<string, [Level, string]> = { ok: ['good', 'räcker'], pause: ['mid', 'kräver paus'], fail: ['bad', 'räcker inte'] };
  for (const w of [1, 2, 3])
    for (const t of [1, 2, 3]) {
      const v = simVerdict(b, w, t, N);
      const [l, txt] = PILL[v.verdict];
      combos.push([`${WHO[w]}, ${TYPE[t]}`, v.s.first ? `månad ${v.s.first}` : '–', kr(v.s.draw), neg(v.s.end), pill(l, txt)]);
    }
  set(
    'r-inc-all',
    table(['Vem och orsak', 'Första uttag', 'Uttag totalt', `Kvar efter ${N} mån`, ''], combos, () => '', 'Alla kombinationer av vem och orsak') +
      '<p class="hk-text">A-kassa och sjukpenning enligt Regler, med skatt. Kontrollera uppsägningstid, inkomstförsäkring och sjuklön i ditt avtal, hos facket och a-kassan.</p>',
  );
}

function renderNWSection(b: Base) {
  const nw = renderNW(b);
  const A = nw.before;
  const B = nw.after;
  const line = (label: string, a: number, c: number, cls = '') => [cls ? `<strong>${label}</strong>` : label, neg(a), neg(c), neg(c - a)];
  const body = [
    line('Bostad (marknadsvärde)', A.hus, B.hus),
    line('Sparkonto', A.spar, B.spar),
    line('Bolån', -A.skuld, -B.skuld),
    line('Gemensamt nettovärde', A.shared, B.shared, 'b'),
    line('ISK person 1', A.isk1, B.isk1),
    line('ISK person 2', A.isk2, B.isk2),
    line('Person 1 totalt', A.p1, B.p1),
    line('Person 2 totalt', A.p2, B.p2),
    line('Samlat nettovärde', A.total, B.total, 'b'),
  ];
  const sum = nw.parts.reduce((t, p) => t + p.value, 0);
  set(
    'r-nw',
    table(['', 'Idag', 'Efter flytt', 'Förändring'], body, (i) => (i === 3 || i === 8 ? 'sum' : ''), 'Tillgångar idag och efter flytt') +
      '<h3>Förändringen i samlat nettovärde</h3>' +
      rows([...nw.parts.map((p) => [p.label, neg(p.value)] as [string, string]), ['Summa', neg(sum), 'strong']]) +
      '<p class="hk-text">Bostäderna värderas till marknadsvärdet. Gemensamma tillgångar delas lika mellan personerna; ISK är personligt. Amorteringen ändrar inte nettovärdet: den flyttar pengar från lönen till bostaden.</p>',
  );
}

function renderMC(b: Base, mc: MC) {
  const end = mc.years[mc.years.length - 1];
  const Y = mc.Y;
  set(
    'r-mc',
    `<div class="kpis">${kpi(`Samlat nettovärde om ${Y} år (median)`, kr(end.nw.p50))}${kpi('Spann 10–90 %', `${mkr(end.nw.p10)}–${mkr(end.nw.p90)}`)}${kpi(
      'Högre än dag 1',
      pct(mc.probUp),
      `nettovärde efter flytten: ${kr(mc.nw0)}`,
    )}${kpi('Huset värt mindre än köpesumman', pct(mc.probBelowPrice))}</div>
    <p><strong>I hälften av simuleringarna är det samlade nettovärdet om ${Y} år över ${kr(end.nw.p50)}. I en av tio är det under ${kr(end.nw.p10)}.</strong></p>`,
  );
  const xs = mc.years.map((y) => y.t);
  if (views.mc === 'chart') {
    drawChart($('ch-mc'), {
      xs,
      xTick: (t) => `år ${t}`,
      bands: [
        { lo: mc.years.map((y) => y.nw.p10), hi: mc.years.map((y) => y.nw.p90), color: 'var(--hk-s1)', opacity: 0.14 },
        { lo: mc.years.map((y) => y.nw.p25), hi: mc.years.map((y) => y.nw.p75), color: 'var(--hk-s1)', opacity: 0.24 },
      ],
      series: [{ name: 'Median', values: mc.years.map((y) => y.nw.p50), color: 'var(--hk-s1)' }],
      refs: [{ value: mc.nw0, label: 'Efter flytten' }],
      yTick: (v) => `${num(v / 1e6, 1)} Mkr`,
      ariaLabel: `Solfjäderdiagram: samlat nettovärde år 0 till ${Y}, median och band för 50 och 80 procent`,
      tooltip: (i) => {
        const y = mc.years[i];
        return `<strong>År ${y.t}</strong><br>90 %: ${kr(y.nw.p90)}<br>75 %: ${kr(y.nw.p75)}<br><i style="background:var(--hk-s1)"></i>Median: ${kr(y.nw.p50)}<br>25 %: ${kr(y.nw.p25)}<br>10 %: ${kr(y.nw.p10)}`;
      },
    });
  } else {
    set(
      'tb-mc',
      table(
        ['År', '10 %', '25 %', 'Median', '75 %', '90 %', 'Skuld'],
        mc.years.map((y) => [String(y.t), kr(y.nw.p10), kr(y.nw.p25), kr(y.nw.p50), kr(y.nw.p75), kr(y.nw.p90), kr(y.debt)]),
        () => '',
        'Samlat nettovärde per år, percentiler',
      ),
    );
  }
  set(
    'r-mc-sum',
    `<h3>Läget om ${Y} år</h3>` +
      table(
        ['', 'Pessimistiskt (10 %)', 'Median', 'Optimistiskt (90 %)'],
        [
          ['Samlat nettovärde', kr(end.nw.p10), kr(end.nw.p50), kr(end.nw.p90)],
          ['Bostadens värde', kr(end.H.p10), kr(end.H.p50), kr(end.H.p90)],
          ['ISK totalt', kr(end.I.p10), kr(end.I.p50), kr(end.I.p90)],
          ['Person 1', kr(mc.person1.p10), kr(mc.person1.p50), kr(mc.person1.p90)],
          ['Person 2', kr(mc.person2.p10), kr(mc.person2.p50), kr(mc.person2.p90)],
          ['Skuld', kr(end.debt), kr(end.debt), kr(end.debt)],
        ],
        () => '',
        `Läget om ${Y} år`,
      ) +
      `<p class="hk-text">1 000 simuleringar med slumpmässiga år för villapriser och börs, enligt dina antaganden (förväntning, volatilitet, samband, ISK-skatt). Lånet amorteras med dagens belopp. Samma indata ger alltid samma resultat. Det är ett räkneexempel, inte en prognos.</p>`,
  );
}

// ---------- Rendering ----------

function render() {
  queued = false;
  const b = compute(state);
  const mc10 = runMC(b, 10);
  const mc = years === 10 ? mc10 : runMC(b, years);
  renderPriceCard(b);
  renderKpis(b);
  renderDeal(b, mc10);
  renderControls(b);
  renderPromise(b);
  renderIsk(b);
  renderCash(b);
  renderRefund(b);
  renderRates(b);
  renderScenarios();
  renderMatrix();
  renderIncome(b);
  renderNWSection(b);
  renderMC(b, mc);
  persist();
}

function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(render);
}

export function init() {
  state = defaultInputs();
  // Startvärden från fälten (om webbläsaren har behållit ifyllda värden).
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-key]').forEach((el) => {
    state[el.dataset.key as NumKey] = parseNum(el.value);
  });
  state.selling = $<HTMLInputElement>('selling').checked;
  lossOn = $<HTMLInputElement>('loss-toggle').checked;
  restore();
  applySelling();
  bindFields();
  bindPriceSlider();
  let t = 0;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = window.setTimeout(schedule, 120);
  });
  render();
}
