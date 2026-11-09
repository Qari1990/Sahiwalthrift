const {render,rs}=require('./lib.js');const D=__dirname+'/img10/';const go=process.argv[2]=='go';
const IT=[['bershka','BERSHKA MA-1 BOMBER','L',2899],['cars','CARS JEANS PUFFER','L',1999],['para','PARAGONA PUFFER','L',1999],
 ['hm','H&M TIE-DYE PUFFER','170',1999],['mipha','MIPHA FUR-LINED PARKA','XL',1199],['jodi','JODI VELVET COAT','L',1199]];
const IN=2.6,PER=3.0,N=IT.length,EN=IN+PER*N,DUR=EN+6.5;
let ph='',ln='';IT.forEach(([k,n,s,p],i)=>{
 ph+=`<div class="a" id="p${i}" style="left:190px;top:150px;width:700px;height:860px;background:#fff;padding:18px 18px 70px;box-shadow:0 24px 50px rgba(0,0,0,.35);opacity:0">
  <img id="pi${i}" src="${D+k}-front.jpg" style="width:100%;height:100%;object-fit:cover;object-position:50% 40%;display:block">
  <div class="a mono" style="left:0;width:100%;bottom:16px;text-align:center;font-size:30px;color:#222">#${String(i+1).padStart(2,'0')} · ${n}</div>
  <div class="a" id="pt${i}" style="right:-30px;top:40px;transform:rotate(10deg);opacity:0"><span style="display:inline-block;background:#e63946;color:#fff;font-weight:900;font-size:46px;padding:10px 24px;border-radius:12px">${rs(p)}</span></div></div>`;
 ln+=`<div id="l${i}" class="mono" style="display:flex;justify-content:space-between;font-size:32px;line-height:1.6;opacity:0"><span>${String(i+1).padStart(2,'0')} ${n} <span style="color:#777">${s}</span></span><span>${p.toLocaleString('en-US')}</span></div>`});
const html=`<style>@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=IBM+Plex+Mono:wght@500;700&display=swap');.mono{font-family:'IBM Plex Mono',monospace;font-weight:700}.sg{font-family:'Space Grotesk',sans-serif;font-weight:700}</style>
<div class="a" style="inset:0;background:#b98b5e;background-image:radial-gradient(rgba(0,0,0,.08) 2px,transparent 2px);background-size:22px 22px"></div>
<div class="a grain" style="inset:0"></div><span class="mono" style="position:absolute;opacity:0">x</span><span class="sg" style="position:absolute;opacity:0">x</span>
<div class="a" id="intro" style="left:0;width:1080px;top:640px;text-align:center;color:#fff">
 <div class="sg" id="i1" style="font-size:150px;line-height:.95;text-shadow:0 6px 0 #6b4a2b">NEW DROP<br>RECEIPT</div>
 <div class="mono" id="i2" style="font-size:40px;margin-top:40px">6 pieces · 10 Nov · Sahiwal</div></div>
${ph}
<div class="a" id="rc" style="left:110px;top:1060px;width:860px;height:820px;overflow:hidden">
 <div id="rp" style="background:#fbfaf5;color:#222;padding:34px 44px 40px;box-shadow:0 10px 30px rgba(0,0,0,.3);-webkit-mask:linear-gradient(#000,#000)">
  <div class="mono" style="text-align:center;font-size:40px;letter-spacing:.1em">ABCTHRIFT</div>
  <div class="mono" style="text-align:center;font-size:24px;color:#666;margin:6px 0 16px">ORIGINAL BRANDS · SAHIWAL · 10/11</div>
  <div style="border-top:3px dashed #999;margin-bottom:12px"></div>
  ${ln}
  <div id="tl" style="opacity:0"><div style="border-top:3px dashed #999;margin:12px 0"></div>
  <div class="mono" style="display:flex;justify-content:space-between;font-size:32px"><span>REAL TAGS</span><span>6/6 ✓</span></div>
  <div class="mono" style="display:flex;justify-content:space-between;font-size:32px"><span>STOCK EACH</span><span>1 PIECE</span></div>
  <div class="mono" style="display:flex;justify-content:space-between;font-size:32px"><span>PAYMENT</span><span>COD</span></div></div>
 </div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:rgba(30,20,12,.97)">
 <div class="a" style="left:0;width:1080px;top:520px;text-align:center;color:#fff">
  <div class="sg" style="font-size:120px;line-height:1">FROM ${rs(1199)}</div>
  <div class="mono" style="font-size:38px;margin-top:30px">first message, first served</div>
  <div style="display:inline-block;margin-top:60px;background:#e63946;color:#fff;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">WhatsApp 0311 4139007</div>
  <div style="font-size:34px;font-weight:700;margin-top:34px;color:#eee">COD all Pakistan · 7-day returns · abcthrift.store</div>
  <svg width="520" height="110" style="margin-top:60px">${Array.from({length:60},(_,j)=>`<rect x="${j*8.6}" y="0" width="${[2,4,3,5,2,3][j%6]}" height="110" fill="#fff"/>`).join('')}</svg>
  <div><img src="${__dirname}/abcthrift-logo-white.png" style="width:280px;margin-top:40px"></div></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
const a=eb(P(t,.2,1));st('i1',{opacity:C(P(t,.2,.4)),transform:'scale('+L(.6,1,a)+')'});st('i2',{opacity:eo(P(t,.9,1.5))});st('intro',{opacity:1-P(t,IN-.4,IN)});
st('rc',{opacity:P(t,IN-.3,IN)});
// receipt slides up as lines print
const lines=C((t-IN)/PER+.0);st('rp',{transform:'translateY('+L(420,0,eo(P(t,IN-.3,IN+.6)))+'px)'});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&(u<PER||i==N-1&&t<EN+.6);
 st('p'+i,{opacity:on?C(P(u,0,.25)):0,transform:'translateX('+L(i%2?700:-700,0,eo(P(u,0,.5)))+'px) rotate('+L(i%2?8:-8,(i%2?2:-2),eo(P(u,0,.6)))+'deg)'});
 st('pi'+i,{transform:'scale('+L(1,1.08,P(u,0,PER))+')'});
 st('pt'+i,{opacity:C(P(u,1.0,1.1)),transform:'rotate(10deg) scale('+L(1.8,1,eb(P(u,1.0,1.5)))+')'});
 st('l'+i,{opacity:u>=.9?1:0});}
st('tl',{opacity:eo(P(t,EN-.2,EN+.4))});
st('end',{opacity:eo(P(t,EN+2.0,EN+2.6))});`;
render({name:'r86',html,draw,dur:DUR,out:go?__dirname+'/out/86-reel-new-drop-receipt.mp4':null,stills:go?[]:[1.5,4.5,12,20.8,25]}).then(()=>console.log('ok',DUR));
