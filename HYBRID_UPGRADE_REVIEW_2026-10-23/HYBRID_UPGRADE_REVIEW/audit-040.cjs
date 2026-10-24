'use strict';
// Read-only mathematical probes of functions extracted from the supplied 0.4.0 HTML.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const file=process.argv[2]||'hybrid-terminal.html';
const output=process.argv[3]||'findings.actual.json';
const raw=fs.readFileSync(file,'utf8'),normalized=raw.replace(/\r\n/g,'\n');
assert.equal(crypto.createHash('sha256').update(normalized).digest('hex'),'0593c0096957d295628d267f1f3b16dd90a6478832d61bf39d2e9ed1959bc7d9');
const script=normalized.match(/<script>([\s\S]*?)<\/script>/)[1];
const stop=script.indexOf("\n$('sym').onchange");assert.ok(stop>0);
const elements=new Map(),noop=()=>{};
const canvas=new Proxy({}, {get:(o,p)=>p in o?o[p]:noop});
function element(id){if(!elements.has(id))elements.set(id,{value:id==='acc'?1000:id==='rk'?1:'',getContext:()=>canvas,style:{},classList:{toggle:noop},clientWidth:300});return elements.get(id)}
const context=vm.createContext({document:{getElementById:element},navigator:{onLine:true},console,Date,Map,Set});
vm.runInContext(script.slice(0,stop),context,{timeout:1000});
const run=s=>vm.runInContext(s,context,{timeout:2000}),read=s=>JSON.parse(run('JSON.stringify('+s+')'));
const results={sourceVersion:read('APP_VERSION'),normalizedSha256:crypto.createHash('sha256').update(normalized).digest('hex'),scope:'Isolated synthetic mathematical probes, not full application QA or live/performance validation.',probes:{}};
run("S.k=Array.from({length:100},(_,i)=>({t:i*300000,end:(i+1)*300000-1,o:100,h:100,l:100,c:100,v:0,closed:true}));Object.assign(S,analyze(S.k))");
results.probes.zeroVolumeFlat={rsi:read('S.rsi[99]'),atr:read('S.atr[99]'),vectors:read('S.k.filter(b=>b.cls===2).length'),vwap:read('S.vw[99]')};
assert.deepEqual(results.probes.zeroVolumeFlat,{rsi:100,atr:0,vectors:90,vwap:null});

run("S.min=3;S.k=Array.from({length:101},(_,i)=>({t:i*300000,end:(i+1)*300000-1,o:100,h:101,l:99,c:100,v:100,closed:true}));S.atr=Array(101).fill(1);S.e=[[],Array(101).fill(100),[],[]];S.rsi=Array(101).fill(70);S.z=[{i:50,hi:104,lo:102,mid:103,up:false,i2:Infinity}];S.sv=[{i:98,t:'top'},{i:99,t:'bot'}];S.mw=[{i:90,t:'M',confirmedAt:93,supersededAt:null},{i:91,t:'W',confirmedAt:94,supersededAt:null}]");
const tied=read('sigAt(100)');assert.equal(tied.score,3);assert.equal(tied.side,'WAIT');assert.equal(tied.short,true);
run('S.rsi[100]=50');const long=read('sigAt(100)');assert.equal(long.side,'LONG');assert.equal(long.score,3);
results.probes.directionTie={tiedOutput:{side:tied.side,score:tied.score,selectedShort:tied.short,plan:tied.plan},sameLongConditionsWithoutExtraShortRsi:{side:long.side,score:long.score,rr:long.plan.rr},interpretation:'A higher/equal preliminary short score can suppress an otherwise eligible long plan when the selected short side has no target. This is a policy/eligibility counterexample, not a measurement of market frequency.'};

// Exercise the actual position-size panel with a valid plan and finite inputs.
run("S.sig={side:'LONG',short:false,score:3,items:[],plan:{entry:100,stop:99.9,tp1:102,tp2:103,rr:30}};S.closedIndex=100;S.st=[{n:0,t:0,m:0,f:0,med:'–'},{n:0,t:0,m:0,f:0,med:'–'}];S.bt={N:0,cur:[0],L:{n:0},S:{n:0},wr:0,lo:0,hi:0,avg:0,pf:0,dd:0,t1:0};S.htf=null;S.panelKey=null;S.connected=false;S.phase='disconnected';panel()");
const sized=elements.get('szo').innerHTML;assert.match(sized,/10\.0x/);
results.probes.positionSizing={account:1000,riskPercent:1,entry:100,stop:99.9,quantityApprox:100,notionalApprox:10000,displayedNotionalToAccount:'10.0x',interpretation:'Nominal stop-distance sizing has no spot-cash cap, step-size rounding or costs; this is not an executable unleveraged spot size.'};

// Exercise two isolated outcomes through the original aggregate routine.
run("S.k=Array.from({length:65},(_,i)=>({t:i*300000,end:(i+1)*300000-1,o:100,h:100.5,l:99.5,c:100,v:100,closed:true}));S.k[62]={...S.k[62],h:103,l:100,c:102};sigAt=i=>i===60?{side:'LONG',short:false,plan:{stop:99,tp1:101,tp2:102}}:{side:'WAIT'}");
const bt=read('backtest()');assert.equal(bt.N,1);assert.equal(bt.pf,99);
results.probes.noLossProfitFactor={closedTrades:bt.N,grossProfitR:bt.trades[0].grossR,netR:bt.trades[0].R,reportedProfitFactor:bt.pf,interpretation:'99 is a display sentinel, not the mathematical ratio when the denominator is zero. Use an explicit unavailable/no-loss state.'};
run("sigAt=()=>({side:'WAIT'})");const empty=read('backtest()');assert.equal(empty.N,0);assert.ok(empty.hi>.79&&empty.hi<.80);
results.probes.zeroTradeInterval={trades:empty.N,winRate:empty.wr,lower:empty.lo,upper:empty.hi,interpretation:'The aggregate routine uses max(N,1), manufacturing a nonempty-denominator Wilson interval when N=0. The on-screen no-trade branch hides metrics, but the report path still formats these values. Use unavailable statistics for N=0.'};

fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});
fs.writeFileSync(output,JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
