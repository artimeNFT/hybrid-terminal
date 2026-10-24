'use strict';
// QA-only preload: original suites keep their page-level fixtures and assertions.
// Context fallback routes reject any request not fulfilled by those fixtures.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
 const browser=await launch(options),newContext=browser.newContext.bind(browser),close=browser.close.bind(browser),contexts=[],unexpected=[];
 browser.newContext=async options=>{const context=await newContext(options);contexts.push(context);
  await context.route('**/*',route=>{if(/^https?:/.test(route.request().url())){unexpected.push(route.request().url());return route.abort('blockedbyclient')}return route.continue()});
  await context.routeWebSocket(/.*/,socket=>{unexpected.push(socket.url());socket.close()});
  await context.tracing.start({screenshots:true,snapshots:true,sources:true});return context;
 };
 browser.close=async()=>{if(!contexts.length)unexpected.push('QA guard did not observe any browser context');const directory=process.env.HYBRID_QA_DIR;try{
  if(directory){fs.mkdirSync(directory,{recursive:true});for(let i=0;i<contexts.length;i++)try{await contexts[i].tracing.stop({path:path.join(directory,'trace-'+(i+1)+'.zip')})}catch(e){console.error('Trace unavailable: '+e.message)}
   fs.writeFileSync(path.join(directory,'network-guard.json'),JSON.stringify({unexpected,scope:'All public HTTP/WebSocket requests must be fulfilled by the existing synthetic page routes'},null,2)+'\n');}
 }finally{await close()}
 if(unexpected.length)throw Error('Unmocked external browser requests: '+unexpected.join(', '));
 };
 return browser;
};
