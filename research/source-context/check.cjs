'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const {identity} = require('./preload.cjs');
const root = path.resolve(__dirname, '../..');
// This manifest remains historical, unchanged. The active app has a separate new manifest.
const checks = JSON.parse(fs.readFileSync(path.join(root, 'qa/source-checksums.json'), 'utf8'));
for (const [file, expected] of Object.entries(checks)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'), expected, file);
const contract = require('../calculation-contract.cjs').checkSources();
const options = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  assert.ok(['--preparation-output', '--audit-output'].includes(process.argv[i]) && process.argv[i + 1] && !options.has(process.argv[i]), 'Unsupported verification option');
  options.set(process.argv[i], process.argv[i + 1]);
}
const existing = {};
if (options.has('--preparation-output')) {
  const preparation = require('../prepare.cjs'), out = path.resolve(options.get('--preparation-output'));
  preparation.checkedSeal(out); existing.preparation = preparation.verify(out);
}
if (options.has('--audit-output')) {
  const bytes = fs.readFileSync(path.resolve(options.get('--audit-output'))), audit = JSON.parse(bytes);
  const receipt = JSON.parse(fs.readFileSync(path.join(root, 'tests/results/calculation-readiness-v1/delivery.json'), 'utf8'));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), receipt.fullLocalEvidence.sha256);
  assert.deepEqual(audit.source, require('../audit/adapter.cjs').createAdapter().identity);
  for (const [key, file] of [['audit', 'research/readiness-audit.cjs'], ['adapter', 'research/audit/adapter.cjs']])
    assert.equal(audit.auditFilesSha256[key], crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'));
  assert.equal(audit.protocolSha256, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'research/audit/protocol.json'))).digest('hex'));
  assert.equal(audit.data.canonicalDataHash, contract.canonicalDataHash);
  existing.audit = {originalBytesAndSourceIdentityVerified: true, canonicalDataHash: audit.data.canonicalDataHash};
}
console.log(JSON.stringify({context: identity, historicalManifestVerified: true, contract, existing, scope: 'Read-only source/seal/existing-payload verification; no dataset calculation or cohort generation'}, null, 2));
