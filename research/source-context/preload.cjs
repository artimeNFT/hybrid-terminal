'use strict';
// Explicit process-local logical source binding, never loaded by the active app or its browser QA.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const {fileURLToPath} = require('node:url');
const root = path.resolve(__dirname, '../..'), bindingFile = path.join(__dirname, 'html-0.4.3-v1.json');
const originalRead = fs.readFileSync.bind(fs), originalAsync = fs.readFile.bind(fs), promises = require('node:fs/promises');
const originalPromiseRead = promises.readFile.bind(promises), sha = b => crypto.createHash('sha256').update(b).digest('hex');
const binding = JSON.parse(originalRead(bindingFile, 'utf8'));
const expected = 'fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9';
assert.equal(binding.contextId, 'hybrid-html-0.4.3-context-v1'); assert.equal(binding.bindingVersion, 1);
assert.equal(binding.logicalSource, 'hybrid-terminal.html'); assert.equal(binding.physicalSource, 'baseline/hybrid-terminal.0.4.3.html'); assert.equal(binding.sha256, expected);
const logical = path.join(root, binding.logicalSource), physical = path.join(root, binding.physicalSource);
function verifyFrozenCandidate(file) { assert.equal(sha(originalRead(file)), expected, 'Frozen 0.4.3 bytes differ; refusing source binding'); }
verifyFrozenCandidate(physical);
const identity = Object.freeze({...binding, bindingSha256: sha(originalRead(bindingFile)),
  loaderSha256: sha(originalRead(__filename)), nodeVersion: process.version,
  activeApplicationSha256: sha(originalRead(logical)), physicalSourceSha256: sha(originalRead(physical))});
function boundPath(file) {
  const name = file instanceof URL ? fileURLToPath(file) : Buffer.isBuffer(file) ? file.toString() : file;
  return typeof name === 'string' && path.resolve(name) === logical ? physical : file;
}
fs.readFileSync = (file, ...args) => originalRead(boundPath(file), ...args);
fs.readFile = (file, ...args) => originalAsync(boundPath(file), ...args);
promises.readFile = (file, ...args) => originalPromiseRead(boundPath(file), ...args);
process.stderr.write('[frozen research] ' + binding.contextId + ': ' + binding.logicalSource + ' -> ' + binding.physicalSource + ' (' + expected + ')\n');
module.exports = {identity, verifyFrozenCandidate};
