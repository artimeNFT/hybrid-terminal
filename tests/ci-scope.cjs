'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {classify,documentationOnly}=require('../scripts/ci-scope.cjs');
const output=process.env.HYBRID_QA_DIR||path.join(__dirname,'..','.qa-results','ci-scope');fs.mkdirSync(output,{recursive:true});
function fixture(fn){const cwd=fs.mkdtempSync(path.join(output,'git-'));const git=(...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();const write=(file,text)=>{fs.mkdirSync(path.dirname(path.join(cwd,file)),{recursive:true});fs.writeFileSync(path.join(cwd,file),text);};const commit=()=>{git('add','-A');git('commit','-qm','fixture');return git('rev-parse','HEAD');};git('init','-q','-b','main');git('config','user.name','CI fixture');git('config','user.email','ci@example.invalid');try{fn({cwd,git,write,commit});}finally{fs.rmSync(cwd,{recursive:true,force:true});}}
const push=(before,after)=>({before,after});
test('only four operational documents qualify; code, schemas, evidence and unknown names never do',()=>{
 assert.equal(documentationOnly(['README.md','STATUS.md','START_HERE.md','STATUS_HISTORY.md']),true);
 for(const file of ['hybrid-terminal.html','research/SCHEMA.md','tests/results/a.md','.github/workflows/ci.yml','package.json','scripts/ci-scope.cjs','tests/ci-scope.cjs','docs/new.md','status.md','README.md\nengine.cjs'])assert.equal(documentationOnly(['STATUS.md',file]),false,file);
 assert.equal(documentationOnly([]),false);assert.equal(documentationOnly(null),false);
});
test('real multi-commit push catches earlier code even when the tip changes only documentation',()=>fixture(({cwd,write,commit})=>{
 write('README.md','base');write('app.js','base');const base=commit();write('app.js','changed');commit();write('README.md','docs');const head=commit();const result=classify('push',push(base,head),{cwd});assert.equal(result.full,true);assert.ok(result.paths.includes('app.js'));
}));
test('real documentation changes and deletion use the fast path',()=>fixture(({cwd,git,write,commit})=>{
 write('README.md','base');write('STATUS.md','old');const base=commit();write('README.md','new');git('rm','-q','STATUS.md');write('STATUS_HISTORY.md','old');const head=commit();assert.equal(classify('push',push(base,head),{cwd}).full,false);
}));
test('code renamed to an allowlisted document remains full QA',()=>fixture(({cwd,git,write,commit})=>{
 write('old.js','source');const base=commit();git('mv','old.js','README.md');const head=commit();const r=classify('push',push(base,head),{cwd});assert.equal(r.full,true);assert.ok(r.paths.includes('old.js'));
}));
test('nonregular document mode changes are conservative',()=>fixture(({cwd,git,write,commit})=>{
 write('README.md','same');const base=commit();git('update-index','--chmod=+x','README.md');git('commit','-qm','mode');const head=git('rev-parse','HEAD');assert.equal(classify('push',push(base,head),{cwd}).full,true);
}));
test('PR comparison uses merge-base; push integration still includes base-side code',()=>fixture(({cwd,git,write,commit})=>{
 write('README.md','base');write('app.js','base');const base=commit();git('checkout','-qb','topic');write('README.md','topic');const head=commit();git('checkout','-q','main');write('app.js','main change');const currentBase=commit();const event={pull_request:{base:{sha:currentBase},head:{sha:head}}};assert.equal(classify('pull_request',event,{cwd}).full,false);git('merge','-qm','merge','topic');const merged=git('rev-parse','HEAD');assert.equal(classify('push',push(base,merged),{cwd}).full,true);
}));
test('missing/zero/malformed SHAs, unavailable objects, empty diffs and manual events select full QA',()=>fixture(({cwd,write,commit})=>{
 write('README.md','base');const head=commit();for(const event of [{},push('0'.repeat(40),head),push('not-a-sha',head),push('f'.repeat(40),head),push(head,head)])assert.equal(classify('push',event,{cwd}).full,true);assert.equal(classify('workflow_dispatch',{}, {cwd}).full,true);assert.equal(classify('unknown',{}, {cwd}).full,true);
}));
test('CLI safely emits conservative scope when event data is unavailable',()=>{
 const dir=fs.mkdtempSync(path.join(output,'cli-'));try{const out=path.join(dir,'out');execFileSync(process.execPath,[path.join(__dirname,'../scripts/ci-scope.cjs')],{cwd:dir,env:{...process.env,GITHUB_EVENT_NAME:'push',GITHUB_EVENT_PATH:path.join(dir,'missing'),GITHUB_OUTPUT:out,GITHUB_STEP_SUMMARY:path.join(dir,'summary')},stdio:'pipe'});assert.equal(fs.readFileSync(out,'utf8'),'full=true\n');}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
