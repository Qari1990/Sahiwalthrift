const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const K=['COA-0046','COA-0043','COA-0038','COA-0022','PUF-0009','HOO-0033'].map(D.I);
const ST=['BOARDING','LAST CALL','BOARDING','ON TIME','LAST CALL','BOARDING'];
const IN=4.2,PER=4.6,N=K.length,EN=IN+PER*N,DUR=EN+4.4;
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&family=Barlow+Condensed:wght@600;700;800&display=swap');.sm{font-family:'Space Mono',monospace}.bc{font-family:'Barlow Condensed',sans-serif}
.fl{display:inline-block;width:29px;height:50px;margin:0 1.5px;background:#1c1c1c;border-radius:5px;color:#ffd23f;text-align:center;line-height:50px;font-size:30px;position:relative;box-shadow:inset 0 -2px 0 #000}.fl:after{content:"";position:absolute;left:0;right:0;top:50%;height:2px;background:#000}</style>`;
const pad=(s,n)=>(s.toUpperCase()+' '.repeat(n)).slice(0,n);
const rows=K.map((x,i)=>[pad(x.brandShow.replace('jodi by Kim Dong Su','JODI'),10),pad(x.size,3),pad(String(x.price),4),pad(ST[i],9)]);
let board='';rows.forEach((r,i)=>{board+=`<div id="rw${i}" style="display:flex;gap:18px;white-space:nowrap;padding:12px 16px;border-radius:12px">${r.map((c,j)=>`<div>${[...c].map((ch,q)=>`<span class="fl sm" data-c="${ch}" id="f${i}_${j}_${q}">${ch}</span>`).join('')}</div>`).join('')}</div>`});
let pass='';K.forEach((x,i)=>{pass+=`<div class="a" id="bp${i}" style="left:60px;top:860px;width:960px;opacity:0;z-index:4"><div style="display:flex;background:#fff;border-radius:30px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.6)">
 <img src="${x.img}" style="width:400px;height:620px;object-fit:cover">
 <div style="flex:1;padding:30px 34px;position:relative;border-left:6px dashed #ccc">
  <div class="bc" style="font-size:30px;font-weight:700;letter-spacing:.2em;color:#e63946">BOARDING PASS ✈</div>
  <div class="bc" style="font-size:${x.brandShow.length>12?52:72}px;font-weight:800;line-height:1;margin-top:8px;color:#111">${x.brandShow.toUpperCase()}</div>
  <div class="bc" style="font-size:32px;font-weight:600;color:#555;margin-top:6px">${x.name}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px">${[['FROM','Sahiwal'],['TO','Warm winter'],['SEAT (SIZE)',x.size],['CLASS',x.g]].map(([a,b])=>`<div><div class="sm" style="font-size:20px;color:#888">${a}</div><div class="bc" style="font-size:40px;font-weight:800;color:#111">${b}</div></div>`).join('')}</div>
  <div style="margin-top:22px;display:flex;align-items:center;justify-content:space-between"><div><div class="sm" style="font-size:20px;color:#888">FARE</div><div class="bc" style="font-size:78px;font-weight:800;color:#e63946;line-height:1">${rs(x.price)}</div></div>
   <div style="width:120px;height:120px;background:repeating-linear-gradient(90deg,#111 0 4px,#fff 4px 7px,#111 7px 9px,#fff 9px 14px)"></div></div></div></div></div>`});
const html=`${F}<div class="a" style="inset:0;background:linear-gradient(#0d1b2a,#1b263b)"></div>
<div class="a bc" style="left:60px;top:90px;color:#fff;font-size:90px;font-weight:800;line-height:1">✈ DEPARTURES</div>
<div class="a sm" style="left:64px;top:190px;color:#ffd23f;font-size:30px">FLIGHT ABC-WINTER · COATS & JACKETS · ${String(N)} SEATS LEFT</div>
<div class="a" style="left:40px;top:260px;width:1000px;background:#000;border-radius:24px;padding:20px 10px">
 <div class="sm" style="display:flex;gap:18px;padding:0 16px 10px;color:#9aa;font-size:22px"><div style="width:338px">BRAND</div><div style="width:114px">SIZE</div><div style="width:146px">RS</div><div>STATUS</div></div>${board}</div>
${pass}<div class="a bc" style="left:0;width:1080px;top:1560px;text-align:center;color:#fff;font-size:48px;font-weight:700">Comment your seat (brand) to book 👇<br><span style="color:#ffd23f;font-size:40px">COD all Pakistan · 1 piece each</span></div>
<div class="a" id="end" style="inset:0;opacity:0;background:linear-gradient(#0d1b2a,#1b263b);color:#fff;z-index:9"><div class="a" style="left:0;width:1080px;top:460px;text-align:center">
 <div class="bc" style="font-size:130px;font-weight:800;line-height:1">Final call<br>for winter ✈</div>
 <div class="bc" style="font-size:54px;font-weight:700;margin-top:30px;color:#ffd23f">Comment your seat (brand) to book 👇</div>
 <div class="bc" style="display:inline-block;margin-top:50px;background:#e63946;font-size:58px;font-weight:800;padding:20px 50px;border-radius:999px">abcthrift.store</div>
 <div style="margin-top:36px">${D.END('#fff')}</div><img src="${D.LOGOW}" style="width:280px;margin-top:50px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};const CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
document.querySelectorAll('.fl').forEach((e,n)=>{const id=e.id.split('_'),r=+id[0].slice(1),q=+id[2]+(+id[1])*10;const done=.4+r*.35+q*.04;if(t<done){e.textContent=CH[(Math.floor(t*24)+n*7)%CH.length]}else e.textContent=e.dataset.c});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s,on=u>=0&&u<PER;st('rw'+i,{background:on?'rgba(255,210,63,.25)':'transparent'});
 const a=P(u,.2,.7),b=1-P(u,PER-.4,PER);st('bp'+i,{opacity:on?Math.min(a,b):0,transform:'translateY('+L(500,0,eo(a))+'px) rotate('+L(4,0,eo(a))+'deg)'});}
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r120',html,draw,dur:DUR,out:go?D.OUT+'120-reel-departures-boarding-pass.mp4':null,stills:go?[]:[1,3.5,IN+2,IN+PER*3+2,EN+3]}).then(()=>console.log('ok',DUR));
