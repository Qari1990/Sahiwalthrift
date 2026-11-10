const {IMG,TG,lib,LOGOW}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
const IT=[['ST-PUF-0041','GIORDANO','Quilted puffer vest',999,'giordano',53,52],['ST-SWE-0030','H&M','Striped crew sweatshirt',999,'hm',49,42],
 ['ST-SWE-0039','OBEY','Half-zip sweatshirt',699,'obey',43,38],['ST-SWE-0017','SEAN JOHN','Quarter-zip sweatshirt',699,'seanjohn',53,60],
 ['ST-COA-0038','RECEL','Crown-print hooded jacket',1599,'recel',46,45],['ST-COA-0022','IDENTIC','Sherpa corduroy trucker',1499,'identic',47,41]];
const IN=3.2,PER=4.2,N=IT.length,EN=IN+PER*N,DUR=EN+4.6;
let q='';IT.forEach(([s,b,l,p,tg,fx,fy],i)=>{q+=`<div class="a" id="q${i}" style="inset:0;opacity:0">
 <div class="a" style="left:0;width:1080px;top:170px;text-align:center"><span style="background:#ffd400;color:#000;font-weight:900;font-size:40px;padding:12px 30px;border-radius:12px">ROUND ${i+1} / ${N}</span></div>
 <div class="a" id="tw${i}" style="left:140px;top:300px;width:800px;height:800px;border-radius:50%;overflow:hidden;border:14px solid #ffd400">
  <img id="ti${i}" src="${TG}tag-${tg}.jpg" style="width:100%;height:100%;object-fit:cover;object-position:${fx}% ${fy}%;transform-origin:${fx}% ${fy}%"></div>
 <svg class="a" style="left:120px;top:280px" width="840" height="840"><circle id="rg${i}" cx="420" cy="420" r="410" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="2576" stroke-dashoffset="0" transform="rotate(-90 420 420)"/></svg>
 <div class="a" id="cd${i}" style="left:0;width:1080px;top:1180px;text-align:center;font-size:170px;font-weight:900;color:#fff">3</div>
 <div class="a" id="ph${i}" style="left:90px;top:1120px;width:380px;height:475px;border-radius:24px;overflow:hidden;border:6px solid #fff;opacity:0"><img src="${IMG(s)}" style="width:100%;height:100%;object-fit:cover"></div>
 <div class="a" id="rv${i}" style="left:510px;top:1150px;width:520px;opacity:0;color:#fff">
  <div style="font-size:30px;font-weight:800;color:#ffd400;letter-spacing:.14em">IT'S…</div>
  <div class="anton" style="font-size:${b.length>7?96:124}px;line-height:1;margin-top:8px">${b}</div>
  <div style="font-size:32px;font-weight:600;margin-top:12px;color:#ddd">${l}</div>
  <div style="display:inline-block;margin-top:22px;background:#ffd400;color:#000;font-weight:900;font-size:58px;padding:10px 26px;border-radius:16px">${rs(p)}</div></div></div>`});
const html=`<div class="a" style="inset:0;background:radial-gradient(circle at 50% 35%,#2a2a2a,#0b0b0b 70%)"></div>
<div class="a" style="left:0;width:1080px;top:60px;text-align:center"><span class="anton" style="font-size:72px;color:#fff">GUESS THE <span style="color:#ffd400">BRAND</span> 🔍</span></div>
${q}
<div class="a" id="intro" style="left:0;width:1080px;top:600px;text-align:center;color:#fff">
 <div class="anton" style="font-size:200px;line-height:.9">CAN YOU<br><span style="color:#ffd400">NAME IT?</span></div>
 <div style="font-size:44px;font-weight:700;margin-top:40px">We zoom into the real tag.<br>You guess the brand before 3 ⏱️</div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:#ffd400"><div class="a" style="left:0;width:1080px;top:480px;text-align:center;color:#000">
 <div class="anton" style="font-size:150px;line-height:.92">HOW MANY<br>DID YOU GET?</div>
 <div style="font-size:48px;font-weight:900;margin-top:40px">Comment your score 👇 (out of ${N})</div>
 <div style="font-size:38px;font-weight:700;margin-top:20px">Every tag is real · every piece is 1 of 1</div>
 <div style="display:inline-block;margin-top:50px;background:#000;color:#ffd400;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">abcthrift.store</div>
 <div style="font-size:36px;font-weight:800;margin-top:30px">WhatsApp 0311 4139007 · COD all Pakistan</div></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
const a=eo(P(t,.1,.8));st('intro',{opacity:a*(1-P(t,IN-.4,IN)),transform:'scale('+L(1.2,1,a)+')'});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;st('q'+i,{opacity:on?C(P(u,0,.2))*(1-P(u,PER-.2,PER)):0});if(!on)continue;
 const k=P(u,.2,2.2);st('ti'+i,{transform:'scale('+L(3.2,1.25,eio(P(u,0,2.6)))+')',filter:'blur('+L(16,0,eio(P(u,.3,2.4)))+'px)'});
 $('rg'+i).setAttribute('stroke-dashoffset',''+(2576*k));
 const n=3-Math.floor(k*3);$('cd'+i).textContent=n>0?n:'';st('cd'+i,{opacity:u<2.2?1:0,transform:'scale('+(1+.2*((k*3)%1))+')'});
 const r=eb(P(u,2.3,2.9));st('ph'+i,{opacity:C(P(u,2.3,2.4)),transform:'translateX('+L(-300,0,r)+'px) rotate('+L(-8,-2,r)+'deg)'});
 st('rv'+i,{opacity:C(P(u,2.5,2.7)),transform:'scale('+L(1.4,1,eb(P(u,2.5,3.0)))+')'});}
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r95',html,draw,dur:DUR,out:go?OUT+'95-reel-guess-the-brand.mp4':null,stills:go?[]:[1.5,4.2,5.2,7,10.5,EN+3]}).then(()=>console.log('ok',DUR));
