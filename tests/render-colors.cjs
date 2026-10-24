'use strict';
const fs=require('node:fs'),path=require('node:path');
const {createCanvas}=require('@napi-rs/canvas');
const {openApp}=require('./app-harness.cjs');
const {randomBars}=require('./regression.cjs');
(async()=>{
 const output=path.resolve(process.argv[2]||'chart-preview.png'),mode=process.argv[3]||'accessible';
 const labels={accessible:'High contrast',standard:'Standard',pvsra:'PVSRA'};
 if(!Object.hasOwn(labels,mode))throw Error('Expected accessible, standard or pvsra');
 const bars=randomBars(13,1000).map(b=>({...b,o:b.o*600,h:b.h*600,l:b.l*600,c:b.c*600}));
 const app=await openApp({bars,nativeCanvas:true,width:1056,height:560});
 app.exec(`S.n=80;S.off=-8;S.follow=false;S.palette=${JSON.stringify(mode)};draw()`);
 const result=createCanvas(1104,674),c=result.getContext('2d');
 c.fillStyle='#0e121c';c.fillRect(0,0,result.width,result.height);
 c.fillStyle='#e6ecfa';c.font='bold 20px sans-serif';c.fillText(`Hybrid Terminal ${app.read('APP_VERSION')} / ${labels[mode]} / filled candles`,24,32);
 c.font='14px sans-serif';c.fillStyle='#73c8ff';c.fillText(mode==='accessible'?'Blue = Up (close > open)':'Up / Down uses each candle’s own open and close',24,58);
 if(mode==='accessible'){c.fillStyle='#ffbc70';c.fillText('Orange = Down (close < open)',340,58)}
 c.drawImage(app.nativeCanvas,24,76);
 c.fillStyle='#aebdd7';c.font='12px sans-serif';c.fillText('Single chart preview from the actual renderer. Synthetic data. Change modes using Candles in the terminal toolbar.',24,656);
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,result.toBuffer('image/png'));
 console.log('Rendered one chart from application code: '+output);
})().catch(e=>{console.error(e);process.exitCode=1});
