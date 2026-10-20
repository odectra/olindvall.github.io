// Små inline-SVG-diagram utan bibliotek: linjer, band, referenslinjer,
// direktetiketter, hårlinje med tooltip (mus, touch och piltangenter).

export interface ChartSeries {
  name: string;
  values: number[];
  color: string;
  dash?: string;
}

export interface ChartBand {
  lo: number[];
  hi: number[];
  color: string;
  opacity: number;
}

export interface ChartSpec {
  xs: number[];
  xTick: (x: number) => string;
  series: ChartSeries[];
  bands?: ChartBand[];
  refs?: { value: number; label: string }[];
  yTick: (v: number) => string;
  tooltip: (i: number) => string;
  ariaLabel: string;
  zeroLine?: boolean;
}

export function niceStep(range: number, count: number): number {
  const raw = range / Math.max(1, count);
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * mag;
}

export function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  }
  const step = niceStep(max - min, count);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step);
  return ticks;
}

const f1 = (v: number) => v.toFixed(1);

export function drawChart(host: HTMLElement, spec: ChartSpec): void {
  const W = Math.max(280, Math.floor(host.clientWidth || 600));
  const narrow = W < 520;
  const H = narrow ? 220 : 260;
  const padL = 62;
  const padR = narrow ? 14 : 132;
  const padT = 14;
  const padB = 28;
  const n = spec.xs.length;

  const all: number[] = [];
  for (const s of spec.series) all.push(...s.values);
  for (const b of spec.bands ?? []) all.push(...b.lo, ...b.hi);
  for (const r of spec.refs ?? []) all.push(r.value);
  if (spec.zeroLine) all.push(0);
  const finite = all.filter(Number.isFinite);
  const yt = niceTicks(finite.length ? Math.min(...finite) : 0, finite.length ? Math.max(...finite) : 1, narrow ? 4 : 5);
  const y0 = yt[0];
  const y1 = yt[yt.length - 1];
  const x0 = spec.xs[0] ?? 0;
  const x1 = spec.xs[n - 1] ?? 1;
  const sx = (x: number) => padL + (x1 === x0 ? 0.5 : (x - x0) / (x1 - x0)) * (W - padL - padR);
  const sy = (v: number) => H - padB - ((v - y0) / (y1 - y0 || 1)) * (H - padT - padB);

  let g = '';
  for (const v of yt) {
    const y = sy(v);
    g += `<line class="ch-grid" x1="${padL}" x2="${W - padR}" y1="${f1(y)}" y2="${f1(y)}"/>`;
    g += `<text class="ch-tick" x="${padL - 8}" y="${f1(y + 4)}" text-anchor="end">${spec.yTick(v)}</text>`;
  }
  if (spec.zeroLine && y0 < 0 && y1 > 0) {
    g += `<line class="ch-axis" x1="${padL}" x2="${W - padR}" y1="${f1(sy(0))}" y2="${f1(sy(0))}"/>`;
  }
  const xStep = Math.max(1, Math.ceil(n / (narrow ? 5 : 10)));
  spec.xs.forEach((x, i) => {
    if (i % xStep !== 0 && i !== n - 1) return;
    if (i !== n - 1 && n - 1 - i < xStep / 2) return;
    g += `<text class="ch-tick" x="${f1(sx(x))}" y="${H - padB + 18}" text-anchor="middle">${spec.xTick(x)}</text>`;
  });
  g += `<line class="ch-axis" x1="${padL}" x2="${W - padR}" y1="${H - padB}" y2="${H - padB}"/>`;

  for (const b of spec.bands ?? []) {
    const top = b.hi.map((v, i) => `${i ? 'L' : 'M'}${f1(sx(spec.xs[i]))},${f1(sy(v))}`).join('');
    const bottom = b.lo
      .map((v, i) => [i, v] as const)
      .reverse()
      .map(([i, v]) => `L${f1(sx(spec.xs[i]))},${f1(sy(v))}`)
      .join('');
    g += `<path d="${top}${bottom}Z" fill="${b.color}" fill-opacity="${b.opacity}" stroke="none"/>`;
  }

  // Direktetiketter: placeras vid sista punkten och flyttas isär om de krockar.
  const labels: { y: number; text: string; color?: string; ref?: boolean }[] = [];
  for (const r of spec.refs ?? []) {
    const y = sy(r.value);
    g += `<line class="ch-ref" x1="${padL}" x2="${W - padR}" y1="${f1(y)}" y2="${f1(y)}"/>`;
    labels.push({ y, text: r.label, ref: true });
  }
  for (const s of spec.series) {
    const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${f1(sx(spec.xs[i]))},${f1(sy(v))}`).join('');
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}/>`;
    const last = s.values[n - 1];
    g += `<circle cx="${f1(sx(x1))}" cy="${f1(sy(last))}" r="4" fill="${s.color}" class="ch-end"/>`;
    labels.push({ y: sy(last), text: s.name, color: s.color });
  }
  labels.sort((a, b) => a.y - b.y);
  const gap = 14;
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].y - labels[i - 1].y < gap) labels[i].y = labels[i - 1].y + gap;
  }
  const overflow = labels.length ? labels[labels.length - 1].y - (H - padB - 4) : 0;
  if (overflow > 0) labels.forEach((l) => (l.y -= overflow));
  for (const l of labels) {
    if (narrow) {
      g += `<text class="ch-label${l.ref ? ' ch-label-ref' : ''}" x="${W - padR - 4}" y="${f1(l.y - 6)}" text-anchor="end">${l.text}</text>`;
    } else {
      const swatch = l.color ? `<rect x="${W - padR + 8}" y="${f1(l.y - 1.5)}" width="10" height="3" rx="1.5" fill="${l.color}"/>` : '';
      g += `${swatch}<text class="ch-label${l.ref ? ' ch-label-ref' : ''}" x="${W - padR + (l.color ? 22 : 8)}" y="${f1(l.y + 4)}">${l.text}</text>`;
    }
  }

  g += `<line class="ch-hair" x1="0" x2="0" y1="${padT}" y2="${H - padB}" visibility="hidden"/>`;
  spec.series.forEach((s) => {
    g += `<circle class="ch-dot" r="5" fill="${s.color}" visibility="hidden"/>`;
  });
  g += `<rect class="ch-hit" x="${padL}" y="${padT}" width="${W - padL - padR}" height="${H - padT - padB}" fill="transparent"/>`;

  host.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" tabindex="0" aria-label="${spec.ariaLabel}. Använd piltangenterna för att läsa värden.">${g}</svg><div class="ch-tip" role="status" aria-live="polite" hidden></div>`;

  const svg = host.querySelector('svg')!;
  const hair = svg.querySelector<SVGLineElement>('.ch-hair')!;
  const dots = Array.from(svg.querySelectorAll<SVGCircleElement>('.ch-dot'));
  const tip = host.querySelector<HTMLDivElement>('.ch-tip')!;
  let idx = -1;

  const show = (i: number) => {
    idx = Math.max(0, Math.min(n - 1, i));
    const x = sx(spec.xs[idx]);
    hair.setAttribute('x1', f1(x));
    hair.setAttribute('x2', f1(x));
    hair.setAttribute('visibility', 'visible');
    spec.series.forEach((s, k) => {
      dots[k].setAttribute('cx', f1(x));
      dots[k].setAttribute('cy', f1(sy(s.values[idx])));
      dots[k].setAttribute('visibility', 'visible');
    });
    tip.innerHTML = spec.tooltip(idx);
    tip.hidden = false;
    const tw = tip.offsetWidth;
    let left = x + 12;
    if (left + tw > W - 4) left = x - tw - 12;
    tip.style.left = `${Math.max(0, left)}px`;
    tip.style.top = `${padT}px`;
  };
  const hide = () => {
    hair.setAttribute('visibility', 'hidden');
    dots.forEach((d) => d.setAttribute('visibility', 'hidden'));
    tip.hidden = true;
  };
  const nearest = (clientX: number) => {
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bd = Infinity;
    spec.xs.forEach((x, i) => {
      const d = Math.abs(sx(x) - px);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
  svg.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
  svg.addEventListener('pointerdown', (e) => show(nearest(e.clientX)));
  svg.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') hide();
  });
  svg.addEventListener('focus', () => show(idx < 0 ? n - 1 : idx));
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      show((idx < 0 ? n - 1 : idx) + (e.key === 'ArrowLeft' ? -1 : 1));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      show(e.key === 'Home' ? 0 : n - 1);
    } else if (e.key === 'Escape') {
      hide();
    }
  });
}
