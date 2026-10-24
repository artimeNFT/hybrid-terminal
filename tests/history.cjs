'use strict';
const assert=require('node:assert/strict');
const {openApp,rows,steps}=require('./app-harness.cjs');
const {randomBars}=require('./regression.cjs');
function older(req,count){const u=new URL(req.url),end=+u.searchParams.get('endTime'),limit=count??+u.searchParams.get('limit');return rows(randomBars(7,limit).map((b,i)=>({...b,t:end+1-(limit-i)*steps['5m']})),steps['5m'])}
(async()=>{
 const app=await openApp({bars:randomBars(3,1000),respond:async req=>req.url.includes('endTime=')?older(req):undefined});
 const snapshot=app.read('({k:S.k,sig:S.sig,bt:S.bt,st:S.st,journal:S.journal})'),first=app.read('S.k[0].t');
 for(let i=0;i<5;i++){await app.exec('loadOlder()');await app.flush()}
 assert.equal(app.read('S.history.length'),5000);assert.equal(app.read('chartBars().length'),6000);assert.equal(app.read('S.k[0].t'),first);
 assert.deepEqual(app.read('({k:S.k,sig:S.sig,bt:S.bt,st:S.st,journal:S.journal})'),snapshot);
 assert.equal(app.element('historybtn').disabled,true);assert.match(app.element('historynote').textContent,/chart only/);
 const count=app.requests.length;await app.exec('loadOlder()');await app.flush();assert.equal(app.requests.length,count);
 const view=app.read('viewStart()'),last=app.read('S.k[S.k.length-1]');app.sockets[0].receive({...last,t:last.t+steps['5m']},false);await app.flush();
 assert.equal(app.read('chartBars().length'),6001);assert.ok(Math.abs(app.read('viewStart()')-view)<1e-8);assert.deepEqual(app.read('S.sig'),snapshot.sig);assert.deepEqual(app.read('S.journal'),snapshot.journal);
 console.log('PASS: five dated pages add 5000 chart-only candles, enforce the cap and preserve all live-core bars, confirmed signal, statistics, backtest and journal snapshots; live appends retain the historical viewport.');

 const short=await openApp({respond:async req=>req.url.includes('endTime=')?older(req,17):undefined});await short.exec('loadOlder()');await short.flush();assert.equal(short.read('S.history.length'),17);assert.equal(short.read('S.historyDone'),true);
 const invalid=await openApp({respond:async req=>{if(req.url.includes('endTime=')){const r=older(req,17);r[16][0]-=300000;return r}}});const safe=invalid.read('S.sig');await invalid.exec('loadOlder()');await invalid.flush();assert.equal(invalid.read('S.history.length'),0);assert.deepEqual(invalid.read('S.sig'),safe);assert.ok(invalid.read('S.historyError'));
 let resolveOld,requestOld;const stale=await openApp({respond:async req=>{if(req.url.includes('endTime=')){requestOld=req;return new Promise(resolve=>{resolveOld=resolve})}}});const pending=stale.exec('loadOlder()');await stale.flush();stale.exec('S.sym="ETHUSDT";load()');await stale.flush();resolveOld(older(requestOld));await pending;await stale.flush();assert.equal(stale.read('S.sym'),'ETHUSDT');assert.equal(stale.read('S.history.length'),0);
 console.log('PASS: short history pages stop further loading; discontinuous history is rejected without touching live decisions; obsolete history responses cannot cross an asset switch.');
 console.log('Scope: older data is for chart navigation. It does not extend research/backtest coverage or reseed the live decision engine.');
})().catch(e=>{console.error(e);process.exitCode=1});
