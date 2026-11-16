const D=require('./d.js');const {render,rs}=D.lib;const go=process.argv[2]=='go';
const K=['SWE-0058','SWE-0054','SWE-0036','SWE-0035','KID-0056','SWE-0029','SWE-0028','SWE-0027','SWE-0024'].map(D.I);
const CODE=['A1','A2','A3','B1','B2','B3','C1','C2','C3'];const PICK=[0,4,7,2,5];
const IN=2.8,PER=5.4,N=PICK.length,EN=IN+PER*N,DUR=EN+4.4;
const F=`<style>@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=VT323&display=swap');.bl{font-family:'Baloo 2',sans-serif}.vt{font-family:VT323,monospace}</style>`;
const SX=150,SY=330,SW=230,SH=300,G=14;
let slots='';K.forEach((x,i)=>{const c=i%3,r=Math.floor(i/3);slots+=`<div class="a" style="left:${SX+c*(SW+G)}px;top:${SY+r*(SH+G)}px;width:${SW}px;height:${SH}px;border-radius:14px;background:#e9f6ff;overflow:hidden">
 <div class="a" style="left:8px;right:8px;bottom:44px;height:10px;border-radius:5px;background:repeating-linear-gradient(90deg,#9aa 0 10px,#ccd 10px 20px)"></div>
 <img id="it${i}" src="${x.img}" style="position:absolute;left:20px;top:14px;width:190px;height:230px;object-fit:cover;border-radius:10px;box-shadow:0 6px 14px rgba(0,0,0,.25)">
 <div class="a bl" style="left:0;right:0;bottom:0;height:42px;background:#ff4d8d;color:#fff;font-weight:800;font-size:26px;display:flex;justify-content:space-between;align-items:center;padding:0 12px"><span>${CODE[i]}</span><span>${rs(x.price)}</span></div></div>`});
let cards='';K.forEach((x,i)=>{cards+=`<div class="a" id="cd${i}" style="left:110px;top:300px;width:860px;opacity:0;z-index:6"><div style="background:#fff;border-radius:44px;padding:30px;text-align:center;border:12px solid #ffd43b;box-shadow:0 30px 80px rgba(0,0,0,.45)">
 <div class="bl" style="font-size:46px;font-weight:800;color:#ff4d8d">🍬 ${CODE[i]} dropped!</div>
 <img src="${x.img}" style="width:760px;height:780px;object-fit:cover;border-radius:30px;margin-top:10px">
 <div class="bl" style="font-size:${x.brandShow.length>12?62:78}px;font-weight:800;line-height:1;margin-top:16px;color:#1d3557">${x.brandShow}</div>
 <div class="bl" style="font-size:36px;font-weight:600;color:#555">Kids · Size ${x.size}</div>
 <div class="bl" style="display:inline-block;margin-top:14px;background:#ff4d8d;color:#fff;font-weight:800;font-size:74px;padding:0 40px;border-radius:24px">${rs(x.price)}</div></div></div>`});
const html=`${F}<div class="a" style="inset:0;background:linear-gradient(160deg,#a0e7ff,#ffd6e8)"></div>
<div class="a" style="left:110px;top:150px;width:860px;height:1560px;border-radius:50px;background:#3a86ff;box-shadow:0 30px 60px rgba(0,0,0,.3)"></div>
<div class="a bl" style="left:110px;top:170px;width:860px;text-align:center;color:#fff;font-size:80px;font-weight:800;line-height:1">KIDS WINTER VENDING</div>
<div class="a bl" style="left:110px;top:258px;width:860px;text-align:center;color:#ffd43b;font-size:36px;font-weight:800">warm sweatshirts · from ${rs(399)}</div>
<div class="a" style="left:136px;top:316px;width:808px;height:968px;border-radius:24px;background:#1d3557"></div>${slots}
<div class="a" style="left:150px;top:1300px;width:540px;height:200px;border-radius:24px;background:#1d3557;overflow:hidden"><div class="a bl" style="left:0;right:0;top:8px;text-align:center;color:#9cc;font-size:26px;font-weight:700">PUSH ↓</div>
 <img id="dp" src="" style="position:absolute;left:180px;top:200px;width:160px;height:190px;object-fit:cover;border-radius:10px"></div>
<div class="a" style="left:710px;top:1300px;width:220px;height:200px;border-radius:24px;background:#0b1d33;display:flex;align-items:center;justify-content:center"><div id="ky" class="vt" style="font-size:110px;color:#7CFC00">--</div></div>
<div class="a bl" style="left:110px;top:1560px;width:860px;text-align:center;color:#fff;font-size:44px;font-weight:800">Comment a code (A1-C3) to order! 👇</div>
${cards}
<div class="a" id="end" style="inset:0;opacity:0;background:linear-gradient(160deg,#a0e7ff,#ffd6e8);z-index:9;color:#1d3557"><div class="a" style="left:0;width:1080px;top:440px;text-align:center">
 <div class="bl" style="font-size:130px;font-weight:800;line-height:1">Pick a code,<br>keep them warm 🧸</div>
 <div class="bl" style="font-size:52px;font-weight:800;margin-top:30px;color:#ff4d8d">9 kids sweatshirts · Rs 399 - 699</div>
 <div class="bl" style="display:inline-block;margin-top:44px;background:#3a86ff;color:#fff;font-size:58px;font-weight:800;padding:16px 50px;border-radius:999px">abcthrift.store</div>
 <div style="margin-top:36px">${D.END('#1d3557')}</div><img src="${D.LOGO}" style="width:280px;margin-top:50px"></div></div>`;
const draw=`const IN=${IN},PER=${PER},N=${N},EN=${EN},PK=${JSON.stringify(PICK)},CD=${JSON.stringify(CODE)},IM=${JSON.stringify(K.map(x=>x.img))};
for(let i=0;i<9;i++){st('cd'+i,{opacity:0});st('it'+i,{transform:'none',opacity:1});}
$('ky').textContent='--';st('dp',{top:'200px'});
if(t>=IN&&t<EN){const j=Math.floor((t-IN)/PER),u=t-IN-j*PER,k=PK[j];
 $('ky').textContent=u<.4?'--':u<.8?CD[k][0]+'_':CD[k];
 const dr=P(u,1.1,1.9);st('it'+k,{transform:'translateY('+(ei(dr)*700)+'px) rotate('+(dr*14)+'deg)',opacity:dr>.95?0:1});
 if($('dp').getAttribute('src')!=IM[k])$('dp').setAttribute('src',IM[k]);st('dp',{top:L(200,20,eb(P(u,1.85,2.25)))+'px'});
 const c=P(u,2.5,2.8),c2=1-P(u,PER-.35,PER);st('cd'+k,{opacity:Math.min(c,c2),transform:'scale('+L(.4,1,eb(c))+')'});
 for(let q=0;q<j;q++)st('it'+PK[q],{opacity:.15});}
if(t>=EN)for(let q=0;q<N;q++)st('it'+PK[q],{opacity:.15});
st('end',{opacity:eo(P(t,EN,EN+.5))});`;
render({name:'r121',html,draw,dur:DUR,out:go?D.OUT+'121-reel-kids-vending-machine.mp4':null,stills:go?[]:[1.5,IN+1.5,IN+2.1,IN+3.5,EN+3]}).then(()=>console.log('ok',DUR));
