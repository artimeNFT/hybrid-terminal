'use strict';
const assert = require('node:assert/strict');
const {protocol, order, ascii} = require('./features.cjs');
const calipers = protocol.features.continuousCalipers;
const stratum = r => [r.side, r.block, r.priorEdgeTouch, r.weekend, r.utcSixHourBucket].join('|');
const finiteCovariates = r => Object.keys(calipers).every(k => Number.isFinite(r[k]));
function matchEpisodes(episodes) {
  const pool = episodes.filter(r => !r.exclusions.length), vectors = pool.filter(r => r.arm === 'V').sort(order);
  const controls = pool.filter(r => r.arm === 'C'), groups = new Map(), used = new Set(), pairs = [], unmatched = [];
  assert.equal(new Set(pool.map(r => r.id)).size, pool.length, 'Duplicate episode IDs');
  for (const c of controls) if (finiteCovariates(c)) {
    const key = stratum(c); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(c);
  }
  const [minLag, maxLag] = protocol.matching.absoluteSeparationBarsInclusive;
  for (const v of vectors) {
    const exact = groups.get(stratum(v)) || [], temporal = [], caliper = [];
    if (!finiteCovariates(v)) { unmatched.push({id: v.id, reason: 'missing-covariate', exact: exact.length, temporal: 0, caliper: 0, unused: 0}); continue; }
    for (const c of exact) {
      const separation = Math.abs(v.decisionIndex - c.decisionIndex);
      if (separation < minLag || separation > maxLag) continue;
      temporal.push(c); let distance = 0, admitted = true;
      for (const [key, maximum] of Object.entries(calipers)) {
        const delta = Math.abs(v[key] - c[key]);
        if (delta > maximum) { admitted = false; break; }
        distance += (delta / maximum) ** 2;
      }
      if (admitted) caliper.push({c, distance, separation});
    }
    const available = caliper.filter(q => !used.has(q.c.id));
    available.sort((a, b) => a.distance - b.distance || a.separation - b.separation || order(a.c, b.c));
    const stages = {exact: exact.length, temporal: temporal.length, caliper: caliper.length, unused: available.length};
    if (!available.length) {
      const reason = !exact.length ? 'no-exact-stratum' : !temporal.length ? 'no-time-support' : !caliper.length ? 'no-caliper-support' : 'controls-exhausted';
      unmatched.push({id: v.id, reason, ...stages}); continue;
    }
    const q = available[0]; used.add(q.c.id);
    pairs.push({vectorId: v.id, controlId: q.c.id, cost: q.distance, separationBars: q.separation, candidateCounts: stages,
      vector: pairCoordinates(v), control: pairCoordinates(q.c)});
  }
  return {pairs, unmatched, ignoredMissingControlCovariates: controls.filter(r => !finiteCovariates(r)).length};
}
function pairCoordinates(r) {
  const start = r.decisionCloseTime, end = start + protocol.chronology.reservedFollowingBars * protocol.stepMs;
  const days = [];
  for (let d = Math.floor(start / 86400000) * 86400000; d < end; d += 86400000) days.push(new Date(d).toISOString().slice(0, 10));
  return {decisionIndex: r.decisionIndex, decisionCloseUtc: new Date(start).toISOString(), zoneOpenUtc: new Date(r.zoneOpenTime).toISOString(),
    block: r.block, side: r.side, decisionDayUtc: r.decisionDayUtc,
    reservedStartUtc: new Date(start).toISOString(), reservedEndExclusiveUtc: new Date(end).toISOString(), reservedUtcDays: days};
}
module.exports = {matchEpisodes, pairCoordinates, stratum};
