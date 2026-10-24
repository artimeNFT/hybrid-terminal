'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {replacementFixture}=require('./regression.cjs');
const steps={'5m':300000,'15m':900000,'1h':3600000,'4h':14400000,'1d':86400000};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const rows=(bars,step)=>bars.map(b=>[b.t,String(b.o),String(b.h),String(b.l),String(b.c),String(b.v),b.t+step-1]);
function contextBars(now,step){const start=Math.floor(now/step)*step-69*step;return Array.from({length:70},(_,i)=>({t:start+i*step,o:100+i*.1,h:102+i*.1,l:99+i*.1,c:101+i*.1,v:100}))}
async function openApp(options={}){
 const bars=options.bars||replacementFixture().slice(0,94),step=300000,state={serverNow:options.serverNow??bars.at(-1).t+step+50};
 const elements=new Map(),sockets=[],drawCalls=[],requests=[],notifications=[],globalHandlers={},handlers={},timers=new Map(),downloads=[];let copied='',timerId=0;
 const ctx=new Proxy({}, {get(target,key){if(key in target)return target[key];return(...args)=>drawCalls.push({method:key,args,color:target.fillStyle})}});
 let nativeCanvas=null;
 if(options.nativeCanvas){const {createCanvas}=require('@napi-rs/canvas');nativeCanvas=createCanvas(options.width||1100,options.height||760)}
 function element(id){if(!elements.has(id)){
  const classes=new Set();const e={id,value:'',innerHTML:'',textContent:'',hidden:id==='hp',clientWidth:300,dataset:{},style:{},width:900,height:750,
   classList:{toggle(name,force){const on=force??!classes.has(name);on?classes.add(name):classes.delete(name);return on},contains:name=>classes.has(name),remove:name=>classes.delete(name),add:name=>classes.add(name)},
   getContext:()=>id==='cv'&&nativeCanvas?nativeCanvas.getContext('2d'):ctx,
   getBoundingClientRect:()=>({width:options.width||900,height:options.height||750,left:0,top:0}),focus(){},setPointerCapture(){},releasePointerCapture(){},setAttribute(name,value){this[name]=value},click(){downloads.push({href:this.href,download:this.download})}};
  if(id==='cv'&&nativeCanvas)for(const key of ['width','height'])Object.defineProperty(e,key,{get:()=>nativeCanvas[key],set:value=>{nativeCanvas[key]=value}});
  elements.set(id,e);
 }return elements.get(id)}
 const selectors={
  '[data-tf]':['5m','15m','1h','4h'].map(tf=>Object.assign(element('tf-'+tf),{dataset:{tf}})),
  '[data-l]':['z','e','p','m'].map(l=>Object.assign(element('layer-'+l),{dataset:{l}}))
 };
 const document={title:'',hidden:false,getElementById:element,createElement:tag=>element('created-'+tag),querySelectorAll:q=>selectors[q]||[],addEventListener:(event,fn)=>{handlers[event]=fn}};
 class MockWebSocket{
  constructor(url){this.url=url;sockets.push(this);queueMicrotask(()=>this.onopen?.())}
  close(){this.onclose?.()}
  receive(bar,closed=true,extra={}){const match=this.url.match(/\/([^/]+)@kline_(.+)$/),s=match[1].toUpperCase(),i=match[2];this.onmessage?.({data:JSON.stringify({s,k:{t:bar.t,T:bar.t+steps[i]-1,o:String(bar.o),h:String(bar.h),l:String(bar.l),c:String(bar.c),v:String(bar.v),x:closed,s,i,...extra}})})}
 }
 const fetch=async(url,init={})=>{
  const u=new URL(url),req={url,signal:init.signal,interval:u.searchParams.get('interval'),symbol:u.searchParams.get('symbol')};requests.push(req);
  if(options.respond){const response=await options.respond(req,state);if(response!==undefined)return{ok:true,json:async()=>response}}
  if(init.signal?.aborted)throw Object.assign(Error('Aborted'),{name:'AbortError'});
  if(u.pathname.endsWith('/time'))return{ok:true,json:async()=>({serverTime:state.serverNow})};
  const data=req.interval==='5m'?bars:contextBars(state.serverNow,steps[req.interval]);
  return{ok:true,json:async()=>rows(data,steps[req.interval])};
 };
 class Notification{constructor(title,data){notifications.push({title,data})}static permission='granted';static requestPermission(){}}
 const localStorage=options.localStorage||{};
 const context=vm.createContext({document,window:{Notification},Notification,localStorage,devicePixelRatio:1,WebSocket:MockWebSocket,AbortController,URL,Blob,
  addEventListener:(event,fn)=>{globalHandlers[event]=fn},setInterval(){},setTimeout(fn,delay){const id=++timerId;timers.set(id,{fn,delay});return id},clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>queueMicrotask(fn),
  navigator:{onLine:true,clipboard:{writeText:text=>{copied=text;return Promise.resolve()}}},fetch});
 const html=fs.readFileSync(options.file||path.resolve(__dirname,'../hybrid-terminal.html'),'utf8');
 vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
 await flush();
 return{state,elements,element,selectors,sockets,drawCalls,requests,notifications,handlers,globalHandlers,nativeCanvas,flush,timers,downloads,localStorage,
  exec:code=>vm.runInContext(code,context),
  read:code=>{const v=vm.runInContext('JSON.stringify('+code+')',context);return v===undefined?undefined:JSON.parse(v)},
  get copied(){return copied},
  set(name,value){context[name]=value}
 };
}
module.exports={openApp,flush,rows,steps};
