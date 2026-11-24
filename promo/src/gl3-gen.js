// Grand Launch v3 creatives 145-147 (24 Nov 2026), after WAQAR: "colour too bright, images bigger and original".
// Theme "stone & charcoal": warm stone #efebe4, charcoal ink, sage FREE chip, Young Serif + Work Sans; REAL site photos big (no cut-outs).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'../..'),IMG=R+'/public/img/',OUT=R+'/promo/gl3/',F='/mnt/skills/examples/canvas-design/canvas-fonts/';
const u=f=>'file://'+f,rs=n=>'Rs '+n.toLocaleString('en-US');
const G=[['ST-PUF-0045','Cars Jeans','Puffer jacket','L',1999],['ST-PUF-0044','H&M','Puffer jacket','L',1999],['ST-PUF-0047','PARAGONA','Puffer jacket','L',1999],['ST-PUF-0042','Bershka','Bomber jacket','L',2899]];
const GS=[['ST-SWE-0048','Mariner','Sweatshirt','XL',599]];
const W=[['ST-COA-0046','MIPHA','Hooded coat','XL',1199],['ST-PUF-0021','ABCThrift Select','Puffer jacket','L',1199],['ST-PUF-0009','House Basic','Puffer jacket','M',1199]];
const K=[['ST-SWE-0035','KIABI','Kids sweatshirt','5-6Y',399]];
const css=`@font-face{font-family:Y;src:url(${u(F+'YoungSerif-Regular.ttf')})}@font-face{font-family:S;src:url(${u(F+'WorkSans-Regular.ttf')})}@font-face{font-family:S;font-weight:700;src:url(${u(F+'WorkSans-Bold.ttf')})}
*{box-sizing:border-box;margin:0}body{font-family:S;color:#22201d;background:#efebe4;overflow:hidden;position:relative}
.h{font-family:Y;line-height:1.02;letter-spacing:-.01em}.k{font:700 22px S;letter-spacing:.2em;text-transform:uppercase;color:#7a7268}
.t{position:relative;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 1px 0 rgba(0,0,0,.04),0 14px 30px rgba(60,50,40,.10)}.t img{width:100%;height:100%;object-fit:cover;object-position:center}
.cap{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;gap:10px}.cap b{font:700 26px S;letter-spacing:.04em;text-transform:uppercase}.cap span{font:400 22px S;color:#6b645c}
.pr{font:700 26px S}.fr{display:flex;align-items:baseline;gap:10px}.fr s{font:400 24px S;color:#8a8279}.fr em{font:700 26px S;font-style:normal;color:#fff;background:#5f6f52;border-radius:8px;padding:2px 12px}
.chip{position:absolute;top:16px;left:16px;background:#5f6f52;color:#fff;font:700 22px S;letter-spacing:.08em;border-radius:999px;padding:6px 16px}
.plus{width:64px;height:64px;border-radius:50%;background:#22201d;color:#efebe4;font:400 44px Y;display:grid;place-items:center;align-self:center;margin-top:-40px}
.lab{font:700 22px S;letter-spacing:.16em;text-transform:uppercase;color:#5f6f52;margin-bottom:12px}
.wa{display:inline-flex;align-items:center;gap:12px;background:#22201d;color:#efebe4;font:700 30px S;border-radius:999px;padding:14px 30px}.wa i{width:16px;height:16px;border-radius:50%;background:#25d366;display:inline-block}
.tc{font:400 20px S;color:#6b645c}`;
const tile=(x,w,h,free)=>`<div><div class="t" style="width:${w}px;height:${h}px"><img src="${u(IMG+x[0]+'-1.jpg')}">${free?'<span class="chip">FREE GIFT</span>':''}</div>
<div class="cap" style="width:${w}px"><div><b>${x[1]}</b> <span>· ${x[3]}</span></div>${free?`<div class="fr"><s>${rs(x[4])}</s><em>FREE</em></div>`:`<span class="pr">${rs(x[4])}</span>`}</div></div>`;
const row=(lbl,a,b,wa,wb,h)=>`<div><p class="lab">${lbl}</p><div style="display:flex;gap:14px;align-items:center">${tile(a,wa,h)}<div class="plus">+</div>${tile(b,wb,h,1)}</div></div>`;
const S={};
S['145-gl3-feed']=[1080,1350,`<div style="position:absolute;inset:44px 46px;display:grid;align-content:start;gap:26px">
<div style="display:flex;justify-content:space-between;align-items:end"><div><p class="k">Website Grand Launch · till 29 Nov</p><h1 class="h" style="font-size:66px;margin-top:10px">Jacket lo, sweatshirt free.</h1></div></div>
${row('Gents jacket Rs 1,999+',G[0],GS[0],500,410,400)}${row('Ladies jacket Rs 1,199+',W[0],K[0],500,410,400)}</div>
<div style="position:absolute;left:46px;right:46px;bottom:34px;display:flex;justify-content:space-between;align-items:center"><span class="wa"><i></i>WhatsApp 0322 4631990</span><span class="tc" style="text-align:right">Free delivery · Cash on delivery<br>1 gift per order · while stock lasts</span></div>`];
S['146-gl3-story']=[1080,1920,`<div style="position:absolute;inset:130px 46px 0;display:grid;align-content:start;gap:34px">
<div style="text-align:center"><p class="k">Website Grand Launch · till 29 Nov</p><h1 class="h" style="font-size:92px;margin-top:14px">Jacket lo,<br>sweatshirt free.</h1></div>
${row('Gents jacket Rs 1,999+',G[0],GS[0],520,390,540)}${row('Ladies jacket Rs 1,199+',W[0],K[0],520,390,540)}</div>
<div style="position:absolute;left:0;right:0;bottom:100px;display:grid;justify-items:center;gap:12px"><span class="wa" style="font-size:38px;padding:18px 40px"><i></i>Tap to WhatsApp us</span><span class="tc" style="font-size:24px">0322 4631990 · free delivery · COD · 1 gift per order</span></div>`];
const big=(x,free,lbl)=>`<div class="t" style="position:absolute;left:40px;right:40px;top:150px;height:1360px;border-radius:30px"><img src="${u(IMG+x[0]+'-1.jpg')}">${free?'<span class="chip" style="font-size:32px;padding:10px 24px;top:24px;left:24px">FREE GIFT</span>':''}</div>
<p class="k" style="position:absolute;left:40px;top:84px;font-size:28px;color:#5f6f52">${lbl}</p>
<div style="position:absolute;left:40px;right:40px;top:1550px;display:flex;justify-content:space-between;align-items:baseline"><div><b style="font:700 50px S;text-transform:uppercase;letter-spacing:.03em">${x[1]}</b><p style="font:400 34px S;color:#6b645c;margin-top:6px">${x[2]} · size ${x[3]}</p></div>
${free?`<div class="fr"><s style="font-size:40px">${rs(x[4])}</s><em style="font-size:48px;padding:4px 20px;border-radius:12px">FREE</em></div>`:`<b style="font:700 52px S">${rs(x[4])}</b>`}</div>`+`<p style="position:absolute;left:0;right:0;bottom:90px;text-align:center;font:700 30px S;color:#6b645c">Free delivery · COD · WhatsApp 0322 4631990</p>`;
const RS=[`<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div><p class="k" style="font-size:32px">Website Grand Launch</p><h1 class="h" style="font-size:150px;margin-top:30px">Jacket lo,<br>sweatshirt<br>free.</h1><p style="font:400 40px S;color:#6b645c;margin-top:30px">till 29 Nov · original brands</p></div></div>`,
big(G[0],0,'Gents jacket'),big(GS[0],1,'+ gents sweatshirt'),big(W[0],0,'Ladies jacket'),big(K[0],1,'+ kids sweatshirt'),
big(G[1],0,'Gents · free gift inside'),big(W[1],0,'Ladies · free gift inside'),big(G[2],0,'Gents · free gift inside'),big(W[2],0,'Ladies · free gift inside'),
`<div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center"><div style="display:grid;gap:34px;justify-items:center"><h1 class="h" style="font-size:120px">Free delivery.<br>Cash on delivery.</h1><span class="wa" style="font-size:50px;padding:22px 48px"><i style="width:22px;height:22px"></i>WhatsApp us now</span><p style="font:700 46px S">0322 4631990</p><p class="tc" style="font-size:30px">1 gift per order · while stock lasts · till 29 Nov</p></div></div>`];
(async()=>{const b=await chromium.launch();
 const shot=async(w,h,body,file)=>{const p=await b.newPage({viewport:{width:w,height:h}});const hf=OUT+'_page.html';fs.writeFileSync(hf,`<!doctype html><meta charset="utf-8"><style>${css}</style><body style="width:${w}px;height:${h}px">${body}</body>`);await p.goto(u(hf),{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);await p.screenshot({path:file,type:'jpeg',quality:92});await p.close()};
 for(const k in S)await shot(S[k][0],S[k][1],S[k][2],OUT+k+'.jpg');
 for(let i=0;i<RS.length;i++)await shot(1080,1920,RS[i],OUT+'reel/s'+String(i).padStart(2,'0')+'.jpg');
 fs.unlinkSync(OUT+'_page.html');await b.close();console.log('ok')})();
