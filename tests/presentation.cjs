'use strict';
const {test} = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const {openApp} = require('./app-harness.cjs');
const {randomBars, replacementFixture, reflect} = require('./regression.cjs');
const oldFile = path.resolve(__dirname, '../baseline/hybrid-terminal.0.4.3.html');
const root = path.resolve(__dirname, '..'), expected = 'fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');

test('frozen reference is exact, explicit context verifies old sources, and unbound research rejects the active UI', () => {
  assert.equal(sha(fs.readFileSync(oldFile)), expected);
  const activeExpected = require('../qa/source-checksums.0.4.19.json')['hybrid-terminal.html'];
  assert.equal(sha(fs.readFileSync(path.join(root, 'hybrid-terminal.html'))), activeExpected);
  assert.notEqual(activeExpected, expected);
  const outside = spawnSync(process.execPath, ['-e', "require('./research/audit/adapter.cjs').createAdapter()"], {cwd: root, encoding: 'utf8'});
  assert.notEqual(outside.status, 0); assert.match(outside.stderr, /Reviewed application source changed/);
  const check = spawnSync(process.execPath, ['research/run-frozen.cjs', 'check'], {cwd: root, encoding: 'utf8'});
  assert.equal(check.status, 0, check.stderr); const report = JSON.parse(check.stdout);
  assert.equal(report.historicalManifestVerified, true); assert.equal(report.context.physicalSourceSha256, expected);
  assert.equal(report.context.activeApplicationSha256, activeExpected);
  const readers = spawnSync(process.execPath, ['--require', './research/source-context/preload.cjs', '-e',
    "const fs=require('node:fs'),p=require('node:fs/promises'),h=b=>require('node:crypto').createHash('sha256').update(b).digest('hex');(async()=>{const a=fs.readFileSync('hybrid-terminal.html');const b=await p.readFile('hybrid-terminal.html');const c=await new Promise((resolve,reject)=>fs.readFile('hybrid-terminal.html',(e,b)=>e?reject(e):resolve(b)));console.log(JSON.stringify([a,b,c].map(h)))})()"], {cwd: root, encoding: 'utf8'});
  assert.equal(readers.status, 0, readers.stderr); assert.deepEqual(JSON.parse(readers.stdout), [expected, expected, expected]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hybrid-binding-'));
  try {
    const bad = path.join(dir, 'bad.html'); fs.writeFileSync(bad, fs.readFileSync(oldFile) + '\n');
    const reject = spawnSync(process.execPath, ['-e', "require('./research/source-context/preload.cjs').verifyFrozenCandidate(process.argv[1])", bad], {cwd: root, encoding: 'utf8'});
    assert.notEqual(reject.status, 0); assert.match(reject.stderr, /Frozen 0.4.3 bytes differ/);
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});

test('preserved calculation/journal functions remain exact to frozen 0.4.3 with scoped presentation/daily-source hooks', async () => {
  const current = await openApp(), old = await openApp({file: oldFile});
  const names = [...fs.readFileSync(oldFile, 'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m => m[1]);
  const changedRendering = new Set([...require('./chart-usability-fixtures.cjs').changedView,'updateSystemUI', 'sizingHTML', 'candidateHTML', 'panel', 'draw', 'dailyLabelLayout', 'loadDisplayPrefs', 'saveDisplayPrefs', 'bindSystem','refreshPivots','dailyContextHTML','updateLegend','chartGeometry','bindChart','endChartDrag']);
  for (const name of names.filter(n => !changedRendering.has(n))) assert.equal(current.read(name + '.toString()'), old.read(name + '.toString()'), name);
  for (const name of ['RULE_VERSION', 'EXECUTION_VERSION', 'RSI_POLICY']) assert.equal(current.read(name), old.read(name));
  assert.equal(current.read('APP_VERSION'), '0.4.19');
});

test('synthetic calculation/decision/backtest behavior matches 0.4.3 across thresholds and degenerate inputs', async () => {
  const flat = Array.from({length: 100}, (_, i) => ({t: i * 300000, o: 100, h: 100, l: 100, c: 100, v: 0}));
  for (const bars of [replacementFixture(), reflect(replacementFixture()), randomBars(31, 300), randomBars(9, 300), flat]) {
    const active = await openApp({bars}), old = await openApp({bars, file: oldFile});
    for (const threshold of [3, 4, 5]) {
      for (const app of [active, old]) app.exec(`S.min=${threshold};calc()`);
      for (const value of ['S.k.map(b=>b.cls)', 'S.e', 'S.atr', 'S.rsi', 'S.rsiState', 'S.vw', 'S.dop', 'S.mw', 'S.sv', 'S.sig', 'S.bt']) assert.deepEqual(active.read(value), old.read(value), value);
    }
  }
});

test('presentation risk uses confirmed coordinates, independent ATR availability and guarded arithmetic', async () => {
  const app = await openApp();
  assert.deepEqual(app.exec('plannedRiskDisplay({entry:100,stop:99,tp1:102,tp2:103},100,2)'), app.exec('({stopAtr:.5,tp1Atr:1,tp2Atr:1.5,costR:.1})'));
  assert.deepEqual(app.read('plannedRiskDisplay({entry:100,stop:102,tp1:98,tp2:96},100,2)'), {stopAtr: 1, tp1Atr: 1, tp2Atr: 2, costR: 0.05});
  for (const expr of ['null,100,1', '{entry:100,stop:100},100,1', '{entry:100,stop:99},101,1', '{entry:100,stop:0},100,1', '{entry:100,stop:99},0,1', '{entry:100,stop:Infinity},100,1']) assert.deepEqual(app.read('plannedRiskDisplay(' + expr + ')'), {stopAtr: null, tp1Atr: null, tp2Atr: null, costR: null});
  for (const atr of ['0', 'null', 'NaN', 'Infinity']) assert.deepEqual(app.read(`plannedRiskDisplay({entry:100,stop:99,tp1:102,tp2:103},100,${atr})`), {stopAtr: null, tp1Atr: null, tp2Atr: null, costR: 0.1});
  assert.deepEqual(app.read('plannedRiskDisplay({entry:100,stop:99,tp1:100,tp2:Infinity},100,1)'), {stopAtr: 1, tp1Atr: null, tp2Atr: null, costR: 0.1});
});

test('upgrade preserves old journal bytes/identities and display/sizing preferences', async () => {
  const old = await openApp({file: oldFile}), storage = old.localStorage;
  const bytes = storage['hybridTerminal.journal.v1'];
  storage['hybridTerminal.view.v2'] = JSON.stringify({schemaVersion: 2, palette: 'pvsra', body: 'hollow', pane: 'rsi', zone: 'UTC', dayLevels: false, pivots: false, other: 19});
  const active = await openApp({localStorage: storage});
  assert.equal(storage['hybridTerminal.journal.v1'], bytes);
  assert.deepEqual(active.read('[S.palette,S.body,S.pane,S.zone]'), ['pvsra', 'hollow', 'rsi', 'UTC']);
  active.element('body').onchange({target: {value: 'filled'}}); active.element('displaybtn').onclick(); await active.flush();
  assert.equal(storage['hybridTerminal.journal.v1'], bytes); assert.equal(JSON.parse(storage['hybridTerminal.view.v2']).other, 19);
  assert.equal(active.read('S.journal.records[0].applicationVersion'), '0.4.3');
});
