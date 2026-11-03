'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),D=require('../derivatives/schema.cjs'),P=require('./protocol.json');
function createCalculations(bars,{memo=true}={}){
 const html=fs.readFileSync(P.source,'utf8');assert.equal(D.sha(html),P.applicationSha256);const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];const between=(a,b)=>{assert.equal(script.split(a).length,2);return script.slice(script.indexOf(a),script.indexOf(b,script.indexOf(a)))};
 const helpers=script.match(/^const finite=.*$/m)[0]+'\n'+script.match(/^const RSI_POLICY=.*$/m)[0],functions=between('function ema(','const MARKET_PRODUCTS=')+between('function mwEvents(','function calc(');
 // Only an identity wrapper captures the selected target list; the predicates,
 // sorts, eligibility, indicators and flags retain their original expressions.
 const originalSignal=between('function sigAt(','function backtest(');let signal=originalSignal;
 for(const [from,to]of [['const gz=act.filter',"const gz=capture('SHORT',act.filter"],['.sort((a,b)=>b.hi-a.hi)[0]','.sort((a,b)=>b.hi-a.hi))[0]'],['rz=act.filter',"rz=capture('LONG',act.filter"],['.sort((a,b)=>a.lo-b.lo)[0]','.sort((a,b)=>a.lo-b.lo))[0]']]){assert.equal(signal.split(from).length,2);signal=signal.replace(from,to)}
 const denied=[],deny=n=>()=>{denied.push(n);throw Error('Forbidden capability: '+n)},proxy=n=>new Proxy({},{get:deny(n),set:deny(n)});
 const context=vm.createContext({__bars:bars,__Math:Math,__Number:Number,fetch:deny('network'),WebSocket:deny('network'),localStorage:proxy('storage'),document:proxy('bootstrap'),window:proxy('bootstrap'),setInterval:deny('timer'),setTimeout:deny('timer')});
 const code=`'use strict';const Math=__Math,Number=__Number,S={min:3,k:[]};${helpers}\n${functions}\nfunction capture(side,list){S.targets[side]=list;return list}\n${signal}\nconst input=Array.from(__bars,b=>({...b}));${memo?`const oldReference=volumeReference,memo=[];volumeReference=(k,i)=>{if(k!==S.k)throw Error('Wrong prefix');return memo[i]||(memo[i]=oldReference(k,i))};`:''}`;
 new vm.Script(code).runInContext(context,{timeout:30000});const replay=new vm.Script(`(()=>{S.k=input.slice(0,__i+1);Object.assign(S,analyze(S.k));S.targets={LONG:[],SHORT:[]};const g=sigAt(__i);return {valid:g.validity.ready,atr:S.atr[__i],ema50:S.e[1][__i],rsi:S.rsi[__i],candidates:['LONG','SHORT'].map(side=>{const z=S.targets[side][0],q=g.candidates[side];return{side,geometry:q.geometryEligible,zone:z?{time:S.k[z.i].t,age:__i-z.i,hi:z.hi,lo:z.lo,mid:z.mid}:null,stoppingVolume:q.items[2][1],mw:q.items[3][1]}})}})()`);
 return{identity:{sourceSha256:P.applicationSha256,functionBodiesSha256:D.sha(helpers+'\n'+functions+'\n'+originalSignal),captureAdapterSha256:D.sha(code.replace(/const input=[\s\S]*/,'')),mode:'full-past-prefix-recompute; no serialized parser/recursive state',memo:'pure volumeReference by immutable origin index only',bootstrap:false,backtest:false},at(i){assert.ok(Number.isInteger(i)&&i>=0&&i<bars.length);context.__i=i;return structuredClone(replay.runInContext(context,{timeout:30000}))},deniedCalls:()=>denied};
}
module.exports={createCalculations};
