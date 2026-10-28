'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {canonical,hash}=require('../derivatives/schema.cjs'),protocol=require('./protocol.json'),contract=require('./contract.json');
const original=require('../policy-pilot/execution.cjs'),{statistics,distribution}=require('../policy-pilot/summary.cjs'),oldProtocol=require('../policy-pilot/protocol.json');
const {assertInput}=require('./input.cjs');
// Reuse unchanged execution expressions and pure statistics, never their Spot input/contract.
assert.equal(canonical(protocol.measurement),canonical(oldProtocol.measurement));assert.equal(canonical(protocol.fees.roundTripBps),canonical(oldProtocol.costs.roundTripBps));
const LABEL=protocol.label,components=()=>JSON.parse(canonical(protocol.components));
const calculationContractSha256=require('../derivatives/schema.cjs').sha(fs.readFileSync(require('node:path').join(__dirname,'contract.json')));
function validateComponents(value){assert.equal(canonical(value),canonical(protocol.components),'Missing funding/account effects must remain explicit null, not zero')}
function assess(frame){
 const exclusions=[],d=contract.data;
 if(frame.historyStart!==d.startInclusive||frame.pastBars!==frame.index+1||frame.openTime!==d.startInclusive+frame.index*d.stepMs||frame.closeTime!==frame.openTime+d.stepMs)exclusions.push('coordinate/origin');
 if(frame.pastBars<contract.state.minimumPastBars)exclusions.push('initial-preparation');
 if(!frame.decision.validity?.ready||frame.volume.state!=='ready'||!Number.isFinite(frame.metrics.ema50.value)||!(frame.metrics.atr14.value>0)||frame.metrics.rsi14.state!=='ready')exclusions.push('invalid-calculation');
 if(frame.dayCoverage!==contract.state.utcDayCoverage)exclusions.push('partial-UTC-day');
 return{calculationContractSha256,calculationState:exclusions.length?'excluded':'ready',exclusions};
}
function execute(input,decisionAt,options={}){assertInput(input);return original.simulate(input.bars,decisionAt,{first:protocol.measurement.firstDecisionIndex,last:input.bars.length-121,...options})}
function annotate(raw,input,decisions){assertInput(input);return original.annotate(raw,input.bars,decisions).map(({R,...t})=>({...t,modeledFee10R:R,components:components()}))}
function describe(values){const a=[...values].sort((a,b)=>a-b),q=p=>{const h=(a.length-1)*p,lo=Math.floor(h),hi=Math.ceil(h);return a.length?a[lo]+(a[hi]-a[lo])*(h-lo):null};return{...distribution(values),P10:q(.1),P90:q(.9),P99:q(.99),quantileConvention:'Hyndman-Fan type7'}}
const blockAt=i=>protocol.measurement.blocksHalfOpen.findIndex(([a,b])=>i>=a&&i<b);
function population(trades){
 const n=trades.length;for(const t of trades)validateComponents(t.components);
 return{label:LABEL,components:components(),n,gross:statistics(trades,0),afterModeledFees:Object.fromEntries(protocol.fees.roundTripBps.map(b=>[b,statistics(trades,b)])),
  exitReasons:Object.fromEntries(['stop','TP2','expiry'].map(r=>[r,trades.filter(t=>t.exitReason===r).length])),stopAtOpen:trades.filter(t=>t.stopAtOpen).length,
  holdingBars:distribution(trades.map(t=>t.holdingBars)),tp1Touch:trades.filter(t=>t.t1).length,tp1TouchFraction:n?trades.filter(t=>t.t1).length/n:null,
  sameBarStopTp2:trades.filter(t=>t.sameBarStopTp2).length,sameBarStopTp2Fraction:n?trades.filter(t=>t.sameBarStopTp2).length/n:null,
  crossBlockHoldings:trades.filter(t=>protocol.measurement.blocksHalfOpen.slice(1).some(([a])=>t.decisionIndex<a&&t.exitIndex>=a)).length,followupIntoTail:trades.filter(t=>t.exitIndex>protocol.measurement.lastDecisionIndex).length,
  riskBps:describe(trades.map(t=>10000*t.risk/t.entry)),costR:Object.fromEntries(protocol.fees.roundTripBps.map(b=>[b,describe(trades.map(t=>(b/10000)*t.entry/t.risk))]))};
}
function validateTrace(payload){
 assert.equal(payload.kind,'hybrid-usdm-gross-fee-pilot-raw');assert.equal(payload.label,LABEL);validateComponents(payload.components);
 const {decisions,trades}=payload,m=protocol.measurement,d=contract.data,map=new Map(trades.map(t=>[t.decisionIndex,t]));assert.equal(map.size,trades.length);
 let cursor=m.firstDecisionIndex;
 for(const frame of decisions){assert.equal(frame.index,cursor);assert.equal(frame.historyStart,d.startInclusive);assert.equal(frame.pastBars,cursor+1);assert.equal(frame.openTime,d.startInclusive+cursor*d.stepMs);assert.equal(frame.closeTime,frame.openTime+d.stepMs);
  const t=map.get(cursor);if(t){validateComponents(t.components);assert.equal(canonical(t.plan),canonical(frame.decision.plan),'Recorded plan mismatch');assert.equal(t.side,frame.decision.side);assert.equal(t.entryIndex,cursor+1);assert.equal(t.entryOpenTime,frame.closeTime);assert.equal(t.risk,Math.abs(t.plan.stop-t.entry));assert.equal(t.modeledFee10R,t.grossR-.001*t.entry/t.risk);assert.equal(t.holdingBars,t.exitIndex-cursor);assert.equal(t.exitBarOpenTime,d.startInclusive+t.exitIndex*d.stepMs);
   if(t.exitReason==='expiry'){assert.equal(t.exitIndex,cursor+120);assert.equal(t.nextDecisionIndex,cursor+122)}else{assert.ok(['stop','TP2'].includes(t.exitReason));assert.equal(t.nextDecisionIndex,t.exitIndex+1);assert.ok(t.exitIndex<=cursor+120)}cursor=t.nextDecisionIndex;
  }else cursor++;
 }
 assert.ok(cursor>m.lastDecisionIndex);const overlap=(a,b)=>Math.max(0,Math.min(m.lastDecisionIndex,b)-Math.max(m.firstDecisionIndex,a)+1),held=trades.reduce((n,t)=>n+overlap(t.decisionIndex+1,t.exitIndex),0),expiry=trades.reduce((n,t)=>n+(t.exitReason==='expiry'?overlap(t.exitIndex+1,t.nextDecisionIndex-1):0),0);
 assert.equal(decisions.length+held+expiry,m.admissibleDecisionIndices);
 const plans=decisions.filter(f=>f.decision.side!=='WAIT'&&f.decision.plan).length;
 return{label:LABEL,components:components(),counts:{totalBars:d.rows,initialExcludedIndices:m.firstDecisionIndex,tailExcludedIndices:d.rows-m.lastDecisionIndex-1,admissibleDecisionIndices:m.admissibleDecisionIndices,considered:decisions.length,waitOrNoPlan:decisions.length-plans,selectedPlans:plans,invalidNextOpenEntries:plans-trades.length,unavailableCalculationDecisions:decisions.filter(f=>f.assessment.calculationState!=='ready').length,heldSkippedIndices:held,expiryCursorSkippedIndices:expiry,trades:trades.length},
  all:population(trades),sides:Object.fromEntries(['LONG','SHORT'].map(s=>[s,population(trades.filter(t=>t.side===s))])),blocks:m.blocksHalfOpen.map((range,block)=>({block,range,considered:decisions.filter(f=>blockAt(f.index)===block).length,...population(trades.filter(t=>blockAt(t.decisionIndex)===block))}))};
}
module.exports={canonical,hash,LABEL,components,validateComponents,assess,execute,annotate,describe,population,validateTrace};
