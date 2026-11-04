'use strict';
// State confirmation precedes the application's scheduled Canvas/panel render.
// Observe the actual rendered identity and value; never force panel() or sleep.
async function waitForConfirmedCandleRender(page,expected){
 return page.waitForFunction(({asOf,symbol,timeframe,volumeText})=>{
  const el=document.querySelector('[data-candle-context]');
  return confirmedCandleContext().asOf===asOf&&el?.dataset.candleClose===String(asOf)&&el.dataset.candleSymbol===symbol&&el.dataset.candleTimeframe===timeframe&&el.querySelector('[data-candle-metric="volumeRatio"]')?.textContent===volumeText;
 },expected); // Existing Playwright 30-second default, including failure semantics.
}
// Opt-in, test-only controlled capture. Holds a scheduled native frame once;
// restoration schedules the original callback, without invoking draw/panel.
async function holdCandleRender(page){
 await page.evaluate(()=>{
  const snapshot=()=>{const v=confirmedCandleContext(),el=document.querySelector('[data-candle-context]');return{performanceMs:performance.now(),model:{asOf:v.asOf,symbol:v.symbol,timeframe:v.timeframe,volumeRatio:v.volume?.ratio},dom:{asOf:el?.dataset.candleClose,symbol:el?.dataset.candleSymbol,timeframe:el?.dataset.candleTimeframe,volumeText:el?.querySelector('[data-candle-metric="volumeRatio"]')?.textContent}}};
  const c=window.__candleRenderBoundary={native:window.requestAnimationFrame,held:[],snapshot,before:snapshot()};
  window.requestAnimationFrame=fn=>{c.held.push(fn);return-c.held.length};
 });
}
async function releaseCandleRender(page){
 return page.evaluate(()=>{const c=window.__candleRenderBoundary;c.beforeRelease=c.snapshot();c.heldFrames=c.held.length;window.requestAnimationFrame=c.native;for(const fn of c.held)c.native.call(window,fn);return{before:c.before,beforeRelease:c.beforeRelease,heldFrames:c.heldFrames}});
}
async function afterCandleRender(page){return page.evaluate(()=>window.__candleRenderBoundary.snapshot())}
module.exports={waitForConfirmedCandleRender,holdCandleRender,releaseCandleRender,afterCandleRender};
