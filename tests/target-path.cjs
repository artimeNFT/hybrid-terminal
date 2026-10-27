'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {openApp}=require('./app-harness.cjs'),{day,step,bars,dailyRows,isDaily,settle}=require('./target-path-fixtures.cjs');
async function live(options={}){return openApp({bars:bars(),respond:async req=>isDaily(req)?dailyRows(req.url):undefined,...options})}
async function enable(a){a.element('daylevels').onclick();a.element('pivots').onclick();await settle(a)}
const unchanged=a=>a.read('({sig:S.sig,bt:S.bt,journal:localStorage[JOURNAL_KEY]})');

test('directional geometry sorts LONG/SHORT, groups exact equality, keeps rounded-near prices distinct and excludes endpoints',async()=>{
 const a=await live(),levels=[['ENTRY',100],['A',101],['B',105],['D',105],['C',105.000000001],['F',109],['TP2',110],['OUT',111],['BEHIND',90],['BAD',NaN]].map(([name,value])=>({name,value}));
 a.set('__levels',levels);let v=a.read('targetPathGeometry({entry:100,tp1:105,tp2:110,stop:98},2,__levels)');
 assert.equal(v.state,'ready');assert.deepEqual(v.levels.map(x=>x.price),[101,105,105.000000001,109]);assert.deepEqual(v.levels[1].names,['B','D']);assert.deepEqual(v.levels.map(x=>x.position),['before-tp1','at-tp1','after-tp1','after-tp1']);assert.deepEqual(v.endpoints.map(x=>x.position),['entry','tp2']);assert.equal(v.outside.length,2);assert.equal(v.levels[0].percent,1);assert.equal(v.levels[0].atr,.5);assert.equal(v.levels[0].r,.5);
 assert.notEqual(a.read('dayPrice(105)'),a.read('dayPrice(105.000000001)'));
 a.set('__display',{...a.read('confirmedTargetPath()'),...v});const rendered=a.exec('targetPathHTML(__display)');assert.ok(rendered.includes('B / D · 105'));assert.ok(rendered.includes('C · 105.00 · ערכים נפרדים'));assert.ok(rendered.includes('title="105.000000001"'));assert.ok(rendered.includes('data-path-price="105.000000001"'));assert.equal((rendered.match(/data-path-price=/g)||[]).length,4);
 a.set('__levels',levels.map(x=>({...x,value:200-x.value})));v=a.read('targetPathGeometry({entry:100,tp1:95,tp2:90,stop:102},2,__levels)');assert.equal(v.direction,'SHORT');assert.deepEqual(v.levels.map(x=>x.names),[['A'],['B','D'],['C'],['F']]);assert.deepEqual(v.levels.map(x=>x.position),['before-tp1','at-tp1','after-tp1','after-tp1']);assert.equal(v.levels[0].percent,1);
});
test('invalid geometry and levels stay unavailable; invalid denominators affect only their own distance metrics',async()=>{
 const a=await live();for(const plan of ['null','{}','{entry:100,tp2:100}','{entry:0,tp2:110}','{entry:100,tp2:Infinity}'])assert.equal(a.read('targetPathGeometry('+plan+',2,[]).state'),'unavailable');
 assert.deepEqual(a.read('targetPathDistances(100,102,0,99)'),{distance:2,percent:2,atr:null,r:2});assert.deepEqual(a.read('targetPathDistances(100,102,2,100)'),{distance:2,percent:2,atr:1,r:null});assert.deepEqual(a.read('targetPathDistances(0,2,2,-2)'),{distance:2,percent:null,atr:1,r:1});
 for(const value of ['null','NaN','Infinity']){assert.equal(a.read('targetPathDistances(100,102,'+value+',99).atr'),null);assert.equal(a.read('targetPathDistances(100,102,2,'+value+').r'),null)}
 assert.equal(a.read('targetPathGeometry({entry:100,tp2:110},2,[null,{name:"x",value:NaN},{name:"z",value:0},{}]).levels.length'),0);
 assert.equal(a.read('targetPathGeometry({entry:100,tp2:110},2,null).levels.length'),0);
 assert.equal(a.read('targetPathGeometry({entry:100,tp1:null,tp2:110,stop:100},2,[{name:"A",value:105}]).levels[0].position'),'tp1-unavailable');
});
test('confirmed sources obey independent layers, full UTC coverage, availability and validated daily identity without changing decisions',async()=>{
 const a=await live();assert.equal(a.read('S.sig.side'),'LONG');const before=unchanged(a);await enable(a);let v=a.read('confirmedTargetPath()');assert.equal(v.state,'ready');assert.equal(v.sources.filter(x=>x.status==='available').length,8);assert.ok(v.endpoints.some(x=>x.names.includes('PDH')&&x.names.includes('R1')));assert.ok(v.levels.some(x=>x.position==='at-tp1'&&x.names.includes('PDL')&&x.names.includes('S1')));assert.deepEqual(unchanged(a),before);
 const count=a.requests.length;a.exec('confirmedTargetPath();confirmedTargetPath()');assert.equal(a.requests.length,count);
 a.set('__goodKey',a.read('S.pivotKey'));a.exec('S.pivotKey="1|SOLUSDT|5m|stale"');assert.equal(a.read('confirmedTargetPath().anchor.daily'),null);a.exec('S.pivotKey=__goodKey');
 a.exec('S.dayCoverage[S.closedIndex]="partial-first-day"');v=a.read('confirmedTargetPath()');assert.equal(v.sources.find(x=>x.name==='UTC VWAP').status,'partial');assert.ok(!v.levels.some(x=>x.names.includes('UTC VWAP')));assert.match(a.exec('targetPathHTML(confirmedTargetPath())'),/כיסוי יום UTC חלקי/);
 a.exec('S.e[2][S.closedIndex]=null');assert.equal(a.read('confirmedTargetPath().sources.find(x=>x.name==="EMA200").status'),'unavailable');
 a.exec('dailyAt(confirmedAsOf()).validFrom-=86400000');v=a.read('confirmedTargetPath()');assert.equal(v.anchor.daily,null);assert.ok(v.sources.slice(0,5).every(x=>x.status==='unavailable'));
 a.exec('S.l.e=0;S.dayLevels=false;S.pivots=false');v=a.read('confirmedTargetPath()');assert.ok(v.sources.every(x=>x.status==='disabled'));assert.equal(v.levels.length,0);assert.match(a.exec('targetPathHTML(confirmedTargetPath())'),/מידע חסר אינו היעדר רמות/);assert.deepEqual(unchanged(a),before);
});
test('anchor and distances remain confirmed through provisional ticks, pointer/view/history changes; WAIT and mismatched entries have no substitute',async()=>{
 const a=await live();await enable(a);const before=unchanged(a),v=a.read('confirmedTargetPath()');const b=bars().at(-1);a.sockets[0].receive({...b,t:b.t+step,o:b.c,c:104,h:106,l:94},false);await settle(a);assert.deepEqual(a.read('confirmedTargetPath()'),v);assert.deepEqual(unchanged(a),before);
 a.exec('S.mouse={x:100,y:120};S.off=37;S.follow=false;S.price=[80,120];sched()');await settle(a);assert.deepEqual(a.read('confirmedTargetPath()'),v);
 a.exec('S.history=[{...S.k[0],t:S.k[0].t-86400000}];refreshChart()');await a.exec('refreshPivots()');await settle(a);assert.deepEqual(a.read('confirmedTargetPath()'),v);assert.deepEqual(unchanged(a),before);
 a.exec('S.sig.side="WAIT";S.panelKey=null;panel()');assert.equal(a.read('confirmedTargetPath().state'),'unavailable');assert.ok(!a.element('pn').innerHTML.includes('data-target-path'));
 a.exec('S.sig.side="LONG";S.sig.plan.entry++');assert.equal(a.read('confirmedTargetPath().state'),'unavailable');
});
test('missing clock/daily response stays excluded, while stale symbol/timeframe responses cannot publish path sources',async()=>{
 const noClock=await live({respond:async req=>req.url.endsWith('/time')?{}:isDaily(req)?dailyRows(req.url):undefined});noClock.sockets[0].receive(bars().at(-1),true);await settle(noClock);await enable(noClock);assert.ok(noClock.read('confirmedTargetPath().sources.slice(0,5).every(x=>x.status==="unavailable")'));
 const missing=await live({respond:async req=>isDaily(req)?[]:undefined});await enable(missing);assert.ok(missing.read('confirmedTargetPath().sources.slice(0,5).every(x=>x.status==="unavailable")'));
 for(const change of ['S.sym="ETHUSDT";load()','S.tf="15m";load()']){
  const pending=[];const a=await live({respond:async req=>isDaily(req)?new Promise(resolve=>pending.push({req,resolve})):req.interval==='15m'?bars(96,900000).map(b=>[b.t,''+b.o,''+b.h,''+b.l,''+b.c,''+b.v,b.t+900000-1]):undefined});a.element('daylevels').onclick();await settle(a);assert.equal(pending.length,1);a.state.serverNow=day+500*900000+1;a.exec(change);await settle(a);assert.ok(pending.length>=2);
  const old=pending.shift();old.resolve(dailyRows(old.req.url).map(row=>row.map((v,i)=>i===2?'999':v)));await settle(a);assert.equal(a.read('S.pivotDays.size'),0);let v=a.read('confirmedTargetPath()');assert.equal(v.anchor.daily,null);assert.equal(v.sources[0].status,'loading');
  for(const item of pending.splice(0)){item.resolve(dailyRows(item.req.url));await settle(a)}v=a.read('confirmedTargetPath()');assert.equal(v.sources[0].status,'available');assert.equal(v.anchor.symbol,a.read('S.sym'));assert.equal(v.anchor.timeframe,a.read('S.tf'));assert.ok(!v.sources.some(s=>s.value===999));
 }
});
test('all pre-existing 0.4.4 calculation function bodies and legacy journal bytes remain unchanged',async()=>{
 const old=await openApp({file:'baseline/hybrid-terminal.0.4.4.html',bars:bars()}),stored=old.localStorage['hybridTerminal.journal.v1'],a=await live({localStorage:old.localStorage});const fs=require('node:fs'),names=[...fs.readFileSync('baseline/hybrid-terminal.0.4.4.html','utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m=>m[1]);
 for(const name of names.filter(n=>![...require('./chart-usability-fixtures.cjs').changedView,'panel','draw','dailyLabelLayout','loadDisplayPrefs','saveDisplayPrefs','bindSystem','refreshPivots','dailyContextHTML','updateLegend','chartGeometry','bindChart','endChartDrag'].includes(n)))assert.equal(a.read(name+'.toString()'),old.read(name+'.toString()'),name);
 await enable(a);a.exec('S.l.e=0;S.panelKey=null;panel()');assert.equal(a.localStorage['hybridTerminal.journal.v1'],stored);assert.deepEqual(a.read('S.sig'),old.read('S.sig'));assert.deepEqual(a.read('S.bt'),old.read('S.bt'));
});
