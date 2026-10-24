'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const protocol = require('./protocol.json');
const {assessSnapshot, contract} = require('../calculation-contract.cjs');
const ascii = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const order = (a, b) => a.decisionIndex - b.decisionIndex || a.zoneOpenTime - b.zoneOpenTime || ascii(a.id, b.id);
const blockAt = (index, blocks = protocol.chronology.blocksDecisionIndexHalfOpen) => blocks.findIndex(([a, b]) => index >= a && index < b);
function canonical(value) {
  function visit(v) {
    if (typeof v === 'number') { assert.ok(Number.isFinite(v), 'Canonical numbers must be finite'); return v; }
    if (v === null || typeof v === 'string' || typeof v === 'boolean') return v;
    if (Array.isArray(v)) return v.map(visit);
    assert.ok(v && typeof v === 'object', 'Unsupported canonical value');
    return Object.fromEntries(Object.keys(v).sort(ascii).map(k => [k, visit(v[k])]));
  }
  return JSON.stringify(visit(value));
}
const hash = value => crypto.createHash('sha256').update(canonical(value)).digest('hex');
function sourceArm(source) {
  if (source.reference.state !== 'ready' || source.h <= source.l) return null;
  return source.cls === 2 ? 'V' : source.cls === 0 ? 'C' : null;
}
function eligibility(source, decision, path, atr) {
  const arm = sourceArm(source), age = decision.index - source.index;
  if (!arm || age < 1 || age > 300 || !Number.isFinite(atr) || atr <= 0) return null;
  const up = source.c >= source.o, side = up ? 'SHORT' : 'LONG';
  const near = up ? source.h : source.l, midpoint = (source.h + source.l) / 2;
  const distance = up ? decision.c - near : near - decision.c;
  if (!(distance > 0) || distance > 6 * atr) return null;
  let priorEdgeTouch = false, firstEdgeTouchTime = null;
  for (const b of path) {
    if (b.index <= source.index || b.index > decision.index) continue;
    if (up ? b.l <= midpoint : b.h >= midpoint) return null;
    if (up ? b.l <= near : b.h >= near) {
      priorEdgeTouch = true; if (firstEdgeTouchTime === null) firstEdgeTouchTime = b.t;
    }
  }
  return {arm, side, age, midpoint, near, distance, priorEdgeTouch, firstEdgeTouchTime};
}
function atrPercentile(current, preceding) {
  if (!Number.isFinite(current) || preceding.length !== 288 || !preceding.every(Number.isFinite)) return null;
  return preceding.reduce((sum, x) => sum + (x < current ? 1 : x === current ? 0.5 : 0), 0) / 288;
}
function calendar(closeTime) {
  const d = new Date(closeTime), weekday = d.getUTCDay();
  return {decisionDayUtc: d.toISOString().slice(0, 10), weekend: weekday === 0 || weekday === 6,
    utcSixHourBucket: Math.floor(d.getUTCHours() / 6)};
}
function eligibleRecords(frame) {
  const prep = assessSnapshot(frame, {stateMode: contract.state.mode});
  if (prep.calculationState !== 'ready') return {records: [], invalidReasons: prep.exclusions};
  const A = frame.metrics.atr14.value, percentile = atrPercentile(A, frame.priorAtr);
  if (percentile === null) return {records: [], invalidReasons: ['ATR-percentile-unavailable']};
  const current = frame.recent.at(-1), stopWindow = frame.recent.slice(-20);
  assert.equal(current.index, frame.index); assert.equal(stopWindow.length, 20);
  const lowest = Math.min(...stopWindow.map(b => b.l)), highest = Math.max(...stopWindow.map(b => b.h));
  const records = [];
  for (const z of frame.recent) {
    const e = eligibility(z, current, frame.recent, A); if (!e) continue;
    const stop = e.side === 'LONG' ? Math.min(lowest - 0.3 * A, current.c - A) : Math.max(highest + 0.3 * A, current.c + A);
    const risk = Math.abs(stop - current.c), midDistance = Math.abs(e.midpoint - current.c);
    assert.ok(risk > 0 && Number.isFinite(risk));
    records.push({id: `${protocol.symbol}:${protocol.timeframe}:${z.t}:${e.side}`, arm: e.arm, side: e.side,
      zoneOpenTime: z.t, decisionIndex: frame.index, decisionCloseTime: frame.closeTime,
      ...calendar(frame.closeTime), ageBars: e.age, logAge: Math.log(e.age),
      priorEdgeTouch: e.priorEdgeTouch, firstEdgeTouchTime: e.firstEdgeTouchTime,
      midpointDistanceAtr: midDistance / A, stopDistanceAtr: risk / A, zoneWidthAtr: (z.h - z.l) / A,
      nearEdgeDistanceAtr: e.distance / A, atrPercentile: percentile, plannedRr: midDistance / risk,
      plan: {decisionClose: current.c, atr14: A, stop, tp1: e.near, tp2: e.midpoint},
      source: {open: z.o, high: z.h, low: z.l, close: z.c, volume: z.v, classification: z.cls,
        up: z.c >= z.o, doji: z.c === z.o, reference: {...z.reference}}});
  }
  for (const arm of ['V', 'C']) for (const side of ['LONG', 'SHORT']) {
    records.filter(r => r.arm === arm && r.side === side).sort((a, b) =>
      a.nearEdgeDistanceAtr - b.nearEdgeDistanceAtr || a.zoneOpenTime - b.zoneOpenTime || ascii(a.id, b.id))
      .forEach((r, i) => { r.withinArmNearestRank = i + 1; });
  }
  return {records: records.sort(order), invalidReasons: []};
}
function firstEpisodes(records) {
  const seen = new Set();
  return [...records].sort(order).filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
}
function applyChronology(records, blocks = protocol.chronology.blocksDecisionIndexHalfOpen) {
  // First eligibility always precedes exclusions, including when merging worker shards.
  return firstEpisodes(records).map(r => {
    const block = blockAt(r.decisionIndex, blocks), exclusions = [];
    if (block < 0) exclusions.push('outside-chronology');
    else if (r.decisionIndex + protocol.chronology.reservedFollowingBars >= blocks[block][1]) exclusions.push('reserved-tail');
    return {...r, block: block < 0 ? null : block, exclusions};
  });
}
module.exports = {protocol, canonical, hash, ascii, order, blockAt, sourceArm, eligibility, atrPercentile, calendar, eligibleRecords, firstEpisodes, applyChronology};
