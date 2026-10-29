'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../research/aggression-increment/design.cjs'),O=require('../research/aggression-increment/ols.cjs'),{experiment}=require('../research/aggression-increment/experiment.cjs'),P=require('../research/aggression-increment/protocol.json'),S=require('../research/derivatives/schema.cjs');
const {identities}=require('../research/aggression-increment.cjs');
const STEP=300000,START=P.data.start,near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol,JSON.stringify({a,b}));
function literal(){const T=START+12*STEP,map=new Map(Array.from({length:20},(_,j)=>[START+j*STEP,{t:START+j*STEP,o:100,h:110,l:90,c:100,v:j,buy:j/2}]));map.get(START+10*STEP).c=102;Object.assign(map.get(START+11*STEP),{c:105,v:20,buy:15});map.get(T).o=200;map.get(START+18*STEP).o=204;return{T,map}}
function orthogonal(){const means=[10,-4,3,20,7,.25],sd=[2,3,4,5,6,.5],beta=[2,-3,.5,0,4,6];const x=Array.from({length:128},(_,i)=>means.map((m,j)=>m+sd[j]*((i>>j&1)?1:-1))),y=x.map((r,i)=>7+r.reduce((n,v,j)=>n+beta[j]*(v-means[j])/sd[j],0)+((i>>6&1)?.25:-.25));return{x,y,means,sd,beta}}
function synthetic(direction=1){
 const map=new Map();for(let j=0;j<P.data.rows;j++){const o=100+Math.sin(j*.17)+.3*Math.cos(j*.023),c=o+.07*Math.sin(j*.71),v=100+20*Math.sin(j*.43);map.set(START+j*STEP,{t:START+j*STEP,o,c,h:Math.max(o,c)+.1+.03*(j%7),l:Math.min(o,c)-.1-.02*(j%11),v,buy:v/2})}
 const cal=D.calendar(),opps=[...cal.train,...cal.test],ys=opps.map(o=>10000*(map.get(o.exitTime).o/map.get(o.entryTime).o-1)),max=Math.max(...ys.map(Math.abs));opps.forEach((o,j)=>{const b=map.get(o.decisionOpen);b.buy=b.v*(1+direction*ys[j]/max)/2});return map;
}
function checkedSyntheticSeal(material){const dir=process.env.HYBRID_QA_DIR||'.qa-results/aggression-increment-v1/fixtures';fs.mkdirSync(dir,{recursive:true});const f=path.join(dir,'synthetic-coefficients.json');fs.writeFileSync(f,S.canonical(material));const read=JSON.parse(fs.readFileSync(f));assert.equal(S.hash(read),S.hash(material));return read}
test('calendar literal endpoints, warm-up/split purge/tail counts and exact opens',()=>{
 const c=D.calendar();assert.equal(c.train.length,2973);assert.equal(c.test.length,1439);assert.deepEqual(c.exclusions,{train:{'initial-feature-history':2,'split-exit-purge':1},test:{'unobserved-exit':1}});
 assert.equal(new Date(c.train[0].entryTime).toISOString(),'2026-07-01T01:00:00.000Z');assert.equal(new Date(c.train.at(-1).entryTime).toISOString(),'2026-08-31T23:00:00.000Z');assert.equal(new Date(c.test[0].entryTime).toISOString(),'2026-09-01T00:00:00.000Z');assert.equal(new Date(c.test.at(-1).exitTime).toISOString(),'2026-09-30T23:30:00.000Z');for(const o of [...c.train,...c.test])assert.equal(o.exitTime-o.entryTime,1800000);
});
test('independently specified feature values and aggression signs/base units',()=>{
 const {T,map}=literal(),f=D.featureAt(map,T);assert.deepEqual(f.reasons,[]);const expected=[500,4/21,.75,40/11,200,.5];f.x.forEach((x,j)=>near(x,expected[j]));
 map.get(T-STEP).buy=0;assert.equal(D.featureAt(map,T).x[5],-1);map.get(T-STEP).buy=20;assert.equal(D.featureAt(map,T).x[5],1);map.get(T-STEP).buy=10;assert.equal(D.featureAt(map,T).x[5],0);
});
test('missing/nonfinite/flat/range/volume guards share one common mask without imputation',()=>{
 for(const mutate of [m=>m.delete(START+5*STEP),m=>m.get(START+11*STEP).c=NaN,m=>Object.assign(m.get(START+11*STEP),{o:100,c:100,h:100,l:100}),m=>m.get(START+11*STEP).v=0,m=>m.get(START+11*STEP).buy=21,m=>m.get(START+11*STEP).buy=-1,m=>{for(let j=1;j<=10;j++)m.get(START+j*STEP).v=0}]){const {T,map}=literal();mutate(map);const p=D.prepare(map,[{entryTime:T,exitTime:START+18*STEP}]);assert.equal(p.rows.length,0);assert.equal(p.quality.invalid,1);assert.ok(Object.keys(p.quality.reasons).length)}
 const {T,map}=literal();map.delete(START+18*STEP);assert.equal(D.prepare(map,[{entryTime:T,exitTime:START+18*STEP}]).rows.length,0);
});
test('target uses actual next open to i+7 open, not decision close or final close',()=>{
 const {T,map}=literal();map.get(START+17*STEP).c=999;const p=D.prepare(map,[{entryTime:T,exitTime:START+18*STEP}]),r=D.targets(p.rows)[0];near(r.y,200);assert.equal(r.entry,200);assert.equal(r.exit,204);assert.throws(()=>D.targets([{entry:Number.MIN_VALUE,exit:Number.MAX_VALUE}]),/inconclusive/);
});
test('literal orthogonal OLS expectations, intercept, population scales and training-only application',()=>{
 const f=orthogonal(),scales=O.scales(f.x);scales.forEach((s,j)=>{near(s.mean,f.means[j]);near(s.sd,f.sd[j])});const base=O.fit(f.x.map(x=>x.slice(0,5)),f.y,scales.slice(0,5)),aug=O.fit(f.x,f.y,scales);
 assert.equal(base.rank,6);assert.equal(aug.rank,7);[7,...f.beta.slice(0,5)].forEach((v,j)=>near(base.standardizedCoefficients[j],v));[7,...f.beta].forEach((v,j)=>near(aug.standardizedCoefficients[j],v));near(aug.rawCoefficients[6],12);near(aug.rawCoefficients[0],-15.041666666666666);assert.deepEqual(base.scalers,aug.scalers.slice(0,5));
 near(O.mean(f.x.map((x,i)=>(O.predict(base,x.slice(0,5))-f.y[i])**2)),36.0625);near(O.mean(f.x.map((x,i)=>(O.predict(aug,x)-f.y[i])**2)),.0625);assert.equal(O.transform([1000],[{mean:10,sd:2}])[0],495);assert.deepEqual(aug.scalers,scales);assert.equal(O.scales([[.1],[.1],[.1]])[0].sd,0);
});
test('QR detects exact/near rank deficiency at fixed tolerance, without fallback',()=>{
 assert.equal(O.solve([[1,2,2],[1,3,3],[1,4,4],[1,5,5]],[1,2,3,4]).state,'nonestimable');
 const rows=e=>Array.from({length:12},(_,i)=>[1,i,i+e*(i%2)]);assert.equal(O.solve(rows(1e-14),Array(12).fill(1)).state,'nonestimable');assert.equal(O.solve(rows(1e-7),Array(12).fill(1)).state,'full-rank');assert.equal(O.TOL,1e-12);
});
test('exact sign/flat, common-opportunity denominator, cost once, MSE and daily totals',()=>{
 const rows=[{entryTime:START,y:20,baseline:0,augmented:1},{entryTime:START+1800000,y:-20,baseline:-1,augmented:-1},{entryTime:START+3600000,y:50,baseline:0,augmented:0}],s=D.score(rows);assert.deepEqual(s.baseline.counts,{LONG:0,SHORT:1,flat:2});assert.equal(s.baseline.opportunities,3);near(s.baseline.afterModeledFeesMeanBps[10],10/3);near(s.augmented.afterModeledFeesMeanBps[10],20/3);near(s.pairedImprovement10Bps,10/3);near(s.baseline.mseBpsSquared,1087);near(s.augmented.mseBpsSquared,1074);assert.equal(s.daily['2026-07-01'].baseline.afterModeledFeesTotalBps[10],10);assert.equal(D.sign(-0),0);assert.equal(D.sign(1e-200),1);assert.equal(D.payoff(0,100,20),0);assert.throws(()=>D.sign(NaN));
 const fail=D.score([{entryTime:START,y:8,baseline:0,augmented:1}]);assert.equal(fail.augmented.afterModeledFeesMeanBps[5],3);assert.equal(fail.primaryPass,false);assert.equal(D.score([{entryTime:START,y:10,baseline:0,augmented:0}]).primaryPass,false);
});
test('nonpositive training gate fits once each, seals and never accesses September',()=>{
 const data=synthetic(-1),guard={get(t){assert.ok(t<P.data.split,'September accessed despite training rejection');return data.get(t)}};let seals=0;
 const r=experiment(guard,{sealFit:m=>{seals++;return checkedSyntheticSeal(m)}});assert.equal(r.summary.verdict,'training-rejected');assert.ok(r.summary.training.rawAggressionCoefficient<0);assert.deepEqual(r.summary.fits,{baseline:1,augmented:1});assert.equal(seals,1);assert.equal(r.summary.test.state,'test-not-evaluated');assert.equal(r.summary.test.metrics,null);assert.equal(r.raw.testRows,null);assert.ok(!r.raw.stages.includes('test-labels'));
 const zero=synthetic(1);for(const o of [...D.calendar().train,...D.calendar().test]){for(const t of [o.entryTime,o.exitTime]){const b=zero.get(t);if(b){b.o=100;b.h=Math.max(b.h,100.1);b.l=Math.min(b.l,99.9)}}}
 const z=experiment(zero,{sealFit:checkedSyntheticSeal});assert.ok(z.summary.training.rawAggressionCoefficient===0);assert.equal(z.summary.verdict,'training-rejected');assert.equal(z.summary.test.metrics,null);
});
test('positive gate verifies frozen coefficients before September, no test-set refit/scaling',()=>{
 const data=synthetic(1);let sealed=false,material;const guard={get(t){if(t>=P.data.split)assert.equal(sealed,true);return data.get(t)}};
 const r=experiment(guard,{sealFit:m=>{material=checkedSyntheticSeal(m);sealed=true;return material}});assert.equal(r.summary.test.state,'evaluated-once');assert.deepEqual(r.summary.fits,{baseline:1,augmented:1});assert.equal(r.summary.training.quality.valid,2973);assert.equal(r.summary.test.quality.valid,1439);assert.ok(r.raw.stages.indexOf('coefficient-seal-verified')<r.raw.stages.indexOf('test-labels'));assert.deepEqual(r.summary.training.models,material.models);assert.equal(r.raw.stages.filter(s=>s==='test-evaluation-once').length,1);
 assert.throws(()=>experiment(data,{sealFit:m=>({...m,trainingRows:0})}),/seal did not verify/);
});
test('coverage/constant scale failures are inconclusive, no fallback and no zero test performance',()=>{
 const gateData=synthetic(1),opps=D.calendar().train.slice(0,20);gateData.delete(opps.at(-1).exitTime);const gate=D.prepare(gateData,opps);assert.equal(gate.quality.valid,19);assert.equal(gate.quality.coveragePass,true);gateData.delete(opps.at(-2).exitTime);assert.equal(D.prepare(gateData,opps).quality.coveragePass,false);
 const bad=synthetic(1);for(const o of D.calendar().train.slice(0,200))bad.delete(o.decisionOpen);let sealed=false;let r=experiment(bad,{sealFit:m=>{sealed=true;return m}});assert.equal(r.summary.verdict,'inconclusive');assert.equal(r.summary.fits.baseline,0);assert.equal(sealed,false);assert.equal(r.summary.test.metrics,null);
 const constant=synthetic(1);for(const b of constant.values())b.buy=b.v/2;r=experiment(constant,{sealFit:m=>m});assert.equal(r.summary.verdict,'inconclusive');assert.equal(r.summary.fits.augmented,0);assert.equal(r.summary.test.metrics,null);
});
test('funding/fully adjusted values unavailable and stored descriptive output deterministic',()=>{
 assert.equal(P.components.funding.valueBps,null);assert.equal(P.components.fullyAdjustedReturn.valueBps,null);assert.match(P.components.funding.state,/not-applied/);const rows=[{entryTime:START,y:11,baseline:1,augmented:-1}];assert.equal(S.hash(D.score(rows)),S.hash(D.score(JSON.parse(JSON.stringify(rows)))));assert.throws(()=>S.hash({missing:NaN}));assert.equal(P.resources.wallSeconds,300);
});
test('historical engine/Spot/derivatives seals remain exact; isolated binding excludes old engine replay',()=>{
 for(const name of ['policy-pilot','derivatives-pilot']){const seal=JSON.parse(fs.readFileSync('research/'+name+'/seal.json'));for(const [f,h]of Object.entries(seal.identities.implementationChecksums))assert.equal(S.sha(fs.readFileSync(f)),h,f)}
 const id=identities(),pre=JSON.parse(fs.readFileSync('research/aggression-increment/seal.json')),fit=JSON.parse(fs.readFileSync('research/aggression-increment/fit-seal.json'));assert.equal(S.canonical(pre.identities),S.canonical(id));assert.equal(fit.preLabelSealHash,S.hash(pre));assert.equal(fit.protocolHash,S.hash(P));assert.equal(fit.materialHash,S.hash(fit.material));assert.equal(fit.SeptemberTargetsBeforeSeal,0);assert.equal(fit.material.trainingGate,fit.material.aggression.rawUnitBpsPerA>0?'positive':'nonpositive');assert.deepEqual(fit.material.models.baseline.scalers,fit.material.models.augmented.scalers.slice(0,5));assert.equal(id.tradeHash,P.data.tradeHash);assert.ok(!Object.keys(id.implementationChecksums).includes('research/derivatives-pilot/calculations.cjs'));assert.equal(S.sha(fs.readFileSync('baseline/hybrid-terminal.0.4.17.html')),'a059f1f3433f5780da7639e92287aaaa5b84cff1cca8e3864a43c1cecd713f5a');
});
