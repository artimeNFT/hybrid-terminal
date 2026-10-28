'use strict';
const assert=require('node:assert/strict'),P=require('./protocol.json');
const VERSION=P.models.solver,TOL=P.models.relativeRankTolerance;
const mean=a=>a.reduce((n,v)=>n+v/a.length,0);
function scales(rows){
 assert.ok(rows.length>0&&rows.every(r=>r.length===rows[0].length&&r.every(Number.isFinite)));
 return rows[0].map((_,j)=>{const values=rows.map(r=>r[j]),m=mean(values),sd=values.every(v=>v===values[0])?0:Math.hypot(...values.map(v=>v-m))/Math.sqrt(values.length);return{mean:m,sd}});
}
function transform(x,s){assert.equal(x.length,s.length);return x.map((v,j)=>{assert.ok(Number.isFinite(v)&&Number.isFinite(s[j].mean)&&Number.isFinite(s[j].sd)&&s[j].sd>0,'Nonestimable scale');const z=(v-s[j].mean)/s[j].sd;assert.ok(Number.isFinite(z));return z})}
// Householder QR with deterministic column pivoting. Recompute trailing norms;
// ties retain current column order. No X'X, explicit inverse or fallback learner.
function solve(X,y){
 const n=X.length,p=X[0]?.length;assert.ok(n>=p&&p>0&&y.length===n&&y.every(Number.isFinite));assert.ok(X.every(r=>r.length===p&&r.every(Number.isFinite)));
 const a=X.map(r=>[...r]),b=[...y],permutation=Array.from({length:p},(_,i)=>i);
 for(let k=0;k<p;k++){
  let pivot=k,best=-1;for(let j=k;j<p;j++){const norm=Math.hypot(...a.slice(k).map(r=>r[j]));if(norm>best){best=norm;pivot=j}}
  if(pivot!==k){for(const row of a)[row[k],row[pivot]]=[row[pivot],row[k]];[permutation[k],permutation[pivot]]=[permutation[pivot],permutation[k]]}
  const v=a.slice(k).map(r=>r[k]),norm=Math.hypot(...v);if(norm===0)continue;
  const alpha=v[0]>=0?-norm:norm;v[0]-=alpha;const vn=Math.hypot(...v);for(let i=0;i<v.length;i++)v[i]/=vn;
  for(let j=k;j<p;j++){let dot=0;for(let i=k;i<n;i++)dot+=v[i-k]*a[i][j];for(let i=k;i<n;i++)a[i][j]-=2*v[i-k]*dot}
  let dot=0;for(let i=k;i<n;i++)dot+=v[i-k]*b[i];for(let i=k;i<n;i++)b[i]-=2*v[i-k]*dot;
  a[k][k]=alpha;for(let i=k+1;i<n;i++)a[i][k]=0;
 }
 const diagonal=Array.from({length:p},(_,j)=>Math.abs(a[j][j])),threshold=TOL*Math.max(...diagonal),rank=diagonal.filter(v=>v>threshold).length;
 const identity={solver:VERSION,relativeRankTolerance:TOL,rank,columns:p,rows:n,threshold,diagonal,permutation};
 if(rank!==p||![...diagonal,...b].every(Number.isFinite))return{state:'nonestimable',...identity,coefficients:null};
 const z=Array(p).fill(0),coefficients=Array(p).fill(0);for(let k=p-1;k>=0;k--){let v=b[k];for(let j=k+1;j<p;j++)v-=a[k][j]*z[j];z[k]=v/a[k][k]}
 for(let j=0;j<p;j++)coefficients[permutation[j]]=z[j];if(!coefficients.every(Number.isFinite))return{state:'nonestimable',...identity,coefficients:null};return{state:'full-rank',...identity,coefficients};
}
function fit(rows,y,scalers){
 const z=rows.map(r=>[1,...transform(r,scalers)]),solution=solve(z,y);if(solution.state!=='full-rank')return solution;
 const beta=solution.coefficients,raw=beta.slice(1).map((v,j)=>v/scalers[j].sd),intercept=beta[0]-raw.reduce((n,v,j)=>n+v*scalers[j].mean,0);
 assert.ok([intercept,...raw].every(Number.isFinite));return{...solution,standardizedCoefficients:beta,rawCoefficients:[intercept,...raw],scalers};
}
function predict(model,x){const z=transform(x,model.scalers);const v=model.standardizedCoefficients[0]+z.reduce((n,v,j)=>n+v*model.standardizedCoefficients[j+1],0);assert.ok(Number.isFinite(v));return v}
module.exports={VERSION,TOL,mean,scales,transform,solve,fit,predict};
