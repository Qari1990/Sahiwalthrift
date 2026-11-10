const {IMG,T10,lib,LOGOW,LOGO}=require('./data.js');const {render,rs}=lib;const go=process.argv[2]=='go';const OUT=__dirname+'/out/';
// chat messages: [side 'u'|'s', type 't'|'i', content, time, extra]
const M=[['u','t','Bhai sardi aa gayi 🥶 koi achi original jacket hai?',.6],
 ['s','t','Ji bilkul! Budget kitna hai? 😊',2.2],
 ['u','t','2000 tak, size L ya XL',3.6],
 ['s','i',['ST-PUF-0045','Cars Jeans quilted puffer · L','Rs 1,999'],5.0],
 ['s','i',['ST-COA-0022','Identic sherpa corduroy jacket · XL','Rs 1,499'],7.4],
 ['s','i',['ST-LEA-0016','Milano Italiano leather jacket · XL','Rs 799'],9.8],
 ['u','t','Bhai ye Cars Jeans wali 🔥 tag original hai?',12.2],
 ['s','i',[T10+'cars-tagcrop.jpg','Real tag 👆 "Since 1982"',''],13.8],
 ['u','t','Done ✅ COD ho jayega?',16.0],
 ['s','t','Ji, COD all Pakistan 🚚 + 7-day returns. Order confirm! 🎉',17.4]];
const DUR=24;
let msgs='';M.forEach(([sd,ty,c],i)=>{const me=sd=='u';
 const inner=ty=='t'?`<div style="font-size:40px;line-height:1.3">${c}</div>`:`<img src="${c[0].startsWith('/')?c[0]:IMG(c[0])}" style="width:560px;height:${c[2]?640:420}px;object-fit:cover;border-radius:18px;display:block"><div style="font-size:34px;font-weight:600;margin-top:12px">${c[1]}</div>${c[2]?`<div style="font-size:44px;font-weight:900;color:#0b7a5e;margin-top:4px">${c[2]}</div>`:''}`;
 msgs+=`<div id="m${i}" style="display:flex;justify-content:${me?'flex-end':'flex-start'};margin:16px 0;opacity:0"><div style="max-width:${ty=='t'?760:600}px;background:${me?'#d8fdd2':'#fff'};border-radius:${me?'28px 6px 28px 28px':'6px 28px 28px 28px'};padding:${ty=='t'?'20px 26px':'14px'};box-shadow:0 2px 4px rgba(0,0,0,.12);color:#111">${inner}<div style="text-align:right;font-size:22px;color:#888;margin-top:4px">9:4${i%10} PM${me?' ✓✓':''}</div></div></div>`});
const html=`<div class="a" style="inset:0;background:#efe7dd;background-image:radial-gradient(rgba(0,0,0,.05) 2px,transparent 2px);background-size:30px 30px"></div>
<div class="a" id="chat" style="left:30px;width:1020px;top:220px"><div id="inner">${msgs}<div id="typ" style="display:flex;margin:16px 0;opacity:0"><div style="background:#fff;border-radius:6px 28px 28px 28px;padding:24px 30px;font-size:44px;letter-spacing:.2em;color:#888" id="dots">•••</div></div></div></div>
<div class="a" style="left:0;top:0;width:1080px;height:200px;background:#0b6b57;display:flex;align-items:center;padding:60px 40px 0;gap:26px;color:#fff;box-shadow:0 4px 10px rgba(0,0,0,.2)">
 <div style="font-size:50px">←</div><div style="width:100px;height:100px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center"><img src="${LOGO}" style="width:86px"></div>
 <div><div style="font-size:42px;font-weight:800">ABCThrift ✔</div><div id="st" style="font-size:28px;opacity:.85">online</div></div></div>
<div class="a" style="left:0;top:1780px;width:1080px;height:140px;background:#f0f0f0;display:flex;align-items:center;padding:0 30px;gap:20px">
 <div style="flex:1;height:90px;background:#fff;border-radius:45px;display:flex;align-items:center;padding:0 34px;font-size:34px;color:#999">Message</div>
 <div style="width:90px;height:90px;border-radius:50%;background:#0b6b57;color:#fff;font-size:40px;display:flex;align-items:center;justify-content:center">➤</div></div>
<div class="a" id="hk" style="left:60px;width:960px;top:760px;text-align:center;opacity:0"><div style="background:#111;color:#fff;font-weight:900;font-size:64px;padding:30px;border-radius:30px;line-height:1.15">Men's winter jackets<br><span style="color:#25d366">under Rs 2,000</span> 👀</div></div>
<div class="a" id="end" style="inset:0;opacity:0;background:#0b6b57"><div class="a" style="left:0;width:1080px;top:520px;text-align:center;color:#fff">
 <div style="font-size:60px;font-weight:800">Your turn 👇</div>
 <div style="font-size:110px;font-weight:900;line-height:1;margin-top:20px">Message us,<br>we'll find your fit</div>
 <div style="font-size:44px;font-weight:700;margin-top:36px">Men's jackets & sweatshirts · original brands</div>
 <div style="display:inline-block;margin-top:50px;background:#fff;color:#0b6b57;font-weight:900;font-size:54px;padding:26px 48px;border-radius:999px">0311 4139007</div>
 <div style="font-size:36px;font-weight:700;margin-top:30px">abcthrift.store · COD all Pakistan · 7-day returns</div>
 <img src="${LOGOW}" style="width:280px;margin-top:56px"></div></div>`;
const draw=`const M=${JSON.stringify(M.map(m=>[m[0],m[3]]))};
st('hk',{opacity:eo(P(t,0,.3))*(1-P(t,.9,1.2))});
let typing=false,last=0;
for(let i=0;i<M.length;i++){const [sd,tm]=M[i];const vis=t>=tm;st('m'+i,{opacity:vis?C(P(t,tm,tm+.25)):0,display:vis?'flex':'none',transform:'translateY('+L(30,0,eo(P(t,tm,tm+.3)))+'px)'});
 if(sd=='s'&&t>tm-1.1&&t<tm)typing=true;}
st('typ',{opacity:typing?1:0,display:typing?'flex':'none'});$('dots').textContent=['•  ','•• ','•••'][Math.floor(t*4)%3];$('st').textContent=typing?'typing…':'online';
const h=$('inner').offsetHeight;const maxH=1540;st('inner',{transform:'translateY('+Math.min(0,maxH-h)+'px)'});
st('end',{opacity:eo(P(t,19.6,20.2))});`;
render({name:'r96',html,draw,dur:DUR,out:go?OUT+'96-reel-men-whatsapp-chat.mp4':null,stills:go?[]:[.5,4.4,9,14.5,18.5,22]}).then(()=>console.log('ok',DUR));
