// ABCThrift giveaway batch 134-137: "Golden ticket" theme (crimson + cream tickets + gold), real photos + real tags
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const S = __dirname, SRC = S + '/src/', OUT = S + '/out/';
const FD = '/mnt/skills/examples/canvas-design/canvas-fonts/';
const NUM = '0322 4631990';
const END = 'Fri 28 Nov, 11:59 PM'; const WIN = 'Sat 29 Nov, 8 PM';
const I = [
 {k:'A', f:'a', brand:'PARAGONA', name:'Quilted Puffer Jacket', size:'L', who:'Unisex', price:1999, sku:'PUF-0047',
  feats:['Fleece-lined stand collar','Zip pockets + storm placket'], fw:[.5,.52,1.0], tg:[.48,.43,3.2], tsz:[1152,1440], fsz:[1149,1440]},
 {k:'B', f:'b', brand:'CARS JEANS', name:'Quilted Puffer Jacket', size:'L', who:'Men', price:1999, sku:'PUF-0045',
  feats:['Dutch denim brand, since 1982','Zip chest pockets, suede-look shoulders'], fw:[.5,.52,1.0], tg:[.47,.48,2.0], tsz:[1152,1440], fsz:[1152,1440]},
 {k:'C', f:'c', brand:'MIPHA', name:'Hooded Parka, Faux-Fur Lined', size:'XL', who:'Women', price:1199, sku:'COA-0046',
  feats:['Plush faux-fur lining','Detachable hood, button-flap pockets'], fw:[.49,.5,1.0], tg:[.49,.46,2.1], tsz:[678,1440], fsz:[1149,1440]},
 {k:'D', f:'d', brand:'NARUTO', name:'Shippuden Sweatshirt', size:'9-10Y', who:'Kids', price:1499, sku:'SWE-0057',
  feats:['Official Shippuden Collection','Soft fleece inside, big back print'], fw:[.5,.5,1.0], tg:[.41,.47,2.2], tsz:[1152,1440], fsz:[1149,1440]},
];
const rs = n => 'Rs ' + n.toLocaleString('en-US');
const css = `
@font-face{font-family:Bold;src:url(file://${FD}Boldonse-Regular.ttf)}
@font-face{font-family:Out;src:url(file://${FD}Outfit-Bold.ttf);font-weight:700}
@font-face{font-family:Out;src:url(file://${FD}Outfit-Regular.ttf);font-weight:400}
@font-face{font-family:Mono;src:url(file://${FD}DMMono-Regular.ttf)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Out;color:#2a0b12}
.cv{position:relative;overflow:hidden;background:radial-gradient(120% 80% at 50% 0%,#c4173a 0%,#9c0d28 55%,#6e0719 100%)}
.cv:before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(255,255,255,.035) 0 2px,transparent 2px 26px)}
.conf{position:absolute;width:14px;height:22px;border-radius:3px;opacity:.9}
.gold{color:#f6c64f}
.h{font-family:Bold;line-height:1.22;letter-spacing:-1px}
.strip{display:inline-flex;align-items:center;gap:14px;background:#f6c64f;color:#5c0716;font-weight:700;letter-spacing:4px;font-size:22px;padding:10px 22px;border-radius:6px;text-transform:uppercase}
.ticket{position:absolute;background:#fff6e5;border-radius:18px;overflow:hidden;box-shadow:0 18px 40px rgba(40,0,8,.45)}
.ticket .ph{position:absolute;left:0;top:0;right:0;overflow:hidden;background:#ddd}
.ph img{position:absolute}
.perf{position:absolute;left:0;right:0;height:0;border-top:4px dashed #e2c9a6}
.notch{position:absolute;width:36px;height:36px;border-radius:50%;background:#8f0c25}
.let{position:absolute;width:86px;height:86px;border-radius:50%;background:#f6c64f;color:#5c0716;font-family:Bold;font-size:44px;display:flex;align-items:center;justify-content:center;border:5px solid #fff6e5;box-shadow:0 6px 16px rgba(0,0,0,.35)}
.tag{position:absolute;overflow:hidden;border:6px solid #f6c64f;border-radius:14px;box-shadow:0 8px 20px rgba(0,0,0,.45);background:#222}
.tag img{position:absolute}
.tagl{position:absolute;background:#f6c64f;color:#5c0716;font-weight:700;font-size:15px;letter-spacing:2px;padding:4px 10px;border-radius:5px}
.lab{display:inline-block;background:#141414;color:#f3ead7;font-weight:700;letter-spacing:3px;padding:7px 14px 6px;border-radius:4px;border:2px solid #3a3a3a;outline:2px dashed #555;outline-offset:-7px}
.price{font-family:Bold;color:#a30f2b}
.mono{font-family:Mono;letter-spacing:2px}
.steps{position:absolute;display:flex;gap:16px}
.step{flex:1;background:#fff6e5;border-radius:16px;padding:18px 18px 16px;position:relative}
.step b{display:flex;width:48px;height:48px;border-radius:50%;background:#a30f2b;color:#f6c64f;font-family:Bold;font-size:24px;align-items:center;justify-content:center;margin-bottom:10px}
.step .t{font-weight:700;font-size:27px;line-height:1.1;color:#2a0b12}
.step .s{font-size:19px;line-height:1.2;color:#6b4b4f;margin-top:4px}
.fine{position:absolute;left:0;right:0;text-align:center;color:#ffd9de;font-size:18px;line-height:1.35}
`;
function fit(box, sz, foc, z){ // returns img style for cover+zoom around focus
  const [w,h]=box,[iw,ih]=sz; const s=Math.max(w/iw,h/ih)*z; const W=iw*s,H=ih*s;
  let l=w/2-foc[0]*W, t=h/2-foc[1]*H; l=Math.min(0,Math.max(w-W,l)); t=Math.min(0,Math.max(h-H,t));
  return `width:${W}px;height:${H}px;left:${l}px;top:${t}px`;
}
const front=(it,w,h)=>`<img src="file://${SRC}${it.f}_front.jpg" style="${fit([w,h],it.fsz,it.fw,it.fw[2])}">`;
const tagimg=(it,w,h)=>`<img src="file://${SRC}${it.f}_tag.jpg" style="${fit([w,h],it.tsz,it.tg,it.tg[2])}">`;
function confetti(W,H,n,seed){let x=seed,o='';const r=()=>(x=(x*9301+49297)%233280)/233280;const c=['#f6c64f','#fff6e5','#ff8fa3','#f6c64f'];
 for(let i=0;i<n;i++){const top=r()*H, left=r()*W; if(left>44&&left<W-44&&top>34&&top<H-30) continue; o+=`<i class="conf" style="left:${left}px;top:${top}px;background:${c[i%4]};transform:rotate(${r()*180}deg) scale(${.6+r()*.8})"></i>`;} return o;}
