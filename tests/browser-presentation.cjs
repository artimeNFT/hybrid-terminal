'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const {chromium} = require('playwright');
const output = process.env.HYBRID_QA_DIR || '.qa-results/browser/browser-presentation';
const step = 300000, day = Date.UTC(2026, 9, 20), now = day + 500 * step + 1;
function fixture(last = 96) {
  return Array.from({length: 500}, (_, i) => {
    if (i === 300) return {t: day + i * step, o: 104, c: 103, h: 104.5, l: 102.5, v: 10000};
    const c = i === 499 ? last : 100;
    return {t: day + i * step, o: c - 0.1, c, h: c + 0.5, l: c - 0.5, v: 100};
  });
}
(async () => {
  fs.mkdirSync(output, {recursive: true});
  const browser = await chromium.launch({headless: true, args: ['--no-sandbox']}), errors = [], evidence = [];
  try {
    async function pageFor(state, mobile) {
      const context = await browser.newContext({viewport: mobile ? {width: 390, height: 844} : {width: 1440, height: 1100},
        ...(mobile ? {isMobile: true, hasTouch: true, deviceScaleFactor: 1} : {})});
      const page = await context.newPage(), bars = fixture(state === 'wait' ? 99 : 96); let socket;
      page.on('pageerror', e => errors.push(e.message));
      await page.routeWebSocket('wss://stream.binance.com:9443/ws/**', ws => { socket = ws; });
      await page.route('https://api.binance.com/**', async route => {
        const u = new URL(route.request().url()); let data;
        if (u.pathname.endsWith('/time')) data = {serverTime: now};
        else if (u.searchParams.get('interval') === '5m' && state === 'unavailable') return route.fulfill({status: 503, body: 'Fixture unavailable'});
        else {
          const dt = u.searchParams.get('interval') === '5m' ? step : 3600000;
          const source = dt === step ? bars : Array.from({length: 70}, (_, i) => ({t: Math.floor(now / dt) * dt - (69 - i) * dt, o: 100, h: 102, l: 98, c: 101, v: 100}));
          data = source.map(b => [b.t, '' + b.o, '' + b.h, '' + b.l, '' + b.c, '' + b.v, b.t + dt - 1]);
        }
        await route.fulfill({contentType: 'application/json', body: JSON.stringify(data)});
      });
      await page.goto('file://' + path.resolve('hybrid-terminal.html'));
      if (state === 'unavailable') await page.waitForFunction(() => S.phase === 'error');
      else {
        await page.waitForFunction(() => S.sig && S.bt && S.k.length === 500);
        const b = bars.at(-1);
        socket.send(JSON.stringify({s: 'BTCUSDT', k: {t: b.t, T: b.t + step - 1, o: '' + b.o, h: '' + b.h, l: '' + b.l, c: '' + b.c, v: '' + b.v, x: true, s: 'BTCUSDT', i: '5m'}}));
        await page.waitForFunction(() => feedHealth().ready);
      }
      return {context, page, socket, bars};
    }
    for (const mobile of [false, true]) for (const state of ['wait', 'eligible', 'unavailable', 'provisional']) {
      const {context, page, socket, bars} = await pageFor(state, mobile), layout = mobile ? 'narrow' : 'desktop';
      assert.equal(await page.locator('#palette').isVisible(), true); assert.equal(await page.locator('#body').isVisible(), true);
      assert.equal(await page.locator('#pane').isVisible(), false);
      if (state === 'unavailable') {
        assert.equal(await page.evaluate(() => S.sig), null); assert.equal(await page.locator('[data-confirmed-plan]').count(), 0);
        assert.match(await page.locator('#systemstatus').innerText(), /נכשלה/); assert.match(await page.locator('#pn').innerText(), /לא זמין/);
      } else if (state === 'wait') {
        assert.equal(await page.evaluate(() => S.sig.side), 'WAIT'); assert.equal(await page.evaluate(() => S.sig.validity.ready), true);
        assert.equal(await page.locator('[data-confirmed-plan]').count(), 0); assert.match(await page.locator('.decision-reason').innerText(), /מתחת לסף/);
      } else {
        assert.equal(await page.evaluate(() => S.sig.side), 'LONG'); assert.equal(await page.locator('[data-confirmed-plan]').count(), 1);
        const expected = await page.evaluate(() => plannedRiskDisplay(S.sig.plan, S.k[S.closedIndex].c, S.atr[S.closedIndex]));
        for (const [key, value] of Object.entries(expected)) assert.equal(key === 'costR' ? await page.locator(`[data-risk="${key}"]`).textContent() : await page.locator(`[data-risk="${key}"]`).innerText(), value.toFixed(3));
        if (state === 'provisional') {
          const before = await page.evaluate(() => ({sig: S.sig, bt: S.bt, journal: localStorage[JOURNAL_KEY], risk: plannedRiskDisplay(S.sig.plan, S.k[S.closedIndex].c, S.atr[S.closedIndex])}));
          const b = bars.at(-1); socket.send(JSON.stringify({s: 'BTCUSDT', k: {t: b.t + step, T: b.t + 2 * step - 1, o: '' + b.c, h: '106', l: '94', c: '104', v: '1200', x: false, s: 'BTCUSDT', i: '5m'}}));
          await page.waitForFunction(() => S.preview !== null);
          assert.deepEqual(await page.evaluate(() => ({sig: S.sig, bt: S.bt, journal: localStorage[JOURNAL_KEY], risk: plannedRiskDisplay(S.sig.plan, S.k[S.closedIndex].c, S.atr[S.closedIndex])})), before);
          assert.equal(await page.locator('#provisional [data-risk]').count(), 0);
          await page.locator('#provisional > details > summary').click();
          assert.match(await page.locator('#provisional').innerText(), /אינו מחליף/);
        }
      }
      if (await page.locator('[data-detail="statistics"]').count()) assert.equal(await page.locator('[data-detail="statistics"]').getAttribute('open'), null);
      const dimensions = await page.evaluate(() => ({root: document.documentElement.scrollWidth, viewport: innerWidth, canvas: document.getElementById('cv').getBoundingClientRect().height}));
      assert.ok(dimensions.root <= dimensions.viewport + 1); assert.ok(dimensions.canvas >= 120);
      if (mobile) {
        await page.evaluate(() => { document.querySelector('main').scrollTop = 0; });
        await page.screenshot({path: path.join(output, `${state}-narrow-overview.png`)});
        await page.locator(state === 'provisional' ? '#provisional' : '#pn').scrollIntoViewIfNeeded();
      }
      await page.screenshot({path: path.join(output, `${state}-${layout}.png`)});
      // Inspect the actual primary panel in a separate image without changing its styling.
      if (!mobile && state === 'eligible') await page.locator('aside').screenshot({path: path.join(output, 'eligible-desktop-panel.png')});
      evidence.push({state, layout, ...dimensions, screenshot: `${state}-${layout}.png`, feed: 'Synthetic REST/WebSocket fixtures; actual Chromium rendering'});
      if (state === 'eligible') {
        // Known UI-only statistic exercises the existing expandable curve; no market outcome resolution.
        await page.evaluate(() => { S.bt = summarizeTrades([{R: 1, sh: false, t1: false}]); S.panelKey = null; panel(); });
        const before = await page.evaluate(() => ({sig: S.sig, bt: S.bt, journal: localStorage[JOURNAL_KEY]}));
        await page.locator('[data-detail="statistics"] > summary').click();
        await page.waitForFunction(() => document.getElementById('eq')?.width > 0);
        await page.evaluate(() => { S.panelKey = null; panel(); });
        assert.equal(await page.locator('[data-detail="statistics"]').getAttribute('open'), '');
        await page.locator('#displaybtn').click(); await page.locator('#pane').selectOption('rsi');
        await page.locator('#palette').selectOption('pvsra'); await page.locator('#body').selectOption('hollow');
        assert.deepEqual(await page.evaluate(() => ({sig: S.sig, bt: S.bt, journal: localStorage[JOURNAL_KEY]})), before);
        await page.locator('#displaybtn').click();
        await page.reload(); await page.waitForFunction(() => S.sig);
        assert.deepEqual(await page.evaluate(() => [S.palette, S.body, S.pane]), ['pvsra', 'hollow', 'rsi']);
      }
      // Keep contexts until the QA hook saves their traces and closes the browser.
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'presentation-evidence.json'), JSON.stringify({version: '0.4.25', checks: evidence,
      scope: 'Actual desktop and narrow/touch-emulated Chromium, mocked market data; no public-live, physical-device, midnight or long-session acceptance'}, null, 2) + '\n');
    console.log('PASS: current desktop/narrow WAIT, eligible-plan, unavailable and provisional screenshots; confirmed ATR/cost coordinates, no WAIT plan, independent provisional state, collapsed/persistent details, chart space, palette/body/pane preferences and journal invariance.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
