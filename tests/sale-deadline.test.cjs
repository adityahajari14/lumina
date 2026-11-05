/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getSalePhase } = require('../src/lib/sale-deadline');

test('sale urgency follows the final three local calendar days and final local day', () => {
  const end = new Date(2026, 10, 30, 23, 59, 59);
  assert.equal(getSalePhase(end, new Date(2026, 10, 5, 12)), 'active');
  assert.equal(getSalePhase(end, new Date(2026, 10, 27, 23, 59, 59)), 'active');
  assert.equal(getSalePhase(end, new Date(2026, 10, 28)), 'ending-soon');
  assert.equal(getSalePhase(end, new Date(2026, 10, 29, 23, 59, 59)), 'ending-soon');
  assert.equal(getSalePhase(end, new Date(2026, 10, 30)), 'final-hours');
  assert.equal(getSalePhase(end, new Date(2026, 10, 30, 23, 59, 58)), 'final-hours');
  assert.equal(getSalePhase(end, end), 'expired');
  assert.equal(getSalePhase(end, new Date(2026, 11, 1)), 'expired');
});

test('final days cross month and year boundaries using the local calendar', () => {
  const end = new Date(2027, 0, 1, 23, 59, 59);
  assert.equal(getSalePhase(end, new Date(2026, 11, 29, 23, 59, 59)), 'active');
  assert.equal(getSalePhase(end, new Date(2026, 11, 30)), 'ending-soon');
  assert.equal(getSalePhase(end, new Date(2027, 0, 1)), 'final-hours');
});