function ticket(it,x,y,w,h,ph){ // grid ticket
  const tw=Math.round(w*.36);
  return `<div class="ticket" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
   <div class="ph" style="height:${ph}px">${front(it,w,ph)}</div>
   <div class="let" style="left:14px;top:14px">${it.k}</div>
   <div class="tag" style="right:12px;top:${ph-tw-12}px;width:${tw}px;height:${tw}px">${tagimg(it,tw-12,tw-12)}</div>
   <div class="tagl" style="right:22px;top:${ph-tw-2}px;font-size:12px">REAL TAG</div>
   <div class="notch" style="left:-18px;top:${ph-18}px"></div><div class="notch" style="right:-18px;top:${ph-18}px"></div>
   <div style="position:absolute;left:18px;right:18px;top:${ph+16}px">
     <span class="lab" style="font-size:20px">${it.brand}</span>
     <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:10px">
       <span style="font-weight:700;font-size:22px">${it.who} · ${it.size}</span>
       <span class="price" style="font-size:22px">${rs(it.price)}</span></div>
   </div></div>`;
}
const stepsHtml=(x,y,w,fs=1)=>`<div class="steps" style="left:${x}px;top:${y}px;width:${w}px">
 <div class="step"><b>1</b><div class="t">Follow</div><div class="s">ABCThrift page</div></div>
 <div class="step"><b>2</b><div class="t">Comment</div><div class="s">your letter: A, B, C or D</div></div>
 <div class="step"><b>3</b><div class="t">WhatsApp</div><div class="s">a screenshot to ${NUM}</div></div></div>`;
const fine=(y,extra='')=>`<div class="fine" style="top:${y}px">Ends ${END} PKT · Winner picked at random, announced ${WIN} on our page${extra}<br>Free delivery for the winner · Not sponsored by or associated with Facebook or Meta</div>`;
const logo=(x,y,sz=34)=>`<div style="position:absolute;left:${x}px;top:${y}px;font-weight:700;font-size:${sz}px;color:#fff6e5;letter-spacing:1px">ABC<span class="gold">Thrift</span><span style="font-weight:400;font-size:${sz*.55}px;color:#ffd9de;margin-left:10px">abcthrift.store</span></div>`;

