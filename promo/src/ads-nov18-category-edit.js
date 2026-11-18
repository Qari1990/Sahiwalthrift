// ads-nov18b (128): category carousels, "boutique arch" premium theme. 1080x1080 cards.
const {chromium}=require('playwright');const fs=require('fs');
const D=__dirname, OUT=D+'/out128/';fs.mkdirSync(OUT,{recursive:true});
const u=p=>'file://'+D+'/'+p;const rs=n=>'Rs '+n.toLocaleString('en-US');const NUM='0322 4631990';
const GOLD='#a8834a';
const CSS=`<style>@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,700;1,6..96,500&family=Inter:wght@500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1080px;overflow:hidden;font-family:Inter,sans-serif;color:#151311;position:relative}
.a{position:absolute}.sf{font-family:'Bodoni Moda',serif}.cap{font-weight:700;letter-spacing:.28em;text-transform:uppercase}
.noise{position:absolute;inset:0;background-image:radial-gradient(rgba(0,0,0,.035) 1px,transparent 1.2px);background-size:4px 4px;pointer-events:none}
.arch{position:absolute;border-radius:999px 999px 0 0;box-shadow:inset 0 30px 60px rgba(0,0,0,.08),inset 0 -2px 0 rgba(0,0,0,.05)}
.arch:after{content:'';position:absolute;inset:-14px -14px 0 -14px;border:1.5px solid ${GOLD};border-bottom:none;border-radius:999px 999px 0 0;opacity:.7}
.gwrap{position:absolute;display:flex;align-items:flex-end;justify-content:center}
.gwrap img{max-width:100%;max-height:100%;filter:drop-shadow(0 24px 22px rgba(0,0,0,.30))}
.label{position:absolute;transform:translateX(-50%);background:#f7f3ea;color:#1a1714;font-family:'Bodoni Moda',serif;font-weight:700;letter-spacing:.12em;padding:9px 26px 10px;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,.18);border-radius:2px}
.label:before{content:'';position:absolute;inset:4px;border:1px dashed rgba(26,23,20,.35)}
.label:after{content:'ORIGINAL';position:absolute;left:0;right:0;top:-15px;text-align:center;font-family:Inter;font-size:9px;letter-spacing:.4em;color:${GOLD};font-weight:800}
.hl{height:1px;background:${GOLD};opacity:.6}
</style>`;
const CATS={
 jackets:{n:'128-jackets',title:'The Jacket',it:'Edit',sub:'Puffers & bombers',tone:'#e9e3d9',arch:'#ddd4c6',from:'from Rs 1,999',items:[
  ['ST-PUF-0042','Bershka','MA-1 bomber jacket','L',2899],['ST-PUF-0047','Paragona','Quilted puffer jacket','L',1999],['ST-PUF-0044','H&amp;M','Tie-dye quilted puffer','L',1999],
  ['ST-PUF-0045','Cars Jeans','Quilted puffer jacket','L',1999],['ST-DEN-0004','Brice','Hooded quilted puffer','L',1999],['ST-PUF-0011','Tom Tompson','Quilted puffer jacket','XXL',1999]]},
 hoodies:{n:'128-hoodies',title:'The Hoodie',it:'& Sweat Edit',sub:'Half-zips, hoodies & crews',tone:'#e4e6e9',arch:'#d3d7dd',from:'from Rs 699',items:[
  ['ST-SWE-0050','Bershka','Half-zip sweatshirt','M',1599],['ST-PUF-0053','American Eagle','Eagle logo hoodie','L',799],['ST-SWE-0039','OBEY','Half-zip sweatshirt','S',699],
  ['ST-SWE-0017','Sean John','Quarter-zip sweatshirt','S',699],['ST-SWE-0030','H&amp;M','Striped crew sweatshirt','M',999],['ST-HOO-0052','Blue Gear','Plaid zip-up hoodie','XL',999]]},
 women:{n:'128-women',title:'The Women’s',it:'Coat Edit',sub:'Parkas & padded coats',tone:'#f0e4e1',arch:'#e5d2ce',from:'Rs 1,199 each',items:[
  ['ST-COA-0046','Mipha','Hooded parka, faux-fur lined','XL',1199],['ST-COA-0043','jodi','Padded coat, velvet panels','L',1199],['ST-PUF-0009','House Basic','Hooded puffer, faux-fur trim','M',1199]]},
 kids:{n:'128-kids',title:'The Kids',it:'Winter Edit',sub:'Ages 5 to 12',tone:'#e3eaee',arch:'#d1dde4',from:'from Rs 399',items:[
  ['ST-SWE-0058','C&amp;A','Unicorn sweatshirt','9-10Y',499],['ST-KID-0056','Northville','Windproof jacket','5-6Y',699],['ST-SWE-0057','Naruto Shippuden','Collection sweatshirt','9-10Y',1499],
  ['ST-SWE-0027','Okaïdi','Striped sweatshirt','11-12Y',499],['ST-SWE-0035','Kiabi','“Amore” sweatshirt','5-6Y',399],['ST-SWE-0024','Quiksilver','Crewneck sweatshirt','7-8Y',499]]},
 vests:{n:'128-vests',title:'Vests',it:'& Layers',sub:'Quilted vests & hooded jackets',tone:'#e5e8de',arch:'#d4d9ca',from:'from Rs 999',items:[
  ['ST-PUF-0041','Giordano','Quilted puffer vest','L',999],['ST-PUF-0019','Rivers','Quilted puffer vest','L',999],['ST-PUF-0018','Klaus Feuner','Multi-pocket quilted vest','XXL',999],['ST-COA-0038','Recel','Crown-check hooded jacket','XL',1599]]},
};
const plain=s=>s.replace(/&amp;/g,'&');
const head=(c,right)=>`<img class="a" src="${u('abcthrift-logo.png')}" style="left:60px;top:48px;width:180px">
<div class="a cap" style="right:60px;top:60px;font-size:15px;color:${GOLD}">${right}</div>`;
const foot=`<div class="a" style="left:60px;right:60px;bottom:40px;display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:600;color:#3b3631"><span>Cash on Delivery · 7-day returns · All Pakistan</span><span style="font-weight:800;color:#151311">WhatsApp ${NUM}</span></div>
<div class="a hl" style="left:60px;right:60px;bottom:82px"></div>`;
const out={};
for(const [key,c] of Object.entries(CATS)){
 const N=c.items.length;
 c.items.forEach(([sku,b,name,sz,pr],i)=>{
  const bl=plain(b).length, bfs=bl>12?42:bl>6?52:66;
  out[`${c.n}-${i+1}-${plain(b).toLowerCase().replace(/[^a-z]+/g,'')}`]=`<body style="background:${c.tone}"><div class="noise"></div>
${head(c,`${plain(c.title).replace('’','’')} ${c.it}`.toUpperCase())}
<div class="arch" style="left:70px;top:140px;width:640px;height:770px;background:linear-gradient(${c.arch},${c.tone})"></div>
<div class="a" style="left:40px;width:700px;top:906px;height:3px;background:rgba(0,0,0,.08)"></div>
<div class="a" style="left:140px;width:500px;top:880px;height:46px;border-radius:50%;background:radial-gradient(rgba(0,0,0,.22),transparent 70%)"></div>
<div class="gwrap" style="left:105px;top:205px;width:570px;height:690px"><img src="${u(sku+'.png')}"></div>
<div class="label" style="left:390px;top:920px;font-size:${bl>12?20:24}px">${b}</div>
<div class="a" style="left:760px;top:190px;width:270px">
 <div class="cap" style="font-size:14px;color:${GOLD}">N° ${String(i+1).padStart(2,'0')} / ${String(N).padStart(2,'0')}</div>
 <div class="hl" style="margin:18px 0 22px;width:60px"></div>
 <div class="cap" style="font-size:12px;color:#6b6257;letter-spacing:.3em">Original brand</div>
 <div class="sf" style="font-weight:700;font-size:${bfs}px;line-height:1.02;margin-top:8px">${b}</div>
 <div style="font-size:18px;font-weight:600;color:#4a443d;margin-top:12px;line-height:1.35">${name}</div>
 <div class="hl" style="margin:28px 0 22px"></div>
 <div class="cap" style="font-size:12px;color:#6b6257">Size</div>
 <div style="font-weight:700;font-size:50px;line-height:1.1;letter-spacing:-.01em">${sz}</div>
 <div class="hl" style="margin:22px 0 22px"></div>
 <div class="cap" style="font-size:12px;color:#6b6257">Price</div>
 <div style="font-weight:800;font-size:54px;line-height:1.1;letter-spacing:-.02em">${rs(pr)}</div>
 <div style="margin-top:16px;display:inline-block;border:1.5px solid #151311;padding:8px 14px;font-size:13px;font-weight:800;letter-spacing:.2em">1 OF 1 PIECE</div>
</div>${foot}</body>`;
 });
 // intro
 const sel=c.items.slice(0,3);
 const mini=sel.map(([s,b],k)=>{const l=80+k*318,w=280,h=k==1?470:420,t=k==1?380:430;return `<div class="arch" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px;background:linear-gradient(${c.arch},${c.tone})"></div>
<div class="gwrap" style="left:${l+20}px;top:${t+40}px;width:${w-40}px;height:${h-60}px"><img src="${u(s+'.png')}"></div>
<div class="label" style="left:${l+w/2}px;top:${t+h+8}px;font-size:17px">${b}</div>`}).join('');
 const brands=[...new Set(c.items.map(x=>plain(x[1]).toUpperCase()))].join(' · ');
 out[`${c.n}-0-intro`]=`<body style="background:${c.tone}"><div class="noise"></div>${head(c,'Pre-loved originals')}
<div class="a sf" style="left:60px;top:120px;font-size:96px;font-weight:700;line-height:.98;letter-spacing:-.01em">${c.title}<br><i style="font-weight:500">${c.it}</i></div>
<div class="a" style="right:60px;top:150px;text-align:right"><div class="cap" style="font-size:13px;color:#6b6257">${c.sub}</div><div style="font-size:40px;font-weight:800;margin-top:8px;letter-spacing:-.02em">${c.from}</div></div>
${mini}
<div class="a cap" style="left:60px;right:60px;top:960px;text-align:center;font-size:14px;color:#4a443d;letter-spacing:.22em">${brands}</div>
<div class="a" style="left:60px;right:60px;top:1000px;text-align:center;font-size:20px;font-weight:700">${N} original pieces · price & size on every card <span style="color:${GOLD}">· Swipe →</span></div></body>`;
 // end
 out[`${c.n}-9-order`]=`<body style="background:#151311;color:#f4efe6"><img class="a" src="${u('abcthrift-logo-white.png')}" style="left:60px;top:48px;width:180px">
<div class="a cap" style="right:60px;top:60px;font-size:15px;color:#d4b27a">${(plain(c.title)+' '+c.it).toUpperCase()}</div>
<div class="a sf" style="left:60px;top:170px;font-size:100px;font-weight:700;line-height:1">Reserve yours<br><i style="font-weight:500;color:#d4b27a">on WhatsApp.</i></div>
<div class="a" style="left:60px;top:430px;font-size:30px;line-height:1.75;font-weight:600">
 <div><span class="sf" style="color:#d4b27a;font-weight:700">I.</span>&nbsp; Send a screenshot of the piece</div>
 <div><span class="sf" style="color:#d4b27a;font-weight:700">II.</span>&nbsp; We send real photos & the brand tag</div>
 <div><span class="sf" style="color:#d4b27a;font-weight:700">III.</span>&nbsp; Pay cash when it arrives</div></div>
<div class="a" style="left:60px;right:60px;top:690px;height:1px;background:#d4b27a;opacity:.5"></div>
<div class="a" style="left:60px;top:720px;font-size:24px;font-weight:600;color:#cfc6b8;line-height:1.6">Delivery Rs 250 · FREE on orders of Rs 1,999+<br>7-day returns · Cash on Delivery all over Pakistan</div>
<div class="a" style="left:0;right:0;bottom:0;height:180px;background:#f4efe6;color:#151311;display:flex;flex-direction:column;align-items:center;justify-content:center">
 <div style="font-size:60px;font-weight:800;letter-spacing:-.01em">WhatsApp ${NUM}</div><div class="cap" style="font-size:18px;margin-top:6px;color:${GOLD}">abcthrift.store</div></div></body>`;
}
(async()=>{const br=await chromium.launch();const only=process.argv[2];
for(const [k,html] of Object.entries(out)){if(only&&!k.includes(only))continue;
 const p=await br.newPage({viewport:{width:1080,height:1080}});fs.writeFileSync(D+'/_'+k+'.html','<html><head>'+CSS+'</head>'+html+'</html>');
 await p.goto('file://'+D+'/_'+k+'.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:OUT+k+'.png'});await p.close();console.log(k);}
await br.close();})();
