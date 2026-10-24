'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {createCalculations} = require('../research/preparation/calculations.cjs');
const {createAdapter} = require('../research/audit/adapter.cjs');
const {protocol, canonical, hash, sourceArm, eligibility, eligibleRecords, atrPercentile, applyChronology, calendar} = require('../research/preparation/features.cjs');
const {matchEpisodes, pairCoordinates} = require('../research/preparation/matching.cjs');
const {smd, distribution, overlap, diagnostics} = require('../research/preparation/diagnostics.cjs');
const {collect} = require('../research/preparation/worker.cjs');
const {seal, checkedSeal, verify, mergeDecisions} = require('../research/prepare.cjs');
const {randomBars} = require('./regression.cjs');
const START = Date.parse(protocol.originInclusive), STEP = protocol.stepMs;
const timed = bars => bars.map((b, i) => ({...b, t: START + i * STEP}));
const bars = timed(randomBars(31, 4010));
const native = v => JSON.parse(JSON.stringify(v));

test('real classification precedence, equality, reference availability and doji direction are preserved', () => {
  const prior = Array.from({length: 10}, () => ({o: 100, c: 100, h: 101, l: 99, v: 100}));
  for (const [v, h, l, expected, state] of [[200, 100.5, 99.5, 2, 'ready'], [150, 100.5, 99.5, 1, 'ready'],
    [100, 100.5, 99.5, 0, 'ready'], [100, 101, 99, 2, 'ready'], [0, 100.5, 99.5, 0, 'zero-volume'], [200, 100, 100, 2, 'ready']]) {
    const input = timed([...prior, {o: 100, c: 100, h, l, v}]), calc = createCalculations(input), frame = calc.at(10);
    assert.equal(frame.volume.classification, expected); assert.equal(frame.volume.state, state); assert.equal(frame.volume.up, true);
    assert.equal(sourceArm(frame.recent.at(-1)), state !== 'ready' || h === l || expected === 1 ? null : expected === 2 ? 'V' : 'C');
    const old = createAdapter(); old.load(input); assert.deepEqual(native(frame.volume), old.snapshot(input[10].t).volume);
  }
  const warm = createCalculations(timed(prior)).at(5); assert.equal(warm.volume.state, 'warm-up'); assert.equal(warm.volume.classification, 0);
  const zeroReference = createCalculations(timed([...prior.map(b => ({...b, v: 0})), {...prior[0]}])).at(10);
  assert.equal(zeroReference.volume.state, 'zero-reference'); assert.equal(zeroReference.volume.classification, 0); assert.equal(sourceArm(zeroReference.recent.at(-1)), null);
});

test('ordinary/vector recovery symmetry, strict outside geometry and inclusive equality boundaries', () => {
  for (const cls of [0, 2]) {
    const z = {index: 100, t: START + 100 * STEP, o: 100, c: 101, h: 102, l: 100, v: 100, cls, reference: {state: 'ready'}};
    const d = {index: 101, t: START + 101 * STEP, c: 103, h: 104, l: 102};
    const reflected = b => ({...b, o: b.o === undefined ? undefined : 210 - b.o, c: 210 - b.c, h: 210 - b.l, l: 210 - b.h});
    const up = eligibility(z, d, [d], 1), down = eligibility(reflected(z), reflected(d), [reflected(d)], 1);
    assert.equal(up.side, 'SHORT'); assert.equal(down.side, 'LONG'); assert.equal(up.priorEdgeTouch, true); assert.equal(down.priorEdgeTouch, true);
    assert.equal(up.arm, cls === 2 ? 'V' : 'C'); assert.equal(up.distance, down.distance);
    assert.equal(eligibility(z, d, [{...d, l: 101}], 1), null, 'Equality at midpoint is recovery');
    assert.equal(eligibility(reflected(z), reflected(d), [reflected({...d, l: 101})], 1), null);
    assert.equal(eligibility(z, {...d, c: 102}, [d], 1), null, 'Near edge equality is not strictly outside');
    assert.ok(eligibility(z, {...d, c: 108}, [{...d, l: 107}], 1));
    assert.equal(eligibility(z, {...d, c: 108.000001}, [{...d, l: 107}], 1), null);
    assert.ok(eligibility(z, {...d, index: 400}, [d], 1)); assert.equal(eligibility(z, {...d, index: 401}, [d], 1), null);
    assert.equal(eligibility(z, {...d, index: 100}, [d], 1), null);
    for (const bad of [{...z, cls: 1}, {...z, reference: {state: 'warm-up'}}, {...z, h: z.l}]) assert.equal(eligibility(bad, d, [d], 1), null);
  }
});

