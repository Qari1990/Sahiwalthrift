const {IMG,lib,LOGOW}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
const IT=[['ST-PUF-0049','QUECHUA','Fleece sweatshirt · L',599],['ST-SWE-0051','DASSY','Half-zip sweatshirt · L',599],
 ['ST-SWE-0035','KIABI','Kids sweatshirt · 5-6Y',399],['ST-SWE-0036','ORCHESTRA','Kids sweatshirt · 9-10Y',399]];
const B=2000,IN=3.2,PER=3.6,N=IT.length,EN=IN+PER*N,DUR=EN+6.4;
let cards='',bk='';let run=0;const tot=[];IT.forEach(([s,b,l,p],i)=>{run+=p;tot.push(run);
 cards+=`<div class="a" id="c${i}" style="left:190px;top:420px;width:700px;height:860px;border-radius:30px;overflow:hidden;border:8px solid #b6ff3b;box-shadow:0 0 60px rgba(182,255,59,.45);opacity:0"><img src="${IMG(s)}" style="width:100%;height:100%;object-fit:cover">
  <div class="a" style="left:0;right:0;bottom:0;padding:24px 30px;background:linear-gradient(transparent,rgba(0,0,0,.85));color:#fff"><div class="px" style="font-size:40px">${b}</div><div style="font-size:32px;font-weight:700;margin-top:10px">${l}</div></div></div>
 <div class="a px" id="cn${i}" style="left:0;width:1080px;top:1310px;text-align:center;font-size:70px;color:#ffd23f;opacity:0;text-shadow:0 0 20px rgba(255,210,63,.7)">+${rs(p)}</div>`;
 bk+=`<img id="b${i}" src="${IMG(s)}" style="width:170px;height:170px;object-fit:cover;border-radius:20px;border:5px solid #b6ff3b;opacity:0">`});
const html=`<style>@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');.px{font-family:'Press Start 2P',monospace;line-height:1.3}</style><span class="px" style="position:absolute;opacity:0">x</span>
<div class="a" style="inset:0;background:radial-gradient(circle at 50% 40%,#3a1670,#12062a 70%)"></div>
<div class="a" style="inset:0;background-image:linear-gradient(rgba(182,255,59,.07) 2px,transparent 2px),linear-gradient(90deg,rgba(182,255,59,.07) 2px,transparent 2px);background-size:60px 60px"></div>
<div class="a" id="hud" style="left:60px;top:90px;width:960px;opacity:0"><div style="display:flex;justify-content:space-between" class="px"><span style="font-size:30px;color:#fff">BUDGET</span><span id="tt" style="font-size:30px;color:#b6ff3b">Rs 0 / 2,000</span></div>
 <div style="margin-top:22px;height:70px;border:6px solid #fff;border-radius:14px;padding:6px"><div id="bar" style="height:100%;width:0;background:linear-gradient(90deg,#b6ff3b,#ffd23f);border-radius:6px"></div></div>
 <div class="px" style="font-size:22px;color:#c9b6ff;margin-top:22px">LEVEL: FAMILY WINTER HAUL</div></div>
${cards}
<div class="a" id="bkt" style="left:0;width:1080px;top:1470px;display:flex;justify-content:center;gap:24px;opacity:0">${bk}</div>
<div class="a" style="left:0;width:1080px;top:1680px;text-align:center;opacity:.8" class="px"><span class="px" style="font-size:24px;color:#fff" id="bl">🛒 BASKET</span></div>
<div class="a" id="intro" style="left:0;width:1080px;top:560px;text-align:center;color:#fff">
 <div class="px" style="font-size:44px;color:#ffd23f">CHALLENGE</div>
 <div style="font-size:150px;font-weight:900;line-height:1;margin-top:30px">${rs(2000)}</div>
 <div style="font-size:64px;font-weight:800;margin-top:20px">How many <span style="color:#b6ff3b">original brands</span><br>can we get? 🎮</div></div>
<div class="a" id="win" style="left:0;width:1080px;top:420px;text-align:center;color:#fff;opacity:0">
 <div class="px" style="font-size:64px;color:#b6ff3b;text-shadow:0 0 30px rgba(182,255,59,.7)">LEVEL<br>COMPLETE!</div>
 <div style="font-size:120px;font-weight:900;margin-top:40px">${N} brands</div>
 <div style="font-size:60px;font-weight:800;margin-top:10px">for ${rs(run)} 🤯</div>
 <div class="px" style="font-size:28px;color:#ffd23f;margin-top:30px">CHANGE: ${rs(B-run)} 🪙</div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:#12062a"><div class="a" style="left:0;width:1080px;top:520px;text-align:center;color:#fff">
 <div class="px" style="font-size:40px;color:#b6ff3b">YOUR TURN</div>
 <div style="font-size:100px;font-weight:900;line-height:1.05;margin-top:30px">Build your own<br>Rs 2,000 haul</div>
 <div style="font-size:42px;font-weight:700;margin-top:30px">Comment what you'd pick 👇</div>
 <div style="display:inline-block;margin-top:50px;background:#b6ff3b;color:#12062a;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">abcthrift.store</div>
 <div style="font-size:36px;font-weight:700;margin-top:30px">WhatsApp 0311 4139007 · COD all Pakistan</div>
 <img src="${LOGOW}" style="width:280px;margin-top:56px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN},T=${JSON.stringify(tot)},B=${B};
const a=eo(P(t,.1,.8));st('intro',{opacity:a*(1-P(t,IN-.4,IN)),transform:'scale('+L(.8,1,a)+')'});st('hud',{opacity:P(t,IN-.3,IN)*(1-P(t,EN+3.4,EN+3.8))});st('bkt',{opacity:P(t,IN-.3,IN)*(1-P(t,EN+3.4,EN+3.8))});
let cur=0;
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;const e=eb(P(u,0,.6)),x=eio(P(u,2.5,3.2));
 st('c'+i,{opacity:on?C(P(u,0,.2)):0,transform:'translate('+L(0,(i-1.5)*194*1.0,x)+'px,'+L(0,705,x)+'px) scale('+L(.5,1,e)*L(1,.24,x)+')'});
 st('cn'+i,{opacity:P(u,1.4,1.6)*(1-P(u,2.4,2.7)),transform:'translateY('+L(30,-30,P(u,1.4,2.7))+'px)'});
 st('b'+i,{opacity:u>=3.1?1:0});
 if(u>=1.5)cur=L(i?T[i-1]:0,T[i],eo(P(u,1.5,2.2)));}
$('tt').textContent='Rs '+Math.round(cur).toLocaleString('en-US')+' / 2,000';st('bar',{width:(cur/B*100)+'%'});
st('win',{opacity:eo(P(t,EN,EN+.5))*(1-P(t,EN+3.4,EN+3.8)),transform:'scale('+L(.6,1,eb(P(t,EN,EN+.6)))+')'});
st('end',{opacity:eo(P(t,EN+3.6,EN+4.1))});`;
render({name:'r98',html,draw,dur:DUR,out:go?OUT+'98-reel-rs2000-challenge.mp4':null,stills:go?[]:[1.5,5.5,6.6,EN+1.5,EN+5]}).then(()=>console.log('ok',DUR));
