// Website Grand Launch creatives 138-141 (23 Nov 2026). Theme "1 + 1 equation": midnight violet, lime FREE, coral glow, Tektur + Instrument Sans.
// Usage: node promo/src/grand-launch-nov23.js  (writes promo/grand-launch/*.jpg and reel frames to /tmp)
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'../..'),IMG=R+'/public/img/',OUT=R+'/promo/grand-launch/',F='/mnt/skills/examples/canvas-design/canvas-fonts/';
const FR=process.argv[2]||'/tmp/gl-frames/';fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(FR,{recursive:true});
const u=f=>'file://'+f;
const J=[['ST-PUF-0045','Cars Jeans','Quilted Puffer','L',1999],['ST-PUF-0042','Bershka','MA-1 Bomber','L',2899],['ST-PUF-0044','H&M','Tie-Dye Puffer','L',1999],['ST-PUF-0047','PARAGONA','Quilted Puffer','L',1999],
 ['ST-DEN-0004','BRICE','Hooded Puffer','L',1999],['ST-PUF-0011','TOM TOMPSON','Quilted Puffer','XXL',1999],['ST-PUF-0002','Explorer','High-Collar Puffer','L',1999],['ST-PUF-0001','Jean Pascale','Puffer Bomber','XXL',1999]];
