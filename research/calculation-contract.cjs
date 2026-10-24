#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {causalDifference} = require('./readiness-audit.cjs');
const contract = require('./contract/v1.json');
const root = path.resolve(__dirname, '..');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const origin = Date.parse(contract.data.originInclusive);
const end = Date.parse(contract.data.endExclusive);
const step = contract.data.stepMs;

// These checks consume trusted snapshots from the existing pinned adapter.
// They neither authenticate caller-supplied snapshots nor calculate indicators.
function checkSources() {
  assert.equal(Number(process.versions.node.split('.')[0]), contract.identities.nodeMajor);
  for (const [file, expected] of Object.entries(contract.sourceChecksums)) {
    const absolute = path.resolve(root, file);
    assert.ok(absolute.startsWith(root + path.sep));
    assert.equal(digest(fs.readFileSync(absolute)), expected, 'Contract source differs: ' + file);
  }
  assert.equal((end - origin) / step, contract.data.expectedRows);
  assert.equal(contract.preparation.excludedInitialBars + 1, contract.preparation.minimumPastBarsIncludingDecision);
  assert.equal(origin + contract.preparation.minimumPastBarsIncludingDecision * step,
    Date.parse(contract.preparation.firstPermittedDecisionClose));
  assert.ok(contract.data.expectedRows <= contract.state.maximumInputBars);
  return {
    contractVersion: contract.version,
    contractSha256: digest(fs.readFileSync(path.join(__dirname, 'contract/v1.json'))),
    status: contract.status,
    sourceChecksums: contract.sourceChecksums,
    canonicalDataHash: contract.data.canonicalHash,
    firstPermittedDecisionClose: contract.preparation.firstPermittedDecisionClose,
    acquiredDataRead: false,
    applicationBootstrapExecuted: false
  };
}

function assessSnapshot(snapshot, {stateMode} = {}) {
  assert.ok(snapshot && snapshot.metrics && snapshot.decision && snapshot.volume, 'Adapter snapshot required');
  const exclusions = [];
  if (snapshot.historyStart !== origin) exclusions.push('wrong-origin');
  const coordinates = [snapshot.openTime, snapshot.closeTime, snapshot.historyStart, snapshot.pastBars];
  if (!coordinates.every(Number.isSafeInteger) || snapshot.pastBars < 1 ||
      snapshot.openTime % step !== 0 || snapshot.closeTime !== snapshot.openTime + step ||
      snapshot.closeTime !== snapshot.historyStart + snapshot.pastBars * step) exclusions.push('coordinate-mismatch');
  if (snapshot.openTime < origin || snapshot.closeTime > end) exclusions.push('outside-frozen-range');
  if (snapshot.pastBars < contract.preparation.minimumPastBarsIncludingDecision) exclusions.push('initial-preparation');
  if (stateMode === undefined) exclusions.push('state-policy-not-declared');
  else if (stateMode !== contract.state.mode) exclusions.push('unsupported-state-policy');
  const {ema50, atr14, rsi14} = snapshot.metrics;
  if (!snapshot.decision.validity?.ready || snapshot.decision.validity.reasons?.length !== 0 ||
      !Number.isFinite(ema50?.value) || ema50.state !== 'available' ||
      !Number.isFinite(atr14?.value) || atr14.value <= 0 || atr14.state !== 'available' ||
      !Number.isFinite(rsi14?.value) || rsi14.state !== 'ready' || rsi14.value < 0 || rsi14.value > 100 ||
      snapshot.volume.state !== 'ready') exclusions.push('invalid-score-inputs');
  if (snapshot.dayCoverage !== 'from-UTC-open') exclusions.push('partial-UTC-day');
  return {
    contractVersion: contract.version,
    calculationState: exclusions.length ? 'excluded' : 'ready',
    exclusions,
    // Preserve a valid WAIT; calculation readiness never chooses a trade side.
    applicationSide: snapshot.decision.side,
    contextAvailability: Object.fromEntries(Object.entries(contract.features)
      .filter(([, f]) => f.role === 'context').map(([key]) => [key, snapshot.metrics[key]?.state ?? 'unavailable']))
  };
}

function checkReplay(reference, replay) {
  if (reference.historyStart !== replay.historyStart || reference.closeTime !== replay.closeTime ||
      reference.openTime !== replay.openTime || reference.pastBars !== replay.pastBars) {
    return {accepted: false, reason: 'different-origin-or-decision', changedFields: []};
  }
  // Reuse the audit's exact projection comparison; its numeric report tolerances do not apply.
  const changedFields = causalDifference(reference, replay);
  return {accepted: changedFields.length === 0, reason: changedFields.length ? 'replay-budget-exceeded' : 'exact-replay', changedFields};
}

if (require.main === module) {
  try {
    assert.equal(process.argv.length, 2, 'Usage: node research/calculation-contract.cjs');
    console.log(JSON.stringify(checkSources(), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = {contract, checkSources, assessSnapshot, checkReplay};
