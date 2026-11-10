const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const IT=[['COA-0043','jodi by Kim Dong Su','Velvet-trim padded coat, fleece lined','L'],
 ['COA-0046','MIPHA','Hooded parka, faux-fur lining','XL'],
 ['PUF-0034','Jean Pascale','Quilted puffer, faux-fur hood','40 (UK 14)']];
const IN=3.2,PER=7.6,N=IT.length,EN=IN+PER*N,DUR=EN+4.6;
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=Italiana&family=Montserrat:wght@500;700;800;900&display=swap');.it{font-family:Italiana,serif}.mo{font-family:Montserrat,sans-serif}</style>`;
const lab=(t,bg,c)=>`<div class="mo" style="display:inline-block;background:${bg};color:${c};font-weight:800;font-size:30px;letter-spacing:.18em;padding:12px 24px;border-radius:999px">${t}</div>`;
let sl='';IT.forEach(([k,b,l,z],i)=>{
 sl+=`<div class="a" id="s${i}" style="inset:0;opacity:0">
 <div class="a" id="A${i}" style="inset:0">
  <img src="${D.real(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#eee">
  <div class="a" style="right:50px;top:330px">${lab('REAL PHOTO ✓','#fff','#7a1f3d')}</div>
  <div id="cl${i}" class="a" style="inset:0;clip-path:inset(0 0 0 0)">
   <img id="si${i}" src="${D.street(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
   <div class="a" style="left:50px;top:330px">${lab('STYLED LOOK','rgba(0,0,0,.55)','#fff')}</div></div>
  <div id="hd${i}" class="a" style="top:0;bottom:0;left:1080px;width:0">
   <div class="a" style="left:-4px;top:0;bottom:0;width:8px;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.4)"></div>
   <div class="a mo" style="left:-60px;top:900px;width:120px;height:120px;border-radius:50%;background:#fff;color:#7a1f3d;font-size:46px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.35)">⟷</div></div>
  <div class="a" style="left:0;right:0;bottom:0;height:560px;background:linear-gradient(transparent,rgba(40,8,20,.85))"></div>
  <div class="a" style="left:60px;bottom:150px;color:#fff;width:960px"><div class="it" style="font-size:${b.length>12?92:130}px;line-height:1">${b}</div><div class="mo" style="font-size:36px;font-weight:600;margin-top:14px">${l}</div></div>
 </div>
 <div class="a" id="B${i}" style="inset:0;background:#f7e9e4;opacity:0">
  <div class="a it" style="left:0;width:1080px;top:150px;text-align:center;font-size:96px;color:#7a1f3d">3 views · 1 coat</div>
  <div class="a mo" style="left:0;width:1080px;top:270px;text-align:center;font-size:32px;font-weight:700;letter-spacing:.2em;color:#a8687d">${b.toUpperCase()}</div>
  ${[['street','Styled look',40,380],['studio','Studio look',560,380]].map(([f,t,x,y],j)=>`<div class="a" id="v${i}${j}" style="left:${x}px;top:${y}px;width:480px;text-align:center"><img src="${D[f](k)}" style="width:480px;height:560px;object-fit:cover;border-radius:24px;background:#fff"><div class="mo" style="font-size:30px;font-weight:700;color:#7a1f3d;margin-top:10px">${t}</div></div>`).join('')}
  <div class="a" id="v${i}2" style="left:190px;top:1020px;width:700px;text-align:center"><div style="position:relative;border:12px solid #c9a14a;border-radius:30px;overflow:hidden;box-shadow:0 20px 50px rgba(122,31,61,.35)"><img src="${D.real(k)}" style="width:100%;height:720px;object-fit:cover;display:block;background:#eee"><div class="a mo" style="left:0;right:0;bottom:0;background:#c9a14a;color:#fff;font-weight:900;font-size:30px;letter-spacing:.08em;padding:12px;white-space:nowrap">REAL PHOTO · THE ONE YOU GET</div></div></div>
 </div>
 <div class="a" id="C${i}" style="inset:0;opacity:0;background:#7a1f3d">
  <div class="a it" style="left:0;width:1080px;top:190px;text-align:center;font-size:110px;color:#fff">Check the tag</div>
  <div class="a" id="tg${i}" style="left:140px;top:380px;width:800px;height:800px;border-radius:40px;overflow:hidden;border:14px solid #fff"><img src="${D.tag(k)}" style="width:100%;height:100%;object-fit:cover"></div>
  <div class="a" id="st${i}" style="left:620px;top:330px;width:330px;height:330px;border-radius:50%;background:#c9a14a;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.4)"><div class="mo" style="font-weight:900;font-size:44px;line-height:1.05">ORIGINAL<br>TAG ✓</div></div>
  <div class="a" style="left:0;width:1080px;top:1260px;text-align:center;color:#fff">
   <div class="mo" style="font-size:46px;font-weight:700">Size ${z} · 1 piece only</div>
   <div id="pr${i}" class="mo" style="display:inline-block;margin-top:30px;background:#fff;color:#7a1f3d;font-weight:900;font-size:120px;padding:10px 50px;border-radius:30px;white-space:nowrap">${rs(1199)}</div>
   <div class="mo" style="font-size:36px;font-weight:600;margin-top:30px;opacity:.9">COD all Pakistan · 7-day returns</div></div>
 </div></div>`});
