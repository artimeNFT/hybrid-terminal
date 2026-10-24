'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const evidence={kind:'Actual public Binance browser probe, no request interception',observedAt:new Date().toISOString(),checks:[],errors:[]};try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>evidence.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')evidence.errors.push(m.text())});
 await page.goto('file://'+path.resolve('hybrid-terminal.html'));
 for(const [symbol,tf] of [['BTCUSDT','5m'],['ETHUSDT','15m'],['SOLUSDT','4h'],['BTCUSDT','1h']]){
  if(await page.locator('#sym').inputValue()!==symbol)await page.locator('#sym').selectOption(symbol);
  await page.locator(`[data-tf="${tf}"]`).click();
  try{await page.waitForFunction(()=>S.k.length>=60&&S.sig,{},{timeout:20000});await page.locator('#pivots').evaluate(el=>{if(el.getAttribute('aria-pressed')!=='true')el.click()});await page.waitForFunction(()=>S.pivotStatus==='ready'||S.pivotStatus.startsWith('unavailable'),{},{timeout:15000});await page.waitForFunction(()=>feedHealth().ready,{},{timeout:15000})}catch(e){evidence.errors.push(symbol+' '+tf+': '+e.message)}
  evidence.checks.push(await page.evaluate(()=>({symbol:S.sym,timeframe:S.tf,bars:S.k.length,phase:S.phase,closedIndex:S.closedIndex,preview:!!S.preview,health:feedHealth(),pivotStatus:S.pivotStatus,pivot:pivotAt(S.k.at(-1)?.t),chartText:document.getElementById('contextstatus').textContent})));
 }
 await page.screenshot({path:'tests/results/browser/live.png',fullPage:true});
 }finally{fs.writeFileSync('tests/results/browser-live.json',JSON.stringify(evidence,null,2)+'\n');await browser.close()}
 const full=evidence.checks.length===4&&evidence.checks.every(c=>c.bars>=60&&c.pivotStatus==='ready'&&c.health.ready)&&!evidence.errors.length;
 console.log(full?'PASS: four actual Binance browser selections load OHLCV, live WebSocket updates and complete UTC pivots without console errors.':'PARTIAL: actual Binance browser probe completed; inspect browser-live.json for load/stream limitations.');if(!full)process.exitCode=2;
})().catch(e=>{console.error(e);process.exitCode=1});
