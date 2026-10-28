'use strict';
const assert=require('node:assert/strict'),protocol=require('./protocol.json');
const {canonical,hash}=require('../preparation/features.cjs');
function distribution(values){
 assert.ok(values.every(Number.isFinite));const a=[...values].sort((a,b)=>a-b),n=a.length;
 return{n,mean:n?values.reduce((a,b)=>a+b,0)/n:null,median:n?(a[Math.floor((n-1)/2)]+a[Math.floor(n/2)])/2:null,min:n?a[0]:null,max:n?a.at(-1):null};
}
function statistics(trades,bps){
 assert.ok([0,...protocol.costs.roundTripBps].includes(bps));
 const values=trades.map(t=>{assert.ok([t.grossR,t.entry,t.risk].every(Number.isFinite)&&t.entry>0&&t.risk>0);return t.grossR-(bps/10000)*t.entry/t.risk});
 const n=values.length,wins=values.filter(x=>x>0),losses=values.filter(x=>x<0),zero=values.filter(x=>x===0).length,gains=wins.reduce((a,b)=>a+b,0),loss=-losses.reduce((a,b)=>a+b,0);
 return{...distribution(values),sumR:values.reduce((a,b)=>a+b,0),gainsR:gains,lossesR:loss,
  profitFactor:loss>0?gains/loss:null,profitFactorState:!n?'no-trades':loss>0?'defined':'no-loss-denominator',
  wins:wins.length,zeros:zero,losses:losses.length,winFraction:n?wins.length/n:null,zeroFraction:n?zero/n:null,lossFraction:n?losses.length/n:null};
}
const blockAt=i=>protocol.measurement.blocksHalfOpen.findIndex(([a,b])=>i>=a&&i<b);
function population(trades){
 const n=trades.length,touch=trades.filter(t=>t.t1).length,ambiguous=trades.filter(t=>t.sameBarStopTp2).length;
 return{n,gross:statistics(trades,0),costs:Object.fromEntries(protocol.costs.roundTripBps.map(b=>[b,statistics(trades,b)])),
  exitReasons:Object.fromEntries(['stop','TP2','expiry'].map(reason=>[reason,trades.filter(t=>t.exitReason===reason).length])),
  stopAtOpen:trades.filter(t=>t.stopAtOpen).length,holdingBars:distribution(trades.map(t=>t.holdingBars)),tp1Touch:touch,tp1TouchFraction:n?touch/n:null,
  sameBarStopTp2:ambiguous,sameBarStopTp2Fraction:n?ambiguous/n:null,
  crossBlockHoldings:trades.filter(t=>protocol.measurement.blocksHalfOpen.slice(1).some(([start])=>t.decisionIndex<start&&t.exitIndex>=start)).length,
  followupIntoTail:trades.filter(t=>t.exitIndex>protocol.measurement.lastDecisionIndex).length};
}
function summarize(payload){
 const {decisions,trades}=payload,{firstDecisionIndex:first,lastDecisionIndex:last}=protocol.measurement;
 const intersection=(a,b)=>Math.max(0,Math.min(last,b)-Math.max(first,a)+1);
 const held=trades.reduce((n,t)=>n+intersection(t.decisionIndex+1,t.exitIndex),0),expiryCursor=trades.reduce((n,t)=>n+(t.exitReason==='expiry'?intersection(t.exitIndex+1,t.nextDecisionIndex-1):0),0);
 const plans=decisions.filter(d=>d.decision.side!=='WAIT'&&d.decision.plan).length;
 assert.equal(decisions.length+held+expiryCursor,last-first+1,'Scheduling coverage mismatch');
 return{counts:{totalBars:protocol.data.rows,initialExcludedIndices:first,tailExcludedIndices:protocol.data.rows-last-1,admissibleDecisionIndices:last-first+1,
  considered:decisions.length,waitOrNoPlan:decisions.length-plans,selectedPlans:plans,invalidNextOpenEntries:plans-trades.length,
  unavailableCalculationDecisions:decisions.filter(d=>d.assessment.calculationState!=='ready').length,heldSkippedIndices:held,expiryCursorSkippedIndices:expiryCursor,trades:trades.length},
  all:population(trades),sides:Object.fromEntries(['LONG','SHORT'].map(side=>[side,population(trades.filter(t=>t.side===side))])),
  blocks:protocol.measurement.blocksHalfOpen.map((range,block)=>({block,range,considered:decisions.filter(d=>blockAt(d.index)===block).length,...population(trades.filter(t=>blockAt(t.decisionIndex)===block))}))};
}
function validateTrace(payload){
 const tradeMap=new Map(payload.trades.map(t=>[t.decisionIndex,t]));assert.equal(tradeMap.size,payload.trades.length);
 let cursor=protocol.measurement.firstDecisionIndex;
 for(const d of payload.decisions){assert.equal(d.index,cursor);assert.equal(d.pastBars,d.index+1);assert.equal(d.historyStart,Date.parse(protocol.data.startInclusive));
  assert.equal(d.openTime,d.historyStart+d.index*protocol.data.stepMs);assert.equal(d.closeTime,d.openTime+protocol.data.stepMs);
  const t=tradeMap.get(cursor);
  if(t){assert.equal(t.entryIndex,cursor+1);assert.equal(t.risk,Math.abs(t.plan.stop-t.entry));assert.equal(t.R,t.grossR-.001*t.entry/t.risk);
   assert.equal(t.exitBarOpenTime,d.historyStart+t.exitIndex*protocol.data.stepMs);assert.equal(t.entryOpenTime,d.closeTime);assert.equal(t.holdingBars,t.exitIndex-cursor);
   if(t.exitReason==='expiry'){assert.equal(t.exitIndex,cursor+120);assert.equal(t.nextDecisionIndex,cursor+122)}else{assert.equal(t.nextDecisionIndex,t.exitIndex+1);assert.ok(t.exitIndex<=cursor+120)}
   cursor=t.nextDecisionIndex;
  }else cursor++;
 }
 assert.ok(cursor>protocol.measurement.lastDecisionIndex);return summarize(payload);
}
module.exports={canonical,hash,statistics,distribution,population,blockAt,summarize,validateTrace};
