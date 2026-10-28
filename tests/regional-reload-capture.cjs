'use strict';
// Test-only: one init script guarantees fixture preparation precedes the read,
// and both precede application initialization. Never reads a personal profile.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const key='hybridTerminal.regionalWindows.v1';
function installCapture(key){
 const error=e=>({name:e?.name||'Error',message:String(e?.message||e)});
 const read=method=>{try{const value=method();return{type:typeof value,value:value===undefined?null:value}}catch(e){return{error:error(e)}}};
 window.__regionalReloadCapture={schemaVersion:1,stage:'after-fixture-before-app',url:location.href,origin:location.origin,readyState:document.readyState,performanceMs:performance.now(),preApp:{sig:read(()=>S.sig),property:read(()=>localStorage[key]),getItem:read(()=>localStorage.getItem(key))},poll:{count:0,first:null,transitions:[],last:null,omittedTransitions:0}};
}
function fixtureThenCapture(prepare,args){
 return{content:'('+prepare.toString()+')('+JSON.stringify(args)+');\n('+installCapture.toString()+')('+JSON.stringify(key)+');'};
}
// This is the actual existing reload predicate, with separate operand capture.
// Keep its return value, default Playwright timeout and assertions unchanged.
function reloadPoll(){
 const sig=S.sig,regionalEnabled=S.regionalEnabled;
 try{
  const encode=value=>({type:typeof value,truthy:!!value,json:value===undefined?null:JSON.stringify(value)});
  const capture=window.__regionalReloadCapture,p=capture.poll;
  const sample={performanceMs:performance.now(),sig:encode(sig),regionalEnabled:encode(regionalEnabled)};
  const changed=p.last&&(p.last.sig.truthy!==sample.sig.truthy||p.last.sig.type!==sample.sig.type||p.last.regionalEnabled.json!==sample.regionalEnabled.json||p.last.regionalEnabled.type!==sample.regionalEnabled.type);
  p.count++;if(!p.first)p.first=sample;
  if(changed){if(p.transitions.length<16)p.transitions.push(sample);else p.omittedTransitions++}
  p.last=sample;
 }catch(e){try{window.__regionalReloadCapture.pollCaptureError={name:e.name,message:e.message}}catch{}}
 return sig&&regionalEnabled;
}
async function snapshot(page){
 return page.evaluate(key=>{
  const read=fn=>{try{const value=fn();return{type:typeof value,value:value===undefined?null:value}}catch(e){return{error:{name:e.name,message:e.message}}}};
  return{url:location.href,capture:window.__regionalReloadCapture||null,now:{property:read(()=>localStorage[key]),getItem:read(()=>localStorage.getItem(key)),sig:read(()=>S.sig),regionalEnabled:read(()=>S.regionalEnabled),regionalStorage:read(()=>S.regionalStorage),symbol:read(()=>S.sym),timeframe:read(()=>S.tf),feedHealth:read(()=>feedHealth()),version:read(()=>APP_VERSION)}};
 },key);
}
async function captureReload(page,file,action,{source=path.resolve('hybrid-terminal.html')}={}){
 const evidence={schemaVersion:1,scope:'Synthetic isolated file-URL regional reload; raw regional key and actual poll operands only; no journal or other storage collection',startedAt:new Date().toISOString(),sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),events:[]};
 const event=(kind,value)=>{if(evidence.events.length<32)evidence.events.push({kind,value})};
 const pageerror=e=>event('pageerror',{name:e.name,message:e.message}),requestfailed=r=>event('requestfailed',{url:r.url(),failure:r.failure()});
 page.on('pageerror',pageerror);page.on('requestfailed',requestfailed);
 const collect=async stage=>{try{evidence[stage]=await snapshot(page)}catch(e){evidence[stage]={captureError:{name:e.name,message:e.message}}}};
 const save=()=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(evidence,null,2)+'\n')};
 await collect('beforeReload');
 try{
  await action();evidence.result='passed';await collect('afterReload');save();
 }catch(original){
  evidence.result='failed';evidence.originalError={name:original.name,message:original.message,stack:original.stack};
  try{await collect('afterReload');save()}catch(captureError){console.error('Regional reload evidence save failed: '+captureError.message)}
  throw original;
 }finally{page.off('pageerror',pageerror);page.off('requestfailed',requestfailed)}
}
module.exports={key,fixtureThenCapture,reloadPoll,captureReload};
