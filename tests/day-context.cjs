'use strict';
const assert=require('node:assert/strict');
const {openApp,rows,steps}=require('./app-harness.cjs');
const {randomBars}=require('./regression.cjs');
const DAY=86400000,day=Date.UTC(2026,9,20),step=300000;
const bars=count=>randomBars(28,count).map((b,i)=>({...b,t:day+i*step}));
const isDaily=req=>req.interval==='1d'&&new URL(req.url).searchParams.has('startTime');
function daily(req,vary=false){const u=new URL(req.url),from=+u.searchParams.get('startTime'),to=+u.searchParams.get('endTime'),out=[];for(let t=from;t<=to;t+=DAY){const next=vary&&t>=day;out.push([t,'100',next?'130':'110',next?'100':'90',next?'120':'100','1000',t+DAY-1])}return out}
const tick=async a=>{await a.flush();await a.flush()};
const enable=async(a,id='daylevels')=>{a.element(id).onclick();await tick(a)};
const frozen=a=>a.read('({sig:S.sig,bt:S.bt,journal:S.journal,stored:localStorage[JOURNAL_KEY],rule:RULE_VERSION,execution:EXECUTION_VERSION})');
(async()=>{
 const a=await openApp({bars:bars(400),respond:async req=>isDaily(req)?daily(req,true):undefined});const prior=frozen(a);await enable(a);
 assert.equal(a.read('S.dayLevels'),true);assert.equal(a.read('S.pivots'),false);assert.equal(a.read('dailyAt('+day+').pdh'),110);assert.equal(a.read('dailyAt('+day+').pdl'),90);
 assert.equal(a.read(`dailyAt(${day+DAY-1}).pdh`),110);assert.equal(a.read(`dailyAt(${day+DAY}).pdh`),130);assert.equal(a.read(`dailyAt(${day+DAY}).pdl`),100);assert.equal(a.read(`dailyAt(${day-1})`),null);
 let c=a.read('nearestDayContext()');assert.equal(c.asOf,day+400*step);assert.equal(c.validFrom,day+DAY);assert.equal(c.sourceStart,day);assert.equal(c.validTo,day+2*DAY);assert.equal(c.state,'ready');assert.deepEqual(frozen(a),prior);
 const count=a.requests.filter(isDaily).length;await enable(a,'pivots');assert.equal(a.requests.filter(isDaily).length,count);assert.equal(a.read('S.pivots'),true);await enable(a,'daylevels');assert.equal(a.read('S.dayLevels'),false);assert.equal(a.read('nearestDayContext().state'),'ready');await enable(a,'pivots');assert.equal(a.read('nearestDayContext().state'),'disabled');await enable(a,'daylevels');assert.equal(a.requests.filter(isDaily).length,count);assert.deepEqual(frozen(a),prior);
 a.exec('S.mouse={x:100,y:100};panBars(-10000);draw()');assert.deepEqual(a.read('nearestDayContext()'),c);assert.ok(a.read('S.chartMetrics.dailySegments').every(s=>s.validFrom===day));assert.ok(a.read('S.chartMetrics.dailyLabels').every(s=>s.validFrom===day));assert.match(a.element('contextstatus').textContent,/2026-10-19/);assert.match(a.element('levelcontext').innerHTML,/2026-10-20/);
 const auto=a.read('visiblePrices()');a.exec(`S.pivotDays.set(${day},{...S.pivotDays.get(${day}),pdh:100000});draw()`);assert.deepEqual(a.read('visiblePrices()'),auto);assert.ok(!a.read('S.chartMetrics.dailyLabels').some(q=>q.names.includes('PDH')));
 a.exec('S.zone="UTC"');assert.equal(a.read('nearestDayContext().asOf'),c.asOf);assert.deepEqual(frozen(a),prior);
 const prefs=await openApp({localStorage:{'hybridTerminal.view.v2':'{"schemaVersion":2,"palette":"pvsra","body":"hollow","pane":"rsi","pivots":true,"dayLevels":false,"zone":"UTC","other":19}'}});await enable(prefs);const restored=await openApp({localStorage:prefs.localStorage});assert.deepEqual(restored.read('[S.palette,S.body,S.pane,S.pivots,S.dayLevels,S.zone]'),['pvsra','hollow','rsi',true,true,'UTC']);assert.equal(JSON.parse(prefs.localStorage['hybridTerminal.view.v2']).other,19);
 console.log('PASS: known/distinct PDH/PDL periods, [from,to) boundaries, independent toggles and cache reuse, preserved preferences, historical chart versus frozen current context, no autoscale distortion and unchanged signal/backtest/journal bytes.');

 a.set('__levels',[{name:'PDH',value:110},{name:'PDL',value:90},{name:'PP',value:100},{name:'R1',value:110},{name:'S1',value:90}]);
 const equal=a.read('nearestLevels(__levels,100,2)');assert.deepEqual(equal.above,{names:['PDH','R1'],price:110,distance:10,percent:10,atr:5});assert.deepEqual(equal.below,{names:['PDL','S1'],price:90,distance:10,percent:10,atr:5});assert.deepEqual(equal.equal,{names:['PP'],price:100,distance:0,percent:0,atr:0});
 const between=a.read('nearestLevels(__levels,105,2)');assert.equal(between.below.price,100);assert.equal(between.above.price,110);assert.equal(between.equal,null);assert.ok(Math.abs(between.above.percent-4.761904761904762)<1e-12);
 assert.equal(a.read('nearestLevels(__levels,110,0).above'),null);assert.equal(a.read('nearestLevels(__levels,90,null).below'),null);assert.equal(a.read('nearestLevels(__levels,100,0).equal.atr'),null);
 for(const bad of [0,NaN,Infinity]){a.set('__price',bad);assert.deepEqual(a.read('nearestLevels(__levels,__price,2)'),{above:null,below:null,equal:null})}
 a.exec('S.atr[S.closedIndex]=0;S.levelContextKey=null;updateLevelContext()');assert.ok(!JSON.stringify(a.read('nearestDayContext()')).includes('Infinity'));assert.ok(a.element('levelcontext').innerHTML.includes('לא זמין'));
 // Deliberately collide all five lines; labels must merge deterministically and remain inside the plot.
 a.set('__closeLevels',['PDH','PDL','PP','R1','S1'].map((name,i)=>({name,value:100+i*.00001,color:'#fff'})));
 const layout=a.read('dailyLabelLayout(__closeLevels,304,240,0,304,p=>200-(p-100)*50)');assert.equal(layout.labels.length,1);assert.equal(layout.labels[0].names.length,5);assert.ok(layout.labels[0].x>=0&&layout.labels[0].x+layout.labels[0].width<=304);assert.equal(layout.overflow,true);assert.deepEqual(a.read('dailyLabelLayout(__closeLevels,304,240,0,304,p=>200-(p-100)*50)'),layout);
 const tinyLayout=a.read('dailyLabelLayout(__closeLevels,100,160,0,77,p=>78)');assert.ok(tinyLayout.labels.every(q=>q.y>=65&&q.x+q.width<=100));
 console.log('PASS: exact nearest above/below/equal grouping, missing sides, finite positive price/ATR denominators and deterministic merged/overflow label placement.');

 // Complete-day validation and explicit unavailable states.
 for(const makeBad of [()=>[],req=>daily(req).map(r=>r.map((v,i)=>i===6?v-1:v)),req=>{const d=daily(req);return[d[0],d[0]]},req=>rows(bars(12),step),req=>daily(req).map(r=>r.map((v,i)=>i===2?'NaN':v)),req=>daily(req).reverse()]){
  const b=await openApp({bars:bars(600),respond:async req=>isDaily(req)?makeBad(req):undefined});await enable(b);assert.equal(b.read('S.pivotDays.size'),0);assert.equal(b.read('nearestDayContext().state'),'unavailable');assert.match(b.read('S.pivotStatus'),/unavailable/);
 }
 const noClock=await openApp({bars:bars(100),respond:async req=>req.url.endsWith('/time')?{}:undefined});await enable(noClock);assert.equal(noClock.read('nearestDayContext().state'),'unavailable');assert.ok(!noClock.requests.some(isDaily));
 const missing=await openApp({bars:bars(400),respond:async req=>isDaily(req)?daily(req).filter(r=>r[0]!==day):undefined});await enable(missing);assert.equal(missing.read(`dailyAt(${day+DAY})`),null);assert.equal(missing.read('nearestDayContext().sourceStart'),null);assert.equal(missing.read('nearestDayContext().state'),'unavailable');
 const failed=await openApp({bars:bars(100),respond:async req=>{if(isDaily(req))throw Error('injected failure')}});await enable(failed);assert.equal(failed.read('nearestDayContext().state'),'unavailable');const failedCount=failed.requests.filter(isDaily).length;await failed.exec('refreshPivots()');assert.equal(failed.requests.filter(isDaily).length,failedCount);
 console.log('PASS: incomplete/truncated/invalid/duplicate/out-of-order/failed/missing daily source and missing trusted clock stay unavailable; failures use bounded retry instead of update-driven request floods.');

 // The 23:55 bar closes at exact midnight before a new opening bar arrives.
 let resolveMidnight,midnightReq;const source=bars(288),midnight=day+DAY;
 const mid=await openApp({bars:source,serverNow:midnight-1000,respond:async req=>{if(isDaily(req)){if(+new URL(req.url).searchParams.get('startTime')===day){midnightReq=req;return new Promise(resolve=>{resolveMidnight=resolve})}return daily(req,true)}}});
 await enable(mid);assert.equal(mid.read('nearestDayContext().validFrom'),day);assert.equal(mid.read('S.closedIndex'),286);mid.set('__midnight',midnight);mid.exec('S.clockOffset=__midnight-Date.now()');mid.sockets[0].receive(source.at(-1),true);await tick(mid);
 assert.equal(mid.read('S.k.at(-1).t'),midnight-step);assert.equal(mid.read('nearestDayContext().asOf'),midnight);assert.equal(mid.read('nearestDayContext().state'),'loading');assert.equal(mid.read('nearestDayContext().sourceStart'),null);assert.equal(mid.read(`dailyAt(${midnight})`),null);assert.equal(+new URL(midnightReq.url).searchParams.get('endTime'),midnight-1);
 const confirmed=frozen(mid);resolveMidnight(daily(midnightReq,true));await tick(mid);assert.deepEqual(frozen(mid),confirmed);assert.equal(mid.read('nearestDayContext().state'),'ready');assert.equal(mid.read('nearestDayContext().sourceStart'),day);assert.equal(mid.read(`dailyAt(${midnight}).pdh`),130);assert.equal(mid.read(`dailyAt(${midnight-1}).pdh`),110);
 mid.sockets[0].receive({...source.at(-1),t:midnight,o:100,c:120,h:121,l:99},false);await tick(mid);assert.deepEqual(frozen(mid),confirmed);assert.equal(mid.read('nearestDayContext().asOf'),midnight);assert.equal(mid.read('nearestDayContext().price'),source.at(-1).c);
 // Server-clock lag cannot authorize an unfinished source; a later tick re-evaluates the range.
 const lag=await openApp({bars:source,serverNow:midnight-1000,respond:async req=>isDaily(req)?daily(req,true):undefined});await enable(lag);lag.sockets[0].receive(source.at(-1),true);await tick(lag);assert.equal(lag.read('nearestDayContext().state'),'unavailable');lag.set('__midnight',midnight);lag.exec('S.clockOffset=__midnight-Date.now()');await lag.exec('refreshPivots()');assert.equal(lag.read('nearestDayContext().state'),'ready');
 console.log('PASS: exact midnight close advances context before the next opening-bar update, delayed sources are unknown until validated, trusted clock lag is conservative, and late completion/provisional updates preserve frozen decisions/backtest/journal.');

 // Shared pending request, independent consumers and all-off/reenable race.
 const queue=[];const shared=await openApp({bars:bars(100),respond:async req=>isDaily(req)?new Promise(resolve=>queue.push({req,resolve})):undefined});await enable(shared);await enable(shared,'pivots');assert.equal(queue.length,1);await enable(shared);assert.equal(shared.read('S.pivots'),true);queue[0].resolve(daily(queue[0].req));await tick(shared);assert.equal(shared.read('S.pivotStatus'),'ready');assert.ok(shared.read('enabledDailyLevels(dailyAt(S.k.at(-1).t))').every(q=>['PP','R1','S1'].includes(q.name)));
 const raceQ=[];const race=await openApp({bars:bars(100),respond:async req=>isDaily(req)?new Promise(resolve=>raceQ.push({req,resolve})):undefined});await enable(race);await enable(race);await enable(race);assert.equal(raceQ.length,2);raceQ[0].resolve(daily(raceQ[0].req).map(r=>r.map((v,i)=>i===2?'999':v)));await tick(race);assert.equal(race.read('S.pivotDays.size'),0);raceQ[1].resolve(daily(raceQ[1].req));await tick(race);assert.equal(race.read(`dailyAt(${day}).pdh`),110);
 for(const change of ['S.sym="ETHUSDT";load()','S.tf="15m";load()','S.history=[{...S.k[0],t:S.k[0].t-1200*86400000}];refreshChart();refreshPivots()']){
  const pending=[];const r=await openApp({bars:bars(100),respond:async req=>isDaily(req)?new Promise(resolve=>pending.push({req,resolve})):undefined});await enable(r);r.exec(change);await tick(r);assert.ok(pending.length>=2);const obsolete=pending.shift();obsolete.resolve(daily(obsolete.req).map(row=>row.map((v,i)=>i===2?'999':v)));await tick(r);assert.equal(r.read('S.pivotDays.size'),0);
  while(pending.length){const item=pending.shift();assert.ok(daily(item.req).length<=1000);item.resolve(daily(item.req));await tick(r)}assert.equal(r.read('S.pivotStatus'),'ready');assert.ok(r.read('[...S.pivotDays.values()].every(p=>p.pdh===110)'));
 }
 // Cache extension requests missing days only; a new consumer does not refetch existing days.
 const cache=await openApp({bars:bars(100),respond:async req=>isDaily(req)?daily(req):undefined});await enable(cache);const before=cache.requests.filter(isDaily);cache.exec('S.history=[{...S.k[0],t:S.k[0].t-1200*86400000}];refreshChart()');await cache.exec('refreshPivots()');assert.equal(cache.requests.filter(isDaily).length-before.length,2);await enable(cache,'pivots');assert.equal(cache.requests.filter(isDaily).length-before.length,2);
 const atomic=await openApp({bars:bars(100),respond:async req=>{if(isDaily(req)){const result=daily(req);return result.length<1000?result.map(r=>r.map((v,i)=>i===6?v-1:v)):result}}});atomic.exec('S.history=[{...S.k[0],t:S.k[0].t-1200*86400000}];refreshChart()');await enable(atomic);assert.equal(atomic.read('S.pivotDays.size'),0);assert.equal(atomic.read('S.dailyCoverage.length'),0);assert.equal(atomic.read('nearestDayContext().state'),'unavailable');
 console.log('PASS: one shared in-flight/cache path, independent layer rendering, all-off/reenable guards, obsolete asset/timeframe/range rejection and <=1000-day missing-range pagination.');

 // New context must not alter legacy versions, stored observations or ordinary engine results.
 const data=bars(240),old=await openApp({bars:data,file:'baseline/hybrid-terminal.0.4.1.html'}),storage=old.localStorage,oldBytes=storage['hybridTerminal.journal.v1'];const upgraded=await openApp({bars:data,localStorage:storage,respond:async req=>isDaily(req)?daily(req):undefined});assert.equal(storage['hybridTerminal.journal.v1'],oldBytes);assert.deepEqual(upgraded.read('S.sig'),old.read('S.sig'));assert.deepEqual(upgraded.read('S.bt'),old.read('S.bt'));
 await enable(upgraded);await enable(upgraded,'pivots');assert.equal(storage['hybridTerminal.journal.v1'],oldBytes);assert.deepEqual(upgraded.read('S.sig'),old.read('S.sig'));assert.deepEqual(upgraded.read('S.bt'),old.read('S.bt'));assert.equal(upgraded.read('RULE_VERSION'),'hybrid-v2-validity-closed');assert.equal(upgraded.read('EXECUTION_VERSION'),'ohlc-market-stop-v2-gap-open');
 const zone=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jerusalem',timeZoneName:'longOffset'});assert.match(zone.format(new Date('2026-10-24T00:00:00Z')),/GMT\+03:00/);assert.match(zone.format(new Date('2026-10-25T00:00:00Z')),/GMT\+02:00/);
 console.log('PASS: exact 0.4.1 signal/backtest/journal upgrade preservation, unchanged rule/execution versions, no context-induced journal write, and IANA Jerusalem DST-aware observation labels.');
 console.log('Scope: deterministic synthetic/mocked data and DOM; no claim of an observed live UTC-midnight transition or long-session soak.');
})().catch(e=>{console.error(e);process.exitCode=1});
