const {IMG,lib,LOGOW}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
const IT=[['ST-PUF-0053','American Eagle','Red pullover hoodie','L',799,'🔥 warm · 🦅 iconic logo'],
 ['ST-HOO-0052','Blue Gear','Plaid zip-up hoodie','XL',999,'🧩 checks · 🧥 layer-ready'],
 ['ST-SWE-0039','OBEY','Half-zip sweatshirt','S',699,'🛹 streetwear · 🟡 mustard'],
 ['ST-SWE-0017','Sean John','Quarter-zip sweatshirt','S',699,'🎤 hip-hop classic · 💙 blue'],
 ['ST-SWE-0031','LMA','Half-zip with patches','M',699,'🍫 brown · 🧵 elbow patches'],
 ['ST-SWE-0050','Bershka','Half-zip sweatshirt','L',1599,'🍷 berry colour · ✨ ribbed collar']];
const IN=3.2,PER=3.4,N=IT.length,EN=IN+PER*N,DUR=EN+5;
let cards='';IT.forEach(([s,b,l,z,p,int],i)=>{cards+=`<div class="a" id="c${i}" style="left:70px;top:230px;width:940px;height:1300px;border-radius:44px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.5);opacity:0">
 <img src="${IMG(s)}" style="width:100%;height:100%;object-fit:cover">
 <div class="a" style="left:0;right:0;bottom:0;height:560px;background:linear-gradient(transparent,rgba(0,0,0,.88))"></div>
 <div class="a" style="left:50px;bottom:60px;color:#fff;width:840px"><div style="font-size:84px;font-weight:900;line-height:1;white-space:nowrap">${b} <span style="display:inline-block;vertical-align:middle;background:#ff3c7d;font-size:48px;padding:6px 22px;border-radius:999px">${rs(p)}</span></div>
  <div style="font-size:36px;font-weight:600;margin-top:14px;opacity:.95">📍 Sahiwal · ${l} · size ${z}</div>
  <div style="display:flex;gap:14px;margin-top:22px;flex-wrap:wrap">${int.split(' · ').map(x=>`<span style="border:3px solid rgba(255,255,255,.8);border-radius:999px;padding:8px 22px;font-size:30px;font-weight:700">${x}</span>`).join('')}<span style="background:#fff;color:#111;border-radius:999px;padding:8px 22px;font-size:30px;font-weight:800">✓ original brand</span></div></div>
 <div class="a" id="lk${i}" style="left:60px;top:80px;border:8px solid #2ee59d;color:#2ee59d;font-size:90px;font-weight:900;padding:4px 30px;border-radius:18px;transform:rotate(-14deg);opacity:0">LIKE</div></div>`});
const html=`<div class="a" style="inset:0;background:#15151c"></div>
<div class="a" style="left:0;width:1080px;top:80px;text-align:center"><span style="font-size:58px;font-weight:900;background:linear-gradient(90deg,#ff3c7d,#ff8a3c);-webkit-background-clip:text;color:transparent">thriftr</span><span style="font-size:30px;color:#888;font-weight:700"> · winter edition</span></div>
${cards}
<div class="a" id="bt" style="left:0;width:1080px;top:1600px;display:flex;justify-content:center;gap:90px;opacity:0">
 <div style="width:150px;height:150px;border-radius:50%;background:#22222c;color:#ff4d6d;font-size:80px;font-weight:900;display:flex;align-items:center;justify-content:center">✕</div>
 <div id="hb" style="width:180px;height:180px;border-radius:50%;background:linear-gradient(135deg,#ff3c7d,#ff8a3c);color:#fff;font-size:96px;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 40px rgba(255,60,125,.5)">♥</div>
 <div style="width:150px;height:150px;border-radius:50%;background:#22222c;color:#5ab0ff;font-size:70px;display:flex;align-items:center;justify-content:center">★</div></div>
<div class="a" id="intro" style="left:0;width:1080px;top:640px;text-align:center;color:#fff">
 <div style="font-size:120px;font-weight:900;line-height:1">Find your<br><span style="background:linear-gradient(90deg,#ff3c7d,#ff8a3c);-webkit-background-clip:text;color:transparent">winter match</span> 💘</div>
 <div style="font-size:44px;font-weight:700;margin-top:40px;color:#bbb">Hoodies & sweatshirts · original brands</div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:linear-gradient(160deg,#ff3c7d,#ff8a3c)"><div class="a" style="left:0;width:1080px;top:300px;text-align:center;color:#fff">
 <div class="cav" style="font-size:150px;line-height:1">It's a Match!</div>
 <div style="display:flex;justify-content:center;gap:20px;margin-top:50px">${IT.slice(0,4).map(([s])=>`<img src="${IMG(s)}" style="width:200px;height:200px;border-radius:50%;object-fit:cover;border:8px solid #fff">`).join('')}</div>
 <div style="font-size:50px;font-weight:900;margin-top:60px">Hoodies & sweatshirts from ${rs(399)}</div>
 <div style="font-size:36px;font-weight:700;margin-top:14px">1 piece each · don't leave them on read 😉</div>
 <div style="display:inline-block;margin-top:56px;background:#fff;color:#ff3c7d;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">abcthrift.store</div>
 <div style="font-size:36px;font-weight:700;margin-top:30px">WhatsApp 0311 4139007 · COD all Pakistan</div>
 <img src="${LOGOW}" style="width:280px;margin-top:60px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
const a=eo(P(t,.1,.8));st('intro',{opacity:a*(1-P(t,IN-.5,IN)),transform:'scale('+L(.9,1,a)+')'});st('bt',{opacity:P(t,IN-.3,IN)*(1-P(t,EN,EN+.3))});
let hb=1;
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>-.4&&u<PER;
 const e=eo(P(u,-.4,.4)),x=ei(P(u,2.5,3.3));
 st('c'+i,{opacity:on?1:0,zIndex:N-i,transform:'translateX('+L(0,1400,x)+'px) translateY('+L(0,-120,x)+'px) rotate('+L(0,22,x)+'deg) scale('+L(.93,1,e)+')'});
 st('lk'+i,{opacity:P(u,1.9,2.3)});if(u>1.8&&u<2.6)hb=1+.25*Math.sin(P(u,1.8,2.6)*Math.PI);}
st('hb',{transform:'scale('+hb+')'});
const en=P(t,EN+.1,EN+.6);st('end',{opacity:en});`;
render({name:'r93',html,draw,dur:DUR,out:go?OUT+'93-reel-hoodies-swipe-match.mp4':null,stills:go?[]:[1.5,5.4,6,8.5,EN+3]}).then(()=>console.log('ok',DUR));
