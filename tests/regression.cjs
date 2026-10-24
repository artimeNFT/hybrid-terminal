'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const fixedPath = path.join(root, 'hybrid-terminal.html');
const baselinePath = path.join(root, 'baseline/hybrid-terminal.original.html');
function engine(file) {
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'Application script exists');
  new vm.Script(match[1], { filename: file });
  assert.match(match[1], /load\(\);\s*$/);
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, {
        value: '', setAttribute() {}, getContext: () => ({}), classList: { toggle() {} }
      });
      return elements.get(id);
    },
    querySelectorAll: () => [], addEventListener() {}, title: ''
  };
  const context = vm.createContext({
    document, localStorage: {}, window: {},
    addEventListener() {}, setInterval() {}, requestAnimationFrame() {},
    fetch() { throw Error('Network is forbidden in regression tests'); }
  });
  // Run the actual application, suppressing only automatic network startup.
  vm.runInContext(match[1].replace(/load\(\);\s*$/, ''), context);
  const run = new vm.Script('S.k=__input;S.min=__threshold;S.bt=null;calc();');
  const signal = new vm.Script('JSON.stringify(sigAt(__index))');
  const patterns = new vm.Script('JSON.stringify(S.mw)');
  return {
    load(bars, threshold = 3) {
      context.__input = bars.map(bar => ({ ...bar, closed: bar.closed !== false }));
      context.__threshold = threshold;
      run.runInContext(context);
    },
    signal(index) {
      context.__index = index;
      return JSON.parse(signal.runInContext(context));
    },
    patterns() { return JSON.parse(patterns.runInContext(context)); },
    backtest() { return JSON.parse(vm.runInContext('JSON.stringify(backtest())', context)); }
  };
}

function interpolate(points, i) {
  for (let j = 1; j < points.length; j++) {
    if (i <= points[j][0]) {
      const [a, x] = points[j - 1], [b, y] = points[j];
      return x + (y - x) * (i - a) / (b - a);
    }
  }
  return points.at(-1)[1];
}
function replacementFixture() {
  const highs = [[0,105],[65,114],[75,120],[82,112],[90,120],[93,119],[97,135],[119,125]];
  const lows = [[0,95],[65,106],[75,110],[82,100],[119,116]];
  return Array.from({ length: 120 }, (_, i) => {
    const h = interpolate(highs, i), l = interpolate(lows, i), c = h - .5;
    return { t: 1700000000000 + i * 300000, o: c - .1, h, l, c, v: 100 };
  });
}
function reflect(bars) {
  return bars.map(b => ({ ...b, o: 250-b.o, c: 250-b.c, h: 250-b.l, l: 250-b.h }));
}
function randomBars(seed, count = 160) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  let price = 100;
  return Array.from({ length: count }, (_, i) => {
    const o = price, c = Math.max(20, o + (random()-.5)*7);
    const h = Math.max(o,c)+.1+random()*3, l = Math.min(o,c)-.1-random()*3;
    price = c;
    return { t: 1700000000000+i*300000, o,h,l,c, v: 10+random()*1000 };
  });
}
function activePatterns(events, i) {
  return events.filter(e => e.confirmedAt <= i && (e.supersededAt === null || i < e.supersededAt))
    .map(({ i,t,p }) => ({ i,t,p }));
}
function inWindow(events, i, type) {
  return activePatterns(events, i).some(e => e.t === type && i-e.i >= 3 && i-e.i <= 15);
}

