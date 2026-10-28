'use strict';
const assert=require('node:assert/strict'),P=require('./protocol.json'),{mean}=require('./ols.cjs');
const {start,split,end,stepMs:S}=P.data,fees=[0,5,10,20];
const day=t=>new Date(t).toISOString().slice(0,10),finite=Number.isFinite,pos=x=>finite(x)&&x>0;
function calendar(){
 const train=[],test=[],exclusions={train:{'initial-feature-history':0,'split-exit-purge':0},test:{'unobserved-exit':0}};
 for(let T=start;T<end;T+=P.calendar.entryIntervalMs){const i=(T-start)/S-1,partition=T<split?'train':'test',exit=T+6*S;
  if(i<10){exclusions.train['initial-feature-history']++;continue}if(partition==='train'&&exit>=split){exclusions.train['split-exit-purge']++;continue}if(exit>=end){exclusions.test['unobserved-exit']++;continue}
  (partition==='train'?train:test).push({entryTime:T,decisionTime:T,decisionOpen:T-S,exitTime:exit,index:i});
 }
 assert.equal(train.length,P.calendar.trainingStructural);assert.equal(test.length,P.calendar.testStructural);return{train,test,exclusions};
}
function featureAt(byTime,T){
 const current=byTime.get(T-S),prior=Array.from({length:10},(_,j)=>byTime.get(T-(j+2)*S)),reasons=[];
 const barValid=b=>b&&[b.o,b.h,b.l,b.c].every(pos)&&finite(b.v)&&b.v>=0&&b.h>=Math.max(b.o,b.c)&&b.l<=Math.min(b.o,b.c)&&b.h>=b.l;
 if(!current||prior.some(b=>!b))reasons.push('missing/noncontiguous-feature-candles');
 if(!barValid(current)||prior.some(b=>!barValid(b)))reasons.push('invalid-feature-OHLCV');
 if(current&&!(current.h>current.l))reasons.push('zero/invalid-current-range');
 if(current&&!(pos(current.v)))reasons.push('nonpositive-current-volume');
 if(current&&!(finite(current.buy)&&current.buy>=0&&current.buy<=current.v))reasons.push('invalid-taker-base-volume');
 if(reasons.length)return{x:null,reasons};
 const priorMean=mean(prior.map(b=>b.v));if(!pos(priorMean))return{x:null,reasons:['nonpositive-prior-volume-mean']};
 const c=current,x=[10000*(c.c/c.o-1),(c.h-c.l)/c.c,(c.c-c.l)/(c.h-c.l),c.v/priorMean,10000*(prior[0].c/prior[6].c-1),2*c.buy/c.v-1];
 if(!x.every(finite))return{x:null,reasons:['nonfinite-feature-arithmetic']};return{x,reasons:[]};
}
function prepare(byTime,opportunities){
 const rows=[],excluded=[],daily={},reasonCounts={};
 for(const o of opportunities){const f=featureAt(byTime,o.entryTime),entry=byTime.get(o.entryTime)?.o,exit=byTime.get(o.exitTime)?.o,reasons=[...f.reasons];
  if(!pos(entry)||!pos(exit))reasons.push('missing/invalid-actual-entry-or-exit-open');
  // No labels before callers reach their sealed stage. This function only validates
  // finite inputs; the target is computed separately by targets().
  const ds=daily[day(o.entryTime)]??={structural:0,valid:0,invalid:0,reasons:{}};ds.structural++;
  if(reasons.length){ds.invalid++;excluded.push({entryTime:o.entryTime,reasons});for(const reason of reasons){reasonCounts[reason]=(reasonCounts[reason]||0)+1;ds.reasons[reason]=(ds.reasons[reason]||0)+1}}else{ds.valid++;rows.push({...o,x:f.x,entry,exit})}
 }
 return{rows,excluded,quality:{structural:opportunities.length,valid:rows.length,invalid:excluded.length,coverage:rows.length/opportunities.length,coveragePass:100*rows.length>=95*opportunities.length,reasons:reasonCounts,daily,reasonCountsMayOverlap:true}};
}
function targets(rows){return rows.map(r=>{const y=10000*(r.exit/r.entry-1);assert.ok(finite(y),'Nonfinite target arithmetic: inconclusive, no outcome-based row exclusion');return{...r,y}})}
const sign=p=>{assert.ok(finite(p));return p>0?1:p<0?-1:0};
const payoff=(p,y,bps)=>{assert.ok(finite(y)&&fees.includes(bps));const d=sign(p);return d*y-bps*(d!==0)};
function statistics(rows,which){
 const n=rows.length;assert.ok(n>0);const counts={LONG:0,SHORT:0,flat:0};for(const r of rows)counts[sign(r[which])>0?'LONG':sign(r[which])<0?'SHORT':'flat']++;
 return{opportunities:n,counts,grossMeanBps:mean(rows.map(r=>payoff(r[which],r.y,0))),afterModeledFeesMeanBps:Object.fromEntries([5,10,20].map(b=>[b,mean(rows.map(r=>payoff(r[which],r.y,b)))])),mseBpsSquared:mean(rows.map(r=>(r[which]-r.y)**2))};
}
function score(rows){
 const baseline=statistics(rows,'baseline'),augmented=statistics(rows,'augmented'),pairedImprovement10Bps=mean(rows.map(r=>payoff(r.augmented,r.y,10)-payoff(r.baseline,r.y,10))),daily={};
 for(const r of rows){const d=daily[day(r.entryTime)]??={opportunities:0,baseline:{grossTotalBps:0,afterModeledFeesTotalBps:{5:0,10:0,20:0}},augmented:{grossTotalBps:0,afterModeledFeesTotalBps:{5:0,10:0,20:0}},pairedImprovement10TotalBps:0};d.opportunities++;for(const m of ['baseline','augmented']){d[m].grossTotalBps+=payoff(r[m],r.y,0);for(const b of [5,10,20])d[m].afterModeledFeesTotalBps[b]+=payoff(r[m],r.y,b)}d.pairedImprovement10TotalBps+=payoff(r.augmented,r.y,10)-payoff(r.baseline,r.y,10)}
 assert.ok([pairedImprovement10Bps,baseline.mseBpsSquared,augmented.mseBpsSquared].every(finite),'Nonfinite scoring: inconclusive');
 return{baseline,augmented,pairedImprovement10Bps,daily,primaryPass:augmented.afterModeledFeesMeanBps[10]>0&&pairedImprovement10Bps>0};
}
module.exports={calendar,featureAt,prepare,targets,sign,payoff,statistics,score,day};
