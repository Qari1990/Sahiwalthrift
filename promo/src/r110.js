const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const IT=[['SWE-0050','BERSHKA','Half-zip sweatshirt','M',1599],
 ['PUF-0053','AMERICAN EAGLE','Logo hoodie','L',799],
 ['PUF-0049','QUECHUA','V-neck pullover','L',599],
 ['SWE-0048','MARINER','Crew sweatshirt','XL',599],
 ['HOO-0052','BLUE GEAR','Plaid zip hoodie','L',999]];
const IN=3.2,PER=6.8,N=IT.length,EN=IN+PER*N,DUR=EN+4.6,G='#39ff88';
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&family=Space+Grotesk:wght@500;700&display=swap');.jm{font-family:'JetBrains Mono',monospace}.sg{font-family:'Space Grotesk',sans-serif}
.grid{background-image:linear-gradient(rgba(57,255,136,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,136,.07) 1px,transparent 1px);background-size:60px 60px}</style>`;
const br=`${[[0,0,'border-left','border-top'],[1,0,'border-right','border-top'],[0,1,'border-left','border-bottom'],[1,1,'border-right','border-bottom']].map(([x,y,a,b])=>`<div class="a" style="${x?'right':'left'}:-14px;${y?'bottom':'top'}:-14px;width:90px;height:90px;${a}:8px solid ${G};${b}:8px solid ${G}"></div>`).join('')}`;
let sl='';IT.forEach(([k,b,l,z,p],i)=>{
 sl+=`<div class="a" id="s${i}" style="inset:0;opacity:0">
 <div class="a jm" style="left:60px;top:90px;color:${G};font-size:30px;font-weight:700">● SCAN ${String(i+1).padStart(2,'0')}/05 &nbsp; ITEM ST-${k}</div>
 <div class="a" style="left:110px;top:200px;width:860px;height:1075px">${br}
  <div class="a" style="inset:0;overflow:hidden;background:#0c1512">
   <img src="${D.street(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
   <div id="c1${i}" class="a" style="inset:0;clip-path:inset(0 0 100% 0)"><img src="${D.studio(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#fff"></div>
   <div id="c2${i}" class="a" style="inset:0;clip-path:inset(0 0 100% 0)"><img src="${D.real(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#ddd"></div>
   <div id="ln${i}" class="a" style="left:0;right:0;top:0;height:10px;background:${G};box-shadow:0 0 40px 12px rgba(57,255,136,.7);opacity:0"></div>
  </div></div>
 <div class="a jm" id="lb${i}" style="left:110px;top:1310px;width:860px;text-align:center;font-size:46px;font-weight:800;color:#0a0f0d;background:${G};padding:14px"></div>
 <div class="a sg" style="left:110px;top:1420px;width:860px;color:#fff"><div style="font-size:${b.length>10?84:110}px;font-weight:700;line-height:1">${b}</div><div style="font-size:40px;opacity:.8;margin-top:10px">${l}</div></div>
 <div class="a" id="tp${i}" style="left:60px;top:200px;width:960px;opacity:0;background:#0c1512;border:4px solid ${G};padding:40px;box-shadow:0 0 60px rgba(57,255,136,.35)">
  <div class="jm" style="color:${G};font-size:40px;font-weight:800">&gt; TAG CHECK</div>
  <div style="position:relative;margin-top:24px;height:760px;overflow:hidden"><img src="${D.tag(k)}" style="width:100%;height:100%;object-fit:cover">
   <div id="t2${i}" class="a" style="left:0;right:0;height:8px;background:${G};box-shadow:0 0 30px 8px rgba(57,255,136,.6)"></div></div>
  <div class="jm" style="color:#fff;font-size:44px;font-weight:700;margin-top:30px;line-height:1.6">
   ${[['BRAND',b+' ✓'],['TAG',' ORIGINAL ✓'],['SIZE',z+' (as per tag)']].map(([a,c],j)=>`<div id="r${i}${j}" style="opacity:0"><span style="color:${G}">${a}</span> ${c}</div>`).join('')}</div>
  <div id="pp${i}" class="sg" style="margin-top:24px;display:inline-block;background:${G};color:#0a0f0d;font-weight:700;font-size:110px;padding:6px 36px;white-space:nowrap;opacity:0">${rs(p)}</div></div>
