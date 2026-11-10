const {IMG,lib,LOGOW}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
const IT=[['ST-SWE-0050','BERSHKA','Half-zip sweatshirt','L',1599],['ST-PUF-0053','AMERICAN EAGLE','Pullover hoodie','L',799],
 ['ST-SWE-0048','MARINER','Embroidered crewneck','XL',599],['ST-SWE-0051','DASSY','Half-zip sweatshirt','L',599],
 ['ST-PUF-0049','QUECHUA','Fleece sweatshirt','L',599],['ST-HOO-0052','BLUE GEAR','Plaid zip hoodie','XL',999],
 ['ST-SWE-0057','NARUTO','Kids sweatshirt','9-10Y',1499],['ST-SWE-0058','C&A','Kids unicorn sweatshirt','9-10Y',499]];
const IN=3.4,PER=2.9,N=IT.length,EN=IN+PER*N,DUR=EN+4.6;
let cards='',labels='';IT.forEach(([s,b,l,z,p],i)=>{
 cards+=`<div class="a" id="c${i}" style="left:200px;top:150px;width:680px;height:850px;background:#fff;padding:14px;box-shadow:0 30px 60px rgba(60,30,0,.35);opacity:0;border-radius:6px">
  <img src="${IMG(s)}" style="width:100%;height:100%;object-fit:cover;border-radius:3px">
  <div class="a" id="st${i}" style="right:-26px;top:-26px;width:150px;height:150px;border-radius:50%;background:#e63946;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:40px;transform:rotate(14deg);border:5px dashed rgba(255,255,255,.7)">NEW</div></div>`;
 labels+=`<div class="a" id="lb${i}" style="inset:0;opacity:0;padding:26px 34px"><div style="font-size:24px;letter-spacing:.2em;font-weight:800;color:#666">SHIP TO: YOU · ITEM ${String(i+1).padStart(2,'0')}/${String(N).padStart(2,'0')}</div>
  <div class="anton" style="font-size:${b.length>12?66:84}px;color:#111;margin-top:12px;white-space:nowrap">${b}</div>
  <div style="font-size:32px;font-weight:700;color:#333;margin-top:6px">${l} · ${z}</div>
  <div style="font-weight:900;font-size:70px;color:#e63946;position:absolute;right:34px;bottom:22px">${rs(p)}</div></div>`});
const html=`<div class="a" style="inset:0;background:linear-gradient(180deg,#efe4d2,#d9c3a3)"></div><div class="a grain" style="inset:0"></div>
<div class="a" style="left:0;top:1640px;width:1080px;height:280px;background:#b08a5f"></div>
<div class="a" id="t1" style="left:0;width:1080px;top:260px;text-align:center"><div class="anton" style="font-size:150px;color:#3a2a18">NEW<br>ARRIVALS</div>
 <div class="cav" style="font-size:78px;color:#a0522d;margin-top:10px">fresh bundle just opened 📦</div></div>
${cards}
<div class="a" style="left:140px;top:1150px;width:800px;height:620px;perspective:1400px">
 <div class="a" id="fl" style="left:0;top:0;width:400px;height:180px;background:#c69c6d;transform-origin:0 0;border:3px solid #a57b4c"></div>
 <div class="a" id="fr" style="left:400px;top:0;width:400px;height:180px;background:#c69c6d;transform-origin:100% 0;border:3px solid #a57b4c"></div>
 <div class="a" style="left:0;top:0;width:800px;height:620px;background:linear-gradient(180deg,#d3a876,#c09162);border:3px solid #a57b4c;box-shadow:0 30px 50px rgba(60,30,0,.35)"></div>
 <div class="a" style="left:360px;top:0;width:80px;height:620px;background:rgba(240,220,180,.55)"></div>
 <div class="a" style="left:70px;top:150px;width:660px;height:400px;background:#fffdf6;box-shadow:0 4px 10px rgba(0,0,0,.2);transform:rotate(-1.5deg)">${labels}
  <div class="a" id="lb0x" style="inset:0;padding:26px 34px"><div class="anton" style="font-size:86px;color:#111">ABCTHRIFT</div><div style="font-size:34px;font-weight:800;color:#444;margin-top:6px">Original brands · Sahiwal → all Pakistan</div><div class="cav" style="font-size:60px;color:#a0522d;margin-top:20px">handle with love ♡</div></div></div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:rgba(40,25,10,.93)"><div class="a" style="left:0;width:1080px;top:560px;text-align:center;color:#fff">
 <div class="cav" style="font-size:80px;color:#f4c58b">${N} new pieces, 1 of each</div>
 <div style="font-weight:900;font-size:120px;margin-top:20px">From ${rs(499)}</div>
 <div style="display:inline-block;margin-top:50px;background:#e63946;color:#fff;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">Shop: abcthrift.store</div>
 <div style="font-size:36px;font-weight:700;margin-top:34px;color:#eee">WhatsApp 0311 4139007 · COD all Pakistan · 7-day returns</div>
 <img src="${LOGOW}" style="width:280px;margin-top:60px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
st('t1',{opacity:eo(P(t,.1,.7))*(1-P(t,2.6,3.1)),transform:'translateY('+L(-40,0,eo(P(t,.1,.7)))+'px)'});
const sh=t<1.4?Math.sin(t*40)*4*P(t,.6,1)*(1-P(t,1.2,1.4)):0;
const o=eio(P(t,1.4,2.4));st('fl',{transform:'translateX('+sh+'px) rotateX('+L(0,-200,o)+'deg)'});st('fr',{transform:'translateX('+sh+'px) rotateX('+L(0,-200,o)+'deg)'});
st('lb0x',{opacity:1-P(t,IN-.2,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER+.1;
 const r=eb(P(u,0,.8)),x=eio(P(u,PER-.45,PER));
 st('c'+i,{opacity:on?1:0,transform:'translate('+L(0,i%2?900:-900,x)+'px,'+L(950,0,r)+'px) scale('+L(.35,1,r)+') rotate('+(L(i%2?-3:3,0,r)+L(0,i%2?15:-15,x))+'deg)',zIndex:2});
 st('st'+i,{transform:'rotate(14deg) scale('+L(0,1,eb(P(u,.7,1.1)))+')'});
 st('lb'+i,{opacity:on?C(P(u,.3,.5)):0});}
st('end',{opacity:eo(P(t,EN,EN+.6))});`;
render({name:'r92',html,draw,dur:DUR,out:go?OUT+'92-reel-new-arrivals-bundle-box.mp4':null,stills:go?[]:[1,2.6,4.6,8,EN+2]}).then(()=>console.log('ok',DUR));
