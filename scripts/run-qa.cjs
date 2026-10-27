'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),group=process.argv[2],suites={
 app:['regression','ui-smoke','live-chart','readability-reliability','history','increment','integrity','day-context','navigation'],
 research:['research-data'],
 audit:['readiness-audit'],
 contract:['calculation-contract'],
 preparation:['preparation'],
 presentation:['presentation','target-path','provenance-readability','planning-costs','readability-help','volume-legend','confirmed-volume','regional-windows','adr20','chart-type','manual-drawings','chart-usability','recorded-decision-review'],
 browser:['browser-smoke','browser-increment','browser-integrity','browser-day-context','browser-navigation','browser-presentation','browser-target-path','browser-provenance-readability','browser-planning-costs','browser-readability-help','browser-volume-legend','browser-confirmed-volume','browser-regional-windows','browser-adr20','browser-chart-type','browser-manual-drawings','browser-chart-usability','browser-recorded-decision-review']
}[group];
if(!suites){console.error('Usage: node scripts/run-qa.cjs app|research|audit|contract|preparation|presentation|browser');process.exit(1)}
const output=path.join(root,'.qa-results',group);fs.mkdirSync(output,{recursive:true});
const manifest={group,node:process.version,startedAt:new Date().toISOString(),scope:'Synthetic/mocked QA only; no acquired datasets or public market access',checks:[]};
(async()=>{
 for(const suite of suites){const directory=path.join(output,suite);fs.mkdirSync(directory,{recursive:true});const env={...process.env,HYBRID_QA_DIR:directory,HYBRID_QA_SCREENSHOT:path.join(directory,'screen.png')};
  // Resolve pinned QA packages from this checkout, never from an old temporary install.
  delete env.NODE_PATH;
  // Rootless Ubuntu fallback is project-local and optional; normal CI uses system dependencies.
  if(group==='browser'){delete env.LD_LIBRARY_PATH;const local=path.join(root,'.tools/browser-libs/root/usr/lib/x86_64-linux-gnu');if(fs.existsSync(local))env.LD_LIBRARY_PATH=local;}
  const frozen=['research','audit','contract','preparation'].includes(group)?['--require',path.join(root,'research/source-context/preload.cjs')]:[];
  const args=frozen.concat((group==='research'||group==='audit'||group==='contract'||group==='preparation'||group==='presentation')?['--test','tests/'+suite+'.cjs']:group==='browser'?['--require',path.join(__dirname,'mock-browser-hooks.cjs'),'tests/'+suite+'.cjs']:['tests/'+suite+'.cjs']);
  console.log('\nRunning '+suite);const log=fs.createWriteStream(path.join(output,suite+'.log'));
  const result=await new Promise(resolve=>{const child=spawn(process.execPath,args,{cwd:root,env,stdio:['ignore','pipe','pipe'],timeout:group==='browser'?180000:120000,killSignal:'SIGTERM'});
   child.stdout.on('data',data=>{process.stdout.write(data);log.write(data)});child.stderr.on('data',data=>{process.stderr.write(data);log.write(data)});
   child.on('error',e=>{log.write(e.stack+'\n');console.error(e.message)});
   child.on('close',(code,signal)=>log.end(()=>resolve({suite,exitCode:code,signal})));
  });manifest.checks.push(result);fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 }
 manifest.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 if(manifest.checks.some(c=>c.exitCode!==0)){process.exitCode=1;console.error('QA failed; diagnostics: '+output)}else console.log('PASS '+group+': '+suites.length+' suites');
})().catch(e=>{console.error(e);process.exitCode=1});
