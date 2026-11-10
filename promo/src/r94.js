const {IMG,lib,LOGOW}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
// [sku,brand,item,size,price,warmth 1-5,tempLabel]
const IT=[['ST-PUF-0009','House Basic','Hooded puffer, faux-fur hood','L',1199,5,'5°'],
 ['ST-PUF-0001','Jean Pascale','Quilted puffer bomber','XXL',1999,4,'7°'],
 ['ST-PUF-0011','TOM TOMPSON','Two-tone quilted puffer','XXL',1999,4,'8°'],
 ['ST-PUF-0003','California Republic','Hooded puffer jacket','L',1999,5,'6°'],
 ['ST-DEN-0004','BRICE','Hooded quilted puffer','L',1999,4,'9°'],
 ['ST-PUF-0041','Giordano','Quilted puffer vest','L',999,3,'12°']];
const IN=3.6,PER=3.4,N=IT.length,EN=IN+PER*N,DUR=EN+4.8;
let cards='';IT.forEach(([s,b,l,z,p,w,tp],i)=>{cards+=`<div class="a gl" id="c${i}" style="left:60px;top:560px;width:960px;height:1180px;opacity:0;padding:26px">
 <div style="display:flex;justify-content:space-between;align-items:center;color:#fff;font-size:34px;font-weight:700"><span>🧥 Outfit for ${tp}</span><span>Warmth ${'<b style="color:#ffd166">●</b>'.repeat(w)}${'<b style="opacity:.3">●</b>'.repeat(5-w)}</span></div>
 <div style="margin-top:20px;height:820px;border-radius:30px;overflow:hidden"><img src="${IMG(s)}" style="width:100%;height:100%;object-fit:cover"></div>
 <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;color:#fff"><div><div style="font-size:${b.length>14?52:64}px;font-weight:900;line-height:1;white-space:nowrap">${b}</div><div style="font-size:32px;font-weight:600;margin-top:8px;opacity:.9">${l} · ${z}</div></div>
 <div style="background:#ffd166;color:#13294b;font-weight:900;font-size:54px;padding:12px 26px;border-radius:20px;white-space:nowrap">${rs(p)}</div></div></div>`});
const html=`<style>.gl{background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.35);border-radius:44px;backdrop-filter:blur(18px)}</style>
<div class="a" id="sky" style="inset:0;background:linear-gradient(180deg,#3d6fb6,#7fb0e6)"></div>
<div class="a" id="snow" style="inset:0"></div>
<div class="a" style="left:0;width:1080px;top:110px;text-align:center;color:#fff">
 <div style="font-size:46px;font-weight:600">📍 Sahiwal · Nov nights</div>
 <div id="tmp" style="font-size:230px;font-weight:200;line-height:1;margin-top:10px">18°</div>
 <div id="cond" style="font-size:42px;font-weight:700">Getting colder… ❄️</div></div>
${cards}
<div class="a gl" id="intro" style="left:60px;top:620px;width:960px;padding:40px;color:#fff">
 <div style="font-size:34px;font-weight:700;opacity:.85">⚠️ WEATHER ALERT</div>
 <div style="font-size:84px;font-weight:900;line-height:1.05;margin-top:16px">Puffer season<br>has arrived</div>
 <div style="font-size:38px;font-weight:600;margin-top:24px;opacity:.95">Today's forecast: 100% chance of<br>original brands at thrift prices 🧥</div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:linear-gradient(180deg,#13294b,#2b4f86)"><div class="a" style="left:0;width:1080px;top:440px;text-align:center;color:#fff">
 <div style="font-size:44px;font-weight:700;opacity:.85">7-DAY FORECAST</div>
 <div style="font-size:120px;font-weight:900;line-height:1;margin-top:16px">Cold outside.<br><span style="color:#ffd166">Warm in ABCThrift.</span></div>
 <div style="font-size:46px;font-weight:800;margin-top:40px">Puffers & vests from ${rs(999)}</div>
 <div style="display:inline-block;margin-top:50px;background:#ffd166;color:#13294b;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">abcthrift.store</div>
 <div style="font-size:36px;font-weight:700;margin-top:30px">WhatsApp 0311 4139007 · COD all Pakistan · 7-day returns</div>
 <img src="${LOGOW}" style="width:280px;margin-top:56px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN},TP=${JSON.stringify(IT.map(x=>+x[6].replace('°','')))};
if(!window.sn){window.sn=[];const b=$('snow');for(let k=0;k<70;k++){const d=document.createElement('div');d.className='a';const r=4+Math.random()*10;d.style.cssText='width:'+r+'px;height:'+r+'px;border-radius:50%;background:#fff;opacity:'+(.4+Math.random()*.5);b.appendChild(d);sn.push([d,Math.random()*1080,Math.random()*1920,40+Math.random()*90,Math.random()*6])}}
for(const [d,x,y,v,ph] of sn){st(d,{left:(x+Math.sin(t+ph)*30)+'px',top:((y+t*v)%1980-40)+'px'})}
let tmp=t<IN?Math.round(L(18,10,eio(P(t,.6,IN)))):TP[Math.min(N-1,Math.floor((t-IN)/PER))];$('tmp').textContent=tmp+'°';
$('cond').textContent=t<IN?'Getting colder… ❄️':'Feels like: puffer weather 🧥';
st('sky',{background:'linear-gradient(180deg,hsl(215,'+L(50,45,P(t,0,IN))+'%,'+L(48,30,P(t,0,IN))+'%),hsl(212,60%,'+L(70,52,P(t,0,IN))+'%))'});
const a=eo(P(t,.4,1.1));st('intro',{opacity:a*(1-P(t,IN-.4,IN)),transform:'translateY('+L(60,0,a)+'px)'});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;const e=eo(P(u,0,.6)),x=eio(P(u,PER-.4,PER));
 st('c'+i,{opacity:on?C(P(u,0,.3))*(1-x):0,transform:'translateY('+L(160,0,e)+'px) scale('+L(1,.94,x)+')'});}
st('end',{opacity:eo(P(t,EN,EN+.6))});`;
render({name:'r94',html,draw,dur:DUR,out:go?OUT+'94-reel-puffers-weather-app.mp4':null,stills:go?[]:[2,5.5,15,EN+3]}).then(()=>console.log('ok',DUR));
