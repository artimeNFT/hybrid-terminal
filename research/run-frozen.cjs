#!/usr/bin/env node
'use strict';
const path = require('node:path'), {spawnSync} = require('node:child_process');
const commands = new Map([
  ['check', 'research/source-context/check.cjs'], ['audit', 'research/readiness-audit.cjs'],
  ['contract', 'research/calculation-contract.cjs'], ['prepare', 'research/prepare.cjs'],
  ['verify-preparation', 'tests/verify-preparation.cjs']
]);
const [command, ...args] = process.argv.slice(2), entry = commands.get(command);
if (!entry) { console.error('Usage: node research/run-frozen.cjs check|audit|contract|prepare|verify-preparation [original arguments]'); process.exitCode = 1; }
else {
  const root = path.resolve(__dirname, '..');
  const result = spawnSync(process.execPath, ['--require', path.join(__dirname, 'source-context/preload.cjs'), path.join(root, entry), ...args], {cwd: root, stdio: 'inherit'});
  if (result.error) console.error(result.error.message);
  process.exitCode = result.status ?? 1;
}