function episode(id, arm, decisionIndex, extra = {}) {
  const close = START + (decisionIndex + 1) * STEP;
  return {id, arm, side: 'LONG', block: 0, decisionIndex, decisionCloseTime: close, zoneOpenTime: close - 20 * STEP,
    ...calendar(close), priorEdgeTouch: false, ageBars: 20, logAge: Math.log(20), atrPercentile: 0.5,
    midpointDistanceAtr: 1, stopDistanceAtr: 1, zoneWidthAtr: 1, nearEdgeDistanceAtr: 0.5, plannedRr: 1,
    source: {doji: false}, withinArmNearestRank: 1, exclusions: [], ...extra};
}
test('first eligibility precedes tail/chronology exclusions and cannot resurrect in a later block', () => {
  const a = episode('same', 'V', 11378), later = {...a, decisionIndex: 11498};
  const rows = applyChronology([later, a]); assert.equal(rows.length, 1); assert.equal(rows[0].decisionIndex, 11378); assert.deepEqual(rows[0].exclusions, ['reserved-tail']);
  assert.deepEqual(applyChronology([episode('last-ok', 'V', 11377)])[0].exclusions, []);
  const outside = applyChronology([episode('x', 'C', 3999), episode('x', 'C', 4000)], [[4000, 5000]]);
  assert.equal(outside.length, 1); assert.deepEqual(outside[0].exclusions, ['outside-chronology']);
});

test('ATR percentile excludes t, uses empirical midrank, and calendar features use the close', () => {
  const prior = Array.from({length: 288}, (_, i) => i);
  assert.equal(atrPercentile(143.5, prior), 0.5); assert.equal(atrPercentile(143, prior), 143.5 / 288);
  assert.equal(atrPercentile(10, prior.slice(1)), null); assert.equal(atrPercentile(10, [...prior.slice(1), null]), null);
  const fridayMidnightClose = Date.parse('2026-07-04T00:00:00Z');
  assert.equal(calendar(fridayMidnightClose).weekend, true); assert.equal(calendar(fridayMidnightClose).utcSixHourBucket, 0);
  assert.equal(calendar(fridayMidnightClose - 1).weekend, false); assert.equal(calendar(fridayMidnightClose - 1).utcSixHourBucket, 3);
});

test('memoized actual reference values equal uncached full replay and the reviewed adapter, including replay backwards', () => {
  const a = createCalculations(bars), b = createCalculations(bars, {memoizeVolumeReference: false}), old = createAdapter();
  for (const i of [4009, 3999, 4003]) {
    const x = a.at(i), y = b.at(i); assert.equal(canonical(x), canonical(y));
    old.load(bars.slice(0, i + 1)); const z = old.snapshot(bars[i].t);
    for (const key of ['metrics', 'decision', 'volume', 'dayCoverage']) assert.equal(canonical(x[key]), canonical(z[key]));
  }
  assert.equal(a.identity.backtestExtracted, false); assert.equal(a.identity.bootstrapExecuted, false); assert.deepEqual(a.deniedCalls(), []);
});

test('all eligible arms get decision-time plans/ranks without score/action filtering and future changes cannot affect them', () => {
  const fixture = bars.map(b => ({...b}));
  for (let i = 3970; i < fixture.length; i++) fixture[i] = {t: START + i * STEP, o: 99.9, c: 100, h: 101, l: 99, v: 100};
  fixture[3980] = {t: fixture[3980].t, o: 106.8, c: 105.1, h: 107, l: 105, v: 10000};
  fixture[3981] = {t: fixture[3981].t, o: 102.8, c: 102.2, h: 103, l: 102, v: 1};
  const calc = createCalculations(fixture), frame = calc.at(3999), found = eligibleRecords(frame);
  assert.deepEqual(found.invalidReasons, []);
  for (const [index, arm] of [[3980, 'V'], [3981, 'C']]) {
    const r = found.records.find(r => r.zoneOpenTime === fixture[index].t); assert.ok(r); assert.equal(r.arm, arm); assert.equal(r.side, 'LONG');
    assert.ok(r.withinArmNearestRank >= 1); assert.equal(r.plan.tp1, fixture[index].l); assert.equal(r.plan.tp2, (fixture[index].h + fixture[index].l) / 2);
    const A = frame.metrics.atr14.value, expectedStop = Math.min(99 - 0.3 * A, 100 - A);
    assert.equal(r.plan.stop, expectedStop); assert.equal(r.stopDistanceAtr, (100 - expectedStop) / A);
  }
  const changed = fixture.map((b, i) => i <= 3999 ? b : {...b, o: 999, c: 1000, h: 1001, l: 998, v: 100000});
  const future = createCalculations(changed); future.at(4009);
  assert.equal(canonical(eligibleRecords(future.at(3999))), canonical(found));
  const changedPolicy = native(frame); changedPolicy.decision.side = 'WAIT'; changedPolicy.decision.score = 0;
  for (const c of Object.values(changedPolicy.decision.candidates)) { c.score = 0; c.eligible = false; }
  assert.equal(canonical(eligibleRecords(changedPolicy)), canonical(found), 'No score/action/legacy choice filter');
});

