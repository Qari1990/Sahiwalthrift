// ads-nov18: "Pop colour block + kraft hang-tag" theme. FB cover 1640x924 + Meta carousel 1080x1080 x10.
const {chromium}=require('playwright');const fs=require('fs');
const D=__dirname, OUT=D+'/out/';fs.mkdirSync(OUT,{recursive:true});
const u=p=>'file://'+D+'/'+p, cut=s=>u(s+'.png');
const rs=n=>'Rs '+n.toLocaleString('en-US');
const NUM='0322 4631990', SITE='abcthrift.store';
const CSS=`<style>@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Mono:wght@500&family=Inter:wght@600;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Bricolage Grotesque',sans-serif;color:#111;overflow:hidden}
.a{position:absolute}.mono{font-family:'DM Mono',monospace}
.g{position:absolute;filter:drop-shadow(0 22px 22px rgba(0,0,0,.28))}
.woven{position:absolute;background:#141414;color:#f4efe4;font-family:Inter;font-weight:900;letter-spacing:.16em;text-transform:uppercase;padding:10px 22px 11px;border-radius:5px;white-space:nowrap;box-shadow:0 6px 14px rgba(0,0,0,.25)}
.woven:before{content:'';position:absolute;inset:4px;border:1.5px dashed rgba(244,239,228,.5);border-radius:3px}
.htag{position:absolute;background:#d8b98c;background-image:radial-gradient(rgba(0,0,0,.05) 1px,transparent 1px);background-size:5px 5px;color:#1b140c;border-radius:14px 14px 18px 18px;clip-path:polygon(22% 0,78% 0,100% 13%,100% 100%,0 100%,0 13%);box-shadow:0 10px 24px rgba(0,0,0,.25);text-align:center}
.htag .hole{position:absolute;left:50%;top:22px;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:#f6f1e6;box-shadow:inset 0 2px 3px rgba(0,0,0,.35)}
.pill{position:absolute;border:2.5px solid #111;border-radius:999px;font-family:Inter;font-weight:800;letter-spacing:.12em;padding:8px 18px}
</style>`;
// products: sku, brand (as on tag), name, size, price, bg colour
const P=[
 ['ST-PUF-0042','Bershka','MA-1 style bomber','L',2899,'#d9f95b','Men'],
 ['ST-PUF-0047','Paragona','Quilted puffer','L',1999,'#ffb08f','Unisex'],
 ['ST-COA-0046','Mipha','Hooded parka, faux-fur lined','XL',1199,'#ffd1e3','Women'],
 ['ST-PUF-0053','American Eagle','Eagle logo hoodie','L',799,'#a9dcff','Men'],
 ['ST-SWE-0050','Bershka','Half-zip ribbed collar','M',1599,'#ffe27a','Unisex'],
 ['ST-PUF-0044','H&amp;M','Tie-dye quilted puffer','L',1999,'#c9b8ff','Men'],
 ['ST-COA-0038','Recel','Crown check hooded jacket','XL',1599,'#8ff0c6','Unisex'],
 ['ST-SWE-0058','C&amp;A','Unicorn sweatshirt (kids)','9-10Y',499,'#b8f1ff','Kids'],
];
const out={};
const plain=s=>s.replace(/&amp;/g,'&');
// ---- product card ----
P.forEach(([sku,b,name,sz,pr,bg,g],i)=>{
 const big=plain(b).toUpperCase(), fsz=Math.min(260,Math.floor(1700/big.length));
 out[`127-car-${i+1}-${plain(b).toLowerCase().replace(/[^a-z]+/g,'')}`]=[1080,1080,`<body style="background:${bg}">
<div class="a" style="left:0;right:0;top:120px;text-align:center;font-weight:800;font-size:${fsz}px;letter-spacing:-.04em;line-height:1;color:transparent;-webkit-text-stroke:3px rgba(0,0,0,.13);white-space:nowrap">${big}</div>
<img class="a" src="${u('abcthrift-logo.png')}" style="left:48px;top:44px;width:200px">
<div class="pill" style="right:48px;top:46px;font-size:20px">1 OF 1 · ${g.toUpperCase()}</div>
<div class="a" style="left:60px;top:140px;width:650px;height:720px;display:flex;align-items:center;justify-content:center"><img src="${cut(sku)}" style="max-height:720px;max-width:650px;filter:drop-shadow(0 22px 22px rgba(0,0,0,.28))"></div>
<svg class="a" style="left:700px;top:150px" width="200" height="200"><path d="M10 10 C 90 40, 120 80, 150 165" stroke="#5a4630" stroke-width="3" fill="none"/></svg>
<div class="htag" style="left:720px;top:300px;width:300px;height:430px;transform:rotate(6deg)"><div class="hole"></div>
 <div class="mono" style="margin-top:70px;font-size:20px;letter-spacing:.18em">${plain(b).length>12?'':'BRAND'} </div>
 <div style="font-weight:800;font-size:${plain(b).length>10?34:44}px;line-height:1;padding:0 18px;margin-top:6px">${b}</div>
 <div class="mono" style="font-size:19px;margin-top:10px;padding:0 20px;line-height:1.3">${name}</div>
 <div style="margin:18px 30px 0;border-top:2px dashed rgba(27,20,12,.5)"></div>
 <div class="mono" style="font-size:22px;margin-top:16px;letter-spacing:.14em">SIZE</div>
 <div style="font-weight:800;font-size:52px;line-height:1">${sz}</div>
 <div style="position:absolute;left:0;right:0;bottom:0;height:92px;background:#141414;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:50px;letter-spacing:-.01em">${rs(pr)}</div></div>
<div class="woven" style="left:385px;transform:translateX(-50%) rotate(-2deg);top:878px;font-size:${plain(b).length>10?26:32}px">${b}</div>
<div class="a" style="left:0;right:0;bottom:0;height:86px;background:#111;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 48px;font-family:Inter;font-weight:800;font-size:28px">
 <span>Cash on Delivery · 7-day returns</span><span style="color:${bg}">WhatsApp ${NUM}</span></div></body>`];
});
// ---- intro card ----
const mini=(s,l,t,h,r)=>`<img class="g" src="${cut(s)}" style="left:${l}px;top:${t}px;height:${h}px;transform:rotate(${r}deg)">`;
out['127-car-0-intro']=[1080,1080,`<body style="background:#111;color:#fff">
<img class="a" src="${u('abcthrift-logo-white.png')}" style="left:56px;top:50px;width:220px">
<div class="pill" style="right:56px;top:54px;font-size:20px;border-color:#d9f95b;color:#d9f95b">NEW STOCK · SAHIWAL</div>
<div class="a" style="left:56px;top:150px;font-weight:800;font-size:112px;line-height:.92;letter-spacing:-.045em">Original brands.<br><span style="color:#d9f95b">Thrift prices.</span></div>
<div class="a" style="left:0;top:420px;width:1080px;height:470px">
 <div class="a" style="left:40px;top:40px;width:300px;height:400px;border-radius:30px;background:#ffb08f"></div>
 <div class="a" style="left:390px;top:10px;width:300px;height:430px;border-radius:30px;background:#d9f95b"></div>
 <div class="a" style="left:740px;top:40px;width:300px;height:400px;border-radius:30px;background:#a9dcff"></div>
 ${mini('ST-PUF-0047',60,70,330,-3)}${mini('ST-PUF-0042',405,30,390,0)}${mini('ST-PUF-0053',785,70,340,3)}
 <div class="woven" style="left:110px;top:410px;font-size:24px;transform:rotate(-3deg)">Paragona</div>
 <div class="woven" style="left:470px;top:410px;font-size:24px;transform:rotate(1deg)">Bershka</div>
 <div class="woven" style="left:770px;top:410px;font-size:22px;transform:rotate(3deg)">American Eagle</div>
</div>
<div class="a" style="left:56px;top:925px;font-family:Inter;font-weight:800;font-size:34px">Price + size on every piece. <span style="color:#d9f95b">Swipe →</span></div>
<div class="a" style="left:56px;top:985px;font-family:Inter;font-weight:600;font-size:26px;color:#bbb">Cash on Delivery all over Pakistan · 7-day returns</div></body>`];
// ---- end card ----
const step=(n,t,s)=>`<div style="display:flex;gap:26px;align-items:center;margin-bottom:30px"><div style="flex:none;width:74px;height:74px;border-radius:50%;background:#111;color:#d9f95b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:40px">${n}</div><div><div style="font-weight:800;font-size:42px;line-height:1.05">${t}</div><div style="font-family:Inter;font-weight:600;font-size:25px;color:#333;margin-top:4px">${s}</div></div></div>`;
out['127-car-9-order']=[1080,1080,`<body style="background:#d9f95b">
<img class="a" src="${u('abcthrift-logo.png')}" style="left:56px;top:50px;width:220px">
<div class="a" style="left:56px;top:150px;font-weight:800;font-size:104px;line-height:.92;letter-spacing:-.045em">Like a piece?<br>Just message us.</div>
<div class="a" style="left:56px;top:380px;width:620px">
${step(1,'Send a screenshot','of the piece you like')}${step(2,'We confirm','size, photos & real tag')}${step(3,'Pay cash on delivery','all over Pakistan')}</div>
<img class="g" src="${cut('ST-SWE-0050')}" style="left:700px;top:330px;height:400px;transform:rotate(5deg)">
<div class="htag" style="left:760px;top:720px;width:250px;height:150px;transform:rotate(-5deg);clip-path:none;padding-top:20px"><div class="mono" style="font-size:20px;letter-spacing:.12em">DELIVERY Rs 250</div><div style="font-weight:800;font-size:34px;line-height:1.05;margin-top:8px">FREE over<br>Rs 1,999</div></div>
<div class="a" style="left:0;right:0;bottom:0;height:150px;background:#111;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center">
 <div style="font-weight:800;font-size:58px;letter-spacing:-.02em">WhatsApp ${NUM}</div>
 <div style="font-family:Inter;font-weight:800;font-size:28px;color:#d9f95b;letter-spacing:.06em">${SITE} · 7-day returns</div></div></body>`];
