'use strict';
const {parentPort,workerData}=require('node:worker_threads'),assert=require('node:assert/strict');
const {createCalculations}=require('../preparation/calculations.cjs'),{assessSnapshot,contract}=require('../calculation-contract.cjs');
const {simulate,annotate}=require('./execution.cjs'),{canonical,validateTrace}=require('./summary.cjs');
const {checkedSeal}=require('../policy-pilot.cjs');
function collect(bars,progress=()=>{}){
 const calc=createCalculations(bars),decisions=[],started=performance.now();let rssMax=process.memoryUsage().rss;
 const raw=simulate(bars,index=>{
  const f=calc.at(index),assessment=assessSnapshot(f,{stateMode:contract.state.mode});
  assert.equal(f.historyStart,bars[0].t);assert.equal(f.pastBars,index+1);
  const frame=JSON.parse(canonical({index:f.index,historyStart:f.historyStart,pastBars:f.pastBars,openTime:f.openTime,closeTime:f.closeTime,
   metrics:f.metrics,decision:f.decision,volume:f.volume,dayCoverage:f.dayCoverage,assessment}));
  decisions.push(frame);
  if(decisions.length%100===0){rssMax=Math.max(rssMax,process.memoryUsage().rss);progress({considered:decisions.length,decisionIndex:index,seconds:(performance.now()-started)/1000,rssBytes:process.memoryUsage().rss})}
  return frame.decision;
 });
 const trades=annotate(raw,bars,decisions),payload={kind:'hybrid-policy-pilot-raw',decisions,trades};
 const summary=validateTrace(payload);assert.deepEqual(calc.deniedCalls(),[]);
 return{payload,summary,calculationIdentity:calc.identity,runtime:{calculationSeconds:(performance.now()-started)/1000,rssBytesObservedMax:Math.max(rssMax,process.memoryUsage().rss)}};
}
if(parentPort){checkedSeal(workerData.out);parentPort.postMessage({type:'complete',value:collect(workerData.bars,value=>parentPort.postMessage({type:'progress',value}))})}
module.exports={collect};
