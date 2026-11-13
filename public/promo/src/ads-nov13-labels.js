// Theme 2 (13 Nov): light, modern "woven label" look. Cut-out garments (rembg) big on soft tiles,
// brand shown as a woven brand label under each piece, price as a small orange sticker. Minimal text.
const {chromium}=require('playwright');const fs=require('fs');
const D=__dirname, OUT=D+'/out/';fs.mkdirSync(OUT,{recursive:true});
const u=p=>'file://'+p, cut=s=>u(D+'/crop/'+s+'.png'), LOGO=u(D+'/fr/abcthrift-logo.png');
const rs=n=>'Rs '+n.toLocaleString('en-US');
const INK='#111', OR='#ff5a1f', BG='#efede8';
const TILES=['#e3e8e4','#ece3da','#e2e6ee','#efe6e9','#e8e6dc','#e1ebea'];
const CSS=`<style>@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;700;800;900&family=Cormorant+Garamond:wght@700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter Tight',sans-serif;color:${INK};background:${BG}}
.a{position:absolute}.tile{position:absolute;border-radius:28px;overflow:visible}
.tile img{position:absolute;left:50%;transform:translateX(-50%);object-fit:contain;filter:drop-shadow(0 14px 18px rgba(0,0,0,.22))}
.lab{position:absolute;left:50%;transform:translateX(-50%) rotate(-2deg);background:#161616;color:#f3efe6;padding:7px 16px 8px;border-radius:4px;font-family:'Cormorant Garamond',serif;font-weight:700;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;box-shadow:0 4px 10px rgba(0,0,0,.25)}
.lab:before{content:'';position:absolute;inset:3px;border:1px dashed rgba(243,239,230,.55);border-radius:2px}
.px{position:absolute;background:${OR};color:#fff;font-weight:900;border-radius:999px;padding:6px 14px;transform:rotate(4deg);box-shadow:0 6px 14px rgba(255,90,31,.35)}
.sz{position:absolute;background:#fff;color:${INK};font-weight:800;border-radius:8px;padding:3px 9px}
</style><span style="font-family:'Cormorant Garamond';opacity:0;position:absolute">x</span>`;
const ITEMS=[['ST-PUF-0042','Bershka','L',2899],['ST-PUF-0047','Paragona','L',1999],['ST-PUF-0044','H&amp;M','L',1999],
['ST-COA-0046','Mipha','XL',1199],['ST-PUF-0041','Giordano','L',999],['ST-SWE-0050','Bershka','L',1599],
['ST-PUF-0053','American Eagle','L',799],['ST-SWE-0039','Obey','L',699],['ST-SWE-0058','C&amp;A','9-10Y',499],
['ST-SWE-0017','Sean John','L',699],['ST-KID-0056','Northville','5-6Y',699],['ST-COA-0043','jodi','L',1199]];
function tile([s,b,z,p],i,l,t,w,h,k){ // k = scale
  return `<div class="tile" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px;background:${TILES[i%TILES.length]}">
<img src="${cut(s)}" style="top:${8*k}px;height:${h-48*k}px;max-width:${w-12*k}px">
<div class="px" style="right:${-6*k}px;top:${-10*k}px;font-size:${26*k}px">${rs(p)}</div>
<div class="sz" style="left:${12*k}px;top:${12*k}px;font-size:${17*k}px">${z}</div>
<div class="lab" style="bottom:${12*k}px;font-size:${(b.length>10?20:25)*k}px">${b}</div></div>`}
const P={};
P['117-ad-feed-label-wall']=[1080,1350,`
<div class="a" style="left:-40px;top:1040px;font-size:330px;font-weight:900;letter-spacing:-.04em;color:rgba(0,0,0,.035);white-space:nowrap">ORIGINAL</div>
<img class="a" src="${LOGO}" style="left:54px;top:46px;width:210px">
<div class="a" style="right:54px;top:52px;font-weight:800;font-size:22px;letter-spacing:.12em">CASH ON DELIVERY · PAKISTAN</div>
<div class="a" style="left:52px;top:112px;font-size:104px;font-weight:900;letter-spacing:-.045em;line-height:.92">Real brands.<br><span style="color:${OR}">Real prices.</span></div>
${ITEMS.slice(0,9).map((m,i)=>tile(m,i,54+(i%3)*330,350+Math.floor(i/3)*318,312,296,1)).join('')}
<div class="a" style="left:54px;top:1306px;width:972px;display:flex;justify-content:space-between;font-weight:800;font-size:24px"><span>1 piece each · 7-day returns</span><span style="color:${OR}">abcthrift.store</span></div>`];
P['118-ad-story-label-wall']=[1080,1920,`
<img class="a" src="${LOGO}" style="left:54px;top:150px;width:230px">
<div class="a" style="left:52px;top:230px;font-size:120px;font-weight:900;letter-spacing:-.045em;line-height:.92">Real brands.<br><span style="color:${OR}">Real prices.</span></div>
${ITEMS.map((m,i)=>tile(m,i,54+(i%3)*330,500+Math.floor(i/3)*306,312,292,.95)).join('')}
<div class="a" style="left:54px;top:1745px;width:972px;height:90px;border-radius:999px;background:${INK};color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 36px;font-weight:800;font-size:30px"><span>Cash on Delivery · 7-day returns</span><span style="color:${OR}">Order on WhatsApp →</span></div>`];
(async()=>{const b=await chromium.launch();const pg=await b.newPage();
for(const [k,[w,h,body]] of Object.entries(P)){if(process.argv[2]&&!k.startsWith(process.argv[2]))continue;await pg.setViewportSize({width:w,height:h});
fs.writeFileSync(D+'/page.html',`<html><head>${CSS}</head><body style="width:${w}px;height:${h}px;position:relative;overflow:hidden">${body}</body></html>`);
await pg.goto('file://'+D+'/page.html',{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(300);await pg.screenshot({path:OUT+k+'.png'});console.log(k)}
await b.close()})();
