'use strict';
const {protocol, blockAt, ascii} = require('./features.cjs');
const variables = protocol.diagnostics.balanceVariables;
function value(r, key) {
  if (/^utcBucket[0-3]$/.test(key)) return Number.isInteger(r.utcSixHourBucket) ? +(r.utcSixHourBucket === +key.at(-1)) : null;
  if (/^block[0-2]$/.test(key)) return Number.isInteger(r.block) ? +(r.block === +key.at(-1)) : null;
  if (key === 'sideShort') return ['LONG', 'SHORT'].includes(r.side) ? +(r.side === 'SHORT') : null;
  if (key === 'priorEdgeTouch' || key === 'weekend') return typeof r[key] === 'boolean' ? +r[key] : null;
  return Number.isFinite(r[key]) ? r[key] : null;
}
function distribution(input) {
  const a = input.filter(Number.isFinite).sort((x, y) => x - y), n = a.length;
  const mean = n ? a.reduce((s, x) => s + x, 0) / n : null;
  const variance = n > 1 ? a.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1) : null;
  const q = p => { if (!n) return null; const i = (n - 1) * p, lo = Math.floor(i); return a[lo] + (a[Math.ceil(i)] - a[lo]) * (i - lo); };
  return {n, missing: input.length - n, min: n ? a[0] : null, q25: q(0.25), median: q(0.5), q75: q(0.75), max: n ? a[n - 1] : null, mean, sampleSd: variance === null ? null : Math.sqrt(variance)};
}
function smd(preV, preC, postV, postC) {
  const d = {preV: distribution(preV), preC: distribution(preC), postV: distribution(postV), postC: distribution(postC)};
  const denominator = d.preV.n >= 2 && d.preC.n >= 2 ? Math.sqrt((d.preV.sampleSd ** 2 + d.preC.sampleSd ** 2) / 2) : null;
  const calculate = (v, c, post) => {
    if (denominator === null) return {value: null, state: 'insufficient-pre-sample', flag: null};
    if (v.n < 1 || c.n < 1) return {value: null, state: post ? 'insufficient-post-sample' : 'insufficient-pre-sample', flag: null};
    const difference = v.mean - c.mean;
    if (denominator === 0) return {value: null, state: difference === 0 ? 'zero-variance-equal' : 'zero-variance-different', flag: difference === 0 ? false : true};
    const result = difference / denominator;
    return {value: result, state: 'finite', flag: Math.abs(result) >= 0.1};
  };
  return {preMatchPooledSd: denominator, pre: calculate(d.preV, d.preC, false), post: calculate(d.postV, d.postC, true), distributions: d};
}
function support(vectors, controls) {
  return Object.fromEntries(Object.keys(protocol.features.continuousCalipers).map(key => {
    const v = vectors.map(r => value(r, key)).filter(Number.isFinite), c = controls.map(r => value(r, key)).filter(Number.isFinite);
    const vr = distribution(v), cr = distribution(c), available = !!v.length && !!c.length;
    const lo = available ? Math.max(vr.min, cr.min) : null, hi = available ? Math.min(vr.max, cr.max) : null;
    return [key, {vectorRange: [vr.min, vr.max], controlRange: [cr.min, cr.max], overlap: available && lo <= hi ? [lo, hi] : null,
      vectorsOutsideControlRange: available ? v.filter(x => x < cr.min || x > cr.max).length : null,
      controlsOutsideVectorRange: available ? c.filter(x => x < vr.min || x > vr.max).length : null}];
  }));
}
function overlap(records) {
  const a = [...records].sort((x, y) => x.decisionIndex - y.decisionIndex), n = a.length, changes = Array(n + 1).fill(0);
  let left = 0, overlappingPairs = 0, maximumConcurrency = 0;
  for (let i = 0; i < n; i++) {
    while (a[i].decisionIndex - a[left].decisionIndex >= protocol.chronology.reservedFollowingBars) left++;
    overlappingPairs += i - left; maximumConcurrency = Math.max(maximumConcurrency, i - left + 1);
    if (left < i) { changes[left]++; changes[i + 1]--; }
  }
  let active = 0, episodesInvolved = 0;
  for (let i = 0; i < n; i++) { active += changes[i]; if (active > 0) episodesInvolved++; }
  return {episodes: n, overlappingPairs, episodesInvolved, maximumConcurrency, interpretation: 'Reserved coordinate-window overlap only; not independence'};
}
function tally(rows, key) {
  const result = {};
  for (const r of rows) { const k = String(key(r)); result[k] = (result[k] || 0) + 1; }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => ascii(a, b)));
}
function concentration(rows) {
  const days = tally(rows, r => r.decisionDayUtc), counts = Object.values(days), total = rows.length;
  return {days, distinctDays: counts.length, maximumDayShare: total ? Math.max(...counts) / total : null,
    dayHhi: total ? counts.reduce((s, n) => s + (n / total) ** 2, 0) : null,
    weekend: tally(rows, r => r.weekend), utcBuckets: tally(rows, r => r.utcSixHourBucket)};
}
function diagnostics(episodes, matching, sourceCensus, decisions) {
  const included = episodes.filter(r => !r.exclusions.length), index = new Map(included.map(r => [r.id, r]));
  const selectedV = matching.pairs.map(p => index.get(p.vectorId)), selectedC = matching.pairs.map(p => index.get(p.controlId));
  const unmatchedIds = new Set(matching.unmatched.map(r => r.id)), populations = {};
  const definitions = [['global', () => true], ...['LONG', 'SHORT'].map(s => ['side:' + s, r => r.side === s]),
    ...[0, 1, 2].map(b => ['block:' + b, r => r.block === b]),
    ...['LONG', 'SHORT'].flatMap(s => [0, 1, 2].map(b => [`${s}:block:${b}`, r => r.side === s && r.block === b]))];
  for (const [name, filter] of definitions) {
    const preV = included.filter(r => r.arm === 'V' && filter(r)), preC = included.filter(r => r.arm === 'C' && filter(r));
    const postV = selectedV.filter(filter), postC = selectedC.filter(filter), balance = {};
    for (const key of variables) balance[key] = smd(preV.map(r => value(r, key)), preC.map(r => value(r, key)), postV.map(r => value(r, key)), postC.map(r => value(r, key)));
    populations[name] = {preV: preV.length, preC: preC.length, pairs: postV.length, matchRate: preV.length ? postV.length / preV.length : null,
      postFlaggedVariables: Object.keys(balance).filter(k => balance[k].post.flag === true),
      postUnavailableVariables: Object.keys(balance).filter(k => balance[k].post.value === null), balance, support: support(preV, preC),
      unmatchedDistributions: Object.fromEntries(Object.keys(protocol.features.continuousCalipers).map(k => [k, distribution(preV.filter(r => unmatchedIds.has(r.id)).map(r => value(r, k)))]))};
  }
  const episodeRows = [];
  for (const arm of ['V', 'C']) for (const side of ['LONG', 'SHORT']) for (const block of [0, 1, 2, null]) {
    const a = episodes.filter(r => r.arm === arm && r.side === side && r.block === block); if (!a.length) continue;
    episodeRows.push({arm, side, block, firstEligible: a.length, included: a.filter(r => !r.exclusions.length).length,
      exclusions: tally(a.flatMap(r => r.exclusions.map(reason => ({reason}))), r => r.reason), doji: a.filter(r => r.source.doji).length});
  }
  const sourceRows = new Map(), firstIds = new Set(episodes.map(r => r.id));
  for (const z of sourceCensus) {
    const arm = z.cls === 2 ? 'V' : z.cls === 0 ? 'C' : 'excluded-cls1', side = z.up ? 'SHORT' : 'LONG', block = blockAt(z.index);
    const key = [arm, side, block].join('|');
    if (!sourceRows.has(key)) sourceRows.set(key, {arm, side, creationBlock: block < 0 ? 'pre-permitted' : block, sources: 0, doji: 0, unavailableReference: 0, zeroRange: 0, noFirstEpisode: 0});
    const a = sourceRows.get(key); a.sources++; a.doji += +z.doji; a.unavailableReference += +(z.referenceState !== 'ready'); a.zeroRange += +z.zeroRange;
    a.noFirstEpisode += +!firstIds.has(`${protocol.symbol}:${protocol.timeframe}:${z.t}:${side}`);
  }
  const arms = {};
  for (const arm of ['V', 'C']) {
    const pre = included.filter(r => r.arm === arm), post = arm === 'V' ? selectedV : selectedC;
    arms[arm] = {included: pre.length, matched: post.length, preOverlap: overlap(pre), postOverlap: overlap(post), preCalendar: concentration(pre), postCalendar: concentration(post),
      nearestRankPre: distribution(pre.map(r => r.withinArmNearestRank)), nearestRankPost: distribution(post.map(r => r.withinArmNearestRank))};
  }
  return {firstEligibleEpisodes: episodes.length, includedEpisodes: included.length, episodeRows, sourceRows: [...sourceRows.values()], decisions,
    pairs: matching.pairs.length, unmatchedVectors: matching.unmatched.length, matchRate: populations.global.matchRate,
    unmatchedReasons: tally(matching.unmatched, r => r.reason),
    unmatchedComposition: tally(included.filter(r => unmatchedIds.has(r.id)), r => [r.side, r.block, r.priorEdgeTouch, r.weekend, r.utcSixHourBucket].join('|')),
    candidateCounts: Object.fromEntries(['exact', 'temporal', 'caliper', 'unused'].map(k => [k, distribution([
      ...matching.pairs.map(p => p.candidateCounts[k]), ...matching.unmatched.map(p => p[k])])])),
    populations, arms,
    pairsAcrossDecisionDays: matching.pairs.filter(p => p.vector.decisionDayUtc !== p.control.decisionDayUtc).length,
    pairSeparationBars: distribution(matching.pairs.map(p => p.separationBars)),
    interpretation: 'Exploratory all-eligible-zone feasibility; different estimand from live nearest-zone policy. SMD and overlap diagnostics do not establish exchangeability or independence; no outcomes.'};
}
module.exports = {distribution, smd, support, overlap, tally, diagnostics};