const pages = {};
// 134 feed 1080x1350
pages['134-giveaway-feed'] = [1080,1350, `${confetti(1080,1350,40,7)}${logo(48,40)}
 <div style="position:absolute;right:48px;top:40px" class="strip">🎁 Giveaway</div>
 <div class="h gold" style="position:absolute;left:48px;top:108px;font-size:96px">WIN IT FREE</div>
 <div style="position:absolute;left:50px;top:222px;color:#fff6e5;font-size:30px;font-weight:700">Pick 1 of these 4 original-brand pieces. 1 winner gets it free.</div>
 ${ticket(I[0],48,282,480,410,300)}${ticket(I[1],552,282,480,410,300)}
 ${ticket(I[2],48,712,480,410,300)}${ticket(I[3],552,712,480,410,300)}
 ${stepsHtml(48,1140,984)}`.replace('</div></div></div>`','') + '' ];
// fine print for feed (append)
pages['134-giveaway-feed'][2] += `<div class="fine" style="top:1296px;font-size:16px">Ends ${END} PKT · Random winner announced ${WIN} · Not sponsored by or associated with Facebook/Meta</div>`;

// 135 story 1080x1920
pages['135-giveaway-story'] = [1080,1920, `${confetti(1080,1920,60,3)}${logo(60,150)}
 <div style="position:absolute;right:60px;top:150px" class="strip">🎁 Giveaway</div>
 <div class="h gold" style="position:absolute;left:60px;top:225px;font-size:104px">WIN IT<br>FREE</div>
 <div style="position:absolute;left:62px;top:505px;color:#fff6e5;font-size:34px;font-weight:700;width:960px">Pick 1 of 4 original-brand pieces.<br>1 lucky winner gets it free.</div>
 ${ticket(I[0],60,610,468,470,350)}${ticket(I[1],552,610,468,470,350)}
 ${ticket(I[2],60,1100,468,470,350)}${ticket(I[3],552,1100,468,470,350)}
 ${stepsHtml(60,1592,960)}
 <div class="fine" style="top:1810px;font-size:17px">Ends ${END} PKT · Random winner announced ${WIN}<br>Not sponsored by or associated with Facebook/Meta</div>`];

// 136 carousel cards 1080x1350
function itemCard(it,i){
  const ph=950, tw=330;
  return `${logo(48,36,30)}<div style="position:absolute;right:48px;top:32px" class="strip">Giveaway · Option ${it.k}</div>
  <div class="ticket" style="left:40px;top:100px;width:1000px;height:1210px">
   <div class="ph" style="height:${ph}px">${front(it,1000,ph)}</div>
   <div class="let" style="left:22px;top:22px;width:120px;height:120px;font-size:62px">${it.k}</div>
   <div class="tag" style="right:22px;top:${ph-tw-22}px;width:${tw}px;height:${tw}px">${tagimg(it,tw-12,tw-12)}</div>
   <div class="tagl" style="right:36px;top:${ph-tw-8}px">REAL BRAND TAG</div>
   <div class="notch" style="left:-18px;top:${ph-18}px;background:#9c0d28"></div><div class="notch" style="right:-18px;top:${ph-18}px;background:#9c0d28"></div>
   <div style="position:absolute;left:34px;right:34px;top:${ph+26}px">
     <div style="display:flex;justify-content:space-between;align-items:center"><span class="lab" style="font-size:28px">${it.brand}</span>
       <span class="mono" style="font-size:20px;color:#9b7f72">No. ${it.sku}</span></div>
     <div style="font-weight:700;font-size:38px;margin-top:14px">${it.name}</div>
     <div style="font-size:25px;color:#6b4b4f;margin-top:6px">${it.who} · Size ${it.size} · ${it.feats.join(' · ')}</div>
     <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px">
       <span style="font-weight:700;font-size:26px;color:#2a0b12">Win it free, or buy now: <span class="price" style="font-size:34px">${rs(it.price)}</span></span>
       <span style="font-weight:700;font-size:22px;background:#a30f2b;color:#f6c64f;padding:10px 16px;border-radius:10px">Comment “${it.k}”</span></div>
   </div></div>`;
}
pages['136-car-0-intro'] = [1080,1350, `${confetti(1080,1350,50,11)}${logo(48,40)}
 <div class="h gold" style="position:absolute;left:48px;top:120px;font-size:120px">WIN<br>IT FREE</div>
 <div style="position:absolute;left:52px;top:480px;color:#fff6e5;font-size:40px;font-weight:700;width:980px;line-height:1.2">4 original-brand winter pieces.<br>You choose 1. We gift it to 1 winner.</div>
 <div style="position:absolute;left:48px;top:640px;display:flex;gap:18px">${I.map(it=>`<div class="ticket" style="position:relative;width:231px;height:300px"><div class="ph" style="height:300px">${front(it,231,300)}</div><div class="let" style="left:10px;top:10px;width:62px;height:62px;font-size:30px;border-width:4px">${it.k}</div></div>`).join('')}</div>
 <div style="position:absolute;left:52px;top:990px;color:#fff6e5;font-size:30px;line-height:1.35">Swipe to see each piece with its <b class="gold">real tag</b>, size and price ➜</div>
 ${stepsHtml(48,1090,984)}
 <div class="fine" style="top:1290px;font-size:16px">Ends ${END} PKT · Random winner announced ${WIN} · Not sponsored by or associated with Facebook/Meta</div>`];
