'use strict';
const {parentPort,workerData}=require('node:worker_threads'),assert=require('node:assert/strict');
const {loadPinnedTrade}=require('./input.cjs'),{createCalculations}=require('./calculations.cjs'),M=require('./model.cjs');
const {checkedSeal}=require('../derivatives-pilot.cjs');
function collect(file,progress=()=>{}){
 const {input,identity:data}=loadPinnedTrade(file),calc=createCalculations(input),decisions=[],started=performance.now();let rssMax=process.memoryUsage().rss;
 const raw=M.execute(input,index=>{
  const f=calc.at(index),assessment=M.assess(f),frame=JSON.parse(M.canonical({index:f.index,historyStart:f.historyStart,pastBars:f.pastBars,openTime:f.openTime,closeTime:f.closeTime,metrics:f.metrics,volume:f.volume,dayCoverage:f.dayCoverage,decision:f.decision,assessment}));decisions.push(frame);
  if(decisions.length%100===0){rssMax=Math.max(rssMax,process.memoryUsage().rss);progress({considered:decisions.length,decisionIndex:index,seconds:(performance.now()-started)/1000,rssBytes:process.memoryUsage().rss})}return frame.decision;
 });
 const payload={kind:'hybrid-usdm-gross-fee-pilot-raw',label:M.LABEL,components:M.components(),decisions,trades:M.annotate(raw,input,decisions)},summary=M.validateTrace(payload);assert.deepEqual(calc.deniedCalls(),[]);
 return{payload,summary,dataIdentity:data,calculationIdentity:calc.identity,runtime:{calculationSeconds:(performance.now()-started)/1000,rssBytesObservedMax:Math.max(rssMax,process.memoryUsage().rss)}};
}
if(parentPort){checkedSeal(workerData.out);parentPort.postMessage({type:'complete',value:collect(workerData.file,value=>parentPort.postMessage({type:'progress',value}))})}
module.exports={collect};
