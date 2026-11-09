import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatYears, formatPeriod, monthsCovered, monthsIn } from '../src/lib/cv-duration.ts';

const now = new Date(2026, 10, 5); // Nov 2026

test('monthsIn counts start and end month inclusively', () => {
  assert.equal(monthsIn({ start: '2022-10', end: '2023-07' }), 10);
  assert.equal(monthsIn({ start: '2018-05', end: '2018-05' }), 1);
  assert.equal(monthsIn({ start: '2023-07' }, now), 41);
});

test('monthsCovered counts overlapping months once', () => {
  const periods = [
    { start: '2023-07' },
    { start: '2022-10', end: '2023-07' },
  ];
  assert.equal(monthsCovered(periods, now), 50);
});

test('formatDuration', () => {
  assert.equal(formatDuration(1), '1 month');
  assert.equal(formatDuration(10), '10 months');
  assert.equal(formatDuration(12), '1 year');
  assert.equal(formatDuration(41), '3 years, 5 months');
});

test('formatPeriod', () => {
  assert.equal(formatPeriod({ start: '2018-05', end: '2018-05' }), 'May 2018');
  assert.equal(formatPeriod({ start: '2023-07' }), 'Jul 2023 – Present');
  assert.equal(formatPeriod({ start: '2019-06', end: '2021-12' }), 'Jun 2019 – Dec 2021');
});

test('formatYears rounds down to whole years', () => {
  assert.equal(formatYears(50), '4+ years');
  assert.equal(formatYears(48), '4 years');
  assert.equal(formatYears(13), '1+ year');
  assert.equal(formatYears(7), '< 1 year');
});