I.forEach((it,i)=>pages[`136-car-${i+1}-${it.brand.toLowerCase().replace(/[^a-z]/g,'')}`]=[1080,1350,confetti(1080,1350,24,20+i)+itemCard(it,i)]);
pages['136-car-5-howto'] = [1080,1350, `${confetti(1080,1350,50,5)}${logo(48,40)}
 <div class="h gold" style="position:absolute;left:48px;top:120px;font-size:84px">HOW TO<br>ENTER</div>
 <div style="position:absolute;left:48px;top:370px;width:984px;display:flex;flex-direction:column;gap:20px">
  ${[['1','Follow the ABCThrift page','Tap Follow on facebook.com/abcthrift.store'],['2','Comment your letter','A, B, C or D under the giveaway post'],['3','WhatsApp us a screenshot','Send it to '+NUM+' to confirm your entry']].map(s=>`<div class="step" style="display:flex;gap:24px;align-items:center;padding:26px 30px"><b style="margin:0;width:72px;height:72px;font-size:34px;flex:none">${s[0]}</b><div><div class="t" style="font-size:38px">${s[1]}</div><div class="s" style="font-size:25px">${s[2]}</div></div></div>`).join('')}
 </div>
 <div style="position:absolute;left:48px;top:880px;width:984px;background:rgba(0,0,0,.22);border:2px solid rgba(246,198,79,.6);border-radius:18px;padding:26px 30px;color:#fff6e5;font-size:25px;line-height:1.45">
  🗓 Entries close <b class="gold">${END} PKT</b><br>🎲 1 winner picked at random, announced <b class="gold">${WIN}</b><br>🚚 Prize delivered free anywhere in Pakistan<br>✅ One entry per person · no purchase needed</div>
 <div class="fine" style="top:1250px;font-size:17px">Full rules in the post caption. This giveaway is not sponsored, endorsed or run by Facebook/Meta.</div>`];

// reel scenes 1080x1920
const R={};
R['r0']=`${confetti(1080,1920,70,9)}${logo(60,160)}
 <div class="strip" style="position:absolute;left:60px;top:300px;font-size:28px">🎁 Free giveaway</div>
 <div class="h gold" style="position:absolute;left:56px;top:390px;font-size:150px">WIN<br>IT<br>FREE</div>
 <div style="position:absolute;left:62px;top:1020px;color:#fff6e5;font-size:48px;font-weight:700;width:960px;line-height:1.2">Original-brand winter wear.<br>4 pieces. You pick 1.</div>
 <div style="position:absolute;left:60px;top:1260px;display:flex;gap:14px">${I.map(it=>`<div class="ticket" style="position:relative;width:228px;height:300px"><div class="ph" style="height:300px">${front(it,228,300)}</div><div class="let" style="left:10px;top:10px;width:60px;height:60px;font-size:28px;border-width:4px">${it.k}</div></div>`).join('')}</div>`;