const KID=['ST-SWE-0058','C&A','Unicorn Sweatshirt','9-10Y',499],MEN=['ST-SWE-0017','Sean John','Quarter-Zip','S',699],MEN2=['ST-SWE-0039','OBEY','Half-Zip','S',699];
const rs=n=>'Rs '+n.toLocaleString('en-US');
const css=`@font-face{font-family:T;src:url(${u(F+'Tektur-Medium.ttf')})}@font-face{font-family:I;src:url(${u(F+'InstrumentSans-Regular.ttf')})}@font-face{font-family:I;font-weight:700;src:url(${u(F+'InstrumentSans-Bold.ttf')})}
*{box-sizing:border-box;margin:0}body{font-family:I;color:#fff;background:#14082f;overflow:hidden}
.bg{position:absolute;inset:0;background:radial-gradient(60% 45% at 100% 0,#ff4d6d 0,transparent 70%),radial-gradient(70% 50% at 0 100%,#5b2cff 0,transparent 70%),#14082f}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:60px 60px}
.k{font:700 26px I;letter-spacing:.16em;text-transform:uppercase;color:#c6ff3d}.h{font-family:T;line-height:.9;letter-spacing:-.02em;text-transform:uppercase}
.lime{color:#c6ff3d}.ph{background:#fff;border-radius:28px;overflow:hidden;position:relative;box-shadow:0 30px 60px rgba(0,0,0,.45)}.ph img{width:100%;height:100%;object-fit:cover}
.lab{position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(transparent,rgba(10,4,28,.92) 40%);display:grid}.lab b{font:700 30px I}.lab span{font:400 22px I;opacity:.9}
.price{position:absolute;top:16px;left:16px;background:#14082f;color:#fff;font:700 28px I;border-radius:999px;padding:6px 16px}
.free{position:absolute;top:16px;left:16px;background:#c6ff3d;color:#14082f;font:900 34px T;border-radius:999px;padding:6px 18px;transform:rotate(-4deg)}
.op{font-family:T;color:#c6ff3d;display:grid;place-items:center}.pill{display:inline-block;border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 22px;font:700 26px I}
.foot{position:absolute;left:0;right:0;bottom:0;background:#c6ff3d;color:#14082f;display:flex;justify-content:space-between;align-items:center;padding:0 48px;font:700 28px I}`;
const card=(it,free,w,h)=>`<div class="ph" style="width:${w}px;height:${h}px"><img src="${u(IMG+it[0]+'-1.jpg')}">${free?'<span class="free">FREE</span>':`<span class="price">${rs(it[4])}</span>`}<div class="lab"><b>${it[1]}</b><span>${it[2]} · ${it[3]}</span></div></div>`;
const S={};
S.feed=[1080,1350,`<div class="bg"></div><div class="grid"></div><div style="position:absolute;inset:56px 56px 110px;display:grid;align-content:start;gap:26px">
<p class="k">Website Grand Launch · 23–29 Nov</p><h1 class="h" style="font-size:132px">Buy 1<br><span class="lime">Get 1 Free</span></h1>
<div style="display:grid;grid-template-columns:420px 1fr 420px;align-items:center">${card(J[0],0,420,580)}<div class="op" style="font-size:120px">+</div>${card(KID,1,420,580)}</div>
<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><span class="pill">1 jacket ${rs(1999)}+ → kids sweatshirt FREE</span><span class="pill" style="border-color:#ff4d6d;background:rgba(255,77,109,.18)">2 jackets → men's sweatshirt FREE</span></div></div>
<div class="foot" style="height:84px"><span>🚚 FREE DELIVERY · Cash on delivery</span><span>abcthrift.store · 0322 4631990</span></div>`];
S.story=[1080,1920,`<div class="bg"></div><div class="grid"></div><div style="position:absolute;inset:150px 64px 260px;display:grid;align-content:start;gap:30px">
<p class="k">Website Grand Launch · till 29 Nov</p><h1 class="h" style="font-size:150px">Buy 1<br><span class="lime">Get 1 Free</span></h1>
<div style="display:grid;grid-template-columns:400px 1fr 400px;align-items:center">${card(J[0],0,400,450)}<div class="op" style="font-size:110px">+</div>${card(KID,1,400,450)}</div>
<div style="display:grid;grid-template-columns:400px 1fr 400px;align-items:center"><div style="display:grid;gap:12px"><div style="display:flex;gap:12px">${card(J[1],0,194,300)}${card(J[2],0,194,300)}</div><b style="font:700 30px I">2 jackets Rs 1,999+</b></div><div class="op" style="font-size:110px">+</div>${card(MEN,1,400,450)}</div>
<p style="font:700 34px I;text-align:center">Gift is added to your bag automatically 🎁</p></div>
<div class="foot" style="height:200px;flex-direction:column;justify-content:center;gap:6px"><span style="font:900 54px T">FREE DELIVERY</span><span>Shop: abcthrift.store · WhatsApp 0322 4631990</span></div>`];
// carousel 1:1
S['car-0-intro']=[1080,1080,`<div class="bg"></div><div class="grid"></div><div style="position:absolute;inset:70px;display:grid;align-content:center;gap:30px"><p class="k">Website Grand Launch · 23–29 Nov</p>
<h1 class="h" style="font-size:150px">Every jacket<br>comes with a<br><span class="lime">free gift</span></h1><p style="font:400 34px I;opacity:.9">Swipe → pick your jacket. We add the sweatshirt free.</p></div>
<div class="foot" style="height:90px"><span>FREE DELIVERY</span><span>Cash on delivery</span></div>`];
J.forEach((j,i)=>{S[`car-${i+1}-${j[1].toLowerCase().replace(/[^a-z]/g,'')}`]=[1080,1080,`<div class="bg"></div><img src="${u(IMG+j[0]+'-1.jpg')}" style="position:absolute;left:0;top:0;width:680px;height:1080px;object-fit:cover;background:#fff">
<div style="position:absolute;left:680px;width:400px;top:0;bottom:0;padding:56px 36px;display:grid;align-content:space-between;overflow:hidden">
<div style="display:grid;gap:14px"><p class="k" style="font-size:20px">Grand Launch</p><h2 class="h" style="font-size:${j[1].length>9?50:j[1].length>6?62:72}px;overflow-wrap:anywhere">${j[1]}</h2><p style="font:400 28px I;opacity:.85">${j[2]}</p>
<p style="font:700 30px I">Size <b style="background:#fff;color:#14082f;border-radius:10px;padding:2px 12px">${j[3]}</b></p><p class="h" style="font-size:72px">${rs(j[4])}</p></div>
<div style="display:grid;gap:14px"><div style="background:#c6ff3d;color:#14082f;border-radius:22px;padding:18px 20px;transform:rotate(-2deg)"><b style="font:900 40px T;display:block">+ FREE</b><span style="font:700 26px I">kids sweatshirt</span></div>
<div style="border:2px solid #ff4d6d;border-radius:22px;padding:14px 18px;font:700 22px I">Buy 2 jackets → men's sweatshirt FREE</div><p style="font:700 22px I;opacity:.85">🚚 Free delivery · COD</p></div></div>`]});
S['car-9-order']=[1080,1080,`<div class="bg"></div><div class="grid"></div><div style="position:absolute;inset:70px;display:grid;align-content:center;gap:28px"><p class="k">How to get your free gift</p>
<ol style="font:700 44px I;display:grid;gap:22px;padding-left:50px"><li>Open <span class="lime">abcthrift.store</span></li><li>Add a jacket (Rs 1,999+)</li><li>Free sweatshirt drops into your bag</li><li>Pay cash on delivery</li></ol>
<p style="font:700 36px I">Or WhatsApp <span class="lime">0322 4631990</span></p><p style="font:400 26px I;opacity:.8">Ends 29 Nov, 11:59 PM · one gift per order · while stock lasts</p></div>`];
// reel scenes (9:16)
const RS=[];
RS.push(`<div class="bg"></div><div class="grid"></div><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><p class="k" style="font-size:34px">Website Grand Launch</p><h1 class="h" style="font-size:210px;margin-top:30px">Buy 1<br><span class="lime">Get 1</span><br>Free?</h1></div></div>`);
RS.push(`<div class="bg"></div><div style="position:absolute;inset:200px 60px;display:grid;align-content:center;justify-items:center;text-align:center;gap:30px">${card(J[0],0,760,820)}<p class="h" style="font-size:90px">1 jacket</p></div>`);
RS.push(`<div class="bg"></div><div style="position:absolute;inset:200px 60px;display:grid;align-content:center;justify-items:center;text-align:center;gap:30px">${card(KID,1,760,820)}<p class="h" style="font-size:90px"><span class="lime">+ kids sweatshirt free</span></p></div>`);
RS.push(`<div class="bg"></div><div style="position:absolute;inset:160px 60px;display:grid;align-content:center;justify-items:center;text-align:center;gap:26px"><div style="display:flex;gap:20px">${card(J[1],0,470,560)}${card(J[2],0,470,560)}</div><p class="h" style="font-size:86px">2 jackets</p></div>`);
RS.push(`<div class="bg"></div><div style="position:absolute;inset:200px 60px;display:grid;align-content:center;justify-items:center;text-align:center;gap:30px">${card(MEN,1,760,820)}<p class="h" style="font-size:80px"><span class="lime">+ men's sweatshirt free</span></p></div>`);
[J[3],J[4],J[5],J[6]].forEach(j=>RS.push(`<div class="bg"></div><div style="position:absolute;inset:200px 60px;display:grid;align-content:center;justify-items:center;text-align:center;gap:26px">${card(j,0,820,900)}<span class="free" style="position:static;font-size:56px">+ FREE GIFT</span></div>`));
RS.push(`<div class="bg"></div><div class="grid"></div><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div style="display:grid;gap:34px"><h1 class="h" style="font-size:150px">Free<br><span class="lime">delivery</span></h1><p style="font:700 48px I">Cash on delivery · 7-day returns</p></div></div>`);
RS.push(`<div class="bg"></div><div class="grid"></div><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div style="display:grid;gap:30px"><p class="k" style="font-size:34px">Till 29 Nov only</p><h1 class="h" style="font-size:120px">abcthrift<span class="lime">.store</span></h1><p style="font:700 52px I">WhatsApp 0322 4631990</p><p style="font:400 36px I;opacity:.85">Gift added to your bag automatically 🎁</p></div></div>`);
(async()=>{const b=await chromium.launch();
 const shot=async(w,h,body,file)=>{const p=await b.newPage({viewport:{width:w,height:h}});const hf=FR+'_page.html';fs.writeFileSync(hf,`<!doctype html><meta charset="utf-8"><style>${css}</style><body style="width:${w}px;height:${h}px">${body}</body>`);await p.goto(u(hf),{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);await p.screenshot({path:file,type:'jpeg',quality:90});await p.close()};
 await shot(...S.feed,OUT+'138-grand-launch-feed.jpg');await shot(...S.story,OUT+'139-grand-launch-story.jpg');
 for(const k of Object.keys(S).filter(k=>k.startsWith('car')))await shot(...S[k],OUT+'140-'+k+'.jpg');
 for(let i=0;i<RS.length;i++)await shot(1080,1920,RS[i],FR+String(i).padStart(2,'0')+'.jpg');
 await b.close();console.log('done',RS.length,'reel scenes')})();
