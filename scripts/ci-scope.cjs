'use strict';
const fs=require('node:fs'),{execFileSync}=require('node:child_process');
// Explicit allowlist: research/SCHEMA.md and historical evidence can affect checks.
const DOCS=new Set(['README.md','STATUS.md','START_HERE.md','STATUS_HISTORY.md']);
const SHA=/^[0-9a-f]{40}$/i;
function documentationOnly(paths){return Array.isArray(paths)&&paths.length>0&&paths.every(p=>typeof p==='string'&&DOCS.has(p));}
function classify(eventName,event,{cwd=process.cwd()}={}){
 const full=reason=>({full:true,reason,paths:[]});
 if(eventName==='workflow_dispatch')return full('manual-full-verification');
 let before,after,range;
 if(eventName==='push'){before=event?.before;after=event?.after;range='..';}
 else if(eventName==='pull_request'){before=event?.pull_request?.base?.sha;after=event?.pull_request?.head?.sha;range='...';}
 else return full('unknown-event');
 if(!SHA.test(before||'')||!SHA.test(after||'')||/^0+$/.test(before)||/^0+$/.test(after))return full('missing-or-invalid-comparison');
 try{
  // NUL delimiting and no rename detection retain both sides of a code-to-doc rename.
  const output=execFileSync('git',['diff','--name-only','--no-renames','-z',before+range+after,'--'],{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:4*1024*1024});
  const paths=output.split('\0').filter(Boolean);
  if(!documentationOnly(paths))return{full:true,reason:paths.length?'code-test-config-or-unknown-path':'empty-diff-conservative',paths};
  for(const revision of [before,after])for(const file of paths){
   const entry=execFileSync('git',['ls-tree','-z',revision,'--',file],{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']});
   if(entry&&!entry.startsWith('100644 blob '))return{full:true,reason:'nonregular-document-change',paths};
  }
  return{full:false,reason:'allowlisted-documentation-only',paths};
 }catch{return full('comparison-unavailable-conservative');}
}
function main(){
 let event;try{event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));}catch{}
 const result=classify(process.env.GITHUB_EVENT_NAME,event);
 console.log(JSON.stringify(result,null,2));
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'full='+result.full+'\n');
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'### CI scope\n'+(result.full?'Full application/research/browser QA selected.':'Documentation-only change: scope regression checks run; application/browser QA intentionally skipped.')+'\nReason: `'+result.reason+'`.\n');
}
if(require.main===module)main();
module.exports={classify,documentationOnly};
