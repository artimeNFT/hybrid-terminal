'use strict';
const {parentPort, workerData} = require('node:worker_threads');
const {performance} = require('node:perf_hooks');
const assert = require('node:assert/strict');
const {createCalculations} = require('./calculations.cjs');
const {eligibleRecords, blockAt, protocol} = require('./features.cjs');
function collect({bars, start, end, stride = 1}, progress = () => {}) {
  assert.ok(start >= protocol.calculation.firstDecisionIndex && end <= bars.length && end > start);
  const calc = createCalculations(bars), seen = new Set(), episodes = [], decisions = new Map();
  const begin = performance.now(); let done = 0, rssBytesObservedMax = 0, heapBytesObservedMax = 0, census = [];
  for (let i = start; i < end; i += stride) {
    const frame = calc.at(i), {records, invalidReasons} = eligibleRecords(frame), block = blockAt(i);
    if (!decisions.has(block)) decisions.set(block, {block, examined: 0, valid: 0, invalid: 0, reasons: {}});
    const d = decisions.get(block); d.examined++;
    if (invalidReasons.length) { d.invalid++; for (const reason of invalidReasons) d.reasons[reason] = (d.reasons[reason] || 0) + 1; }
    else d.valid++;
    for (const r of records) if (!seen.has(r.id)) { seen.add(r.id); episodes.push(r); }
    done++;
    if (i === bars.length - 1) census = calc.sourceCensus();
    if (done % 100 === 0 || i + stride >= end) {
      const memory = process.memoryUsage();
      rssBytesObservedMax = Math.max(rssBytesObservedMax, memory.rss); heapBytesObservedMax = Math.max(heapBytesObservedMax, memory.heapUsed);
      progress({done, decisionIndex: i, wallSeconds: (performance.now() - begin) / 1000, rssBytes: memory.rss});
    }
  }
  assert.deepEqual(calc.deniedCalls(), []);
  return {episodes, sourceCensus: census, decisions: [...decisions.values()], calculationIdentity: calc.identity,
    runtime: {wallSeconds: (performance.now() - begin) / 1000, decisions: done, rssBytesObservedMax, heapBytesObservedMax,
      memoryScope: 'RSS is process-wide across worker threads; heap is this worker; sampled every 100 decisions'}};
}
if (parentPort) {
  try { parentPort.postMessage({type: 'complete', result: collect(workerData, value => parentPort.postMessage({type: 'progress', value}))}); }
  catch (error) { throw error; }
}
module.exports = {collect};
