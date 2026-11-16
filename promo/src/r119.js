const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const K=['PUF-0047','PUF-0045','PUF-0042','PUF-0011','DEN-0004','PUF-0002'].map(D.I);
const ORDER=[2,0,4,1,5,3];const IN=2.6,PER=5.2,N=ORDER.length,EN=IN+PER*N,DUR=EN+4.4;
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=Bungee&family=Rubik:wght@600;800;900&display=swap');.bg{font-family:Bungee,cursive}.rb{font-family:Rubik,sans-serif}</style>`;
const COL=['#ffcc00','#ff3b5c','#2ec5ff','#ff8a00','#8a5cff','#2ee59d'];
const R=440;let seg='';K.forEach((x,i)=>{const a0=(i*60-90)*Math.PI/180,a1=((i+1)*60-90)*Math.PI/180;
 seg+=`<path d="M0 0 L${R*Math.cos(a0)} ${R*Math.sin(a0)} A${R} ${R} 0 0 1 ${R*Math.cos(a1)} ${R*Math.sin(a1)} Z" fill="${COL[i]}" stroke="#1b0b3a" stroke-width="8"/>`;
 const am=i*60+30;seg+=`<g transform="rotate(${am}) translate(0 -${R*.62}) rotate(90)"><text x="0" y="12" text-anchor="middle" font-family="Bungee" font-size="${x.brandShow.length>9?30:40}" fill="#1b0b3a">${x.brandShow.split(' ')[0].toUpperCase()}</text></g>`;});
let cards='';K.forEach((x,i)=>{cards+=`<div class="a" id="cd${i}" style="left:90px;top:330px;width:900px;opacity:0;z-index:5"><div style="background:#fff;border-radius:40px;padding:28px;border:10px solid ${COL[i]};box-shadow:0 30px 80px rgba(0,0,0,.6);text-align:center">
 <div class="bg" style="font-size:52px;color:#1b0b3a">🎯 IT LANDED ON</div>
 <img src="${x.img}" style="width:780px;height:760px;object-fit:cover;border-radius:24px;margin-top:16px">
 <div class="bg" style="font-size:${x.brandShow.length>12?60:84}px;color:#1b0b3a;margin-top:18px;line-height:1">${x.brandShow.toUpperCase()}</div>
 <div class="rb" style="font-size:36px;font-weight:600;color:#444;margin-top:8px">${x.name} · ${x.g} · Size ${x.size}</div>
 <div class="bg" style="display:inline-block;margin-top:18px;background:#1b0b3a;color:#ffcc00;font-size:80px;padding:6px 40px;border-radius:24px">${rs(x.price)}</div></div></div>`});
const html=`${F}<div class="a" style="inset:0;background:radial-gradient(circle at 50% 50%,#5b2bd1,#1b0b3a 75%)"></div>
<div class="a bg" style="left:0;width:1080px;top:110px;text-align:center;font-size:96px;color:#ffcc00;text-shadow:0 8px 0 #ff3b5c">SPIN FOR A JACKET</div>
<div class="a rb" style="left:0;width:1080px;top:230px;text-align:center;font-size:40px;font-weight:800;color:#fff">original brands · 1 piece each</div>
<div class="a" style="left:540px;top:1000px"><div id="wh" style="position:absolute;left:-${R}px;top:-${R}px;width:${2*R}px;height:${2*R}px"><svg viewBox="-${R} -${R} ${2*R} ${2*R}" width="${2*R}" height="${2*R}">${seg}<circle r="80" fill="#1b0b3a" stroke="#ffcc00" stroke-width="10"/></svg></div>
 <div class="a bg" style="left:-70px;top:-40px;width:140px;text-align:center;font-size:44px;color:#ffcc00">ABC</div>
 <div class="a" style="left:-46px;top:-${R+50}px;width:0;height:0;border-left:46px solid transparent;border-right:46px solid transparent;border-top:90px solid #fff;filter:drop-shadow(0 6px 6px rgba(0,0,0,.5))"></div></div>
<div class="a" style="left:540px;top:1000px;width:0;height:0">${Array.from({length:24},(_,i)=>`<div id="bl${i}" class="a" style="left:${Math.sin(i*15*Math.PI/180)*(R+34)-12}px;top:${-Math.cos(i*15*Math.PI/180)*(R+34)-12}px;width:24px;height:24px;border-radius:50%;background:#ffe58a"></div>`).join('')}</div>
<div class="a rb" style="left:0;width:1080px;top:1600px;text-align:center;font-size:46px;font-weight:800;color:#fff">Comment 🛑 when you want it to stop!</div>
${cards}
<div class="a" id="end" style="inset:0;opacity:0;background:radial-gradient(circle,#5b2bd1,#1b0b3a 75%);color:#fff;z-index:9"><div class="a" style="left:0;width:1080px;top:440px;text-align:center">
 <div class="bg" style="font-size:110px;color:#ffcc00;line-height:1.05">Which one<br>did you want?</div>
 <div class="rb" style="font-size:50px;font-weight:800;margin-top:40px">Comment the brand 👇</div>
 <div class="bg" style="display:inline-block;margin-top:50px;background:#ffcc00;color:#1b0b3a;font-size:54px;padding:22px 46px;border-radius:999px">abcthrift.store</div>
 <div style="margin-top:36px">${D.END('#fff')}</div><img src="${D.LOGOW}" style="width:280px;margin-top:50px"></div></div>`;
// compute target angles
let ang=[0],cur=0;ORDER.forEach((k,j)=>{const base=360*(j+1)*3-(k*60+30);let tg=base;while(tg<cur+900)tg+=360;cur=tg;ang.push(tg)});
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN},A=${JSON.stringify(ang)},O=${JSON.stringify(ORDER)};
let r=0;if(t<IN)r=L(0,40,t/IN);else if(t<EN){const j=Math.min(N-1,Math.floor((t-IN)/PER)),u=t-IN-j*PER;r=L(A[j]+(j?0:40),A[j+1],eo(P(u,0,2.4)));
 for(let i=0;i<N;i++)st('cd'+i,{opacity:0});const c=O[j],q=P(u,2.6,2.9),q2=1-P(u,PER-.35,PER);st('cd'+c,{opacity:Math.min(q,q2),transform:'scale('+L(.5,1,eb(q))+')'});}
else{r=A[N];for(let i=0;i<N;i++)st('cd'+i,{opacity:0});}
st('wh',{transform:'rotate('+r+'deg)'});
for(let i=0;i<24;i++)st('bl'+i,{opacity:(Math.floor(t*6)+i)%2?1:.35});
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r119',html,draw,dur:DUR,out:go?D.OUT+'119-reel-spin-the-wheel-jackets.mp4':null,stills:go?[]:[1.2,IN+1.2,IN+3.8,IN+PER+4,EN+3]}).then(()=>console.log('ok',DUR));
