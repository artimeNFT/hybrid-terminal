'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),D=require('../derivatives/schema.cjs'),P=require('./protocol.json');
function createCalculations(bars){
 assert.ok(bars.length>0&&bars.length<=P.scientificDesign.calculation.maximumBars);
 const html=fs.readFileSync(P.execution.source,'utf8');assert.equal(D.sha(html),P.execution.sha256);const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const between=(a,b)=>{assert.equal(script.split(a).length,2);assert.equal(script.split(b).length,2);return script.slice(script.indexOf(a),script.indexOf(b,script.indexOf(a)))};
 const helpers=script.match(/^const finite=.*$/m)[0],reference=between('function numericBar(','function analyze('),classification=between(' k.forEach((x,i)=>{x.up',' A.e=[13,50,200,800]'),atr=between(' A.atr=[];let a=0;k.forEach',' // Local policy: 14 changes');
 const denied=[],deny=n=>()=>{denied.push(n);throw Error('Forbidden restricted capability: '+n)},proxy=n=>new Proxy({},{get:deny(n),set:deny(n)});
 const context=vm.createContext({__bars:bars,__Math:Math,__Number:Number,fetch:deny('network'),WebSocket:deny('network'),localStorage:proxy('storage'),document:proxy('bootstrap'),window:proxy('bootstrap'),setInterval:deny('timer'),setTimeout:deny('timer')});
 const code=`'use strict';const Math=__Math,Number=__Number;${helpers}\n${reference}\nconst input=Array.from(__bars,b=>({...b}));function consumed(k){const A={};\n${classification}\n${atr}\nreturn A}const series=consumed(input);let lastIndex=-1;`;
 for(const forbidden of ['function analyze(','function ema(','mwEvents(','sigAt(','backtest(','A.vw','A.rsi','A.sv','A.z='])assert.ok(!code.includes(forbidden),'Unused dependency extracted: '+forbidden);
 new vm.Script(code).runInContext(context,{timeout:30000});
 const query=new vm.Script(`(()=>{const i=__i,c=input[i],start=Math.max(0,i-300);lastIndex=i;return{index:i,closeTime:c.t+300000,validDecision:c.closed===true&&numericBar(c)&&positive(series.atr[i]),atr:series.atr[i],priorAtr:series.atr.slice(Math.max(0,i-288),i),recent:input.slice(start,i+1).map((b,j)=>({index:start+j,t:b.t,o:b.o,h:b.h,l:b.l,c:b.c,cls:b.cls,up:b.up,reference:{state:b.volumeReference.state}}))}})()`),census=new vm.Script('input.slice(0,lastIndex+1).map(b=>({cls:b.cls,referenceState:b.volumeReference.state,doji:b.c===b.o,up:b.up,zeroRange:b.h<=b.l}))');
 return{identity:{source:P.execution.source,applicationSha256:P.execution.sha256,consumedSourceSha256:D.sha(helpers+'\n'+reference+'\n'+classification+'\n'+atr),adapterCodeSha256:D.sha(code),mode:P.execution.mode,origin:'unchanged first input, no reseed',calculated:['numericBar','volumeReference','Local cls/up','original ATR recurrence'],unusedEvaluated:false,selectionExtracted:false,bootstrap:false,outcomes:false},at(i){assert.ok(Number.isInteger(i)&&i>=0&&i<bars.length);context.__i=i;return structuredClone(query.runInContext(context,{timeout:30000}))},census(){return structuredClone(census.runInContext(context,{timeout:30000}))},deniedCalls:()=>denied};
}
module.exports={createCalculations};
