'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),BINDING='research/source-context/perp-support-v2-0.4.25.cjs',ARCHIVE='baseline/hybrid-terminal.0.4.25.html',PIN='f81375f01a240873017e9ba4efccc7f6deff99d8b7b0c8dfdb6516da9bf7ea57';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),actual=sha(fs.readFileSync(path.join(ROOT,'hybrid-terminal.html'))),originalRead=fs.readFileSync;
function child(code,binding=null,cwd=ROOT){const env={...process.env};delete env.NODE_OPTIONS;delete env.NODE_PATH;return spawnSync(process.execPath,[...(binding?['--require',path.resolve(cwd,binding)]:[]),'-e',code],{cwd,env,encoding:'utf8',timeout:10000})}
test('closed binding reports both identities, maps only logical root reads and preserves every original pinned source',()=>{
 assert.equal(sha(fs.readFileSync(path.join(ROOT,ARCHIVE))),PIN);
 const r=child(`(async()=>{const fs=require('node:fs'),promises=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url'),{promisify}=require('node:util'),crypto=require('node:crypto'),b=require('./${BINDING}'),P=require('./research/perp-support-v2/protocol.json'),sha=v=>crypto.createHash('sha256').update(v).digest('hex'),logical=path.resolve('hybrid-terminal.html');
 const pinned=Object.fromEntries(Object.keys(P.pinnedSources).map(file=>[file,sha(fs.readFileSync(file))]));
 const reads=[fs.readFileSync(logical),fs.readFileSync(Buffer.from(logical)),fs.readFileSync(pathToFileURL(logical)),await promisify(fs.readFile)(logical),await promises.readFile(pathToFileURL(logical))].map(sha);
 console.log(JSON.stringify({identity:b.identity,mapping:b.sourceMapping,pinned,reads,other:sha(fs.readFileSync('baseline/hybrid-terminal.0.4.3.html'))}));})().catch(e=>{console.error(e);process.exitCode=1})`,BINDING);
 assert.equal(r.status,0,r.stderr);const result=JSON.parse(r.stdout),P=JSON.parse(fs.readFileSync(path.join(ROOT,'research/perp-support-v2/protocol.json')));
 assert.deepEqual(result.mapping,{'hybrid-terminal.html':ARCHIVE});assert.equal(result.identity.contextId,'closed-perp-support-v2-active-0.4.25-archive-v1');assert.equal(result.identity.liveApplicationSha256,actual);assert.equal(result.identity.archivedApplicationSha256,PIN);
 assert.deepEqual(result.pinned,P.pinnedSources);assert.deepEqual(result.reads,Array(5).fill(PIN));assert.equal(result.other,P.pinnedSources['baseline/hybrid-terminal.0.4.3.html']);assert.match(r.stderr,/archived perp-support-v2 study/);
});
test('incorrect synthetic archive bytes reject before installing read hooks; protected archive is untouched',()=>{
 const output=path.resolve(process.env.HYBRID_SOURCE_CONTEXT_QA_DIR||path.join(ROOT,'.qa-results/perp-support-v2-source-context'));fs.mkdirSync(output,{recursive:true});const fixture=fs.mkdtempSync(path.join(output,'bad-archive-'));
 fs.mkdirSync(path.join(fixture,'research/source-context'),{recursive:true});fs.mkdirSync(path.join(fixture,'baseline'));fs.copyFileSync(path.join(ROOT,BINDING),path.join(fixture,BINDING));fs.writeFileSync(path.join(fixture,'hybrid-terminal.html'),'synthetic active source');fs.writeFileSync(path.join(fixture,ARCHIVE),'incorrect synthetic archive');
 const r=child(`const fs=require('node:fs'),read=fs.readFileSync;let rejected=false;try{require('./${BINDING}')}catch(e){if(!/Archived perp-support-v2 0.4.25 bytes differ/.test(e.message))throw e;rejected=true}if(!rejected||fs.readFileSync!==read)throw Error('Invalid archive accepted or hooks installed before validation');console.log('rejected-without-hooks')`,null,fixture);
 assert.equal(r.status,0,r.stderr);assert.equal(r.stdout.trim(),'rejected-without-hooks');assert.equal(sha(fs.readFileSync(path.join(ROOT,ARCHIVE))),PIN);
});
test('binding stays in its child process and the sole original v2 test registration; ordinary reads remain actual',()=>{
 const readCode=`const fs=require('node:fs'),c=require('node:crypto');console.log(c.createHash('sha256').update(fs.readFileSync('hybrid-terminal.html')).digest('hex'))`;
 const bound=child(readCode,BINDING);assert.equal(bound.status,0,bound.stderr);assert.equal(bound.stdout.trim(),PIN);
 const unbound=child(readCode);assert.equal(unbound.status,0,unbound.stderr);assert.equal(unbound.stdout.trim(),actual);assert.strictEqual(fs.readFileSync,originalRead);assert.equal(sha(fs.readFileSync(path.join(ROOT,'hybrid-terminal.html'))),actual);
 const scripts=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'))).scripts,command='node --require ./'+BINDING+' --test tests/perp-support-v2.cjs';
 assert.equal(scripts['test:preparation'].split(command).length,2);assert.equal(scripts['test:preparation'].split('--require ./'+BINDING).length,2);
 for(const [name,value]of Object.entries(scripts))if(name!=='test:preparation')assert.ok(!value.includes(BINDING),name);
 assert.ok(!Object.values(scripts).some(s=>s.includes('NODE_OPTIONS=')));
});
