const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const K=['SWE-0050','SWE-0039','SWE-0017','PUF-0053','SWE-0031','SWE-0030','SWE-0048'].map(D.I);
const IN=2.8,PER=4.4,N=K.length,EN=IN+PER*N,DUR=EN+4.4,FH=820;
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Courier+Prime:wght@700&display=swap');.pm{font-family:'Permanent Marker',cursive}.cp{font-family:'Courier Prime',monospace}
.hole{width:34px;height:46px;border-radius:7px;background:#2a0505;margin:18px auto}</style>`;
let fr='';K.forEach((x,i)=>{fr+=`<div style="position:absolute;left:0;top:${i*FH}px;width:760px;height:${FH}px;display:flex;align-items:center;justify-content:center">
 <img id="im${i}" src="${x.img}" style="width:620px;height:740px;object-fit:cover;border-radius:6px">
 <div class="a cp" style="left:24px;bottom:10px;color:#f5a623;font-size:24px">${String(i+1).padStart(2,'0')}A ▸ ABC 400</div></div>`});
let lab='';K.forEach((x,i)=>{lab+=`<div class="a" id="lb${i}" style="left:60px;top:1480px;width:960px;opacity:0;z-index:4"><div class="pm" style="font-size:${x.brandShow.length>14?66:92}px;color:#fff;line-height:1;text-shadow:0 4px 0 #000">${x.brandShow}</div>
 <div class="cp" style="font-size:30px;color:#ffd7c2;margin-top:12px;white-space:nowrap">${x.name} · ${x.g} · size ${x.size}</div>
 <div class="pm" style="display:inline-block;margin-top:14px;font-size:76px;color:#ff2d2d;background:#fff6e8;padding:2px 30px;transform:rotate(-3deg)">${rs(x.price)}</div></div>`});
const html=`${F}<div class="a" style="inset:0;background:radial-gradient(circle at 50% 30%,#7a0b0b,#1a0202 75%)"></div>
<div class="a pm" style="left:0;width:1080px;top:60px;text-align:center;color:#ffb199;font-size:64px">from the darkroom 🎞️</div>
<div class="a" style="left:100px;top:160px;width:880px;height:${FH+460}px;overflow:hidden">
 <div id="strip" class="a" style="left:0;top:0;width:880px">
  <div class="a" style="left:0;top:0;width:60px;height:${FH*N+2000}px;background:#111"><div style="height:100%;background:repeating-linear-gradient(#111 0 18px,#2a0505 18px 64px,#111 64px 82px);margin:0 13px;border-radius:6px"></div></div>
  <div class="a" style="left:60px;top:0;width:760px;height:${FH*N+2000}px;background:#0e0e0e">${fr}</div>
  <div class="a" style="left:820px;top:0;width:60px;height:${FH*N+2000}px;background:#111"><div style="height:100%;background:repeating-linear-gradient(#111 0 18px,#2a0505 18px 64px,#111 64px 82px);margin:0 13px;border-radius:6px"></div></div>
 </div></div>
<div id="ring" class="a" style="left:190px;top:186px;width:700px;height:800px;border:10px solid #ff2d2d;border-radius:46% 54% 50% 50%/52% 48% 52% 48%;opacity:0;z-index:3;transform:rotate(-8deg)"></div>
${lab}
<div class="a" id="intro" style="inset:0;background:radial-gradient(circle at 50% 40%,#7a0b0b,#1a0202 75%);z-index:8"><div class="a" style="left:0;width:1080px;top:600px;text-align:center">
 <div class="pm" style="font-size:150px;color:#fff;line-height:1">Developing...</div><div class="cp" style="font-size:44px;color:#ffb199;margin-top:30px">7 sweatshirts & hoodies · real photos</div></div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:radial-gradient(circle at 50% 40%,#7a0b0b,#1a0202 75%);z-index:9;color:#fff"><div class="a" style="left:0;width:1080px;top:460px;text-align:center">
 <div class="pm" style="font-size:120px;line-height:1.05">Which shot<br>is yours? 📸</div>
 <div class="cp" style="font-size:46px;margin-top:30px;color:#ffd7c2">Comment the frame number 01-07</div>
 <div class="pm" style="display:inline-block;margin-top:44px;background:#fff6e8;color:#ff2d2d;font-size:60px;padding:10px 46px">abcthrift.store</div>
 <div style="margin-top:36px">${D.END('#fff')}</div><img src="${D.LOGOW}" style="width:280px;margin-top:50px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN},FH=${FH};
st('intro',{opacity:1-P(t,IN-.5,IN)});
let y=0;if(t>=IN){const j=Math.min(N-1,Math.floor((t-IN)/PER)),u=t-IN-j*PER;y=(j-1)*FH+FH*eio(P(u,0,1));if(j==0)y=L(-FH*.6,0,eio(P(u,0,1)));
 for(let i=0;i<N;i++){const on=i==j&&t<EN,dv=P(u,1,2);st('im'+i,{filter:i<j?'none':i>j?'invert(1) hue-rotate(180deg) brightness(.8)':'invert('+(1-dv)+') hue-rotate('+(180*(1-dv))+'deg) brightness('+L(.8,1,dv)+')'});
  const a=P(u,2.1,2.4),b=1-P(u,PER-.3,PER);st('lb'+i,{opacity:on?Math.min(a,b):0,transform:'translateY('+L(40,0,eo(a))+'px)'});}
 const r=P(u,2.2,2.6);st('ring',{opacity:t<EN?Math.min(r,1-P(u,PER-.3,PER))*.9:0,transform:'rotate(-8deg) scale('+L(1.3,1,eo(r))+')'});}
st('strip',{transform:'translateY('+(-y)+'px)'});
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r122',html,draw,dur:DUR,out:go?D.OUT+'122-reel-darkroom-film-roll.mp4':null,stills:go?[]:[IN+.5,IN+1.5,IN+3,IN+PER+3,EN+3]}).then(()=>console.log('ok',DUR));
