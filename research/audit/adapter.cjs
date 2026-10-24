'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const APP=path.resolve(__dirname,'../../hybrid-terminal.html'),EXPECTED='fa349f556dea8eb1c7c17a6aa10b8537549f9d74946a01f8494a124e852563e9';
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
function createAdapter({captureTargets=true}={}){
 const html=fs.readFileSync(APP,'utf8');assert.equal(digest(html),EXPECTED,'Reviewed application source changed; adapter requires review');
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const between=(start,end)=>{assert.equal(script.split(start).length,2,start+' must be unique');return script.slice(script.indexOf(start),script.indexOf(end,script.indexOf(start)))};
 const helpers=script.match(/^const finite=.*$/m)[0]+'\n'+script.match(/^const RSI_POLICY=.*$/m)[0];
 const functions=between('function ema(','async function jsonFetch(')+between('function mwEvents(','function calc(');
 let signal=between('function sigAt(','function backtest(');
 // Identity wrappers capture the exact eligible lists already computed by sigAt.
 // No predicate, sort, threshold, plan or indicator expression is duplicated/replaced.
 if(captureTargets){for(const [from,to]of [
  ['const gz=act.filter',"const gz=captureTargets('SHORT',act.filter"],
  ['.sort((a,b)=>b.hi-a.hi)[0]','.sort((a,b)=>b.hi-a.hi))[0]'],
  ['rz=act.filter',"rz=captureTargets('LONG',act.filter"],
  ['.sort((a,b)=>a.lo-b.lo)[0]','.sort((a,b)=>a.lo-b.lo))[0]']
 ]){assert.equal(signal.split(from).length,2,'Target capture source anchor changed');signal=signal.replace(from,to)}}
 const denied=[];const deny=name=>()=>{denied.push(name);throw Error('Audit must not call '+name)};
 const proxy=name=>new Proxy(Object.create(null),{get:deny(name),set:deny(name)});
 const context=vm.createContext({fetch:deny('fetch'),WebSocket:deny('WebSocket'),localStorage:proxy('localStorage'),document:proxy('document'),window:proxy('window'),setInterval:deny('setInterval'),setTimeout:deny('setTimeout'),addEventListener:deny('addEventListener')});
 const code=`'use strict';const S={min:3,k:[]};${helpers}\n${functions}\nfunction captureTargets(side,list){S.auditTargets[side]=list;return list}\n${signal}`;
 new vm.Script(code,{filename:'hybrid-calculation-only-adapter'}).runInContext(context,{timeout:1000});
 const load=new vm.Script('S.k=__bars;S.min=3;if(!S.k.length||!S.k.every(numericBar))throw Error("Invalid calculation bars");Object.assign(S,analyze(S.k));');
 const snapshot=new vm.Script(`(()=>{const i=S.k.findIndex(c=>c.t===__openTime);if(i<0)throw Error('Decision candle missing');const k=S.k,c=k[i],at=S.atr[i];S.auditTargets={LONG:[],SHORT:[]};const decision=sigAt(i);
  const time=j=>Number.isInteger(j)&&j>=0&&j<=i?k[j].t:null;
  const scalar=(value,state)=>({state:finite(value)?state||'available':state||'unavailable',value:finite(value)?value:null});
  const zone=z=>({id:k[z.i].t+':'+(z.up?'up':'down'),openTime:k[z.i].t,up:z.up,hi:z.hi,lo:z.lo,mid:z.mid,firstTouchOpenTime:time(z.i1)});
  const mw=S.mw.filter(e=>e.confirmedAt<=i&&e.i>=i-__mwLookback).map(e=>({id:e.t+':'+k[e.i].t+':'+k[e.confirmedAt].t,type:e.t,pivotOpenTime:k[e.i].t,price:e.p,confirmedCloseTime:k[e.confirmedAt].t+300000,supersededCloseTime:time(e.supersededAt)===null?null:k[e.supersededAt].t+300000,active:e.supersededAt===null||e.supersededAt>i,pivots:e.pivots.map(p=>({openTime:k[p.i].t,type:p.t,price:p.p}))}));
  return JSON.stringify({openTime:c.t,closeTime:c.t+300000,historyStart:k[0].t,pastBars:i+1,price:c.c,
   metrics:{ema13:scalar(S.e[0][i]),ema50:scalar(S.e[1][i]),ema200:scalar(S.e[2][i]),ema800:scalar(S.e[3][i]),atr14:scalar(at,i<13?'partial-seed':'available'),rsi14:scalar(S.rsi[i],S.rsiState[i]),vwap:scalar(S.vw[i]),dayOpen:scalar(S.dop[i])},
   volume:{classification:c.cls,up:c.up,...c.volumeReference},dayCoverage:S.dayCoverage[i],
   zones:{LONG:S.auditTargets.LONG.map(zone),SHORT:S.auditTargets.SHORT.map(zone)},mw,
   stoppingVolume:S.sv.filter(e=>e.i<=i&&i-e.i<=6).map(e=>({id:e.t+':'+k[e.i].t,type:e.t,openTime:k[e.i].t})),decision});})()`);
 return{
  identity:{applicationVersion:'0.4.3',applicationSha256:EXPECTED,extractedAdapterSha256:digest(code),ruleVersion:script.match(/RULE_VERSION='([^']+)'/)[1],rsiPolicy:script.match(/const RSI_POLICY='([^']+)'/)[1],functions:['ema','mwEvents','numericBar','volumeReference','analyze','sigAt'],bootstrapExecuted:false,backtestExecuted:false},
  load(bars){context.__bars=bars.map(b=>({t:b.t,o:b.o,h:b.h,l:b.l,c:b.c,v:b.v,closed:true,end:b.t+300000-1}));load.runInContext(context,{timeout:30000})},
  snapshot(openTime,mwLookback=30){context.__openTime=openTime;context.__mwLookback=mwLookback;return JSON.parse(snapshot.runInContext(context,{timeout:30000}))},
  deniedCalls:()=>[...denied]
 };
}
module.exports={createAdapter};