test('one greedy attempt obeys exact strata, all calipers, no replacement and deterministic ties', () => {
  const vectors = [6000, 6001, 6002].map((i, j) => episode('V' + j, 'V', i));
  const controls = [6288, 6289].map((i, j) => episode('C' + j, 'C', i));
  const first = matchEpisodes([...vectors, ...controls]), reversed = matchEpisodes([...controls, ...vectors].reverse());
  assert.equal(canonical(first), canonical(reversed)); assert.equal(first.pairs.length, 2); assert.equal(new Set(first.pairs.map(p => p.controlId)).size, 2);
  assert.equal(first.pairs[0].controlId, 'C0'); assert.equal(first.unmatched[0].reason, 'controls-exhausted');
  for (const key of ['side', 'block', 'priorEdgeTouch', 'weekend', 'utcSixHourBucket']) {
    const c = {...controls[0], [key]: typeof controls[0][key] === 'boolean' ? !controls[0][key] : key === 'side' ? 'SHORT' : 2};
    assert.equal(matchEpisodes([vectors[0], c]).pairs.length, 0, key);
  }
  for (const [key, cap] of Object.entries(protocol.features.continuousCalipers)) {
    const v = {...vectors[0], [key]: 0}, c = {...controls[0], [key]: cap};
    assert.equal(matchEpisodes([v, c]).pairs.length, 1, key + ' inclusive');
    assert.equal(matchEpisodes([v, {...c, [key]: cap + 1e-8}]).pairs.length, 0, key + ' exceeded');
  }
  // Pure matcher boundary probes deliberately hold the exact stratum fixed.
  for (const lag of [121, 2016]) assert.equal(matchEpisodes([vectors[0], {...controls[0], decisionIndex: 6000 + lag}]).pairs.length, 1);
  for (const lag of [120, 2017]) assert.equal(matchEpisodes([vectors[0], {...controls[0], decisionIndex: 6000 + lag}]).pairs.length, 0);
  const left = {...controls[0], id: 'left', decisionIndex: 5700}, right = {...controls[0], id: 'right', decisionIndex: 6300};
  assert.equal(matchEpisodes([vectors[0], right, left]).pairs[0].controlId, 'left');
  const sameTime = {...right, id: 'earlier-zone', zoneOpenTime: right.zoneOpenTime - STEP};
  assert.equal(matchEpisodes([vectors[0], right, sameTime]).pairs[0].controlId, 'earlier-zone');
  assert.equal(matchEpisodes([vectors[0], {...right, id: 'z'}, {...right, id: 'a'}]).pairs[0].controlId, 'a');
});

test('unmatched reasons distinguish absent strata, time/caliper support, missing values and exhaustion', () => {
  const v = episode('v', 'V', 6000), c = episode('c', 'C', 6288);
  assert.equal(matchEpisodes([v]).unmatched[0].reason, 'no-exact-stratum');
  assert.equal(matchEpisodes([v, {...c, decisionIndex: 6001}]).unmatched[0].reason, 'no-time-support');
  assert.equal(matchEpisodes([v, {...c, midpointDistanceAtr: 10}]).unmatched[0].reason, 'no-caliper-support');
  assert.equal(matchEpisodes([{...v, atrPercentile: null}, c]).unmatched[0].reason, 'missing-covariate');
});