const html=`${F}<div class="a" style="inset:0;background:#f7e9e4"></div>${sl}
<div class="a" id="intro" style="inset:0;background:#f7e9e4;color:#7a1f3d"><div class="a" style="left:0;width:1080px;top:420px;text-align:center">
 <div class="mo" style="font-size:40px;font-weight:800;letter-spacing:.3em">WOMEN'S WINTER COATS</div>
 <div class="it" style="font-size:150px;line-height:.95;margin-top:40px;white-space:nowrap">What you see<br><span style="font-size:120px">vs</span><br>what you get</div>
 <div class="mo" style="font-size:44px;font-weight:700;margin-top:50px">Swipe the slider. Real photo. Real tag.</div>
 <div class="mo" style="display:inline-block;margin-top:40px;background:#7a1f3d;color:#fff;font-weight:900;font-size:56px;padding:18px 44px;border-radius:999px">all ${rs(1199)}</div></div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:#7a1f3d;color:#fff"><div class="a" style="left:0;width:1080px;top:470px;text-align:center">
 <div class="it" style="font-size:120px;line-height:1">Love the look?<br>Get the real one.</div>
 <div class="mo" style="font-size:52px;font-weight:800;margin-top:50px">Comment 1, 2 or 3 👇</div>
 <div class="mo" style="display:inline-block;margin-top:50px;background:#c9a14a;color:#fff;font-weight:900;font-size:54px;padding:24px 50px;border-radius:999px">abcthrift.store</div>
 <div class="mo" style="font-size:38px;font-weight:700;margin-top:36px">WhatsApp 0311 4139007<br>COD all Pakistan · 7-day returns</div>
 <img src="${D.LOGOW}" style="width:280px;margin-top:56px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
st('intro',{opacity:1-P(t,IN-.4,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;st('s'+i,{opacity:on?1:0});if(!on)continue;
 st('si'+i,{transform:'scale('+L(1.1,1.02,eo(P(u,0,1.6)))+')'});
 let x=1080; if(u>1.4){x=L(1080,90,eio(P(u,1.4,2.4)));} if(u>2.5){x=L(90,540,eio(P(u,2.5,3.2)));}
 st('cl'+i,{clipPath:'inset(0 '+(1080-x)+'px 0 0)'});st('hd'+i,{left:x+'px',opacity:u>1.3?1:0});
 const b=P(u,3.7,4.1);st('B'+i,{opacity:b});
 for(let j=0;j<3;j++){const q=eo(P(u,3.9+j*.25,4.4+j*.25));st('v'+i+j,{opacity:q,transform:'translateY('+L(80,0,q)+'px)'+(j==2?' scale('+L(.9,1,eb(P(u,4.4,5)))+')':'')});}
 st('C'+i,{opacity:P(u,5.4,5.7)});
 st('tg'+i,{transform:'scale('+L(1.25,1,eo(P(u,5.4,6.4)))+')'});
 const sp=P(u,6.0,6.3);st('st'+i,{opacity:sp>0?1:0,transform:'rotate(-14deg) scale('+L(2.2,1,eo(sp))+')'});
 st('pr'+i,{transform:'scale('+L(.6,1,eb(P(u,6.3,6.8)))+')',opacity:P(u,6.3,6.5)});}
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r108',html,draw,dur:DUR,out:go?D.OUT+'108-reel-women-see-vs-get.mp4':null,stills:go?[]:[1.5,IN+1,IN+2,IN+3.4,IN+5,IN+7,EN+3]}).then(()=>console.log('ok',DUR));