</div>`});
const html=`${F}<div class="a grid" style="inset:0;background-color:#0a0f0d"></div>${sl}
<div class="a grid" id="intro" style="inset:0;background-color:#0a0f0d;color:#fff"><div class="a" style="left:80px;top:520px;width:920px">
 <div class="jm" style="font-size:40px;font-weight:800;color:${G}">&gt; ABCTHRIFT_SCANNER.exe</div>
 <div class="sg" style="font-size:124px;font-weight:700;line-height:.95;margin-top:30px">Is it real?<br>Let's scan it.</div>
 <div class="jm" style="font-size:38px;margin-top:40px;line-height:1.5;opacity:.9">5 sweatshirts & hoodies<br>styled look → real photo → real tag</div>
 <div class="jm" style="display:inline-block;margin-top:40px;background:${G};color:#0a0f0d;font-weight:800;font-size:50px;padding:16px 36px">from ${rs(599)}</div></div></div>
<div class="a grid" id="end" style="inset:0;opacity:0;background-color:#0a0f0d;color:#fff"><div class="a" style="left:0;width:1080px;top:470px;text-align:center">
 <div class="jm" style="font-size:44px;font-weight:800;color:${G}">SCAN COMPLETE ✓</div>
 <div class="sg" style="font-size:130px;font-weight:700;line-height:1;margin-top:30px">Real photos.<br>Real tags.</div>
 <div class="sg" style="font-size:52px;font-weight:700;margin-top:40px">Comment 1–5 to grab yours 👇</div>
 <div class="jm" style="display:inline-block;margin-top:50px;background:${G};color:#0a0f0d;font-weight:800;font-size:52px;padding:22px 46px">abcthrift.store</div>
 <div class="sg" style="font-size:38px;font-weight:500;margin-top:36px">WhatsApp 0311 4139007<br>COD all Pakistan · 7-day returns</div>
 <img src="${D.LOGOW}" style="width:280px;margin-top:56px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
st('intro',{opacity:1-P(t,IN-.4,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;st('s'+i,{opacity:on?1:0});if(!on)continue;
 const a=P(u,1.3,2.3),b=P(u,2.9,3.9);
 st('c1'+i,{clipPath:'inset(0 0 '+(100-100*a)+'% 0)'});st('c2'+i,{clipPath:'inset(0 0 '+(100-100*b)+'% 0)'});
 const sc=(u>1.3&&u<2.3)?a:(u>2.9&&u<3.9)?b:-1;st('ln'+i,{opacity:sc<0?0:1,top:(sc*1065)+'px'});
 $('lb'+i).textContent=u<1.3?'INPUT: STYLED LOOK':u<2.9?'LAYER 2: STUDIO LOOK':u<3.9?'SCANNING REAL PHOTO…':'REAL PHOTO ✓ VERIFIED';
 st('lb'+i,{background:u<3.9?'#ffffff':'${G}'});
 const tp=P(u,4.3,4.6);st('tp'+i,{opacity:tp,transform:'scale('+L(.92,1,eo(tp))+')'});
 st('t2'+i,{top:(P(u,4.6,5.3)*752)+'px',opacity:u>4.6&&u<5.3?1:0});
 for(let j=0;j<3;j++)st('r'+i+j,{opacity:P(u,5.0+j*.25,5.2+j*.25)});
 st('pp'+i,{opacity:P(u,5.8,6.0),transform:'scale('+L(.6,1,eb(P(u,5.8,6.2)))+')'});}
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r110',html,draw,dur:DUR,out:go?D.OUT+'110-reel-hoodies-scanner.mp4':null,stills:go?[]:[1.5,IN+1,IN+1.8,IN+3.4,IN+4.2,IN+6.4,EN+3]}).then(()=>console.log('ok',DUR));
