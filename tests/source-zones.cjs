'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {openApp}=require('./app-harness.cjs'),{bars,step,settle}=require('./target-path-fixtures.cjs'),{randomBars,reflect}=require('./regression.cjs');
const BASE='baseline/hybrid-terminal.0.4.22.html',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const prior=()=>Array.from({length:10},(_,i)=>({t:i*step,o:90,c:91,h:92,l:90,v:100,closed:true}));
const bar=(i,o,c,h,l,v=20,closed=true)=>({t:i*step,o,c,h,l,v,closed});
const project=(a,k)=>{a.set('__k',k);return a.read('sourceClosedZones(__k,300000)')};
const engine=a=>a.read('({k:S.k,z:S.z,e:S.e,atr:S.atr,rsi:S.rsi,mw:S.mw,sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY],rules:[RULE_VERSION,EXECUTION_VERSION,RSI_POLICY]})');
test('independent prior10 classification goldens, rising/climax and strict source doji vs unchanged analytical direction',async()=>{
 const a=await openApp(),k=prior().concat(bar(10,100,101,101,100,160));a.set('__k',k);assert.deepEqual(a.read('sourceZoneClass(__k,10,300000)'),{state:'ready',kind:'rising',up:true});assert.equal(project(a,k).above.length,0);assert.equal(project(a,k).pendingSourceT,10*step);for(const [v,range,expected]of [[149,1,'normal'],[150,1,'rising'],[200,1,'climax'],[100,2,'climax'],[80,3,'climax']]){a.set('__k',prior().concat(bar(10,100,100+range,100+range,100,v)));assert.equal(a.read('sourceZoneClass(__k,10,300000).kind'),expected)}
 k.push(bar(11,98,99,99,97));const r=project(a,k);assert.equal(r.above.length,1);assert.equal(r.above[0].classification,'rising');assert.equal(r.above[0].processedAt,11*step);
 const doji=prior().concat(bar(10,100,100,101,99,200));a.set('__k',doji);assert.equal(a.read('sourceZoneClass(__k,10,300000).up'),false);a.exec('analyze(__k)');assert.equal(a.read('__k[10].up'),true);assert.equal(project(a,doji).issues['zero-body'],1);
 const flat=prior().map(b=>({...b,h:90,l:90,o:90,c:90})).concat(bar(10,90,90,90,90,100));a.set('__k',flat);assert.equal(a.read('sourceZoneClass(__k,10,300000).kind'),'normal');
});
test('golden body[100,104] shrinks to[103.5,104], provenance retained and source colors do not restrict either array',async()=>{
 const a=await openApp(),k=prior().concat(bar(10,104,100,107,99,200),bar(11,101,101,102,100.5),bar(12,103,103,103.5,102.5)),copy=JSON.stringify(k),r=project(a,k);
 assert.equal(r.above.length,1);assert.equal(r.below.length,1);assert.deepEqual(r.below[0].remaining,{lo:100,hi:100.5});assert.deepEqual(r.above[0].original,{lo:100,hi:104});assert.deepEqual(r.above[0].remaining,{lo:103.5,hi:104});assert.equal(r.above[0].sourceDirection,'down');assert.equal(JSON.stringify(k),copy);
 for(const up of [true,false]){const src=bar(10,up?100:104,up?104:100,107,99,200);const above=project(a,prior().concat(src,bar(11,98,98,99,97)));assert.equal(above.above.length,1);assert.equal(above.below.length,0);const below=project(a,prior().concat(src,bar(11,106,106,107,105)));assert.equal(below.below.length,1);assert.equal(below.above.length,0);assert.deepEqual(below.below[0].remaining,{lo:100,hi:104})}
});
test('strict near-boundary equality does not shrink; far equality/cross removes; below partials and multiple deletions are safe',async()=>{
 const a=await openApp(),z={sourceT:0,sourceDirection:'up',classification:'climax',original:{lo:100,hi:104},remaining:{lo:100,hi:104}};
 const run=(entries,c,dir,p=null)=>{a.set('__entries',entries);a.set('__c',c);a.set('__dir',dir);a.set('__p',p);return a.read('sourceZoneStep(__entries,__p,__c,__dir)')};
 assert.deepEqual(run([z],bar(1,99,99,100,98),'above')[0].remaining,{lo:100,hi:104});assert.deepEqual(run([z],bar(1,105,105,106,104),'below')[0].remaining,{lo:100,hi:104});
 assert.deepEqual(run([z],bar(1,102,102,103,101),'below')[0].remaining,{lo:100,hi:101});
 for(const dir of ['above','below'])for(const c of dir==='above'?[bar(1,102,103,104,101),bar(1,105,105,106,104)]:[bar(1,102,102,103,100),bar(1,98,98,99,97)])assert.deepEqual(run([z,z,z],c,dir),[]);
 const entries=Array.from({length:500},(_,i)=>({...z,sourceT:i,original:{lo:100,hi:i<2?104:210},remaining:{lo:100,hi:i<2?104:210}}));const capped=run(entries,bar(600,103,104,105,102),'above',{...z,sourceT:600});assert.equal(capped.length,497);assert.ok(!capped.some(v=>v.sourceT===499));assert.equal(entries.length,500);
});
test('warmup, missing/invalid/gapped history, zero references/volume/body never manufacture qualified strength',async()=>{
 const a=await openApp();assert.equal(project(a,[]).state,'unavailable');assert.equal(project(a,prior()).state,'warm-up');const zeros=prior().map(b=>({...b,v:0})).concat(bar(10,100,104,107,99,0));assert.equal(project(a,zeros).issues['zero-reference'],1);assert.equal(project(a,zeros).state,'zero-reference');assert.equal(project(a,zeros).above.length,0);
 const zeroVol=prior().concat(bar(10,100,104,107,99,0));assert.equal(project(a,zeroVol).issues['zero-volume'],1);
 for(const bad of [bar(11,100,101,102,99,NaN),{...bar(11,100,101,102,99),h:Infinity},bar(10,100,101,102,99)]){const r=project(a,prior().concat(bar(10,104,100,107,99,200),bad));assert.equal(r.issues['invalid-data'],1);assert.equal(r.above.length,0)}
 const gap=project(a,prior().concat(bar(10,104,100,107,99,200),bar(12,99,99,99,98)));assert.equal(gap.issues['history-gap'],1);assert.equal(gap.above.length,0);assert.equal(gap.state,'warm-up');
});
test('provisional cannot process the previous source; next closed does; time/hover/manual view reuse exact cached result',async()=>{
 const a=await openApp(),k=prior().concat(bar(10,104,100,107,99,200)),before=project(a,k);assert.deepEqual(project(a,k.concat(bar(11,105,105,106,104,20,false))),before);assert.equal(project(a,k.concat(bar(11,98,98,99,97))).above.length,1);
 a.set('__bars',k);a.exec('S.k=__bars;S.history=[];S.closedIndex=10;S.zoneView="source";draw()');const r=a.read('sourceZoneContext()'),n=a.read('SOURCE_ZONE_COMPUTATIONS');a.exec('S.mouse={x:20,y:20};S.off=9;S.price=[1,200];Date.now=()=>1e15;draw();sourceZoneContext()');assert.equal(a.read('SOURCE_ZONE_COMPUTATIONS'),n);assert.deepEqual(a.read('sourceZoneContext()'),r);
 a.exec('S.k.push({...S.k.at(-1),t:3300000,closed:false});sourceZoneContext()');assert.equal(a.read('SOURCE_ZONE_COMPUTATIONS'),n);a.exec('S.k[S.k.length-1]={...S.k.at(-1),closed:true};S.closedIndex++;sourceZoneContext()');assert.equal(a.read('SOURCE_ZONE_COMPUTATIONS'),n+1);
});
test('product/symbol/timeframe/epoch/history cache isolation; loading clears and stale response cannot restore old source context',async()=>{
 let release;const a=await openApp({respond:async r=>{if(new URL(r.url).hostname==='fapi.binance.com'&&new URL(r.url).pathname.endsWith('/time'))return new Promise(resolve=>release=()=>resolve({serverTime:Date.UTC(2026,10,1)}))}});
 a.exec('S.zoneView="source";sourceZoneContext()');let n=a.read('SOURCE_ZONE_COMPUTATIONS');for(const code of ['S.history=S.k.slice(0,1).map(b=>({...b,t:b.t-300000}))','S.sym="ETHUSDT"','S.tf="15m"','S.epoch++']){a.exec(code+';sourceZoneContext()');assert.equal(a.read('SOURCE_ZONE_COMPUTATIONS'),++n)}
 const old=a.sockets[0].onmessage;a.exec('selectMarketProduct("usdm")');await settle(a);assert.equal(a.read('sourceZoneContext().closed'),0);assert.equal(a.read('sourceZoneContext().context.product'),'usdm');old({data:JSON.stringify({s:'BTCUSDT',k:{s:'BTCUSDT',i:'5m',t:0,o:1,h:2,l:.5,c:1,v:1,x:true}})});assert.equal(a.read('sourceZoneContext().closed'),0);release?.();await settle(a);
});
test('exact0.4.22 archive; closed-study binding is explicit and unbound old seal rejects the new root',()=>{
 assert.equal(sha(fs.readFileSync(BASE)),'e037089b4044aff4fee18b696646126c53f024c155076daae3be96240d13dc16');const run=args=>spawnSync(process.execPath,args,{encoding:'utf8'});
 const unbound=run(['-e','require("./research/candidate-context/calculations.cjs").createCalculations([])']);
 const bound=run(['--require','./research/source-context/candidate-0.4.22.cjs','-e','const fs=require("fs"),c=require("crypto");console.log(c.createHash("sha256").update(fs.readFileSync("hybrid-terminal.html")).digest("hex"))']);assert.equal(bound.status,0,bound.stderr);assert.match(bound.stdout,/e037089b/);assert.match(bound.stderr,new RegExp(sha(fs.readFileSync('hybrid-terminal.html'))));assert.notEqual(sha(fs.readFileSync('hybrid-terminal.html')),sha(fs.readFileSync(BASE)));assert.notEqual(unbound.status,0);
});
test('only draw changes versus0.4.22; default Local raster, algorithms/plans/export/journal match, projection stays read-only',async()=>{
 const a=await openApp({nativeCanvas:true}),old=await openApp({file:BASE,nativeCanvas:true,localStorage:{...a.localStorage}}),names=[...fs.readFileSync(BASE,'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);assert.deepEqual(names.filter(n=>a.read(n+'.toString()')!==old.read(n+'.toString()')),['draw','updateBinaryBreakEven','updatePlanningCosts']);assert.deepEqual(engine(a),engine(old));assert.deepEqual(Buffer.from(a.nativeCanvas.toBuffer('image/png')),Buffer.from(old.nativeCanvas.toBuffer('image/png')));
 for(const data of [bars(),reflect(bars()),randomBars(313,200)]){const p=await openApp({file:BASE,bars:data}),n=await openApp({bars:data,localStorage:{...p.localStorage}});assert.deepEqual(engine(n),engine(p));const x=n.read('researchExport()'),y=p.read('researchExport()');for(const r of [x,y]){delete r.applicationVersion;delete r.exportedAt}assert.deepEqual(x,y)}
 const before=engine(a),stored={...a.localStorage},requests=a.requests.length;a.exec('calc=analyze=backtest=recordDecision=persistJournal=notify=()=>{throw Error("read-only view")};S.zoneView="source";for(let i=0;i<10;i++)draw()');assert.deepEqual(engine(a),before);assert.deepEqual(a.localStorage,stored);assert.equal(a.requests.length,requests);assert.equal(a.read('S.zoneView'),'source');
});
test('session-only selector never accesses storage; Local default and equivalent Help disclose guards, cap, delay and plan independence',async()=>{
 const storage=new Proxy({},{get(){throw Error('storage blocked')},set(){throw Error('storage blocked')}}),a=await openApp({localStorage:storage});assert.equal(a.read('S.zoneView'),'local');a.element('zoneview').onchange({target:{value:'source'}});await settle(a);assert.equal(a.read('S.zoneView'),'source');assert.equal(a.element('sourcezonecontext').hidden,false);assert.match(a.element('sourcezonestatus').textContent,/ABOVE/);a.element('zoneview').onchange({target:{value:'constructor'}});assert.equal(a.read('S.zoneView'),'source');a.element('zoneview').onchange({target:{value:'local'}});await settle(a);assert.equal(a.element('sourcezonecontext').hidden,true);
 const f=a.read('HELP_CONTENT.sections.flatMap(s=>s.facts).find(f=>f.id==="source-closed-zones")');for(const lang of ['he','en'])for(const word of ['Local','Source-derived closed','500','ABOVE','BELOW','TradingView','TP1/TP2'])assert.ok(f[lang].includes(word));
});
