'use strict';
const assert=require('node:assert/strict');
const {openApp}=require('./app-harness.cjs');
const {randomBars}=require('./regression.cjs');
const event=(x=300,y=220,extra={})=>({button:0,pointerId:1,clientX:x,clientY:y,preventDefault(){},...extra});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const comparable=a=>{const v=market(a);delete v.stored;for(const r of v.journal.records)delete r.observedAt;return v};
const market=a=>a.read('({k:S.k,e:S.e,atr:S.atr,rsi:S.rsi,sv:S.sv,mw:S.mw,sig:S.sig,bt:S.bt,journal:S.journal,stored:localStorage[JOURNAL_KEY],rule:RULE_VERSION,execution:EXECUTION_VERSION})');
(async()=>{
 const bars=randomBars(43,600),old=await openApp({bars,file:'baseline/hybrid-terminal.0.4.2.html'}),a=await openApp({bars,localStorage:{...old.localStorage}}),control=await openApp({bars,localStorage:{...old.localStorage}}),cv=a.element('cv');
 assert.deepEqual(market(a),market(old));const original=market(a),base=a.read('visiblePrices()'),g=a.read('chartGeometry()'),start=a.read('viewStart()'),span=base[1]-base[0];
 cv.onpointerdown(event());for(const dy of [20,40,80])cv.onpointermove(event(300,220+dy));await a.flush();
 let p=a.read('S.price');near(p[0],base[0]+80*span/g.ph);near(p[1]-p[0],span);near(a.read('viewStart()'),start);assert.equal(a.read('S.follow'),true);
 // Reverse within the same captured gesture: displacement remains relative to its start.
 cv.onpointermove(event(300,180));await a.flush();near(a.read('S.price[0]'),base[0]-40*span/g.ph);cv.onpointerup(event(300,180));
 const reverse=a.read('S.price');cv.onpointerdown(event());cv.onpointermove(event(380,270));cv.onpointerup(event(380,270));await a.flush();near(a.read('S.price[0]'),reverse[0]+50*span/g.ph);near(a.read('viewStart()'),start-80/g.cw);near(a.read('S.price[1]-S.price[0]'),span);
 assert.deepEqual(market(a),original);console.log('PASS: 80px vertical, same-gesture reversal and diagonal translation use drag-start bounds with constant span, correct time movement and unchanged market/indicator/signal/backtest/journal state.');
 a.element('reset').onclick();cv.onpointerdown(event());cv.onpointermove(event(302,223));cv.onpointerup(event(302,223));await a.flush();assert.equal(a.read('S.price'),null);assert.equal(a.read('S.follow'),true);
 cv.onpointerdown(event());cv.onpointermove(event(500,225));cv.onpointerup(event(500,225));await a.flush();assert.equal(a.read('S.price'),null);assert.equal(a.read('S.follow'),false);
 for(const pane of ['volume','rsi']){a.exec(`S.pane='${pane}';resetView()`);const ph=a.read('chartGeometry().ph');cv.onpointerdown(event(300,ph+20));cv.onpointermove(event(350,180));cv.onpointerup(event(350,180));assert.equal(a.read('S.price'),null);assert.equal(a.read('S.follow'),false)}
 a.exec('resetView()');cv.onpointerdown(event());cv.onpointermove(event(310,300,{pointerId:2}));cv.onpointercancel(event(310,300,{pointerId:2}));assert.equal(a.read('S.price'),null);assert.equal(a.read('drag.id'),1);cv.onpointermove(event(300,260));cv.onlostpointercapture(event(300,260));assert.equal(a.read('drag'),null);const held=a.read('S.price');cv.onpointermove(event(300,350));assert.deepEqual(a.read('S.price'),held);
 cv.onpointerdown(event());cv.onpointercancel(event());assert.equal(a.read('drag'),null);assert.equal(cv.style.cursor,'crosshair');
 console.log('PASS: click/jitter and near-horizontal thresholds, Volume/RSI origin isolation, secondary-pointer isolation, cancel and lost-capture cleanup.');
 a.exec('resetView()');const axis=a.read('chartGeometry().pw')+20;cv.onpointerdown(event(axis,200));cv.onpointermove(event(axis,280));cv.onpointerup(event(axis,280));await a.flush();assert.ok(a.read('S.price[1]-S.price[0]')>a.read('visiblePrices()[1]-visiblePrices()[0]')/2);assert.notEqual(a.read('S.price[1]-S.price[0]'),span);
 cv.ondblclick(event(axis,200));assert.equal(a.read('S.price'),null);const count=a.read('S.n');cv.onpointerdown(event(300,740));cv.onpointermove(event(380,660));cv.onpointerup(event(380,660));assert.notEqual(a.read('S.n'),count);assert.equal(a.read('S.price'),null);
 a.exec('resetView()');cv.onkeydown(event(0,0,{key:'ArrowDown'}));const keyed=a.read('S.price');near(keyed[0]-base[0],span*.1);cv.onkeydown(event(0,0,{key:'ArrowUp'}));near(a.read('S.price[0]'),base[0]);a.element('livebtn').onclick();assert.equal(a.read('S.follow'),true);assert.ok(a.read('S.price'));cv.onkeydown(event(0,0,{key:'Escape'}));assert.equal(a.read('S.price'),null);
 // Freeze gesture geometry; resizing cannot compound or change its conversion.
 a.exec('resetView()');cv.onpointerdown(event());const resizeBase=a.read('visiblePrices()'),resizePh=a.read('chartGeometry().ph');const getRect=cv.getBoundingClientRect;cv.getBoundingClientRect=()=>({left:0,top:0,width:700,height:450});cv.onpointermove(event(300,300));cv.onpointerup(event(300,300));near(a.read('S.price[0]'),resizeBase[0]+80*(resizeBase[1]-resizeBase[0])/resizePh);cv.getBoundingClientRect=getRect;
 console.log('PASS: axis scaling/time zoom, focused vertical keyboard controls and frozen drag-start geometry across resize.');
 const manual=a.read('S.price');const last=bars.at(-1),next={...last,t:last.t+300000};for(const app of [a,control])app.sockets[0].receive(next,false);await a.flush();await control.flush();assert.deepEqual(a.read('S.price'),manual);assert.deepEqual(comparable(a),comparable(control));for(const app of [a,control])app.sockets[0].receive(next,true);await a.flush();await control.flush();assert.deepEqual(a.read('S.price'),manual);assert.deepEqual(comparable(a),comparable(control));a.element('livebtn').onclick();assert.deepEqual(a.read('S.price'),manual);a.element('autoscale').onclick();assert.equal(a.read('S.price'),null);a.element('reset').onclick();assert.deepEqual(a.read('[S.n,S.off,S.follow,S.price]'),[150,-18,true,null]);
 for(const expr of ['translatedPrices([1,1],100,80)','translatedPrices([2,1],100,80)','translatedPrices([1,2],0,80)','translatedPrices([1,Infinity],100,80)','translatedPrices([1,2],100,NaN)','translatedPrices([1,2],100,Infinity)'])assert.equal(a.read(expr),null);
 a.exec('S.price=[1,1]');cv.onpointerdown(event());cv.onpointermove(event(300,300));cv.onpointerup(event());assert.deepEqual(a.read('S.price'),[1,1]);a.exec('S.price=null;S.k=[];S.chart=null');cv.onpointerdown(event());cv.onpointermove(event(300,300));cv.onpointerup(event());assert.equal(a.read('S.price'),null);a.exec('panPrice(80)');assert.equal(a.read('S.price'),null);
 const zero=await openApp({bars});zero.element('cv').getBoundingClientRect=()=>({left:0,top:0,width:0,height:0});zero.element('cv').onpointerdown(event());zero.exec('panPrice(80)');assert.equal(zero.read('drag'),null);assert.equal(zero.read('S.price'),null);
 console.log('PASS: manual position survives provisional and confirmed stream updates; engine/journal match untouched control and 0.4.2 upgrade bytes. Live/Auto scale/Reset and invalid/empty/zero-size guards verified.');
})().catch(e=>{console.error(e);process.exitCode=1});
