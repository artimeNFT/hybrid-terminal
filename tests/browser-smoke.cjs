'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { replacementFixture } = require('./regression.cjs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });
    const errors = [], candles = replacementFixture();
    let socket;
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.__markerDraws = [];
      const fillText = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function(text,...args) {
        if (/^[MW]×?$/.test(text)) window.__markerDraws.push({text,x:args[0],y:args[1],color:this.fillStyle});
        return fillText.call(this,text,...args);
      };
    });
    await page.route('https://api.binance.com/**', async route => {
      const url=new URL(route.request().url()),now=candles[93].t+300001;
      if(url.pathname.endsWith('/time')){await route.fulfill({contentType:'application/json',body:JSON.stringify({serverTime:now})});return}
      const tf=url.searchParams.get('interval'),step=tf==='5m'?300000:3600000;
      const source=tf==='5m'?candles.slice(0,94):Array.from({length:70},(_,i)=>({t:Math.floor(now/step)*step-(69-i)*step,o:100,h:102,l:99,c:101,v:100}));
      const bars=source.map(b=>[b.t,String(b.o),String(b.h),String(b.l),String(b.c),String(b.v),b.t+step-1]);
      await route.fulfill({ contentType:'application/json', body:JSON.stringify(bars) });
    });
    await page.routeWebSocket('wss://stream.binance.com:9443/ws/**', ws => { socket = ws; });
    const file = path.resolve(__dirname,'../hybrid-terminal.html');
    await page.goto('file://'+file);
    await page.waitForFunction(() => S.k.length === 94 && S.mw.some(e => e.i === 90));
    await page.waitForFunction(() => window.__markerDraws.some(e => e.text === 'M'));
    const earlier = await page.evaluate(() => sigAt(93));
    assert.ok(socket);
    for (const b of candles.slice(94,101)) {
      socket.send(JSON.stringify({k:{t:b.t,o:String(b.o),h:String(b.h),l:String(b.l),c:String(b.c),v:String(b.v),x:true}}));
    }
    await page.waitForFunction(() => S.k.length === 101);
    const result = await page.evaluate(() => ({
      signal:sigAt(93), event:S.mw.find(e => e.i === 90 && e.t === 'M'), count:S.k.length
    }));
    assert.deepEqual(result.signal,earlier);
    assert.equal(result.event.confirmedAt,93);
    assert.equal(result.event.supersededAt,100);
    await page.waitForFunction(() => window.__markerDraws.some(e => e.text === 'M×'));
    assert.ok((await page.locator('#pn').innerText()).includes('BTCUSDT'));
    await page.locator('#back').click();
    assert.equal(await page.evaluate(()=>S.follow),false);
    await page.locator('#livebtn').click();
    assert.equal(await page.evaluate(()=>S.follow),true);
    assert.equal(await page.locator('#palette').isVisible(),true);
    assert.equal(await page.evaluate(()=>S.palette),'accessible');
    await page.locator('#palette').selectOption('standard');
    assert.equal(await page.evaluate(()=>S.palette),'standard');
    await page.locator('#displaybtn').click();
    await page.locator('#volumetags').check();
    assert.equal(await page.locator('#exportjournal').isEnabled(),true);
    await page.locator('#displaybtn').click();
    await page.locator('#hq').click();
    assert.equal(await page.locator('#hp').isVisible(),true);
    assert.ok((await page.locator('#hp').innerText()).includes('נר האישור'));
    await page.locator('#hp button').click();
    assert.equal(await page.locator('#hp').isVisible(),false);
    const screenshot = process.env.HYBRID_QA_SCREENSHOT;
    if (screenshot) {
      fs.mkdirSync(path.dirname(screenshot),{recursive:true});
      await page.screenshot({path:screenshot,fullPage:true});
    }
    await page.setViewportSize({width:700,height:900});
    await page.waitForFunction(() => {
      const canvas = document.getElementById('cv');
      return canvas.width === Math.floor(canvas.getBoundingClientRect().width * devicePixelRatio);
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.deepEqual(errors,[]);
    console.log('PASS: Chromium loads the actual HTML, renders the closed-candle panel and markers, replays mocked WebSocket updates, retains the decision at bar 93 after supersession at 100, controls history/live view, opens/closes help, and renders at desktop/mobile widths without page errors.');
    console.log('Network is mocked. This is not a live Binance acceptance test.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode=1; });
