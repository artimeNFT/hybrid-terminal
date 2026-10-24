'use strict';
const assert=require('node:assert/strict');
const {openApp,steps}=require('./app-harness.cjs');
const {replacementFixture,randomBars}=require('./regression.cjs');
const fs=require('node:fs'),path=require('node:path');
const rgb=hex=>hex.match(/\w\w/g).map(h=>parseInt(h,16));
const light=color=>color.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const l=[light(a),light(b)].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05)};
const blend=(base,over,alpha)=>base.map((v,i)=>v*(1-alpha)+over[i]*alpha);
(async()=>{
 const html=fs.readFileSync(path.resolve(__dirname,'../hybrid-terminal.html'),'utf8');
 const chartChrome=html.slice(html.indexOf('<header>'),html.indexOf('<aside'));
 assert.doesNotMatch(chartChrome,/[\u0590-\u05ff]/);
 assert.ok(html.indexOf('id="palette"')<html.indexOf('id="displaysettings" hidden'),'candle modes must be visible without opening Display');
 assert.doesNotMatch(html,/id="hollow"/);
 const app=await openApp(),base=rgb('131722'),backgrounds=[base,blend(base,[38,217,127],.045),blend(base,[255,77,94],.045),blend(blend(base,[38,217,127],.045),[255,77,94],.045)];
 const palettes=app.read('PALETTES');let minimum=Infinity;
 for(const colors of Object.values(palettes))for(const hex of Object.values(colors))for(const bg of backgrounds){const c=ratio(rgb(hex.slice(1)),bg);minimum=Math.min(minimum,c);assert.ok(c>=3,`${hex} contrast ${c}`)}
 const originalSignal=app.read('S.sig'),count=app.read('S.journal.records.length');
 assert.equal(app.read('S.palette'),'accessible');assert.equal(app.read('S.volumeTags'),false);
 for(const mode of ['standard','pvsra','accessible']){
  app.element('palette').onchange({target:{value:mode}});await app.flush();
  assert.deepEqual(app.read('S.sig'),originalSignal);assert.equal(app.read('S.journal.records.length'),count);
  // Direction must use this candle's own open/close, including gaps and conflicting cached annotations.
  for(const cls of [0,1,2])for(const [o,c,side] of [[100,105,'up'],[105,100,'down'],[100,100,'flat']]){
   app.set('__candle',{o,c,h:108,l:98,cls,up:c<o,closed:true});app.drawCalls.length=0;
   app.exec('drawCandle(__candle,200,14,p=>200-p)');
   const expected=side==='flat'?palettes[mode].flat:mode==='pvsra'&&cls>0?palettes[mode][(cls===2?'vector':'rising')+(side==='up'?'Up':'Down')]:palettes[mode][side];
   assert.equal(app.read('col(__candle)'),expected);
   assert.ok(app.drawCalls.some(call=>call.method==='fillRect'&&call.color===expected));
   assert.ok(!app.drawCalls.some(call=>call.method==='fillRect'&&call.color==='#131722'));
  }
 }
 app.element('volumetags').onchange({target:{checked:true}});await app.flush();
 assert.deepEqual(app.read('S.sig'),originalSignal);assert.equal(app.read('S.journal.records.length'),count);
 assert.equal(app.read('S.palette'),'accessible');assert.equal(app.read('S.volumeTags'),true);assert.match(app.element('candlelegend').innerHTML,/◆/);
 const restored=await openApp({localStorage:app.localStorage});assert.equal(restored.read('S.palette'),'accessible');assert.equal(restored.read('S.volumeTags'),true);
 const legacy=await openApp({localStorage:{'hybridTerminal.view.v1':'{"palette":"pvsra","hollow":true,"zone":"UTC"}'}});
 assert.equal(legacy.read('S.palette'),'pvsra');assert.equal(legacy.read('S.body'),'hollow');assert.equal(legacy.read('S.volumeTags'),false);assert.equal(legacy.read('S.zone'),'UTC');
 const unknown=await openApp({localStorage:{'hybridTerminal.view.v2':'{"schemaVersion":2,"palette":"constructor"}'}});assert.equal(unknown.read('S.palette'),'accessible');
 app.set('__zero',replacementFixture().map(b=>({...b,v:0})));assert.ok(app.read('analyze(__zero).vw.every(v=>v===null)'));
 app.exec('draw()');
 for(const id of ['st','candlelegend','inspect','chartmeta','candlebadge','historynote','autoscale','historybtn'])assert.doesNotMatch(app.element(id).textContent+app.element(id).innerHTML,/[\u0590-\u05ff]/,id);
 assert.ok(app.drawCalls.filter(call=>call.method==='fillText').every(call=>!/[\u0590-\u05ff]/.test(call.args[0])));
 console.log(`PASS: all three palettes meet >=3:1 against modeled chart backgrounds (minimum ${minimum.toFixed(2)}:1); default bodies are filled, own-bar direction is stable across volume classes, legacy settings migrate, display choices preserve decisions, and chart/header text is English.`);

 const b=app.read('S.k[S.k.length-1]');app.sockets[0].receive(b,true);await app.flush();assert.equal(app.read('feedHealth().ready'),true);
 app.exec('S.lastMessageAt=Date.now()-16000;panel()');assert.equal(app.read('feedHealth().ready'),false);assert.match(app.element('systemstatus').innerHTML,/אינם עדכניים/);
 app.exec('navigator.onLine=false;panel()');assert.match(app.element('systemstatus').innerHTML,/אין חיבור/);
 app.exec('navigator.onLine=true');const generation=app.read('S.epoch');app.handlers.visibilitychange();await app.flush();assert.ok(app.read('S.epoch')>generation);
 const timed=await openApp({respond:async req=>{if(req.interval==='5m')return new Promise((resolve,reject)=>req.signal.addEventListener('abort',()=>reject(Object.assign(Error('aborted'),{name:'AbortError'})),{once:true}))}});
 const pending=[...timed.timers.values()].find(t=>t.delay===12000);assert.ok(pending);pending.fn();await timed.flush();assert.equal(timed.read('S.phase'),'error');assert.equal(timed.read('S.k.length'),0);
 console.log('PASS: delayed/stale and offline feeds are visibly identified; returning to a stale tab resynchronizes; a hanging REST request reaches an explicit timeout error.');

 const bars=replacementFixture(),storage={},journal=await openApp({localStorage:storage});const initial=journal.read('journalExport()');assert.equal(initial.records.length,1);
 journal.sockets[0].receive(bars[94],false);await journal.flush();assert.equal(journal.read('S.journal.records.length'),1);
 journal.sockets[0].receive(bars[94],true);await journal.flush();assert.equal(journal.read('S.journal.records.length'),2);
 journal.sockets[0].receive(bars[94],true);await journal.flush();assert.equal(journal.read('S.journal.records.length'),2);
 const reopened=await openApp({localStorage:storage});assert.equal(reopened.read('S.journal.records.length'),2);assert.deepEqual(reopened.read('S.journal.records[0]'),initial.records[0]);
 reopened.element('exportjournal').onclick();assert.equal(reopened.downloads.length,1);assert.match(reopened.downloads[0].download,/hybrid-decisions.*\.json/);
 const conflicting=await openApp({localStorage:storage,bars:randomBars(5,94)});assert.equal(conflicting.read('S.journalConflict'),true);assert.deepEqual(conflicting.read('S.journal.records[0]'),initial.records[0]);
 const broken={'hybridTerminal.journal.v1':'{invalid json'};const invalid=await openApp({localStorage:broken});assert.equal(invalid.read('S.journalPersistent'),false);assert.equal(broken['hybridTerminal.journal.v1'],'{invalid json');
 const blocked=await openApp({localStorage:new Proxy({}, {set(){throw Error('quota or privacy')}})});assert.equal(blocked.read('S.journalPersistent'),false);assert.match(blocked.element('journalstatus').textContent,/השמירה אינה זמינה/);
 journal.exec('for(let j=0;j<1002;j++){const b=S.k[S.k.length-1];S.k.push({...b,t:b.t+TFMS[S.tf],closed:true});S.closedIndex=S.k.length-1;recordDecision()}');
 assert.equal(journal.read('S.journal.records.length'),1000);assert.equal(journal.read('S.journal.retiredCount'),4);assert.equal(journal.read('journalExport().records.length'),1000);
 console.log('PASS: journal captures closed decisions only, deduplicates, survives reload, exports, preserves a prior conflicting decision, reports unavailable storage, protects malformed stored data, and enforces explicit 1000-record retention.');

 const sample=randomBars(9,500),probe=await openApp({bars:sample}),candidate=probe.read('S.k.findIndex((_,i)=>i>60&&sigAt(i).side!=="WAIT"&&sigAt(i).side!==sigAt(i-1).side)');assert.ok(candidate>60);
 const offline=await openApp({bars:sample.slice(0,candidate+1),serverNow:sample[candidate].t+1000});offline.exec('S.al=true;navigator.onLine=false');offline.sockets[0].receive(sample[candidate],true);await offline.flush();assert.equal(offline.notifications.length,0);
 offline.element('acc').value=-1000;offline.element('rk').value=1;offline.exec('panel()');assert.match(offline.element('szo').innerHTML,/יתרה חיובית/);
 offline.element('acc').value=1000;offline.element('rk').value=1;offline.exec('panel()');assert.match(offline.element('szo').innerHTML,/כמות/);assert.doesNotMatch(offline.element('szo').innerHTML,/NaN|Infinity/);
 console.log('PASS: an offline confirmed setup cannot emit a notification; invalid account/risk inputs do not produce a position size.');
 console.log('Scope: synthetic data and mocked DOM/network; contrast tests are not a claim of full WCAG conformance or human color-perception validation.');
})().catch(error=>{console.error(error);process.exitCode=1});
