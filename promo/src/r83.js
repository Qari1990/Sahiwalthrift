const {render,rs}=require('./lib.js');const D=__dirname+'/img10/';const go=process.argv[2]=='go';
const IT=[['cars','CARS JEANS','Quilted puffer · Men','SIZE L',1999,'Since 1982 on the label'],
 ['para','PARAGONA','Colour-block puffer · Unisex','SIZE L',1999,'Fleece-lined stand collar'],
 ['hm','H&M','Tie-dye quilted puffer','TAG SIZE EUR 170 · 14Y+',1999,'Like-new condition']];
const IN=3.2,PER=7.4,OUT=4.6,DUR=IN+PER*IT.length+OUT;
let items='';IT.forEach(([k,b,l,s,p,f],i)=>{items+=`<div class="a" id="it${i}" style="inset:0;opacity:0">
 <div class="a" style="left:70px;top:120px;width:940px"><div class="ub" id="b${i}" style="font-size:${b.length>7?100:120}px;line-height:1;white-space:nowrap">${b}</div>
 <div style="font-size:38px;font-weight:700;margin-top:14px;color:#444">${l}</div></div>
 <div class="a" id="ph${i}" style="left:70px;top:330px;width:940px;height:1060px;border-radius:36px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.18)">
  <img id="im${i}" src="${D+k}-front.jpg" style="width:100%;height:100%;object-fit:cover;object-position:50% 40%"></div>
 <div class="a" id="tg${i}" style="left:560px;top:960px;width:470px;height:470px;border-radius:50%;overflow:hidden;border:12px solid #d4ff3a;box-shadow:0 20px 50px rgba(0,0,0,.35);opacity:0">
  <img src="${D+k}-tagcrop.jpg" style="width:100%;height:100%;object-fit:cover"></div>
 <div class="a" id="rt${i}" style="left:600px;top:1478px;opacity:0"><span style="background:#111;color:#d4ff3a;font-weight:900;font-size:34px;padding:12px 26px;border-radius:999px;letter-spacing:.06em">✓ REAL BRAND TAG</span></div>
 <div class="a" id="gq${i}" style="left:70px;top:1480px;opacity:0;font-size:44px;font-weight:900;color:#111">Guess the price? 🤔</div>
 <div class="a" id="pr${i}" style="left:70px;top:1565px;opacity:0;transform-origin:0 50%">
  <div style="display:inline-block;background:#d4ff3a;color:#111;padding:22px 44px;border-radius:24px;transform:rotate(-3deg);box-shadow:8px 8px 0 #111"><span class="ub" style="font-size:110px;line-height:1">${rs(p)}</span></div>
  <div style="font-size:36px;font-weight:800;margin-top:30px;color:#111">${s} · ${f}</div></div>
 <div class="a" style="right:70px;top:136px;font-size:30px;font-weight:800;color:#888">${i+1}/${IT.length}</div>
</div>`});
const html=`<style>@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@800;900&display=swap');.ub{font-family:Unbounded,sans-serif;font-weight:900;letter-spacing:-.02em}</style>
<div class="a" style="inset:0;background:#f2f1ec"></div>
<div class="a" style="inset:0;background-image:linear-gradient(#e4e3dd 2px,transparent 2px),linear-gradient(90deg,#e4e3dd 2px,transparent 2px);background-size:90px 90px;opacity:.7"></div>
<span class="ub" style="position:absolute;opacity:0">x</span>
<div class="a" id="intro" style="left:70px;top:520px;width:940px">
 <div id="i1" style="display:inline-block;background:#111;color:#d4ff3a;font-weight:900;font-size:36px;padding:12px 28px;border-radius:999px;letter-spacing:.14em">NEW IN · 10 NOV</div>
 <div class="ub" id="i2" style="font-size:150px;line-height:.95;margin-top:40px;color:#111">3 NEW<br>PUFFERS</div>
 <div id="i3" style="font-size:50px;font-weight:800;margin-top:40px;color:#111">Real tags. <span style="background:#d4ff3a;padding:0 10px">Real prices.</span></div>
 <div id="i4" style="font-size:36px;font-weight:700;margin-top:24px;color:#555">Only 1 piece each 👀</div></div>
${items}
<div class="a" id="out" style="inset:0;opacity:0;background:#111">
 <div class="a" style="left:70px;top:560px;width:940px;color:#fff">
 <div class="ub" style="font-size:118px;line-height:.98">ALL 3 AT<br><span style="color:#d4ff3a">${rs(1999)}</span></div>
 <div style="font-size:42px;font-weight:800;margin-top:44px">Original brands · checked tags · 1 piece each</div>
 <div style="display:inline-block;margin-top:60px;background:#d4ff3a;color:#111;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">WhatsApp 0311 4139007</div>
 <div style="font-size:36px;font-weight:700;margin-top:36px;color:#bbb">COD all Pakistan · 7-day returns<br>abcthrift.store</div>
 <img src="${__dirname}/abcthrift-logo-white.png" style="width:300px;margin-top:70px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${IT.length};
const a=eo(P(t,.2,.9));st('i1',{opacity:a,transform:'translateY('+L(30,0,a)+'px)'});
const b=eo(P(t,.6,1.4));st('i2',{opacity:b,transform:'translateY('+L(60,0,b)+'px)'});
const c=eo(P(t,1.3,2));st('i3',{opacity:c});st('i4',{opacity:eo(P(t,1.8,2.4))});
st('intro',{opacity:1-P(t,IN-.4,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>-.1&&u<PER;st('it'+i,{opacity:on?C(P(u,0,.35))*(1-P(u,PER-.35,PER)):0});if(!on)continue;
 const e=eo(P(u,0,.8));st('ph'+i,{transform:'translateY('+L(140,0,e)+'px)'});st('im'+i,{transform:'scale('+L(1.02,1.12,P(u,0,PER))+')'});
 st('b'+i,{opacity:eo(P(u,.2,.8)),transform:'translateX('+L(-60,0,eo(P(u,.2,.8)))+'px)'});
 const g=eb(P(u,2.3,3.0));st('tg'+i,{opacity:C(P(u,2.3,2.5)),transform:'scale('+L(.3,1,g)+')'});
 st('rt'+i,{opacity:eo(P(u,2.9,3.3))});
 st('gq'+i,{opacity:P(u,3.8,4.1)*(1-P(u,4.9,5.1))*(u%0.5<.38?1:.6)});
 const r=eb(P(u,5.0,5.6));st('pr'+i,{opacity:C(P(u,5,5.1)),transform:'scale('+L(1.8,1,r)+')'});}
const o=eo(P(t,${IN+PER*IT.length},${IN+PER*IT.length+.6}));st('out',{opacity:o});`;
render({name:'r83',html,draw,dur:DUR,out:go?__dirname+'/out/83-reel-new-puffers-price-reveal.mp4':null,stills:go?[]:[16.8,24.2,29]}).then(()=>console.log('ok',DUR));