test('SMD keeps the pre-match denominator, flags equality at 0.1 and exposes missing/zero/insufficient states', () => {
  const d = smd([0, 2], [2, 4], [2], [2]); assert.equal(d.preMatchPooledSd, Math.sqrt(2)); assert.equal(d.post.value, 0); assert.ok(d.pre.flag);
  assert.equal(smd([-1, 0, 1], [-1, 0, 1], [0.1], [0]).post.flag, true);
  assert.equal(smd([1, 1], [1, 1], [1], [1]).post.state, 'zero-variance-equal');
  const unequal = smd([1, 1], [2, 2], [1], [2]); assert.equal(unequal.post.value, null); assert.equal(unequal.post.flag, true);
  assert.equal(smd([1], [1, 2], [1], [1]).post.state, 'insufficient-pre-sample');
  assert.equal(smd([0, 2], [0, 2], [], [1]).post.state, 'insufficient-post-sample');
  const missing = distribution([0, null, NaN, 2]); assert.equal(missing.missing, 2); assert.equal(missing.median, 1); assert.equal(missing.q25, 0.5);
});

test('overlap and full reserved UTC day spans use coordinates, not future prices', () => {
  const rows = [0, 119, 120].map((i, j) => episode(String(j), 'V', i));
  const d = overlap(rows); assert.equal(d.overlappingPairs, 2); assert.equal(d.episodesInvolved, 3); assert.equal(d.maximumConcurrency, 2);
  assert.equal(overlap([]).overlappingPairs, 0);
  const p = pairCoordinates({...rows[0], decisionCloseTime: Date.parse('2026-07-02T23:55:00Z')});
  assert.deepEqual(p.reservedUtcDays, ['2026-07-02', '2026-07-03']); assert.equal(p.reservedEndExclusiveUtc, '2026-07-03T09:55:00.000Z');
});

test('restart/full-prefix worker sharding reproduces canonical episodes, decisions and matching', () => {
  const input = bars.slice(0, 4004), all = collect({bars: input, start: 3999, end: 4004});
  const a = collect({bars: input, start: 3999, end: 4004, stride: 2}), b = collect({bars: input, start: 4000, end: 4004, stride: 2});
  const merged = applyChronology([...a.episodes, ...b.episodes]), plain = applyChronology(all.episodes);
  assert.equal(canonical(merged), canonical(plain)); assert.equal(canonical(mergeDecisions([a, b])), canonical(all.decisions));
  assert.equal(hash(matchEpisodes(merged)), hash(matchEpisodes(plain)));
  const report = diagnostics(plain, matchEpisodes(plain), all.sourceCensus, all.decisions);
  assert.ok(report.populations.global); assert.ok(report.populations['LONG:block:0']);
  assert.doesNotThrow(() => canonical(report));
});

test('protocol seal, reopened canonical hashes and volatile metadata stay separate; incomplete runs fail', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hybrid-preparation-'));
  try {
    const s = seal(dir); assert.equal(canonical(checkedSeal(dir)), canonical(s.identities));
    assert.throws(() => seal(dir), /EEXIST/);
    const features = {identity: s.identities, episodes: []}, featureHash = hash(features), pairs = {identity: s.identities, featureHash, pairs: []};
    fs.writeFileSync(path.join(dir, 'features.json'), canonical(features)); fs.writeFileSync(path.join(dir, 'pairs.json'), canonical(pairs));
    fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify({state: 'complete', identity: s.identities, featureHash, pairHash: hash(pairs), randomRuntime: 1}));
    fs.writeFileSync(path.join(dir, 'runtime.json'), JSON.stringify({state: 'complete', wallSeconds: 999}));
    assert.equal(verify(dir).state, 'canonical-payloads-verified');
    fs.writeFileSync(path.join(dir, 'runtime.json'), JSON.stringify({state: 'failed-not-complete'})); assert.throws(() => verify(dir), /Incomplete/);
    assert.equal(hash({b: 2, a: 1}), hash({a: 1, b: 2})); assert.throws(() => canonical({x: Infinity}), /finite/);
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});

test('preparation calculations run without network, browser storage, application bootstrap or backtest capabilities', () => {
  const priorFetch = global.fetch; let networkCalls = 0;
  global.fetch = () => { networkCalls++; throw Error('No network'); };
  Object.defineProperty(global, 'localStorage', {configurable: true, get() { throw Error('No browser storage'); }});
  try {
    const calc = createCalculations(bars); calc.at(3999);
    assert.equal(calc.identity.bootstrapExecuted, false); assert.equal(calc.identity.backtestExtracted, false);
    assert.deepEqual(calc.deniedCalls(), []); assert.equal(networkCalls, 0);
  } finally { global.fetch = priorFetch; delete global.localStorage; }
});
