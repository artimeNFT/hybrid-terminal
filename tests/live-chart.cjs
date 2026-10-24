'use strict';
const assert=require('node:assert/strict');
const {openApp,rows,steps}=require('./app-harness.cjs');
const {replacementFixture,randomBars}=require('./regression.cjs');
const signalFields=g=>({side:g.side,score:g.score,items:g.items,plan:g.plan,short:g.short});
const event=(extra={})=>({clientX:300,clientY:220,button:0,pointerId:1,deltaY:0,deltaX:0,preventDefault(){},...extra});
(async()=>{
 const bars=replacementFixture(),app=await openApp({bars:bars.slice(0,94),serverNow:bars[93].t+1000});
 assert.equal(app.read('S.closedIndex'),92);assert.ok(app.read('S.preview'));
 const stable=app.read('({signal:S.sig,stats:S.st,backtest:S.bt})');
 assert.ok(!app.drawCalls.some(c=>c.method==='fillText'&&c.args[0]==='M'));
 app.exec('S.al=true');
 for(let j=0;j<20;j++)app.sockets[0].receive({...bars[93],h:bars[93].h+j,c:bars[93].c+j/2,v:100+j*300},false);
 await app.flush();assert.deepEqual(app.read('({signal:S.sig,stats:S.st,backtest:S.bt})'),stable);assert.equal(app.notifications.length,0);
 app.sockets[0].receive(bars[93],true);await app.flush();assert.equal(app.read('S.closedIndex'),93);
 assert.deepEqual(signalFields(app.read('S.sig')),signalFields(app.read('sigAt(93)')));
 assert.ok(app.drawCalls.some(c=>c.method==='fillText'&&c.args[0]==='M'));
 const final=app.read('S.k[93]');app.sockets[0].receive({...bars[93],h:999,c:500},false);await app.flush();assert.deepEqual(app.read('S.k[93]'),final);
 console.log('PASS: 20 developing-candle changes leave confirmed signal, recovery statistics and backtest unchanged; confirmation occurs only on x=true; confirmed bars cannot be downgraded.');

 const random=randomBars(9,500),search=await openApp({bars:random});
 const candidates=search.read('S.k.map((_,i)=>i).filter(i=>i>60&&sigAt(i).side!=="WAIT"&&sigAt(i).side!==sigAt(i-1).side)');assert.ok(candidates.length);
 const i=candidates[0],alert=await openApp({bars:random.slice(0,i+1),serverNow:random[i].t+1000});alert.exec('S.al=true');
 assert.equal(alert.notifications.length,0);assert.notEqual(alert.read('S.preview.side'),'WAIT');
 alert.sockets[0].receive(random[i],false);await alert.flush();assert.equal(alert.notifications.length,0);
 alert.sockets[0].receive(random[i],true);await alert.flush();assert.equal(alert.notifications.length,1);
 alert.sockets[0].receive(random[i],true);await alert.flush();assert.equal(alert.notifications.length,1);
 const replay=await openApp({bars:random.slice(0,i+1)});assert.deepEqual(alert.read('S.sig'),replay.read('S.sig'));assert.deepEqual(alert.read('S.bt'),replay.read('S.bt'));
 console.log('PASS: real setup fixture emits no provisional alert, emits one close alert, suppresses duplicate closes and agrees with completed-candle replay.');

 const noClock=await openApp({respond:async req=>{if(req.url.endsWith('/time'))throw Error('Clock unavailable')}});
 assert.equal(noClock.read('S.closedIndex'),92);assert.equal(noClock.read('S.k[93].closed'),false);
 console.log('PASS: missing server time conservatively leaves the final REST candle provisional, independent of the local wall clock.');

 let resolveBTC;const btc=bars.slice(0,94),eth=btc.map(b=>({...b,o:b.o+100,h:b.h+100,l:b.l+100,c:b.c+100}));
 const race=await openApp({respond:async req=>{if(req.interval==='5m'&&req.symbol==='BTCUSDT')return new Promise(resolve=>{resolveBTC=resolve});if(req.interval==='5m'&&req.symbol==='ETHUSDT')return rows(eth,steps['5m'])}});
 race.exec('S.sym="ETHUSDT";load()');await race.flush();assert.equal(race.read('S.k[93].c'),eth[93].c);
 resolveBTC(rows(btc,steps['5m']));await race.flush();assert.equal(race.read('S.sym'),'ETHUSDT');assert.equal(race.read('S.k[93].c'),eth[93].c);assert.match(race.read('S.btKey'),/ETHUSDT/);
 const snapshot=race.read('S.k');race.sockets.at(-1).receive({...eth.at(-1),t:eth.at(-1).t+steps['5m']},false,{s:'BTCUSDT'});await race.flush();assert.deepEqual(race.read('S.k'),snapshot);
 console.log('PASS: an older BTC response cannot overwrite ETH; cache identity changes with the asset; mismatched stream symbols are ignored.');

 const timed=randomBars(8,90).map((b,i)=>({...b,t:Date.UTC(2026,9,20)+i*steps['5m']}));
 const higher=await openApp({bars:timed.slice(0,71)}),initialHTF=higher.requests.filter(r=>r.interval==='1h').length;
 assert.equal(initialHTF,1);higher.state.serverNow=timed[71].t+steps['5m']+50;
 higher.sockets[0].receive(timed[71],false);await higher.flush();assert.equal(higher.requests.filter(r=>r.interval==='1h').length,initialHTF);
 higher.sockets[0].receive(timed[71],true);await higher.flush();assert.equal(higher.requests.filter(r=>r.interval==='1h').length,initialHTF+1);
 assert.ok(higher.read('S.htf.t+TFMS[S.htf.tf]')<=higher.state.serverNow);
 const beforeGap=higher.read('S.epoch');higher.sockets[0].receive(timed[74],true);await higher.flush();assert.ok(higher.read('S.epoch')>beforeGap);
 console.log('PASS: higher-timeframe context refreshes on its close boundary using closed candles; a stream gap starts a guarded REST resynchronization.');

 const chart=await openApp({bars:randomBars(3,1000)}),cv=chart.element('cv');
 assert.equal(chart.read('S.off'),-18);assert.equal(chart.read('S.follow'),true);
 const anchor=chart.read('viewStart()+.27*S.n');chart.exec('zoomAt(.27,.8)');await chart.flush();assert.ok(Math.abs(chart.read('viewStart()+.27*S.n')-anchor)<1e-8);
 cv.onkeydown(event({key:'Home'}));await chart.flush();assert.equal(chart.read('viewStart()'),0);
 chart.exec('panBars(-100000)');await chart.flush();assert.ok(chart.read('viewStart()')>=-8);
 chart.exec('panBars(100000)');await chart.flush();assert.ok(chart.read('viewStart()')<chart.read('S.k.length'));
 cv.onkeydown(event({key:'End'}));await chart.flush();assert.equal(chart.read('S.follow'),true);assert.equal(chart.read('S.off'),-18);
 cv.onpointerdown(event({clientX:300}));cv.onpointermove(event({clientX:380}));cv.onpointerup(event({clientX:380}));await chart.flush();
 const held=chart.read('viewStart()'),last=chart.read('S.k[S.k.length-1]'),next={...last,t:last.t+steps['5m'],end:last.t+2*steps['5m']-1};
 chart.sockets[0].receive(next,false);await chart.flush();assert.ok(Math.abs(chart.read('viewStart()')-held)<1e-8);
 const pw=chart.read('chartGeometry().pw');cv.onwheel(event({clientX:pw+15,deltaY:100}));await chart.flush();assert.ok(chart.read('S.price'));
 cv.ondblclick(event({clientX:pw+15}));await chart.flush();assert.equal(chart.read('S.price'),null);
 chart.exec('goLive();S.mouse={x:chartGeometry().pw-10,y:250};draw()');assert.ok(chart.read('Math.floor(viewStart()+S.mouse.x/chartGeometry().cw)')>=chart.read('S.k.length'));
 assert.ok(chart.drawCalls.every(c=>c.args.filter(v=>typeof v==='number').every(Number.isFinite)));
 cv.ondblclick(event());await chart.flush();assert.equal(chart.read('S.n'),150);assert.equal(chart.read('S.follow'),true);
 chart.element('tz').onchange({target:{value:'UTC'}});await chart.flush();assert.equal(chart.read('S.zone'),'UTC');
 console.log('PASS: right margin, cursor-anchored zoom, full loaded-history navigation, clamped future pan, End/Home controls, consistent drag width, stable historical view on new candles, price scale reset, future crosshair and timezone selection.');
 console.log('Scope: deterministic/mocked data and DOM/canvas test doubles. Live exchange connectivity and full browser layout remain separate checks.');
})().catch(error=>{console.error(error);process.exitCode=1});
