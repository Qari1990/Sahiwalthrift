const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const IT=[['PUF-0045','CARS JEANS','Quilted puffer jacket','LARGE',1999],
 ['PUF-0044','H&M','Tie-dye puffer jacket','14Y+ (EUR 170)',1999],
 ['PUF-0047','PARAGONA','Two-tone puffer jacket','L',1999],
 ['PUF-0042','BERSHKA','MA-1 bomber jacket','L',2899],
 ['HOO-0033','SIGGI WORKWEAR','Hooded softshell jacket','3XL',1199]];
const IN=3.2,PER=6.4,N=IT.length,EN=IN+PER*N,DUR=EN+4.5;
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Bodoni+Moda:ital,wght@0,700;0,900;1,600&display=swap');.bd{font-family:'Bodoni Moda',serif}.dm{font-family:'DM Serif Display',serif}</style>`;
const mast=(c)=>`<div class="a bd" style="left:0;width:1080px;top:40px;text-align:center;font-size:210px;font-weight:900;letter-spacing:-.02em;color:${c};line-height:1">ABC<span style="font-style:italic;font-weight:600">thrift</span></div>
<div class="a" style="left:60px;right:60px;top:268px;display:flex;justify-content:space-between;color:${c};font-weight:800;font-size:26px;letter-spacing:.2em"><span>WINTER ISSUE</span><span>THE JACKET EDIT</span><span>SAHIWAL · PK</span></div>`;
let sl='';IT.forEach(([k,b,l,z,p],i)=>{
 sl+=`<div class="a" id="s${i}" style="inset:0;opacity:0;perspective:2400px">
 <div class="a" id="pg${i}" style="inset:0;background:#f4efe6;transform-origin:left center">
  <div class="a" style="left:70px;top:330px;width:940px;height:1160px;overflow:hidden"><img src="${D.studio(k)}" style="width:100%;height:100%;object-fit:contain;background:#e9e4da"></div>
  <div class="a dm" style="left:70px;top:150px;font-size:100px;color:#111;line-height:1">The studio shot</div>
  <div class="a" style="left:74px;top:268px;font-size:28px;font-weight:700;letter-spacing:.25em;color:#a33">PAGE ${String(i*2+2).padStart(2,'0')} · ${b}</div>
  <div class="a dm" id="q${i}" style="left:70px;top:1540px;width:940px;font-size:44px;font-style:italic;color:#333;line-height:1.25">"${l}. Clean, warm, and ready for the cold." <br><span style="font-style:normal;font-size:34px;color:#777">Studio look for display — real photo next →</span></div>
 </div>
 <div class="a" id="cv${i}" style="inset:0;transform-origin:left center;backface-visibility:hidden">
  <img src="${D.street(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
  <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5),transparent 28%,transparent 55%,rgba(0,0,0,.8))"></div>
  ${mast('#fff')}
  <div class="a" style="left:60px;top:420px;color:#fff"><div style="font-size:30px;font-weight:800;letter-spacing:.2em">COVER STORY Nº${i+1}</div></div>
  <div class="a" style="left:60px;bottom:200px;width:960px;color:#fff"><div class="bd" style="font-size:${b.length>9?96:150}px;font-weight:900;line-height:.95">${b}</div>
   <div class="dm" style="font-size:52px;font-style:italic;margin-top:10px">${l}</div>
   <div style="display:inline-block;margin-top:24px;border:3px solid #fff;font-size:28px;font-weight:800;letter-spacing:.18em;padding:8px 20px">STYLED LOOK</div></div>
 </div>
 <div class="a" id="po${i}" style="left:150px;top:300px;width:780px;background:#fff;padding:28px 28px 120px;box-shadow:0 30px 60px rgba(0,0,0,.45);opacity:0">
  <img src="${D.real(k)}" style="width:724px;height:900px;object-fit:cover;display:block">
  <div class="a cav" style="left:0;right:0;bottom:24px;text-align:center;font-size:66px;color:#222">the real one 📸</div>
  <div class="a" id="sp${i}" style="right:-40px;top:40px;border:8px solid #d7262e;color:#d7262e;font-weight:900;font-size:62px;padding:8px 26px;border-radius:14px;letter-spacing:.04em;background:rgba(255,255,255,.85);text-align:center;line-height:1">REAL PHOTO<div style="font-size:30px;letter-spacing:.15em;margin-top:6px">NO FILTER ✓</div></div>
 </div>
 <div class="a" id="tg${i}" style="left:110px;top:1160px;width:520px;height:520px;border-radius:50%;overflow:hidden;border:14px solid #111;box-shadow:0 20px 50px rgba(0,0,0,.5);opacity:0"><img src="${D.tag(k)}" style="width:100%;height:100%;object-fit:cover"></div>
 <div class="a" id="tl${i}" style="left:600px;top:1260px;width:440px;opacity:0;color:#111">
  <div style="background:#111;color:#fff;font-weight:900;font-size:34px;letter-spacing:.12em;padding:12px 20px;display:inline-block">ORIGINAL TAG ✓</div>
  <div class="dm" style="font-size:44px;margin-top:16px;line-height:1.1;background:#f4efe6;padding:10px 16px">Size ${z}</div>
  <div class="bd" style="font-size:84px;font-weight:900;margin-top:14px;background:#e9c46a;padding:4px 18px;display:inline-block;white-space:nowrap">${rs(p)}</div></div>
</div>`});
const html=`${F}<div class="a" style="inset:0;background:#f4efe6"></div>${sl}
<div class="a" id="intro" style="inset:0;background:#f4efe6;color:#111">${mast('#111')}
 <div class="a" style="left:60px;top:440px;width:960px;height:1020px;overflow:hidden"><img src="${D.street('PUF-0042')}" style="width:100%;height:100%;object-fit:cover"></div>
 <div class="a" style="left:60px;top:1500px;width:960px"><div class="bd" style="font-size:118px;font-weight:900;line-height:.95">The Jacket Edit</div>
 <div class="dm" style="font-size:46px;font-style:italic;margin-top:14px">5 original-brand jackets · real photos · real tags</div></div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:#111;color:#fff">${mast('#fff')}
 <div class="a" style="left:0;width:1080px;top:560px;text-align:center">
 <div class="dm" style="font-size:64px;font-style:italic">Which cover is yours?</div>
 <div class="bd" style="font-size:130px;font-weight:900;line-height:1;margin-top:30px">Comment<br>1 – 5</div>
 <div style="font-size:42px;font-weight:700;margin-top:40px">1 piece each · first come, first served</div>
 <div style="display:inline-block;margin-top:50px;background:#e9c46a;color:#111;font-weight:900;font-size:52px;padding:24px 48px">abcthrift.store</div>
 <div style="font-size:36px;font-weight:700;margin-top:34px">WhatsApp 0311 4139007<br>COD all Pakistan · 7-day returns</div>
 <img src="${D.LOGOW}" style="width:260px;margin-top:50px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
st('intro',{opacity:1-P(t,IN-.4,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;st('s'+i,{opacity:on?1:0});if(!on)continue;
 const f=eio(P(u,1.8,2.5));st('cv'+i,{transform:'rotateY('+(-100*f)+'deg)',opacity:f>.98?0:1});
 st('cv'+i+'',{});
 const sc='scale('+L(1.08,1,eo(P(u,0,2)))+')';document.querySelector('#cv'+i+' img').style.transform=sc;
 const po=eo(P(u,3.6,4.1));st("q"+i,{opacity:1-po});st('po'+i,{opacity:po,transform:'translateY('+L(900,0,po)+'px) rotate('+L(12,-4,po)+'deg)'});
 const sp=P(u,4.2,4.5);st('sp'+i,{opacity:sp>0?1:0,transform:'rotate(12deg) scale('+L(2.4,1,eo(sp))+')'});
 const tg=P(u,4.9,5.3);st('tg'+i,{opacity:tg>0?1:0,transform:'scale('+L(.2,1,eb(tg))+')'});
 st('tl'+i,{opacity:P(u,5.2,5.5),transform:'translateX('+L(60,0,eo(P(u,5.2,5.6)))+'px)'});}
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r107',html,draw,dur:DUR,out:go?D.OUT+'107-reel-jacket-edit-magazine.mp4':null,stills:go?[]:[IN+6]}).then(()=>console.log('ok',DUR));
