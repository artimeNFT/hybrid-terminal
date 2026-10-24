'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {verify, checkedSeal} = require('../research/prepare.cjs');
const {loadVerifiedDataset} = require('../research/readiness-audit.cjs');
const {protocol, canonical, hash, calendar} = require('../research/preparation/features.cjs');
const {matchEpisodes, stratum, pairCoordinates} = require('../research/preparation/matching.cjs');

// Read-only, outcome-blind cross-check of every published record against its own past raw bars.
// No indicator formula is reimplemented and no post-decision price is read for these checks.
function verifyPreparation(dataset, out) {
  const receipt = verify(out), identity = checkedSeal(out), {bars} = loadVerifiedDataset(dataset);
  const feature = JSON.parse(fs.readFileSync(path.join(out, 'features.json'), 'utf8'));
  const pairs = JSON.parse(fs.readFileSync(path.join(out, 'pairs.json'), 'utf8'));
  assert.equal(canonical(feature.identity), canonical(identity));
  assert.equal(feature.decisions.reduce((n, d) => n + d.examined, 0), bars.length - 3999);
  assert.equal(feature.sourceCensus.length, bars.length);
  assert.equal(new Set(feature.episodes.map(r => r.id)).size, feature.episodes.length);
  for (const r of feature.episodes) {
    const i = r.decisionIndex, z = (r.zoneOpenTime - bars[0].t) / protocol.stepMs, source = bars[z], current = bars[i];
    assert.ok(Number.isInteger(z) && z >= 0 && i >= 3999 && i < bars.length);
    const up = source.c >= source.o, side = up ? 'SHORT' : 'LONG', A = r.plan.atr14;
    assert.equal(r.id, `${protocol.symbol}:${protocol.timeframe}:${source.t}:${side}`);
    assert.equal(r.side, side); assert.equal(r.decisionCloseTime, current.t + protocol.stepMs);
    for (const key of ['decisionDayUtc', 'weekend', 'utcSixHourBucket']) assert.equal(r[key], calendar(r.decisionCloseTime)[key]);
    for (const [key, field] of [['o', 'open'], ['h', 'high'], ['l', 'low'], ['c', 'close'], ['v', 'volume']]) assert.equal(r.source[field], source[key]);
    assert.equal(r.source.doji, source.o === source.c); assert.equal(r.source.up, up);
    assert.equal(r.source.reference.state, 'ready'); assert.ok(source.h > source.l);
    const census = feature.sourceCensus[z]; assert.equal(census.t, source.t); assert.equal(census.cls, r.source.classification);
    assert.equal(r.arm, census.cls === 2 ? 'V' : 'C'); if (r.arm === 'C') assert.equal(census.cls, 0);
    assert.equal(r.ageBars, i - z); assert.ok(r.ageBars >= 1 && r.ageBars <= 300); assert.equal(r.logAge, Math.log(r.ageBars));
    const near = up ? source.h : source.l, mid = (source.h + source.l) / 2;
    const distance = up ? current.c - near : near - current.c; assert.ok(distance > 0 && distance <= 6 * A);
    let touched = false, firstTouch = null;
    for (let j = z + 1; j <= i; j++) {
      const b = bars[j]; assert.ok(up ? b.l > mid : b.h < mid, 'Midpoint already recovered: ' + r.id);
      if (up ? b.l <= near : b.h >= near) { touched = true; if (firstTouch === null) firstTouch = b.t; }
    }
    assert.equal(r.priorEdgeTouch, touched); assert.equal(r.firstEdgeTouchTime, firstTouch);
    const window = bars.slice(i - 19, i + 1), stop = up ? Math.max(Math.max(...window.map(b => b.h)) + 0.3 * A, current.c + A) :
      Math.min(Math.min(...window.map(b => b.l)) - 0.3 * A, current.c - A);
    assert.equal(r.plan.stop, stop); assert.equal(r.plan.decisionClose, current.c); assert.equal(r.plan.tp1, near); assert.equal(r.plan.tp2, mid);
    const risk = Math.abs(stop - current.c), midDistance = Math.abs(mid - current.c);
    assert.equal(r.stopDistanceAtr, risk / A); assert.equal(r.midpointDistanceAtr, midDistance / A);
    assert.equal(r.zoneWidthAtr, (source.h - source.l) / A); assert.equal(r.nearEdgeDistanceAtr, distance / A); assert.equal(r.plannedRr, midDistance / risk);
    const block = protocol.chronology.blocksDecisionIndexHalfOpen.findIndex(([a, b]) => i >= a && i < b); assert.equal(r.block, block);
    const expected = i + 120 < protocol.chronology.blocksDecisionIndexHalfOpen[block][1] ? [] : ['reserved-tail'];
    assert.equal(canonical(r.exclusions), canonical(expected));
  }
  const byId = new Map(feature.episodes.map(r => [r.id, r])), usedV = new Set(), usedC = new Set();
  for (const pair of pairs.pairs) {
    const v = byId.get(pair.vectorId), c = byId.get(pair.controlId); assert.equal(v.arm, 'V'); assert.equal(c.arm, 'C');
    assert.equal(v.exclusions.length + c.exclusions.length, 0); assert.equal(stratum(v), stratum(c));
    assert.ok(!usedV.has(v.id) && !usedC.has(c.id)); usedV.add(v.id); usedC.add(c.id);
    const lag = Math.abs(v.decisionIndex - c.decisionIndex); assert.ok(lag >= 121 && lag <= 2016); assert.equal(pair.separationBars, lag);
    let cost = 0;
    for (const [key, cap] of Object.entries(protocol.features.continuousCalipers)) { const delta = Math.abs(v[key] - c[key]); assert.ok(delta <= cap); cost += (delta / cap) ** 2; }
    assert.equal(pair.cost, cost); assert.equal(canonical(pair.vector), canonical(pairCoordinates(v))); assert.equal(canonical(pair.control), canonical(pairCoordinates(c)));
  }
  const replayed = {kind: 'hybrid-preparation-pairs', identity, featureHash: receipt.featureHash, ...matchEpisodes(feature.episodes)};
  assert.equal(hash(replayed), receipt.pairHash, 'Identical fixed design must reproduce the canonical pair payload');
  return {...receipt, state: 'all-records-and-pairs-verified', recordsChecked: feature.episodes.length, pairsChecked: pairs.pairs.length,
    identicalMatchingReplay: true, realFeatureCohortRuns: 1, geometryRecoveryChecksReadPastBarsOnly: true,
    limitation: 'Full Q3 feature calculation was run once; restart/shard feature equality is covered by synthetic fixtures and exact benchmark prefixes'};
}
if (require.main === module) {
  try { assert.equal(process.argv.length, 4, 'Usage: node tests/verify-preparation.cjs <frozen-dataset> <completed-output>'); console.log(JSON.stringify(verifyPreparation(process.argv[2], process.argv[3]), null, 2)); }
  catch (error) { console.error(error.stack); process.exitCode = 1; }
}
module.exports = {verifyPreparation};