// ---- FB cover 1640x924 (desktop shows middle 1640x624: keep everything between y=150 and y=774) ----
const hang=(s,x,h,r,lab,pr,sz)=>`<div class="a" style="left:${x}px;top:208px;width:0;height:0">
 <img class="g" src="${cut(s)}" style="left:${-h*0.4}px;top:0;height:${h}px;transform:rotate(${r}deg);transform-origin:50% 0"></div>`;
out['abcthrift-fb-cover-1640x924']=[1640,924,`<body style="background:#faf8f4">
<div class="a" style="left:0;right:0;top:0;height:924px;background:radial-gradient(circle at 50% 46%,#fff 0,#faf8f4 40%,#efe9dd 100%)"></div>
<div class="a" style="left:0;right:0;top:110px;text-align:center;font-family:Inter;font-weight:800;font-size:20px;letter-spacing:.3em;color:#9a8f7c">PRE-LOVED · HAND-PICKED IN SAHIWAL · EVERY PIECE 1 OF 1</div>
<div class="a" style="left:0;right:0;top:800px;text-align:center;font-weight:800;font-size:34px;letter-spacing:.02em;color:rgba(21,32,29,.16);white-space:nowrap">BERSHKA · H&amp;M · PARAGONA · AMERICAN EAGLE · OBEY · GIORDANO · C&amp;A · MIPHA · RECEL</div>
<div class="a" style="left:0;right:0;top:196px;height:12px;background:linear-gradient(#b7b0a3,#8b8478);border-radius:6px;box-shadow:0 4px 8px rgba(0,0,0,.15)"></div>
${hang('ST-PUF-0053',330,390,0)}${hang('ST-PUF-0042',140,450,0)}
${hang('ST-SWE-0058',1310,380,0)}${hang('ST-COA-0046',1510,450,0)}
<div class="a" style="left:470px;width:700px;top:238px;text-align:center">
 <img src="${u('abcthrift-logo.png')}" style="width:400px">
 <div style="font-weight:800;font-size:46px;line-height:1.02;letter-spacing:-.035em;margin-top:0;color:#15201d">Original international brands.<br><span style="color:#c8553d">Thrift prices.</span></div>
 <div style="font-family:Inter;font-weight:800;font-size:17px;letter-spacing:.12em;color:#24413a;margin-top:16px">COD ALL PAKISTAN · 7-DAY RETURNS · FREE DELIVERY RS 1,999+</div>
 <div style="display:inline-flex;align-items:center;gap:14px;margin-top:24px;background:#1e9e55;color:#fff;border-radius:999px;padding:14px 30px;font-family:Inter;font-weight:900;font-size:32px;box-shadow:0 8px 18px rgba(30,158,85,.3)">
  <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>
  WhatsApp / Call ${NUM}</div>
 <div style="font-weight:800;font-size:34px;color:#15201d;margin-top:16px;letter-spacing:-.01em">${SITE}</div>
</div></body>`];
(async()=>{const br=await chromium.launch();const only=process.argv[2];
for(const [k,[w,h,html]] of Object.entries(out)){ if(only&&!k.includes(only))continue;
 const p=await br.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
 fs.writeFileSync(D+'/_'+k+'.html','<html><head>'+CSS+'</head>'+html+'</html>');await p.goto('file://'+D+'/_'+k+'.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 await p.screenshot({path:OUT+k+'.png'});await p.close();console.log(k);}
await br.close();})();
