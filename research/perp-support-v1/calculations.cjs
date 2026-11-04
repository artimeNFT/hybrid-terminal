'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),D=require('../derivatives/schema.cjs'),P=require('./protocol.json');
function createCalculations(bars){
 assert.ok(bars.length>0&&bars.length<=P.calculation.maximumBars);
 const html=fs.readFileSync(P.calculation.source,'utf8');assert.equal(D.sha(html),P.calculation.sha256);
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1],between=(a,b)=>{assert.equal(script.split(a).length,2);assert.equal(script.split(b).length,2);return script.slice(script.indexOf(a),script.indexOf(b,script.indexOf(a)))};
 const helpers=script.match(/^const finite=.*$/m)[0]+'\n'+script.match(/^const RSI_POLICY=.*$/m)[0],functions=between('function ema(','async function jsonFetch(')+between('function mwEvents(','function calc(');
 assert.ok(!functions.includes('function sigAt(')&&!functions.includes('function backtest('));
 const denied=[],deny=n=>()=>{denied.push(n);throw Error('Forbidden support capability: '+n)},proxy=n=>new Proxy({},{get:deny(n),set:deny(n)});
 const context=vm.createContext({__bars:bars,__Math:Math,__Number:Number,fetch:deny('network'),WebSocket:deny('network'),localStorage:proxy('storage'),document:proxy('bootstrap'),window:proxy('bootstrap'),setInterval:deny('timer'),setTimeout:deny('timer')});
 const code=`'use strict';const Math=__Math,Number=__Number,S={k:[]};${helpers}\n${functions}\nconst input=Array.from(__bars,b=>({...b}));const originalReference=volumeReference,memo=[];volumeReference=(k,i)=>{if(k!==S.k)throw Error('Wrong fixed-origin prefix');return memo[i]||(memo[i]=originalReference(k,i))};`;
 new vm.Script(code).runInContext(context,{timeout:30000});
 const replay=new vm.Script(`(()=>{S.k=input.slice(0,__i+1);const A=analyze(S.k),i=__i,c=S.k[i],start=Math.max(0,i-300);return{index:i,closeTime:c.t+300000,validDecision:c.closed===true&&numericBar(c)&&positive(A.atr[i]),atr:A.atr[i],priorAtr:A.atr.slice(Math.max(0,i-288),i),recent:S.k.slice(start).map((b,j)=>({index:start+j,t:b.t,o:b.o,h:b.h,l:b.l,c:b.c,cls:b.cls,up:b.up,reference:{state:b.volumeReference.state}}))}})()`);
 const census=new vm.Script('S.k.map(b=>({cls:b.cls,referenceState:b.volumeReference.state,doji:b.c===b.o,up:b.up,zeroRange:b.h<=b.l}))');
 return{identity:{source:P.calculation.source,applicationSha256:P.calculation.sha256,functionBodiesSha256:D.sha(helpers+'\n'+functions),adapterCodeSha256:D.sha(code),mode:P.calculation.state,functions:['ema','mwEvents','numericBar','volumeReference','analyze'],selectionExtracted:false,bootstrap:false,outcomes:false,memo:'pure source reference by immutable origin index only'},at(i){assert.ok(Number.isInteger(i)&&i>=0&&i<bars.length);context.__i=i;return structuredClone(replay.runInContext(context,{timeout:30000}))},census(){return structuredClone(census.runInContext(context,{timeout:30000}))},deniedCalls:()=>denied};
}
module.exports={createCalculations};
