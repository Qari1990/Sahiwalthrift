const {render,rs}=require('./lib.js');const D=__dirname+'/img10/';const go=process.argv[2]=='go';
// shots: [img, start, end, caption, objpos, zoomFrom, zoomTo]
const SH=[['bershka-front.jpg',2.6,6.6,'the MA-1 everyone wants','50% 45%',1.0,1.12],
 ['bershka-tagcrop.jpg',6.6,10.2,'real Bershka tag · EUR L','50% 50%',1.15,1.0],
 ['bershka-lining.jpg',10.2,13.4,'that red lining 🔥','50% 50%',1.0,1.15],
 ['bershka-sleeve.jpg',13.4,16.2,'sleeve utility pocket','50% 50%',1.1,1.0],
 ['bershka-back.jpg',16.2,19.2,'clean back · oversized fit','50% 40%',1.0,1.1]];
const DUR=26;
let sh='';SH.forEach(([f,a,b,c,op],i)=>{sh+=`<div class="a" id="s${i}" style="left:60px;top:390px;width:960px;height:1110px;overflow:hidden;border-radius:8px;opacity:0"><img id="si${i}" src="${D+f}" style="width:100%;height:100%;object-fit:cover;object-position:${op}"></div>
<div class="a sy" id="c${i}" style="left:60px;top:1540px;width:960px;font-size:48px;color:#fff;opacity:0;white-space:nowrap">${c}</div>`});
const corner=(l,t,r)=>`<div class="a" style="left:${l}px;top:${t}px;width:70px;height:70px;border:6px solid #fff;border-width:${r}"></div>`;
const html=`<style>@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@700&display=swap');.sy{font-family:Syne,sans-serif;font-weight:800;letter-spacing:-.01em}.mono{font-family:'JetBrains Mono',monospace;font-weight:700}</style>
<div class="a" style="inset:0;background:#0a0a0a"></div><span class="sy" style="position:absolute;opacity:0">x</span><span class="mono" style="position:absolute;opacity:0">x</span>
${sh}
<div class="a" id="vf" style="inset:0;opacity:0">${corner(40,370,'6px 0 0 6px')}${corner(970,370,'6px 6px 0 0')}${corner(40,1450,'0 0 6px 6px')}${corner(970,1450,'0 6px 6px 0')}
 <div class="a mono" style="left:80px;top:410px;font-size:30px;color:#fff;background:rgba(0,0,0,.55);padding:6px 14px;border-radius:8px"><span id="rec" style="color:#ff2b2b">●</span> REC <span id="tc">00:00</span></div>
 <div class="a mono" style="right:80px;top:410px;font-size:30px;color:#fff;background:rgba(0,0,0,.55);padding:6px 14px;border-radius:8px">ABCTHRIFT CAM</div></div>
<div class="a" id="pov" style="left:60px;top:90px;width:960px">
 <div class="sy" style="font-size:44px;color:#ff2b2b">POV:</div>
 <div class="sy" id="pv" style="font-size:56px;color:#fff;line-height:1.05;margin-top:6px"></div></div>
<div class="a" id="fl" style="inset:0;background:#fff;opacity:0"></div>
<div class="a" id="end" style="inset:0;opacity:0;background:#0a0a0a">
 <div class="a" style="left:0;top:0;width:1080px;height:1920px;background:radial-gradient(circle at 50% 42%,rgba(225,6,0,.55),transparent 60%)"></div>
 <div class="a" style="left:60px;width:960px;top:430px;text-align:center;color:#fff">
 <div class="mono" style="font-size:34px;letter-spacing:.3em;color:#ff8a80">BERSHKA · MA-1 BOMBER · SIZE L</div>
 <div class="sy" id="ep" style="font-size:118px;line-height:1;margin-top:30px;white-space:nowrap">${rs(2899)}</div>
 <div class="sy" style="font-size:52px;margin-top:26px;color:#ff2b2b">only 1 piece in Sahiwal</div>
 <div style="font-size:36px;font-weight:700;margin-top:24px;color:#ddd">Unisex · relaxed fit · great condition</div>
 <div style="display:inline-block;margin-top:64px;background:#ff2b2b;color:#fff;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">DM "MA1" · 0311 4139007</div>
 <div style="font-size:34px;font-weight:700;margin-top:34px;color:#bbb">COD all Pakistan · 7-day returns · abcthrift.store</div>
 <img src="${__dirname}/abcthrift-logo-white.png" style="width:300px;margin-top:70px"></div></div>`;
const draw=`const SH=${JSON.stringify(SH)};
const msg='you found an original Bershka MA-1 in Sahiwal 👀';const n=Math.floor(P(t,.3,2.3)*msg.length);$('pv').textContent=msg.slice(0,n);
st('pov',{opacity:1-P(t,19.4,19.8)});st('vf',{opacity:P(t,2.4,2.6)*(1-P(t,19.4,19.8))});
st('rec',{opacity:(t%1)<.6?1:.15});const ss=Math.floor(Math.max(0,t-2.6));$('tc').textContent='00:'+String(ss).padStart(2,'0');
let fl=0;SH.forEach((s,i)=>{const [f,a,b,c,op,z0,z1]=s;const on=t>=a&&t<b;st('s'+i,{opacity:on?1:0});
 if(on){const k=P(t,a,b);st('si'+i,{transform:'scale('+L(z0,z1,eio(k))+')'});}
 st('c'+i,{opacity:on?eo(P(t,a+.3,a+.8)):0,transform:'translateX('+L(-40,0,eo(P(t,a+.3,a+.8)))+'px)'});
 fl=Math.max(fl,1-P(Math.abs(t-a),0,.28));});
fl=Math.max(fl,1-P(Math.abs(t-19.6),0,.3));st('fl',{opacity:t<2.3?0:fl*.9});
const e=P(t,19.6,19.9);st('end',{opacity:e});const ep=eb(P(t,20,20.7));st('ep',{transform:'scale('+L(1.6,1,ep)+')',opacity:C(P(t,20,20.1))});`;
render({name:'r85',html,draw,dur:DUR,out:go?__dirname+'/out/85-reel-bershka-ma1-pov.mp4':null,stills:go?[]:[2.2,5,8,11.5,14.5,17.5,22]}).then(()=>console.log('ok',DUR));
