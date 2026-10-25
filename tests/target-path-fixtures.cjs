'use strict';
const day=Date.UTC(2026,9,20),step=300000;
function bars(last=96,interval=step){return Array.from({length:500},(_,i)=>i===300?{t:day+i*interval,o:104,c:103,h:104.5,l:102.5,v:10000}:{t:day+i*interval,o:(i===499?last:100)-.1,c:i===499?last:100,h:(i===499?last:100)+.5,l:(i===499?last:100)-.5,v:100})}
function dailyRows(url){const u=new URL(url),from=+u.searchParams.get('startTime'),end=+u.searchParams.get('endTime'),rows=[];for(let t=from;t<=end;t+=86400000)rows.push([t,'103','103.5','102.5','103','100',t+86400000-1]);return rows}
const isDaily=req=>req.interval==='1d'&&new URL(req.url).searchParams.has('startTime');
const settle=async a=>{for(let i=0;i<5;i++)await a.flush()};
module.exports={day,step,bars,dailyRows,isDaily,settle};
