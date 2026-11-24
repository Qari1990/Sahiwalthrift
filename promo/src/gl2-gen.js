// Grand Launch v2 creatives 142-144 (24 Nov 2026): gents jacket -> gents sweatshirt FREE, ladies jacket -> kids sweatshirt FREE.
// Theme "gift ribbon": tomato red, cream ribbon band, butter FREE tags, Erica One + Work Sans, real cut-outs with woven brand labels.
// Usage: node promo/src/gl2-gen.js  -> promo/gl2/*.jpg + reel scene stills in promo/gl2/reel/
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'../..'),C=R+'/promo/gl2/cut/',OUT=R+'/promo/gl2/',F='/mnt/skills/examples/canvas-design/canvas-fonts/';
fs.mkdirSync(OUT+'reel',{recursive:true});const u=f=>'file://'+f,rs=n=>'Rs '+n.toLocaleString('en-US');
const G=[['ST-PUF-0045','Cars Jeans','L',1999],['ST-PUF-0044','H&M','L',1999],['ST-PUF-0047','PARAGONA','L',1999],['ST-PUF-0042','Bershka','L',2899]];
const GS=[['ST-SWE-0048','Mariner','XL',599],['ST-SWE-0051','DASSY','L',599]];
const W=[['ST-COA-0046','MIPHA','XL',1199],['ST-COA-0043','jodi','L',1199],['ST-PUF-0021','ABCThrift Select','L',1199],['ST-PUF-0009','House Basic','M',1199]];
const K=[['ST-SWE-0035','KIABI','5-6Y',399],['ST-SWE-0036','ORCHESTRA','9-10Y',399],['ST-SWE-0054','Inextenso','9-10Y',399]];
const css=`@font-face{font-family:E;src:url(${u(F+'EricaOne-Regular.ttf')})}@font-face{font-family:S;src:url(${u(F+'WorkSans-Regular.ttf')})}@font-face{font-family:S;font-weight:700;src:url(${u(F+'WorkSans-Bold.ttf')})}
*{box-sizing:border-box;margin:0}body{font-family:S;color:#fff3e2;background:#e63b2e;overflow:hidden;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,#f0513f 0,#e63b2e 55%,#c42a1f 100%)}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,243,226,.10) 2px,transparent 2.5px);background-size:34px 34px}
.rib{position:absolute;background:#fff3e2;box-shadow:0 0 0 6px rgba(0,0,0,.06) inset}.rib:after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 18px,rgba(230,59,46,.10) 18px 20px)}
.h{font-family:E;line-height:.92;letter-spacing:.005em}.k{font:700 24px S;letter-spacing:.22em;text-transform:uppercase}
.it{position:relative;display:grid;justify-items:center}.it img{object-fit:contain;filter:drop-shadow(0 22px 26px rgba(70,8,4,.45))}
.lb{background:#1a1a1a;color:#fff3e2;font:700 24px S;letter-spacing:.06em;text-transform:uppercase;padding:7px 16px;border-radius:4px;border-top:3px solid #ffd84a;margin-top:-10px;white-space:nowrap;position:relative}
.pr{font:700 26px S;margin-top:8px;color:#fff3e2}.pr b{background:#fff3e2;color:#1a1a1a;border-radius:999px;padding:3px 14px}
.free{position:absolute;top:-34px;right:-60px;background:#ffd84a;color:#1a1a1a;border-radius:16px;padding:8px 16px 6px;transform:rotate(7deg);display:grid;justify-items:center;line-height:1;box-shadow:0 10px 20px rgba(60,6,2,.35)}
.free s{font:700 24px S;text-decoration-color:#e63b2e;text-decoration-thickness:4px}.free b{font:400 44px E}
.plus{font:400 120px E;color:#ffd84a;align-self:center;text-shadow:0 8px 0 rgba(0,0,0,.12)}
.tag{display:inline-block;background:#1a1a1a;color:#ffd84a;font:700 26px S;letter-spacing:.14em;text-transform:uppercase;padding:8px 20px;border-radius:999px}
.wa{display:flex;align-items:center;gap:14px;background:#25d366;color:#0b2e17;font:700 34px S;border-radius:999px;padding:14px 32px}
.tc{font:400 21px S;opacity:.9}`;
const item=(x,h,free,maxw)=>`<div class="it"><img src="${u(C+x[0]+'.png')}" style="height:${h}px;max-width:${maxw||h}px">${free?`<span class="free"><s>${rs(x[3])}</s><b>FREE</b></span>`:''}<span class="lb">${x[1]} · ${x[2]}</span>${free?'':`<span class="pr"><b>${rs(x[3])}</b></span>`}</div>`;
const row=(lbl,a,b,h)=>`<div style="display:grid;gap:10px"><span class="tag" style="justify-self:start">${lbl}</span><div style="display:grid;grid-template-columns:1fr 110px 1fr;align-items:end;justify-items:center">${item(a,h,0,h*.95)}<span class="plus">+</span>${item(b,h*.82,1,h*.95)}</div></div>`;
const S={};
S['142-gl2-feed']=[1080,1350,`<div class="bg"></div><div class="dots"></div>
<div style="position:absolute;inset:40px 50px;display:grid;align-content:start;gap:12px"><p class="k">ABCThrift · Website Grand Launch · till 29 Nov</p>
<h1 class="h" style="font-size:94px">Jacket lo,<br><span style="color:#ffd84a">sweatshirt FREE</span></h1>
<div class="rib" style="position:relative;height:12px;margin:6px -50px 4px"></div>${row('Gents jacket Rs 1,999+',G[0],GS[0],290)}${row('Ladies jacket',W[0],K[0],290)}</div>
<p class="tc" style="position:absolute;left:50px;bottom:128px">*1 gift per order · while stock lasts · original brands, pre-loved</p>
<div style="position:absolute;left:50px;right:50px;bottom:36px;display:flex;justify-content:space-between;align-items:center"><span class="wa">💬 WhatsApp 0322 4631990</span><span style="font:700 26px S;text-align:right">Free delivery<br>Cash on delivery</span></div>`];
S['143-gl2-story']=[1080,1920,`<div class="bg"></div><div class="dots"></div>
<div style="position:absolute;inset:120px 56px 0;display:grid;align-content:start;gap:20px;text-align:center;justify-items:center"><p class="k">Website Grand Launch · till 29 Nov</p>
<h1 class="h" style="font-size:108px">Jacket lo,<br><span style="color:#ffd84a">sweatshirt<br>FREE</span></h1>
<div style="width:100%;background:rgba(26,26,26,.18);border-radius:36px;padding:22px 10px">${row('Gents jacket Rs 1,999+',G[0],GS[0],330)}</div>
<div style="width:100%;background:rgba(26,26,26,.18);border-radius:36px;padding:22px 10px">${row('Ladies jacket',W[0],K[0],330)}</div></div>
<div style="position:absolute;left:0;right:0;bottom:90px;display:grid;justify-items:center;gap:12px"><span class="wa" style="font-size:44px;padding:20px 44px">💬 Tap to WhatsApp us</span><span style="font:700 30px S">0322 4631990 · free delivery · COD</span><span class="tc" style="font-size:24px">1 gift per order · while stock lasts</span></div>`];
// reel scenes 1080x1920
const big=(x,free,lbl)=>`<div class="bg"></div><div class="dots"></div><div style="position:absolute;inset:0;display:grid;place-items:center"><div style="display:grid;justify-items:center;gap:30px">${lbl?`<span class="tag" style="font-size:36px">${lbl}</span>`:''}<div class="it"><img src="${u(C+x[0]+'.png')}" style="height:1050px;max-width:960px">${free?`<span class="free" style="padding:14px 26px 10px"><s style="font-size:40px">${rs(x[3])}</s><b style="font-size:84px">FREE</b></span>`:''}<span class="lb" style="font-size:40px;padding:12px 28px">${x[1]} · ${x[2]}</span>${free?'':`<span class="pr" style="font-size:44px;margin-top:16px"><b>${rs(x[3])}</b></span>`}</div></div></div>`;
const RS=[
`<div class="bg"></div><div class="dots"></div><div class="rib" style="left:0;right:0;top:1340px;height:40px"></div><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><p class="k" style="font-size:36px">Website Grand Launch</p><h1 class="h" style="font-size:190px;margin-top:30px">Jacket<br>lo…</h1></div></div>`,
big(G[0],0,'Gents jacket'),big(GS[0],1,'+ Gents sweatshirt'),
big(W[0],0,'Ladies jacket'),big(K[0],1,'+ Kids sweatshirt'),
big(G[1],0,'Gents · gift inside 🎁'),big(W[2],0,'Ladies · gift inside 🎁'),big(G[2],0,'Gents · gift inside 🎁'),big(W[3],0,'Ladies · gift inside 🎁'),
`<div class="bg"></div><div class="dots"></div><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div style="display:grid;gap:34px;justify-items:center"><h1 class="h" style="font-size:150px">Free<br><span style="color:#ffd84a">delivery</span></h1><p style="font:700 50px S">Cash on delivery · original brands</p><span class="wa" style="font-size:54px;padding:24px 50px">💬 WhatsApp us now</span><p style="font:700 44px S">0322 4631990</p><p class="tc" style="font-size:30px">1 gift per order · while stock lasts · till 29 Nov</p></div></div>`];
(async()=>{const b=await chromium.launch();
 const shot=async(w,h,body,file)=>{const p=await b.newPage({viewport:{width:w,height:h}});const hf=OUT+'_page.html';fs.writeFileSync(hf,`<!doctype html><meta charset="utf-8"><style>${css}</style><body style="width:${w}px;height:${h}px">${body}</body>`);await p.goto(u(hf),{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);await p.screenshot({path:file,type:'jpeg',quality:90});await p.close()};
 for(const k in S)await shot(S[k][0],S[k][1],S[k][2],OUT+k+'.jpg');
 for(let i=0;i<RS.length;i++)await shot(1080,1920,RS[i],OUT+'reel/s'+String(i).padStart(2,'0')+'.jpg');
 fs.unlinkSync(OUT+'_page.html');await b.close();console.log('ok')})();
