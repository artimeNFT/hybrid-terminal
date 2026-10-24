'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {contract, checkSources, assessSnapshot, checkReplay} = require('../research/calculation-contract.cjs');
const {createAdapter} = require('../research/audit/adapter.cjs');
const {randomBars} = require('./regression.cjs');
const START = Date.parse(contract.data.originInclusive), STEP = contract.data.stepMs;
const mode = {stateMode: 'full-past-prefix-recompute'};
const timed = bars => bars.map((b, i) => ({...b, t: START + i * STEP}));
function snapshot(bars, time = bars.at(-1).t) {
  const adapter = createAdapter();
  adapter.load(bars);
  const result = adapter.snapshot(time);
  assert.deepEqual(adapter.deniedCalls(), []);
  return result;
}
const ordinary = timed(randomBars(31, 4300));

test('contract pins reviewed sources without reading acquired data or bootstrapping the app', () => {
  const identity = checkSources();
  assert.equal(identity.contractVersion, '1.0.0');
  assert.equal(identity.acquiredDataRead, false);
  assert.equal(identity.applicationBootstrapExecuted, false);
  assert.equal(identity.status, 'predeclared-awaiting-independent-review');
  assert.match(identity.contractSha256, /^[a-f0-9]{64}$/);
  assert.equal(contract.features.ema800.role, 'context');
  assert.equal(contract.features.ema50.role, 'score');
  for (const feature of Object.values(contract.features)) assert.equal(feature.maximumReplayDelta, 0);
});

test('3999 is excluded and the full-origin 4000th candle is the first prepared decision', () => {
  const before = snapshot(ordinary.slice(0, 3999));
  const first = snapshot(ordinary.slice(0, 4000));
  assert.equal(before.decision.validity.ready, true, 'Preparation is additional to unchanged app validity');
  assert.deepEqual(assessSnapshot(before, mode).exclusions, ['initial-preparation']);
  assert.equal(first.closeTime, Date.parse(contract.preparation.firstPermittedDecisionClose));
  assert.equal(assessSnapshot(first, mode).calculationState, 'ready');
  assert.equal(assessSnapshot(snapshot(ordinary.slice(0, 4001)), mode).calculationState, 'ready');
});

test('a warmed trailing window cannot impersonate fixed-origin history or retained parser state', () => {
  const full = snapshot(ordinary);
  const rolling = snapshot(ordinary.slice(-4000));
  assert.equal(rolling.pastBars, 4000);
  assert.equal(rolling.decision.validity.ready, true);
  assert.ok(assessSnapshot(rolling, mode).exclusions.includes('wrong-origin'));
  assert.equal(checkReplay(full, rolling).reason, 'different-origin-or-decision');
  assert.ok(assessSnapshot(full).exclusions.includes('state-policy-not-declared'));
  for (const stateMode of ['last-30-events', 'rolling-4000', 'serialized-mw-state']) {
    assert.ok(assessSnapshot(full, {stateMode}).exclusions.includes('unsupported-state-policy'));
  }
});

test('UTC end coordinates allow the last closed candle but reject future or inconsistent coordinates', () => {
  // Coordinate-policy boundary probes use a trusted-shape snapshot, not a fabricated market run.
  const base = snapshot(ordinary.slice(0, 4000));
  const last = structuredClone(base);
  last.pastBars = contract.data.expectedRows;
  last.closeTime = Date.parse(contract.data.endExclusive);
  last.openTime = last.closeTime - STEP;
  assert.equal(assessSnapshot(last, mode).calculationState, 'ready');
  const future = {...last, pastBars: last.pastBars + 1, closeTime: last.closeTime + STEP, openTime: last.openTime + STEP};
  assert.ok(assessSnapshot(future, mode).exclusions.includes('outside-frozen-range'));
  for (const bad of [{...base, closeTime: base.closeTime - 1}, {...base, pastBars: 3999}, {...base, openTime: NaN}]) {
    assert.ok(assessSnapshot(bad, mode).exclusions.includes('coordinate-mismatch'));
  }
  const partial = structuredClone(base); partial.dayCoverage = 'partial-first-day';
  assert.ok(assessSnapshot(partial, mode).exclusions.includes('partial-UTC-day'));
});

