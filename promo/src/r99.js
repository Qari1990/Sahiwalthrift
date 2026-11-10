const {IMG,lib,LOGOW}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
const IT=[['ST-PUF-0034','Jean Pascale','Quilted puffer, faux-fur hood','40','Need it 😍','Cute 💕'],
 ['ST-PUF-0009','House Basic','Hooded puffer, faux-fur trim','L','Obsessed 🤍','Maybe 🤔'],
 ['ST-COA-0046','MIPHA','Hooded parka, faux-fur lining','XL','Cozy 🧸','Warm 🔥'],
 ['ST-COA-0043','jodi by Kim Dong Su','Velvet-trim padded coat','L','Love 💜','Classy ✨'],
 ['ST-PUF-0021','Handpicked','Quilted hooded puffer','L','Yes 🙌','Sporty 🏃‍♀️']];
const IN=3,PER=3.6,N=IT.length,EN=IN+PER*N,DUR=EN+4.8;
let sl='',bars='';IT.forEach(([s,b,l,z,a1,a2],i)=>{
 bars+=`<div style="flex:1;height:8px;background:rgba(255,255,255,.4);border-radius:4px;overflow:hidden"><div id="pb${i}" style="height:100%;width:0;background:#fff"></div></div>`;
 sl+=`<div class="a" id="s${i}" style="inset:0;opacity:0"><img id="im${i}" src="${IMG(s)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
  <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45),transparent 25%,transparent 55%,rgba(0,0,0,.7))"></div>
  <div class="a" id="pl${i}" style="left:190px;top:1020px;width:700px;background:#fff;border-radius:34px;padding:26px;box-shadow:0 10px 30px rgba(0,0,0,.3);opacity:0">
   <div style="text-align:center;font-size:38px;font-weight:800;color:#222">Would you wear it?</div>
   <div style="display:flex;gap:16px;margin-top:20px">${[a1,a2].map((x,j)=>`<div style="flex:1;position:relative;height:90px;border-radius:20px;background:#f1f1f1;overflow:hidden"><div id="pf${i}${j}" style="position:absolute;left:0;top:0;bottom:0;width:0;background:${j?'#ffd1e3':'#c9a7ff'}"></div><div style="position:relative;text-align:center;line-height:90px;font-size:38px;font-weight:800;color:#222">${x}</div></div>`).join('')}</div></div>
  <div class="a" style="left:60px;bottom:110px;color:#fff;width:960px"><div style="font-size:${b.length>12?66:86}px;font-weight:900;line-height:1;white-space:nowrap">${b}</div>
   <div style="font-size:38px;font-weight:600;margin-top:12px">${l} · size ${z}</div>
   <div style="display:inline-block;margin-top:20px;background:#ff4f9a;font-size:56px;font-weight:900;padding:10px 28px;border-radius:18px">${rs(1199)}</div></div></div>`});
const html=`<div class="a" style="inset:0;background:#000"></div>${sl}
<div class="a" style="left:30px;right:30px;top:40px;display:flex;gap:10px">${bars}</div>
<div class="a" style="left:30px;top:76px;display:flex;align-items:center;gap:18px;color:#fff"><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#ff4f9a,#ffb347);padding:5px"><div style="width:100%;height:100%;border-radius:50%;background:#111;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:30px">ABC</div></div><div style="font-size:34px;font-weight:800">abcthrift <span style="opacity:.7;font-weight:500">· her winter picks</span></div></div>
<div class="a" id="intro" style="inset:0;background:linear-gradient(160deg,#ff4f9a,#ffb347)"><div class="a" style="left:0;width:1080px;top:560px;text-align:center;color:#fff">
 <div class="cav" style="font-size:110px">ladies, this one's for you</div>
 <div style="font-size:120px;font-weight:900;line-height:1;margin-top:30px">Every coat<br>${rs(1199)}</div>
 <div style="font-size:44px;font-weight:700;margin-top:30px">5 winter coats · 1 of each · vote in the poll 🗳️</div></div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:linear-gradient(160deg,#ff4f9a,#ffb347)"><div class="a" style="left:0;width:1080px;top:460px;text-align:center;color:#fff">
 <div style="font-size:54px;font-weight:800">Which one is yours? 👇</div>
 <div style="font-size:120px;font-weight:900;line-height:1;margin-top:24px">Comment<br>1, 2, 3, 4 or 5</div>
 <div style="font-size:44px;font-weight:700;margin-top:30px">Women's coats & puffers · all ${rs(1199)}</div>
 <div style="display:inline-block;margin-top:50px;background:#fff;color:#ff4f9a;font-weight:900;font-size:50px;padding:26px 48px;border-radius:999px">abcthrift.store</div>
 <div style="font-size:36px;font-weight:700;margin-top:30px">WhatsApp 0311 4139007 · COD all Pakistan · 7-day returns</div>
 <img src="${LOGOW}" style="width:280px;margin-top:56px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN};
st('intro',{opacity:1-P(t,IN-.4,IN)});
for(let i=0;i<N;i++){const s=IN+i*PER,u=t-s;const on=u>=0&&u<PER;st('s'+i,{opacity:on?1:0});st('pb'+i,{width:(t<s?0:Math.min(1,u/PER)*100)+'%'});if(!on)continue;
 st('im'+i,{transform:'scale('+L(1.12,1.0,eo(P(u,0,PER)))+')'});
 st('pl'+i,{opacity:C(P(u,.8,1.0)),transform:'scale('+L(.6,1,eb(P(u,.8,1.3)))+') rotate(-3deg)'});
 const v=eo(P(u,1.6,2.4));st('pf'+i+'0',{width:(100*v)+'%'});}
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r99',html,draw,dur:DUR,out:go?OUT+'99-reel-women-story-poll.mp4':null,stills:go?[]:[1.5,5.5,EN-1,EN+3]}).then(()=>console.log('ok',DUR));