I.forEach((it,i)=>{
 R['r'+(i+1)+'a']=`<div style="position:absolute;inset:0">${front(it,1080,1920).replace('<img','<img style2')}</div>`;
 R['r'+(i+1)+'a']=`<div class="ph" style="position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden">${front(it,1080,1920)}</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:720px;background:linear-gradient(transparent,rgba(60,0,12,.92) 55%)"></div>
  <div style="position:absolute;left:0;right:0;top:0;height:300px;background:linear-gradient(rgba(60,0,12,.7),transparent)"></div>
  <div class="let" style="left:56px;top:150px;width:150px;height:150px;font-size:80px">${it.k}</div>
  <div class="strip" style="position:absolute;right:56px;top:190px;font-size:24px">Option ${it.k} of 4</div>
  <div style="position:absolute;left:60px;right:60px;top:1420px;color:#fff6e5">
   <span class="lab" style="font-size:40px">${it.brand}</span>
   <div style="font-weight:700;font-size:54px;margin-top:20px;line-height:1.1">${it.name}</div>
   <div style="font-size:34px;color:#ffd9de;margin-top:10px">${it.who} · Size ${it.size} · ${it.feats[0]}</div>
   <div style="margin-top:24px;display:inline-block;background:#f6c64f;color:#5c0716;border-radius:14px;padding:12px 24px;font-family:Bold;font-size:40px">${rs(it.price)}</div>
  </div>`;
 R['r'+(i+1)+'b']=`<div class="ph" style="position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden">${tagimg(it,1080,1920).replace(String(it.tg[2]),'x')}</div>
  <div class="tagl" style="left:60px;top:200px;font-size:30px;padding:10px 22px">REAL BRAND TAG ✓</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:420px;background:linear-gradient(transparent,rgba(60,0,12,.9))"></div>
  <div style="position:absolute;left:60px;bottom:170px;color:#fff6e5;font-weight:700;font-size:50px">Comment “<span class="gold">${it.k}</span>” to pick it</div>`;
});
R['r5']=`${confetti(1080,1920,60,13)}${logo(60,160)}
 <div class="h gold" style="position:absolute;left:56px;top:290px;font-size:104px">HOW TO<br>ENTER</div>
 <div style="position:absolute;left:60px;top:650px;width:960px;display:flex;flex-direction:column;gap:26px">
 ${[['1','Follow','the ABCThrift page'],['2','Comment','your letter: A, B, C or D'],['3','WhatsApp','a screenshot to '+NUM]].map(s=>`<div class="step" style="display:flex;gap:28px;align-items:center;padding:34px 36px"><b style="margin:0;width:90px;height:90px;font-size:42px;flex:none">${s[0]}</b><div><div class="t" style="font-size:54px">${s[1]}</div><div class="s" style="font-size:32px">${s[2]}</div></div></div>`).join('')}</div>
 <div style="position:absolute;left:60px;top:1420px;width:960px;color:#fff6e5;font-size:36px;line-height:1.45">🗓 Ends <b class="gold">${END}</b><br>🎲 Random winner: <b class="gold">${WIN}</b><br>🚚 Free delivery for the winner</div>
 <div class="fine" style="top:1760px;font-size:22px">Not sponsored by or associated with Facebook/Meta</div>`;
R['r6']=`${confetti(1080,1920,80,17)}
 <div style="position:absolute;left:0;right:0;top:600px;text-align:center">
  <div style="font-weight:700;font-size:96px;color:#fff6e5">ABC<span class="gold">Thrift</span></div>
  <div style="font-size:40px;color:#ffd9de;margin-top:16px">Original brands · Real tags · Thrift prices</div>
  <div class="strip" style="margin-top:70px;font-size:34px;padding:18px 34px">WhatsApp ${NUM}</div>
  <div style="font-size:36px;color:#fff6e5;margin-top:46px">🛒 abcthrift.store</div>
  <div style="font-size:30px;color:#ffd9de;margin-top:16px">Cash on Delivery all Pakistan · 7-day returns</div></div>`;
// fix tag zoom bug from replace hack: rebuild r*b images properly
I.forEach((it,i)=>{R['r'+(i+1)+'b']=R['r'+(i+1)+'b'].replace(/<img[^>]*>/, `<img src="file://${SRC}${it.f}_tag.jpg" style="${fit([1080,1920],it.tsz,it.tg,it.tg[2]*0.75>1?it.tg[2]*0.75:1.05)}">`)});

(async()=>{
 const b=await chromium.launch({args:['--allow-file-access-from-files']}); const p=await b.newPage({deviceScaleFactor:1});
 const only=process.argv[2];
 const shoot=async(name,w,h,body,dir)=>{ if(only&&!name.startsWith(only))return;
   await p.setViewportSize({width:w,height:h});
   fs.writeFileSync(S+'/_t.html',`<html><head><style>${css}</style></head><body><div class="cv" style="width:${w}px;height:${h}px">${body}</div></body></html>`); await p.goto('file://'+S+'/_t.html',{waitUntil:'load'});
   await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(150);
   await p.screenshot({path:dir+name+(dir==OUT?'.png':'.png')}); console.log(name);};
 for(const [n,[w,h,body]] of Object.entries(pages)) await shoot(n,w,h,body,OUT);
 fs.mkdirSync(S+'/reel',{recursive:true});
 for(const [n,body] of Object.entries(R)) await shoot(n,1080,1920,body,S+'/reel/');
 await b.close();})();
