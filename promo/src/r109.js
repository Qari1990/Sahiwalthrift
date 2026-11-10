const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const IT=[['SWE-0057','Naruto Shippuden','Printed sweatshirt','9-10Y (140cm)',1499],
 ['SWE-0058','C&A','Unicorn sweatshirt','10Y (140cm)',499],
 ['SWE-0054','Inextenso','Colour-block hoodie','10Y',399],
 ['SWE-0027','okaïdi','Striped sweatshirt','12Y (152cm)',499]];
const IN=3.4,PER=7.4,N=IT.length,EN=IN+PER*N,DUR=EN+4.6;
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Chewy&display=swap');.fr{font-family:Fredoka,sans-serif}.ch{font-family:Chewy,cursive}
.bulbs{background-image:radial-gradient(circle,#ffe58a 0 7px,transparent 8px);background-size:44px 44px;background-position:center}</style>`;
const cur=(i)=>`<div class="a" id="cL${i}" style="left:0;top:0;width:540px;height:1920px;transform-origin:left;background:repeating-linear-gradient(90deg,#9e1020 0 40px,#c21a2e 40px 70px,#8a0d1b 70px 90px);box-shadow:10px 0 30px rgba(0,0,0,.6);z-index:5"></div>
<div class="a" id="cR${i}" style="left:540px;top:0;width:540px;height:1920px;transform-origin:right;background:repeating-linear-gradient(90deg,#8a0d1b 0 20px,#c21a2e 20px 50px,#9e1020 50px 90px);box-shadow:-10px 0 30px rgba(0,0,0,.6);z-index:5"></div>`;
let sl='';IT.forEach(([k,b,l,z,p],i)=>{
 const fr=(f,j)=>`<img id="im${i}${j}" src="${D[f](k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${j?0:1};background:#fff">`;
 sl+=`<div class="a" id="s${i}" style="inset:0;opacity:0">
 <div class="a" style="inset:0;background:radial-gradient(ellipse 60% 45% at 50% 42%,#4b2a7a,#1a0f2e 70%)"></div>
 <div class="a" style="left:80px;top:250px;width:920px;height:1150px;border-radius:30px;overflow:hidden;border:16px solid #ffd54a;box-shadow:0 0 80px rgba(255,213,74,.45)">${fr('street',0)}${fr('studio',1)}${fr('real',2)}
  <div class="a fr" id="bd${i}" style="left:30px;top:30px;background:#ff3d7f;color:#fff;font-weight:700;font-size:40px;padding:10px 26px;border-radius:999px">⭐ Styled look</div>
  <div class="a" id="rb${i}" style="right:24px;bottom:24px;width:300px;height:300px;border-radius:50%;background:#2ecc71;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:8px solid #fff;opacity:0"><div class="ch" style="font-size:62px;line-height:1">REAL<br>PHOTO ✓</div><div class="fr" style="font-size:26px;font-weight:600;margin-top:6px">what you get</div></div></div>
 <div class="a bulbs" style="left:60px;top:1440px;width:960px;height:220px;border-radius:30px;background-color:#2b1650;border:6px solid #ffd54a"></div>
 <div class="a" style="left:100px;top:1475px;width:880px;height:150px;border-radius:18px;background:#fff7e0;display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div class="fr" style="font-size:28px;font-weight:700;letter-spacing:.3em;color:#c21a2e">NOW STARRING</div><div class="ch" style="font-size:${b.length>12?66:80}px;color:#2b1650;line-height:1">${b}</div></div>
 <div class="a fr" style="left:0;width:1080px;top:1700px;text-align:center;color:#fff;font-size:42px;font-weight:600">${l} · age ${z}</div>
 <div class="a" id="tk${i}" style="left:90px;top:330px;width:900px;opacity:0;z-index:4">
  <div style="background:#fff7e0;border-radius:40px;padding:40px;box-shadow:0 30px 60px rgba(0,0,0,.6);text-align:center;border:6px dashed #c21a2e">
   <div class="ch" style="font-size:80px;color:#c21a2e;line-height:1">Original tag ✓</div>
   <img src="${D.tag(k)}" style="width:740px;height:740px;object-fit:cover;border-radius:30px;margin-top:24px">
   <div class="fr" style="font-size:44px;font-weight:700;color:#2b1650;margin-top:18px">Tag says: ${z}</div>
   <div style="display:inline-block;margin-top:16px;background:#c21a2e;color:#fff;border-radius:20px;padding:10px 40px"><span class="fr" style="font-size:30px;font-weight:700;letter-spacing:.2em">ADMIT ONE</span><div class="ch" style="font-size:110px;line-height:1;white-space:nowrap">${rs(p)}</div></div></div></div>
 ${cur(i)}</div>`});
const html=`${F}<div class="a" style="inset:0;background:#1a0f2e"></div>${sl}
<div class="a" id="intro" style="inset:0;background:radial-gradient(ellipse 60% 45% at 50% 45%,#5a3290,#1a0f2e 70%);color:#fff"><div class="a" style="left:0;width:1080px;top:470px;text-align:center">
 <div class="fr" style="font-size:44px;font-weight:700;letter-spacing:.3em;color:#ffd54a">ABCTHRIFT PRESENTS</div>
 <div class="ch" style="font-size:190px;line-height:.95;margin-top:30px">The Kids<br>Winter Show</div>
 <div class="fr" style="font-size:48px;font-weight:600;margin-top:40px">4 stars · real photos · real tags</div>
 <div class="fr" style="display:inline-block;margin-top:40px;background:#ffd54a;color:#2b1650;font-weight:700;font-size:54px;padding:18px 44px;border-radius:999px">from ${rs(399)}</div></div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:radial-gradient(ellipse 60% 45% at 50% 45%,#5a3290,#1a0f2e 70%);color:#fff"><div class="a" style="left:0;width:1080px;top:460px;text-align:center">
 <div class="ch" style="font-size:140px;line-height:1">Who's your<br>little star? ⭐</div>
 <div class="fr" style="font-size:54px;font-weight:700;margin-top:40px">Comment 1, 2, 3 or 4 👇</div>
 <div class="fr" style="display:inline-block;margin-top:50px;background:#ffd54a;color:#2b1650;font-weight:700;font-size:54px;padding:24px 50px;border-radius:999px">abcthrift.store</div>
 <div class="fr" style="font-size:38px;font-weight:600;margin-top:36px">WhatsApp 0311 4139007<br>COD all Pakistan · 7-day returns</div>
 <img src="${D.LOGOW}" style="width:280px;margin-top:56px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};const LB=['⭐ Styled look','🎬 Studio look','📸 Real photo'];
st('intro',{opacity:1-P(t,IN-.4,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;st('s'+i,{opacity:on?1:0});if(!on)continue;
 const c=eio(P(u,.2,1.3));st('cL'+i,{transform:'scaleX('+L(1,.08,c)+')'});st('cR'+i,{transform:'scaleX('+L(1,.08,c)+')'});
 const a1=P(u,2.6,3.0),a2=P(u,3.9,4.2);st('im'+i+'1',{opacity:a1});st('im'+i+'2',{opacity:a2});
 st('im'+i+'0',{transform:'scale('+L(1.15,1,eo(P(u,0,2.6)))+')'});
 $('bd'+i).textContent=LB[u<2.8?0:u<4.05?1:2];st('bd'+i,{background:u<4.05?'#ff3d7f':'#2ecc71'});
 const r=P(u,4.3,4.7);st('rb'+i,{opacity:r>0?1:0,transform:'rotate(-10deg) scale('+L(.2,1,eb(r))+')'});
 const k=P(u,5.6,6.0);st('tk'+i,{opacity:k,transform:'translateY('+L(300,0,eo(k))+'px) rotate('+L(6,-1.5,eo(k))+'deg)'});}
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r109',html,draw,dur:DUR,out:go?D.OUT+'109-reel-kids-winter-show.mp4':null,stills:go?[]:[1.5,IN+.7,IN+2,IN+3.4,IN+5,IN+7,EN+3]}).then(()=>console.log('ok',DUR));
