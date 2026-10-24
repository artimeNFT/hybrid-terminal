'use strict';
const assert=require('node:assert/strict');
const {openApp,rows,steps}=require('./app-harness.cjs');
const {randomBars}=require('./regression.cjs');
const DAY=86400000,day=Math.floor(1700000000000/DAY)*DAY;
function daily(req){const u=new URL(req.url),from=+u.searchParams.get('startTime'),to=+u.searchParams.get('endTime');const out=[];for(let t=from;t<=to;t+=DAY)out.push([t,'100','110','90','100','1000',t+DAY-1]);return out}
const sample=randomBars(31,600).map((b,i)=>({...b,t:day+i*300000}));
(async()=>{
 const app=await openApp({bars:sample});
 const original=app.read('({signal:S.sig,bt:S.bt,journal:S.journal,classes:S.k.map(c=>c.cls)})');
 const journalBytes=app.localStorage['hybridTerminal.journal.v1'];
 for(const mode of ['accessible','standard','pvsra'])for(const body of ['filled','hollow']){
  app.element('palette').onchange({target:{value:mode}});app.element('body').onchange({target:{value:body}});
  for(const cls of [0,1,2])for(const [o,c] of [[100,105],[105,100],[100,100]]){
   app.set('__c',{o,c,h:108,l:98,cls,up:c<o,closed:true});app.drawCalls.length=0;app.exec('drawCandle(__c,200,14,p=>200-p)');
   const color=app.read('col(__c)'),fill=body==='hollow'&&c>o?'#131722':color;
   assert.ok(app.drawCalls.some(x=>x.method==='fillRect'&&x.color===fill));assert.ok(app.drawCalls.some(x=>x.method==='strokeRect'));
   assert.match(app.read('candleName(__c)'),c===o?/Doji/:c>o?/↑ Up/:/↓ Down/);
  }
 }
 await app.flush();assert.deepEqual(app.read('({signal:S.sig,bt:S.bt,journal:S.journal,classes:S.k.map(c=>c.cls)})'),original);
 assert.equal(app.localStorage['hybridTerminal.journal.v1'],journalBytes);
 const restored=await openApp({localStorage:app.localStorage,bars:sample});assert.equal(restored.read('S.body'),'hollow');assert.equal(restored.read('S.palette'),'pvsra');
 const v2=await openApp({localStorage:{'hybridTerminal.view.v2':JSON.stringify({schemaVersion:2,palette:'standard',zone:'UTC',volumeTags:true,otherSetting:'retain'})}});
 v2.element('body').onchange({target:{value:'hollow'}});assert.equal(v2.read('S.palette'),'standard');assert.equal(v2.read('S.zone'),'UTC');assert.equal(JSON.parse(v2.localStorage['hybridTerminal.view.v2']).otherSetting,'retain');
 const v1=await openApp({localStorage:{'hybridTerminal.view.v1':'{"palette":"pvsra","hollow":true,"zone":"UTC"}'}});assert.equal(v1.read('S.palette'),'pvsra');assert.equal(v1.read('S.body'),'hollow');
 console.log('PASS: 54 palette/body/class/direction cases, neutral doji, own OHLC despite conflicting cached direction, v1/v2 preferences, unrelated view fields and byte-identical journal across appearance changes.');

 app.element('pane').onchange({target:{value:'rsi'}});app.exec('draw()');
 app.set('__bars',sample.slice(0,20));assert.equal(app.read('rsiView(analyze(__bars),13)'),null);assert.equal(app.read('rsiView(analyze(__bars),14)'),app.read('analyze(__bars).rsi[14]'));
 app.exec('S.n=80;S.off=0;S.mouse={x:400,y:620};draw()');
 const expected=app.read('S.rsi[Math.floor(S.chartMetrics.start+400/S.chartMetrics.cw)]');assert.ok(app.drawCalls.some(c=>c.method==='fillText'&&c.args[0].startsWith('RSI14 '+expected.toFixed(2))));
 app.exec('goLive();S.mouse={x:800,y:620};draw()');assert.ok(app.drawCalls.some(c=>c.method==='fillText'&&/RSI14 No candle.*Unavailable/.test(c.args[0])));
 const before=app.read('({sig:S.sig,bt:S.bt,journal:S.journal})'),last=app.read('S.k.at(-1)');
 app.sockets[0].receive({...last,t:last.t+300000,o:last.c,c:last.c+1,h:last.h+2,l:last.l},false);await app.flush();
 app.exec('goLive();S.mouse=null;draw()');assert.ok(app.drawCalls.some(c=>c.method==='fillText'&&/RSI14.*Provisional/.test(c.args[0])));assert.deepEqual(app.read('({sig:S.sig,bt:S.bt,journal:S.journal})'),before);
 app.exec('S.mouse={x:450,y:650};zoomAt(.5,.8);panBars(-20);draw()');assert.ok(app.read('S.chartMetrics.rsiY.bottom>S.chartMetrics.rsiY.top'));
 for(const pane of ['none','volume','rsi']){app.element('pane').onchange({target:{value:pane}});await app.flush();assert.deepEqual(app.read('S.sig'),before.sig)}
 console.log('PASS: displayed RSI reuses the original RSI14 array, hides seed/warm-up, follows selected candle/pan/zoom/crosshair, marks developing values provisional, preserves closed signals/backtest/journal and retains Volume/None choices.');

 const piv=await openApp({bars:sample,respond:async req=>req.interval==='1d'?daily(req):undefined});piv.element('pivots').onclick();await piv.flush();
 assert.equal(piv.read('S.pivotStatus'),'ready');assert.deepEqual(piv.read(`pivotAt(${day})`),{pp:100,r1:110,s1:90,sourceStart:day-DAY,validFrom:day,validTo:day+DAY});
 assert.equal(piv.read(`pivotAt(${day-1})`),null);assert.equal(piv.read(`pivotAt(${day+DAY-1}).pp`),100);
 const p0=piv.read(`pivotAt(${day})`);piv.exec('S.zone="UTC";draw()');assert.deepEqual(piv.read(`pivotAt(${day})`),p0);
 const request=piv.requests.find(r=>r.interval==='1d'),url=new URL(request.url);assert.equal(+url.searchParams.get('startTime'),day-DAY);assert.equal(+url.searchParams.get('endTime')%DAY,DAY-1);
 assert.equal(piv.read('pivotAt(S.k.at(-1).t+UTC_DAY)'),null);
 // Incomplete slices and malformed daily close times are never accepted as a prior day.
 for(const bad of [req=>rows(sample.slice(0,12),steps['5m']),req=>daily(req).map(r=>r.map((v,i)=>i===6?v-1:v)),()=>[]]){
  const a=await openApp({bars:sample,respond:async req=>req.interval==='1d'?bad(req):undefined});a.element('pivots').onclick();await a.flush();assert.equal(a.read('S.pivotDays.size'),0);assert.match(a.read('S.pivotStatus'),/unavailable/)
 }
 const boundary=await openApp({bars:sample,respond:async req=>req.interval==='1d'?daily(req).map(r=>r[0]===day-DAY?r:[r[0],'110','120','100','110','1000',r[6]]):undefined});boundary.element('pivots').onclick();await boundary.flush();
 assert.equal(boundary.read(`pivotAt(${day+DAY-1}).pp`),100);assert.equal(boundary.read(`pivotAt(${day+DAY}).pp`),110);assert.equal(boundary.read(`pivotAt(${day}).sourceStart`),day-DAY);
 const missing=await openApp({bars:sample,respond:async req=>req.interval==='1d'?daily(req).filter(r=>r[0]!==day-DAY):undefined});missing.element('pivots').onclick();await missing.flush();assert.equal(missing.read(`pivotAt(${day})`),null);assert.equal(missing.read(`pivotAt(${day+DAY}).pp`),100);
 const noClock=await openApp({respond:async req=>req.url.endsWith('/time')?{}:undefined});noClock.element('pivots').onclick();await noClock.flush();assert.match(noClock.read('S.pivotStatus'),/clock unavailable/);assert.ok(!noClock.requests.some(r=>r.interval==='1d'));
 // Obsolete symbol, timeframe, and same-identity history-range responses cannot win a race.
 for(const change of ['S.sym="ETHUSDT";load()','S.tf="15m";load()','S.history=[{...S.k[0],t:S.k[0].t-1200*86400000}];refreshChart();refreshPivots()']){
  const pending=[];const a=await openApp({bars:sample,respond:async req=>req.interval==='1d'?new Promise(resolve=>pending.push({req,resolve})):undefined});a.element('pivots').onclick();await a.flush();assert.equal(pending.length,1);
  a.exec(change);await a.flush();assert.ok(pending.length>=2);const old=pending.shift();old.resolve(daily(old.req).map(r=>r.map((v,i)=>i===2?'999':v)));await a.flush();assert.equal(a.read('S.pivotDays.size'),0);
  while(pending.length){const p=pending.shift();p.resolve(daily(p.req));await a.flush()}
  assert.equal(a.read('S.pivotStatus'),'ready');assert.ok(a.read('[...S.pivotDays.values()].every(p=>p.pp===100)'));
  assert.ok(a.requests.filter(r=>r.interval==='1d').every(r=>daily(r).length<=1000));
 }
 // Stable historical values when tomorrow's source and validity period are appended.
 piv.set('__last',piv.read('S.k.at(-1)'));piv.exec('S.k.push({...__last,t:__last.t+86400000});S.clockOffset+=86400000;refreshPivots()');await piv.flush();assert.deepEqual(piv.read(`pivotAt(${day})`),p0);
 console.log('PASS: pivot 110/90/100 arithmetic, UTC boundaries/timezone invariance, separate complete daily source, missing/incomplete source rejection, stable history, <=1000-day pagination and obsolete symbol/timeframe/range response rejection.');

 // Run both the preserved baseline and the changed real backtest with a single signal fixture.
 for(const sh of [false,true]){
  for(const [file,gapExpected] of [['baseline/hybrid-terminal.0.3.1.html',-1],['hybrid-terminal.html',-2.5]]){
   const a=await openApp({file});a.set('__sh',sh);
   a.exec(`S.k=Array.from({length:65},(_,i)=>({t:i*300000,o:100,h:101,l:99,c:100,v:100,closed:true}));S.k[62]=__sh?{...S.k[62],o:105,h:106,l:104,c:105.5}:{...S.k[62],o:95,h:96,l:94,c:95.5};sigAt=i=>i===60?{side:__sh?'SHORT':'LONG',short:__sh,plan:{stop:__sh?102:98,tp1:__sh?91:109,tp2:__sh?90:110}}:{side:'WAIT'}`);
   assert.equal(a.read('backtest().N'),1);assert.equal(a.read('backtest().avg'),gapExpected-.05);
   if(gapExpected===-2.5){assert.equal(a.read('backtest().trades[0].grossR'),-2.5);assert.equal(a.read('backtest().trades[0].exit'),sh?105:95);assert.equal(a.read('backtest().executionVersion'),'ohlc-market-stop-v2-gap-open');
    a.exec('S.k[62]={...S.k[62],o:100,h:112,l:88,c:100}');assert.equal(a.read('backtest().trades[0].grossR'),-1);
    a.exec('S.k[61].o=__sh?103:97');assert.equal(a.read('backtest().N'),0);
   }
  }
 }
 // Prior journal records keep original versions and bytes when replayed under the new app.
 const old=await openApp({file:'baseline/hybrid-terminal.0.3.1.html'}),stored=JSON.parse(old.localStorage['hybridTerminal.journal.v1']).records;const upgraded=await openApp({localStorage:old.localStorage});for(const record of stored)assert.deepEqual(upgraded.read('S.journal.records').find(r=>r.id===record.id),record);assert.ok(upgraded.read('S.journal.records').some(r=>r.ruleVersion==='hybrid-v2-validity-closed'));
 console.log('PASS: real baseline reproduces both optimistic gap fills; new long/short gross -2.5R and net -2.55R, ordinary ambiguous bars stop first, invalid gap entries skipped, explicit execution version, old journal records preserved.');
 console.log('Scope: deterministic synthetic data and mocked DOM/network; browser/live-feed evidence is reported separately.');
})().catch(e=>{console.error(e);process.exitCode=1});
