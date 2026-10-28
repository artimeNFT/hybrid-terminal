'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const contract=require('./contract.json');
const {assertInput}=require('./input.cjs');
const protocol = require('./protocol.json');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

// Separate derivatives binding: original function bodies are extracted, never rewritten.
// No Spot loader or Spot-bound calculation contract is used.
function createCalculations(input, {memoizeVolumeReference = true} = {}) {
  assertInput(input);const bars=input.bars;
  assert.ok(bars.length > 0 && bars.length <= contract.state.maximumBars);
  const html = fs.readFileSync(path.resolve(__dirname, '../../'+contract.source.engineFile), 'utf8');
  assert.equal(sha(html),contract.source.engineSha256,'Frozen engine differs');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const between = (a, b) => {
    assert.equal(script.split(a).length, 2); assert.equal(script.split(b).length, 2);
    return script.slice(script.indexOf(a), script.indexOf(b, script.indexOf(a)));
  };
  const helpers = script.match(/^const finite=.*$/m)[0] + '\n' + script.match(/^const RSI_POLICY=.*$/m)[0];
  const functions = between('function ema(', 'async function jsonFetch(') +
    between('function mwEvents(', 'function calc(') + between('function sigAt(', 'function backtest(');
  const denied = [];
  const deny = name => () => { denied.push(name); throw Error('Forbidden derivatives-pilot capability: ' + name); };
  const proxy = name => new Proxy(Object.create(null), {get: deny(name), set: deny(name)});
  const context = vm.createContext({__Math: Math, __Number: Number, __input: bars,
    fetch: deny('network'), WebSocket: deny('network'), localStorage: proxy('storage'),
    document: proxy('application-bootstrap'), window: proxy('application-bootstrap'),
    setTimeout: deny('timer'), setInterval: deny('timer'), addEventListener: deny('application-bootstrap')});
  // Lexical native intrinsics avoid VM global-proxy lookups. Mathematical expressions are untouched.
  const memo = memoizeVolumeReference ? `
    const originalVolumeReference=volumeReference,referenceMemo=[];
    volumeReference=(k,i)=>{if(k!==S.k)throw Error('Memo requires original-origin owned prefix');
      return referenceMemo[i]||(referenceMemo[i]=originalVolumeReference(k,i))};` : '';
  const code = `'use strict';const Math=__Math,Number=__Number;const S={min:3,k:[]};${helpers}\n${functions}
    const input=Array.from(__input,b=>({t:b.t,o:b.o,h:b.h,l:b.l,c:b.c,v:b.v,closed:true,end:b.t+300000-1}));
    if(!input.every(numericBar))throw Error('Invalid calculation input');${memo}`;
  assert.equal(sha(helpers+'\n'+functions),contract.source.functionBodiesSha256,'Original calculation expressions changed');
  new vm.Script(code, {filename: 'derivatives-past-only-calculations'}).runInContext(context, {timeout: 30000});
  const replay = new vm.Script(`(()=>{
    S.k=input.slice(0,__length);Object.assign(S,analyze(S.k));
    const k=S.k,i=k.length-1,c=k[i],decision=sigAt(i);
    const scalar=(v,state)=>({state:finite(v)?state||'available':state||'unavailable',value:finite(v)?v:null});
    return {index:i,historyStart:k[0].t,pastBars:k.length,openTime:c.t,closeTime:c.t+300000,
      metrics:{ema13:scalar(S.e[0][i]),ema50:scalar(S.e[1][i]),ema200:scalar(S.e[2][i]),ema800:scalar(S.e[3][i]),
        atr14:scalar(S.atr[i],i<13?'partial-seed':'available'),rsi14:scalar(S.rsi[i],S.rsiState[i]),vwap:scalar(S.vw[i]),dayOpen:scalar(S.dop[i])},
      volume:{classification:c.cls,up:c.up,...c.volumeReference},dayCoverage:S.dayCoverage[i],decision,
      priorAtr:S.atr.slice(Math.max(0,i-288),i),
      recent:k.slice(Math.max(0,i-300)).map((b,j)=>({index:Math.max(0,i-300)+j,t:b.t,o:b.o,h:b.h,l:b.l,c:b.c,v:b.v,cls:b.cls,up:b.up,reference:{...b.volumeReference}}))};
  })()`);
  const census = new vm.Script('S.k.map((b,i)=>({index:i,t:b.t,cls:b.cls,up:b.up,doji:b.c===b.o,zeroRange:b.h<=b.l,referenceState:b.volumeReference.state}))');
  return {
    identity: {kind:'usdm-trade-calculation',calculationContractSha256:sha(fs.readFileSync(path.join(__dirname,'contract.json'))),inputSchema:input.dataIdentity.schema,inputSeries:'trade',applicationSha256:contract.source.engineSha256,
      functionBodiesSha256: sha(helpers + '\n' + functions), bootstrapExecuted: false,
      backtestExtracted: false, statePolicy: contract.state.mode, memoizeVolumeReference},
    at(index) {
      assert.ok(Number.isSafeInteger(index) && index >= 0 && index < bars.length);
      context.__length = index + 1;
      // Normalize the VM boundary without coercing nonfinite numbers to null.
      return structuredClone(replay.runInContext(context, {timeout: protocol.resources.vmCallTimeoutMs}));
    },
    sourceCensus() { return census.runInContext(context, {timeout: 30000}); },
    deniedCalls: () => [...denied]
  };
}
module.exports = {createCalculations};
