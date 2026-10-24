#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {Worker} = require('node:worker_threads');
const {performance} = require('node:perf_hooks');
const {checkSources} = require('./calculation-contract.cjs');
const {loadVerifiedDataset} = require('./readiness-audit.cjs');
const {createCalculations} = require('./preparation/calculations.cjs');
const {protocol, canonical, hash, applyChronology} = require('./preparation/features.cjs');
const {matchEpisodes} = require('./preparation/matching.cjs');
const {diagnostics} = require('./preparation/diagnostics.cjs');
const root = path.resolve(__dirname, '..');
const files = ['research/prepare.cjs', ...['protocol.json', 'calculations.cjs', 'features.cjs', 'matching.cjs', 'diagnostics.cjs', 'worker.cjs'].map(f => 'research/preparation/' + f)];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const writeNew = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
function identities() {
  const contract = checkSources();
  assert.equal(contract.contractSha256, protocol.contractSha256);
  assert.equal(protocol.dataHash, contract.canonicalDataHash);
  return {preparationVersion: protocol.version, protocolHash: sha(fs.readFileSync(path.join(__dirname, 'preparation/protocol.json'))),
    contractHash: contract.contractSha256, dataHash: protocol.dataHash, pinnedSourceChecksums: contract.sourceChecksums,
    preparationSourceChecksums: Object.fromEntries(files.map(f => [f, sha(fs.readFileSync(path.join(root, f)))]))};
}
function seal(out) {
  fs.mkdirSync(out, {recursive: true});
  const value = {identities: identities(), writtenAt: new Date().toISOString(), purpose: 'Sealed before real cohort summaries; not outcome/inference approval'};
  writeNew(path.join(out, 'seal.json'), value); return value;
}
function checkedSeal(out) {
  const sealed = JSON.parse(fs.readFileSync(path.join(out, 'seal.json'), 'utf8'));
  assert.equal(canonical(sealed.identities), canonical(identities()), 'Sealed protocol/source changed; do not silently continue');
  return sealed.identities;
}
function benchmark(dataset, out) {
  const identity = checkedSeal(out), {bars, identity: data} = loadVerifiedDataset(dataset);
  const {createAdapter} = require('./audit/adapter.cjs');
  const calc = createCalculations(bars), uncached = createCalculations(bars, {memoizeVolumeReference: false}), reference = createAdapter(), samples = [];
  for (const index of protocol.resources.benchmarkDecisionIndices) {
    const seconds = []; let frame;
    for (let j = 0; j < protocol.resources.benchmarkRepeats; j++) { const t = performance.now(); frame = calc.at(index); seconds.push((performance.now() - t) / 1000); }
    const uncachedFrame = uncached.at(index);
    assert.equal(canonical(frame), canonical(uncachedFrame), 'Pure reference memo changed complete frame');
    const t = performance.now(); reference.load(bars.slice(0, index + 1)); const old = reference.snapshot(bars[index].t);
    for (const key of ['metrics', 'decision', 'volume', 'dayCoverage']) assert.equal(canonical(frame[key]), canonical(old[key]), 'Reviewed adapter parity: ' + key);
    const sample = {decisionIndex: index, seconds, reviewedAdapterSeconds: (performance.now() - t) / 1000, exactParity: true};
    samples.push(sample); console.log(JSON.stringify({benchmark: sample}));
  }
  const estimate = Math.max(...samples.flatMap(s => s.seconds)) * (bars.length - protocol.calculation.firstDecisionIndex) / protocol.resources.workers * 2;
  const result = {identity, dataIdentity: data, samples, conservativeEstimatedSeconds: estimate,
    admitted: estimate <= protocol.resources.maximumWallSeconds, rssBytes: process.memoryUsage().rss,
    state: estimate <= protocol.resources.maximumWallSeconds ? 'benchmark-admitted' : 'resource-refused', calculationIdentity: calc.identity};
  assert.deepEqual(calc.deniedCalls(), []); assert.deepEqual(uncached.deniedCalls(), []); assert.deepEqual(reference.deniedCalls(), []);
  writeNew(path.join(out, 'benchmark.json'), result); return result;
}
function mergeDecisions(parts) {
  const map = new Map();
  for (const part of parts) for (const d of part.decisions) {
    if (!map.has(d.block)) map.set(d.block, {block: d.block, examined: 0, valid: 0, invalid: 0, reasons: {}});
    const a = map.get(d.block); for (const key of ['examined', 'valid', 'invalid']) a[key] += d[key];
    for (const [key, count] of Object.entries(d.reasons)) a.reasons[key] = (a.reasons[key] || 0) + count;
  }
  return [...map.values()].sort((a, b) => a.block - b.block);
}
async function run(dataset, out) {
  const identity = checkedSeal(out), admission = JSON.parse(fs.readFileSync(path.join(out, 'benchmark.json'), 'utf8'));
  assert.equal(canonical(admission.identity), canonical(identity)); assert.equal(admission.admitted, true, 'Reference resource bound not admitted');
  const {bars, identity: data} = loadVerifiedDataset(dataset);
  assert.equal(bars.length, protocol.expectedBars);
  const stateFile = path.join(out, 'runtime.json'), begin = performance.now();
  writeNew(stateFile, {state: 'in-progress', startedAt: new Date().toISOString(), identity});
  const workers = []; let deadline;
  try {
    const work = Array.from({length: protocol.resources.workers}, (_, workerId) => new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, 'preparation/worker.cjs'), {
        workerData: {bars, start: protocol.calculation.firstDecisionIndex + workerId, end: bars.length, stride: protocol.resources.workers},
        resourceLimits: {maxOldGenerationSizeMb: protocol.resources.workerHeapMb}});
      workers.push(worker); let received = false;
      worker.on('message', message => {
        if (message.type === 'progress') {
          const event = {workerId, ...message.value};
          fs.appendFileSync(path.join(out, 'progress.jsonl'), JSON.stringify(event) + '\n');
          if (event.done % 500 === 0) console.log(JSON.stringify({progress: event}));
        } else if (message.type === 'complete') { received = true; resolve(message.result); }
      });
      worker.on('error', reject); worker.on('exit', code => { if (code !== 0 || !received) reject(Error('Worker incomplete: ' + code)); });
    }));
    const timeout = new Promise((_, reject) => { deadline = setTimeout(() => reject(Error('Declared wall-time resource limit exceeded')), protocol.resources.maximumWallSeconds * 1000); });
    const parts = await Promise.race([Promise.all(work), timeout]); clearTimeout(deadline);
    const decisions = mergeDecisions(parts);
    assert.equal(decisions.reduce((s, d) => s + d.examined, 0), bars.length - protocol.calculation.firstDecisionIndex, 'Incomplete decision coverage');
    const sourceCensus = parts.flatMap(p => p.sourceCensus);
    assert.equal(sourceCensus.length, bars.length, 'Incomplete source census');
    const episodes = applyChronology(parts.flatMap(p => p.episodes));
    const features = {kind: 'hybrid-preparation-features', identity, episodes, decisions, sourceCensus};
    const matching = matchEpisodes(episodes), featureHash = hash(features);
    const pairPayload = {kind: 'hybrid-preparation-pairs', identity, featureHash, ...matching};
    const summary = diagnostics(episodes, matching, sourceCensus, decisions);
    const runtime = {state: 'complete', wallSeconds: (performance.now() - begin) / 1000,
      workers: parts.map(p => p.runtime), rssBytesObservedMax: Math.max(process.memoryUsage().rss, ...parts.map(p => p.runtime.rssBytesObservedMax)),
      benchmarkConservativeEstimatedSeconds: admission.conservativeEstimatedSeconds,
      dataIdentity: data, calculationIdentity: parts[0].calculationIdentity, completedAt: new Date().toISOString()};
    const result = {state: 'complete', identity, featureHash, pairHash: hash(pairPayload), firstEligibleEpisodes: episodes.length,
      includedEpisodes: summary.includedEpisodes, pairs: summary.pairs, matchRate: summary.matchRate, runtime};
    // Publish after complete coverage; result and runtime must both say complete before a run is usable.
    for (const [name, value] of [['features', features], ['pairs', pairPayload]]) fs.writeFileSync(path.join(out, name + '.json'), canonical(value), {flag: 'wx'});
    writeNew(path.join(out, 'summary.json'), summary); writeNew(path.join(out, 'result.json'), result);
    fs.writeFileSync(stateFile, JSON.stringify(runtime, null, 2) + '\n');
    return result;
  } catch (error) {
    fs.writeFileSync(stateFile, JSON.stringify({state: 'failed-not-complete', wallSeconds: (performance.now() - begin) / 1000, error: error.message, identity}, null, 2) + '\n');
    throw error;
  } finally { clearTimeout(deadline); await Promise.all(workers.map(w => w.terminate())); }
}
function verify(out) {
  const result = JSON.parse(fs.readFileSync(path.join(out, 'result.json'), 'utf8')); assert.equal(result.state, 'complete');
  assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'runtime.json'), 'utf8')).state, 'complete', 'Incomplete resource/publication state');
  const payloads = [];
  for (const [file, key] of [['features.json', 'featureHash'], ['pairs.json', 'pairHash']]) {
    const bytes = fs.readFileSync(path.join(out, file), 'utf8'), payload = JSON.parse(bytes);
    assert.equal(bytes, canonical(payload)); assert.equal(sha(bytes), result[key]); payloads.push(payload);
  }
  assert.equal(payloads[1].featureHash, result.featureHash);
  assert.equal(canonical(payloads[0].identity), canonical(result.identity)); assert.equal(canonical(payloads[1].identity), canonical(result.identity));
  return {state: 'canonical-payloads-verified', featureHash: result.featureHash, pairHash: result.pairHash};
}
async function main() {
  const [command, ...args] = process.argv.slice(2), options = new Map();
  assert.ok(['seal', 'benchmark', 'run', 'verify'].includes(command), 'Usage: prepare.cjs seal|benchmark|run|verify --out .qa-results/<fresh-run> [--dataset <frozen-file>]');
  for (let i = 0; i < args.length; i += 2) {
    assert.ok(['--dataset', '--out'].includes(args[i]) && args[i + 1] && !options.has(args[i]), 'Invalid or duplicate option'); options.set(args[i], args[i + 1]);
  }
  assert.ok(options.has('--out')); const out = path.resolve(options.get('--out'));
  assert.ok(out.startsWith(path.join(root, '.qa-results') + path.sep), 'Bulky preparation output must stay under ignored .qa-results');
  if (command === 'seal') return seal(out);
  if (command === 'verify') return verify(out);
  assert.ok(options.has('--dataset')); const dataset = path.resolve(options.get('--dataset'));
  return command === 'benchmark' ? benchmark(dataset, out) : run(dataset, out);
}
if (require.main === module) main().then(r => console.log(JSON.stringify(r, null, 2))).catch(error => { console.error(error.stack); process.exitCode = 1; });
module.exports = {identities, seal, checkedSeal, benchmark, run, verify, mergeDecisions};
