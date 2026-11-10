const {IMG,lib,LOGO}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
const IT=[['ST-SWE-0057','Naruto sweatshirt','9-10Y',1499,'#ff8a3d'],['ST-SWE-0058','C&A unicorn sweatshirt','9-10Y',499,'#ff6fa8'],
 ['ST-KID-0056','NORTHVILLE windproof jacket','5-6Y',699,'#3d7bff'],['ST-SWE-0054','Inextenso funnel-neck','9-10Y',399,'#ff9f1c'],
 ['ST-SWE-0024','Quiksilver sweatshirt','7-8Y',499,'#2bb673'],['ST-SWE-0035','KIABI "Amore" sweatshirt','5-6Y',399,'#c45bd6'],
 ['ST-SWE-0027','okaïdi striped sweatshirt','11-12Y',499,'#1f4fa8']];
const IN=3,PER=2.9,N=IT.length,EN=IN+PER*N,DUR=EN+4.6;
let ph='',ln='';IT.forEach(([s,n,z,p,c],i)=>{
 ph+=`<div class="a" id="p${i}" style="left:250px;top:250px;width:580px;height:700px;background:#fff;padding:16px 16px 60px;box-shadow:0 16px 30px rgba(0,0,0,.25);opacity:0">
  <img src="${IMG(s)}" style="width:100%;height:100%;object-fit:cover"><div class="a cav" style="left:0;width:100%;bottom:6px;text-align:center;font-size:58px;font-weight:700;color:${c}">${rs(p)}</div>
  <div class="a" style="left:220px;top:-26px;width:150px;height:50px;background:rgba(255,230,120,.8);transform:rotate(-4deg)"></div></div>`;
 ln+=`<div id="l${i}" class="cav" style="position:relative;height:84px;font-size:52px;color:#1b2a6b;opacity:0;white-space:nowrap"><span style="display:inline-block;width:56px;height:56px;border:4px solid #1b2a6b;border-radius:8px;vertical-align:middle;margin-right:18px;position:relative"><svg style="position:absolute;left:-6px;top:-22px" width="80" height="80"><path id="tk${i}" d="M8 44 L28 66 L72 8" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="110" stroke-dashoffset="110"/></svg></span>${n} <span style="color:${c}">(${z})</span> <b style="font-size:54px">${rs(p)}</b></div>`});
const html=`<div class="a" style="inset:0;background:#fffdf3;background-image:repeating-linear-gradient(180deg,transparent 0 83px,#b8d4f0 83px 85px)"></div>
<div class="a" style="left:110px;top:0;width:4px;height:1920px;background:#f08a8a"></div>
<div class="a cav" style="left:150px;top:50px;font-size:96px;color:#e63946;line-height:1">Winter checklist ✏️</div>
<div class="a cav" style="left:150px;top:150px;font-size:50px;color:#666">for kids · original brands · from ${rs(399)}</div>
${ph}
<div class="a" style="left:140px;top:1015px;width:900px">${ln}</div>
<svg class="a" style="left:870px;top:260px" width="180" height="180"><circle cx="90" cy="90" r="60" fill="#ffd166"/>${[0,45,90,135,180,225,270,315].map(a=>`<line x1="90" y1="90" x2="${90+85*Math.cos(a*Math.PI/180)}" y2="${90+85*Math.sin(a*Math.PI/180)}" stroke="#ffd166" stroke-width="8" stroke-linecap="round"/>`).join('')}<circle cx="90" cy="90" r="50" fill="#ffd166"/></svg>
<div class="a cav" style="left:60px;top:300px;font-size:60px;color:#2bb673;transform:rotate(-12deg)">☁ ☁</div>
<div class="a" id="end" style="inset:0;opacity:0;background:#fffdf3;background-image:repeating-linear-gradient(180deg,transparent 0 83px,#b8d4f0 83px 85px)"><div class="a" style="left:0;width:1080px;top:440px;text-align:center">
 <div class="cav" style="font-size:120px;color:#e63946;line-height:1">All set for winter! ✅</div>
 <div class="cav" style="font-size:70px;color:#1b2a6b;margin-top:30px">warm, branded & under budget</div>
 <div style="font-size:48px;font-weight:900;color:#1b2a6b;margin-top:40px">Kids sweatshirts & jackets from ${rs(399)}</div>
 <div style="display:inline-block;margin-top:50px;background:#e63946;color:#fff;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">WhatsApp 0311 4139007</div>
 <div style="font-size:36px;font-weight:700;color:#444;margin-top:30px">abcthrift.store · COD all Pakistan · 7-day returns</div>
 <img src="${LOGO}" style="width:300px;margin-top:56px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;const e=eb(P(u,0,.6)),x=eio(P(u,PER-.4,PER));
 st('p'+i,{opacity:on?1:0,transform:'translateY('+L(-900,0,e)+'px) rotate('+L(i%2?8:-8,i%2?2.5:-2.5,e)+'deg) translateX('+L(0,i%2?-900:900,x)+'px)'});
 st('l'+i,{opacity:u>=.4?1:(t<IN?0:0),transform:'translateX('+L(-30,0,eo(P(u,.4,.8)))+'px)'});
 $('tk'+i).setAttribute('stroke-dashoffset',''+(110*(1-eo(P(u,1.3,1.8)))));}
st('end',{opacity:eo(P(t,EN,EN+.6))});`;
render({name:'r97',html,draw,dur:DUR,out:go?OUT+'97-reel-kids-winter-checklist.mp4':null,stills:go?[]:[1.5,5,12,EN-1,EN+3]}).then(()=>console.log('ok',DUR));