test('actual flat-RSI, zero-volume and zero-ATR inputs remain excluded after preparation', () => {
  const flat = Array.from({length: 4000}, (_, i) => ({t: START + i * STEP, o: 100, c: 100, h: 101, l: 99, v: 100}));
  for (const bars of [flat, ordinary.slice(0, 4000).map(b => ({...b, v: 0})), flat.map(b => ({...b, h: 100, l: 100}))]) {
    const s = snapshot(bars), result = assessSnapshot(s, mode);
    assert.equal(s.decision.validity.ready, false);
    assert.equal(result.calculationState, 'excluded');
    assert.ok(result.exclusions.includes('invalid-score-inputs'));
    assert.equal(result.applicationSide, 'WAIT', 'Report the app side without confusing it with readiness');
  }
  assert.equal(snapshot(flat).metrics.rsi14.state, 'undefined-no-change');
});

test('a valid WAIT is retained and readiness does not mutate decisions or add context score votes', () => {
  const adapter = createAdapter(); adapter.load(ordinary);
  const snapshots = Array.from({length: 20}, (_, i) => adapter.snapshot(ordinary[4000 + i].t));
  const s = snapshots.find(s => s.decision.side === 'WAIT' && s.decision.validity.ready);
  assert.ok(s, 'Fixture must contain an actual valid WAIT');
  const prior = structuredClone(s);
  const result = assessSnapshot(s, mode);
  assert.equal(result.calculationState, 'ready');
  assert.equal(result.applicationSide, 'WAIT');
  assert.deepEqual(s, prior);
  const absentContext = structuredClone(s); absentContext.metrics.ema800 = {state: 'unavailable', value: null};
  assert.equal(assessSnapshot(absentContext, mode).calculationState, 'ready');
  assert.equal(assessSnapshot(absentContext, mode).contextAvailability.ema800, 'unavailable');
});

test('exact budgets detect price, RSI, RR and state changes smaller than audit reporting tolerances', () => {
  const original = snapshot(ordinary.slice(0, 4000));
  assert.equal(checkReplay(original, structuredClone(original)).accepted, true);
  for (const mutate of [
    s => { s.metrics.ema800.value += 1e-10; },
    s => { s.metrics.rsi14.value += 1e-12; },
    s => { s.metrics.rsi14.state = 'undefined-no-change'; },
    s => { s.decision.candidates.LONG.eligible = !s.decision.candidates.LONG.eligible; },
    s => { s.volume.mean += 1e-10; }
  ]) {
    const altered = structuredClone(original); mutate(altered);
    assert.equal(checkReplay(original, altered).reason, 'replay-budget-exceeded');
  }
  // Controlled plan projection checks exercise dimensionless RR independently of price.
  const planned = structuredClone(original);
  planned.decision.candidates.LONG.plan = {entry: 100, stop: 99, tp1: 101, tp2: 102, rr: 2};
  const changedRr = structuredClone(planned); changedRr.decision.candidates.LONG.plan.rr += 1e-12;
  assert.deepEqual(checkReplay(planned, changedRr).changedFields, ['decision']);
});

test('full-origin restart reproduces M/W with pivots older than a recent-event reporting window', () => {
  const points = [[0, 105], [100, 120], [200, 105], [300, 120], [303, 119], [330, 125]];
  const bars = Array.from({length: 331}, (_, i) => {
    const j = points.findIndex(p => p[0] >= i), [a, x] = points[Math.max(0, j - 1)], [b, y] = points[j];
    const h = a === b ? x : x + (y - x) * (i - a) / (b - a), c = h - 0.5;
    return {t: START + i * STEP, o: c - 0.1, c, h, l: h - 8, v: 100};
  });
  const prefix = bars.slice(0, 304), before = snapshot(prefix);
  const event = before.mw.find(e => e.type === 'M' && e.pivotOpenTime === bars[300].t);
  assert.ok(event);
  assert.ok(event.pivots.some(p => p.openTime < bars[273].t), 'Recent event still depends on older pivots');
  const resumed = snapshot(prefix); // Fresh adapter, no serialized cache or parser state.
  assert.equal(checkReplay(before, resumed).accepted, true);
  const truncated = snapshot(prefix.slice(-30));
  assert.ok(!truncated.mw.some(e => e.pivotOpenTime === bars[300].t));
  assert.equal(checkReplay(before, truncated).reason, 'different-origin-or-decision');
  assert.equal(checkReplay(before, snapshot(bars, prefix.at(-1).t)).accepted, true);
});

test('future append parity is exact and cannot be mixed with changed-time comparisons', () => {
  const prefix = ordinary.slice(0, 4000), before = snapshot(prefix);
  assert.equal(checkReplay(before, snapshot(ordinary, prefix.at(-1).t)).accepted, true);
  assert.equal(checkReplay(before, snapshot(ordinary.slice(0, 4001))).reason, 'different-origin-or-decision');
});
