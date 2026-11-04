'use strict';
const {day,step}=require('./target-path-fixtures.cjs');
const NOW=day+500*step+1000,END=Math.floor(NOW/step)*step,BASES={BTCUSDT:'BTC',ETHUSDT:'ETH',SOLUSDT:'SOL'};
function metadata(){return{serverTime:NOW,symbols:Object.entries(BASES).map(([symbol,baseAsset])=>({symbol,baseAsset,quoteAsset:'USDT',marginAsset:'USDT',contractType:'PERPETUAL',status:'TRADING',underlyingType:'COIN'}))}}
function raw(symbol='BTCUSDT'){
 return{time:{serverTime:NOW},metadata:metadata(),premium:{symbol,markPrice:'100.1',indexPrice:'100',lastFundingRate:'.99',nextFundingTime:NOW+7200000,time:NOW-1200},funding:[{symbol,fundingRate:'-.0002',fundingTime:NOW-23400000,markPrice:'99',rateType:'Regular'},{symbol,fundingRate:'0',fundingTime:NOW-3000000,markPrice:'100',rateType:'Regular'}],oi:{symbol,openInterest:'1234.5',time:NOW-900},history:[{symbol,sumOpenInterest:'200',sumOpenInterestValue:'888888',timestamp:END-step},{symbol,sumOpenInterest:'210',sumOpenInterestValue:'1',timestamp:END}],book:{symbol,bidPrice:'99.9',askPrice:'100.1',bidQty:'1',askQty:'2',time:NOW-400}};
}
function results(symbol='BTCUSDT'){return Object.fromEntries(Object.entries(raw(symbol)).map(([key,value],i)=>[key,{raw:value,receivedAt:NOW+20+i,url:'https://fapi.binance.com/'+key}]))}
function keyForURL(url){const u=new URL(url);return({'/fapi/v1/time':'time','/fapi/v1/exchangeInfo':'metadata','/fapi/v1/premiumIndex':'premium','/fapi/v1/fundingRate':'funding','/fapi/v1/openInterest':'oi','/futures/data/openInterestHist':'history','/fapi/v1/ticker/bookTicker':'book'})[u.pathname]??null}
const CONTEXT_PATHS=new Set(['/fapi/v1/exchangeInfo','/fapi/v1/premiumIndex','/fapi/v1/fundingRate','/fapi/v1/openInterest','/futures/data/openInterestHist','/fapi/v1/ticker/bookTicker']);
module.exports={NOW,END,raw,results,metadata,keyForURL,CONTEXT_PATHS};