if (require.main === module) {
const fixed = engine(fixedPath), legacy = engine(baselinePath);
let comparisons = 0, snapshots = 0, validityCases = 0;
const legacyFields=({side,score,items,plan,short})=>({side,score,items,plan,short});
for (const [type, bars] of [['M', replacementFixture()], ['W', reflect(replacementFixture())]]) {
  legacy.load(bars.slice(0,94));
  const before = legacy.signal(93);
  assert.ok(legacy.patterns().some(e => e.i === 90 && e.t === type));
  legacy.load(bars);
  const after = legacy.signal(93);
  assert.ok(!legacy.patterns().some(e => e.i === 90 && e.t === type));
  assert.notDeepEqual(before, after, 'Original code must reproduce the historical decision defect');
  fixed.load(bars);
  const event = fixed.patterns().find(e => e.i === 90 && e.t === type);
  assert.ok(event);
  assert.equal(event.confirmedAt, 93);
  assert.equal(event.supersededAt, 100);
  assert.equal(event.pivotTime, bars[90].t);
  assert.equal(event.confirmationBarTime, bars[93].t);
  assert.equal(event.supersededBarTime, bars[100].t);
  assert.equal(inWindow(fixed.patterns(),92,type), false, 'No signal before three-bar confirmation');
  assert.equal(inWindow(fixed.patterns(),93,type), true);
  assert.equal(inWindow(fixed.patterns(),99,type), true);
  assert.equal(inWindow(fixed.patterns(),100,type), false, 'Supersession applies only from its own confirmation');
  assert.deepEqual(legacyFields(fixed.signal(93)), before, 'Past decision survives later supersession');
  console.log(`PASS: ${type} replacement at pivot 97 preserves the decision at bar 93; supersession begins at 100.`);
}

const flat = Array.from({length:120},(_,i)=>({t:1700000000000+i*300000,o:100,c:100,h:101,l:99,v:100}));
const cases = [replacementFixture(),reflect(replacementFixture()),flat];
for (let seed=1;seed<=12;seed++) cases.push(randomBars(seed));
for (let caseIndex=0;caseIndex<cases.length;caseIndex++) {
  const bars = cases[caseIndex];
  for (const threshold of [3,4,5]) {
    const signals = [];
    for (let i=59;i<bars.length;i++) {
      const prefix = bars.slice(0,i+1);
      fixed.load(prefix,threshold);
      legacy.load(prefix,threshold);
      const current = fixed.signal(i);
      if(caseIndex===2){assert.equal(current.validity.ready,false);assert.ok(current.validity.reasons.includes('RSI-unavailable'));assert.equal(current.side,'WAIT');assert.equal(current.plan,null);validityCases++}else{assert.equal(current.validity.ready,true);assert.deepEqual(legacyFields(current),legacy.signal(i),`Current-bar rule compatibility: case ${caseIndex}, bar ${i}, threshold ${threshold}`);comparisons++}
      assert.deepEqual(activePatterns(fixed.patterns(),i),legacy.patterns(),`Active pattern compatibility: case ${caseIndex}, bar ${i}`);
      signals.push([i,current]);
    }
    fixed.load(bars,threshold);
    const completeEvents = fixed.patterns();
    for (const [i,expected] of signals) {
      assert.deepEqual(fixed.signal(i),expected,`Append-only signal invariance: case ${caseIndex}, bar ${i}, threshold ${threshold}`);
      snapshots++;
    }
    // Each event's active interval must also reproduce the historical snapshots.
    for (let i=59;i<bars.length;i++) {
      legacy.load(bars.slice(0,i+1),threshold);
      assert.deepEqual(activePatterns(completeEvents,i),legacy.patterns());
    }
    const result = fixed.backtest();
    if(result.N){assert.equal(Number.isFinite(result.avg),true);assert.equal(Number.isFinite(result.dd),true)}else{for(const key of ['wr','lo','hi','avg','pf','dd'])assert.equal(result[key],null)}
  }
}
console.log(`PASS: ${comparisons} original/current-bar comparisons and ${snapshots} append-only decision comparisons; ${validityCases} explicit flat-RSI unavailable cases across ${cases.length} datasets and all three score thresholds.`);
console.log('PASS: complete event history reproduces every original prefix pattern set; backtest outputs are finite.');
console.log('Scope: synthetic completed candles with a fixed history origin. Live candle closure, rolling-window reseeding, feed isolation and market performance are not validated here.');
}

module.exports = { replacementFixture, reflect, randomBars };
