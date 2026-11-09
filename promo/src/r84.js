const {render,rs}=require('./lib.js');const D=__dirname+'/img10/';const go=process.argv[2]=='go';
const IT=[['mipha','MIPHA','Hooded parka','Faux-fur lined · detachable hood','XL',1199,'Plush faux-fur lining'],
 ['jodi','jodi by Kim Dong Su','Padded coat','Velvet collar & cuffs · drawstring waist','L',1199,'Soft fleece lining']];
const IN=3.4,PER=8.6,OUT=4.6,DUR=IN+PER*IT.length+OUT;
let items='';IT.forEach(([k,b,l,f,s,p,ln],i)=>{items+=`<div class="a" id="it${i}" style="inset:0;opacity:0">
 <div class="a" id="ar${i}" style="left:150px;top:300px;width:780px;height:1040px;border-radius:390px 390px 30px 30px;overflow:hidden;border:10px solid #fffaf6;box-shadow:0 30px 70px rgba(70,20,50,.28)">
  <img id="im${i}" src="${D+k}-front.jpg" style="width:100%;height:100%;object-fit:cover;object-position:50% 35%"></div>
 <div class="a" id="lc${i}" style="left:60px;top:1010px;width:400px;height:400px;border-radius:50%;overflow:hidden;border:8px solid #fffaf6;box-shadow:0 18px 40px rgba(70,20,50,.35);opacity:0">
  <img src="${D+k}-tagcrop.jpg" style="width:100%;height:100%;object-fit:cover"></div>
 <div class="a cav" id="nt${i}" style="left:475px;top:1360px;font-size:50px;color:#5a2a4f;opacity:0;white-space:nowrap">← real tag + ${ln.toLowerCase()}</div>
 <div class="a" id="tx${i}" style="left:0;width:1080px;top:1460px;text-align:center;opacity:0">
  <div class="dsd" style="font-size:${b.length>10?84:120}px;line-height:1;color:#3b1f3a">${b}</div>
  <div style="font-size:34px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#8a5a7a;margin-top:16px">${l} · Size ${s}</div>
  <div style="font-size:32px;color:#5a3a52;margin-top:10px">${f}</div></div>
 <div class="a" id="pr${i}" style="right:70px;top:250px;opacity:0;transform-origin:50% 50%">
  <div style="width:250px;height:250px;border-radius:50%;background:#3b1f3a;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(8deg);box-shadow:0 14px 30px rgba(0,0,0,.25)">
  <div style="font-size:26px;letter-spacing:.2em;font-weight:700;color:#f3c9dd">ONLY</div><div class="dsd" style="font-size:58px;line-height:1">${rs(p)}</div><div style="font-size:22px;letter-spacing:.14em;margin-top:6px;color:#f3c9dd">1 PIECE</div></div></div>
</div>`});
const html=`<style>@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');.dsd{font-family:'DM Serif Display',serif}</style>
<div class="a" style="inset:0;background:radial-gradient(circle at 50% 30%,#fbefe9,#f0d9dd 70%,#e6c7d2)"></div>
<div class="a grain" style="inset:0"></div><span class="dsd" style="position:absolute;opacity:0">x</span>
<div class="a" style="left:0;width:1080px;top:70px;text-align:center;font-size:28px;letter-spacing:.5em;font-weight:700;color:#8a5a7a" id="mh">ABCTHRIFT · WOMEN</div>
<div class="a" id="intro" style="left:0;width:1080px;top:560px;text-align:center">
 <div class="dsd" id="i1" style="font-size:96px;color:#8a5a7a;font-style:italic">the</div>
 <div class="dsd" id="i2" style="font-size:200px;line-height:.9;color:#3b1f3a">Winter<br>Edit</div>
 <div id="i3" style="font-size:40px;font-weight:600;margin-top:46px;color:#5a3a52">2 warm coats · real Korean labels</div>
 <div id="i4" class="cav" style="font-size:66px;margin-top:26px;color:#b0577f">just dropped ♡</div></div>
${items}
<div class="a" id="out" style="inset:0;opacity:0;background:#3b1f3a">
 <div class="a" style="left:0;width:1080px;top:520px;text-align:center;color:#fff">
 <div class="dsd" style="font-size:62px;font-style:italic;color:#f3c9dd">stay warm, look soft</div>
 <div class="dsd" style="font-size:150px;line-height:1;margin-top:20px">${rs(1199)}</div>
 <div style="font-size:38px;font-weight:600;margin-top:20px;letter-spacing:.12em">EACH · ONLY 1 PIECE</div>
 <div style="display:inline-block;margin-top:60px;background:#f3c9dd;color:#3b1f3a;font-weight:900;font-size:48px;padding:24px 46px;border-radius:999px">WhatsApp 0311 4139007</div>
 <div style="font-size:34px;font-weight:600;margin-top:34px;color:#e8cfe0">COD all Pakistan · 7-day returns · abcthrift.store</div>
 <img src="${__dirname}/abcthrift-logo-white.png" style="width:300px;margin-top:70px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${IT.length};
st('i1',{opacity:eo(P(t,.2,.9))});const b=eo(P(t,.5,1.5));st('i2',{opacity:b,transform:'translateY('+L(50,0,b)+'px)',letterSpacing:L(.12,0,b)+'em'});
st('i3',{opacity:eo(P(t,1.5,2.1))});st('i4',{opacity:eo(P(t,2,2.6))});st('intro',{opacity:1-P(t,IN-.45,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>-.1&&u<PER;st('it'+i,{opacity:on?C(P(u,0,.45))*(1-P(u,PER-.45,PER)):0});if(!on)continue;
 const e=eio(P(u,0,1.1));st('ar'+i,{transform:'translateY('+L(80,0,e)+'px)',clipPath:'inset('+L(100,0,e)+'% 0 0 0 round 390px 390px 30px 30px)'});
 st('im'+i,{transform:'scale('+L(1.14,1.02,eo(P(u,0,PER)))+')'});
 const tx=eo(P(u,.7,1.5));st('tx'+i,{opacity:tx,transform:'translateY('+L(40,0,tx)+'px)'});
 const g=eb(P(u,3.0,3.8));st('lc'+i,{opacity:C(P(u,3,3.2)),transform:'scale('+L(.4,1,g)+') rotate('+L(-12,0,g)+'deg)'});
 st('nt'+i,{opacity:eo(P(u,3.7,4.3))});
 const r=eb(P(u,5.2,5.9));st('pr'+i,{opacity:C(P(u,5.2,5.35)),transform:'scale('+L(.2,1,r)+')'});}
st('out',{opacity:eo(P(t,${IN+PER*IT.length},${IN+PER*IT.length+.6}))});st('mh',{opacity:1-P(t,${IN+PER*IT.length},${IN+PER*IT.length+.4})});`;
render({name:'r84',html,draw,dur:DUR,out:go?__dirname+'/out/84-reel-women-winter-edit.mp4':null,stills:go?[]:[2.8,10.5,19,24]}).then(()=>console.log('ok',DUR));
