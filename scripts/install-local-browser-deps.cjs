'use strict';
// Rootless Ubuntu 24.04 x64 alternative for minimal WSL hosts. No system writes.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),directory=path.join(root,'.tools/browser-libs'),packages=path.join(directory,'packages'),target=path.join(directory,'root');
if(process.platform!=='linux'||process.arch!=='x64'||!fs.readFileSync('/etc/os-release','utf8').includes('VERSION_ID="24.04"'))throw Error('Use the official Playwright --with-deps installer on this OS; rootless helper targets Ubuntu 24.04 x64');
function run(cmd,args,options={}){const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',...options});if(r.error)throw r.error;if(r.status!==0)throw Error(cmd+' failed with exit '+r.status);return r}
fs.mkdirSync(packages,{recursive:true});fs.mkdirSync(target,{recursive:true});
run(process.execPath,[path.join(root,'node_modules/playwright/cli.js'),'install','chromium']);
run('apt-get',['download','libnss3','libnspr4','libasound2t64'],{cwd:packages});
for(const name of fs.readdirSync(packages).filter(n=>n.endsWith('.deb')))run('dpkg-deb',['--extract',path.join(packages,name),target]);
fs.writeFileSync(path.join(directory,'installed.json'),JSON.stringify({scope:'Rootless QA only; Ubuntu repository package metadata/hashes verified by apt-get',at:new Date().toISOString(),packages:fs.readdirSync(packages).filter(n=>n.endsWith('.deb'))},null,2)+'\n');
console.log('Local Chromium libraries ready under .tools/browser-libs; run npm run test:browser. No /tmp QA package or system installation is used.');
