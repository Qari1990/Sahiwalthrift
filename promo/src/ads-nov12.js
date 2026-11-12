const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const D=__dirname, IMG='/home/user/sahiwalthrift/public/img/', OUT=D+'/out/';fs.mkdirSync(OUT,{recursive:true});
const u=p=>'file://'+p; const im=s=>u(IMG+s+'-1.jpg'); const T=n=>u(D+'/fr/t-'+n+'.jpg');
const LOGOW=u(D+'/fr/abcthrift-logo-white.png');
const rs=n=>'Rs '+n.toLocaleString('en-US');
const G='#e9c46a', BG='#12201b';
const CSS=`<style>@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@1,700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;color:#fff;background:${BG}}
.a{position:absolute}.an{font-family:Anton,sans-serif;letter-spacing:.01em;line-height:.95}.pf{font-family:'Playfair Display',serif;font-style:italic}
.card{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.35);position:absolute}
.card img{width:100%;height:100%;object-fit:cover;display:block}
.chip{position:absolute;left:12px;right:12px;bottom:12px;background:rgba(18,32,27,.92);border-radius:14px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center}
.chip b{font-size:22px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62%}
.chip span{background:${G};color:${BG};font-weight:900;font-size:22px;padding:5px 12px;border-radius:999px;white-space:nowrap}
.tag{border-radius:18px;overflow:hidden;border:4px solid ${G};position:absolute}.tag img{width:100%;height:100%;object-fit:cover;display:block}
.tick{display:flex;gap:14px;align-items:center;font-weight:800}.tick i{font-style:normal;width:40px;height:40px;border-radius:50%;background:${G};color:${BG};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;flex:none}
.glow{background:radial-gradient(circle at 20% 0%,rgba(233,196,106,.22),transparent 55%),radial-gradient(circle at 100% 100%,rgba(233,196,106,.12),transparent 50%)}
</style><span class="an" style="opacity:0">x</span><span class="pf" style="opacity:0">x</span>`;
const card=(sku,brand,price,l,t,w,h)=>`<div class="card a" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px"><img src="${im(sku)}"><div class="chip"><b>${brand}</b><span>${rs(price)}</span></div></div>`;
const HERO=[['ST-PUF-0042','Bershka',2899],['ST-PUF-0047','Paragona',1999],['ST-PUF-0044','H&amp;M',1999],['ST-SWE-0039','OBEY',699],['ST-SWE-0017','Sean John',699],['ST-PUF-0053','AEO',799]];
const TAGS=[['par','Paragona'],['rec','Recel'],['gio','Giordano'],['kla','Klaus Feuner']];
const tagRow=(l,t,s,gap)=>TAGS.map(([n,b],i)=>`<div class="tag a" style="left:${l+i*(s+gap)}px;top:${t}px;width:${s}px;height:${s}px"><img src="${T(n)}"></div>`).join('');
const trust=(l,t,fs,items)=>`<div class="a" style="left:${l}px;top:${t}px;display:flex;flex-direction:column;gap:${fs*.7}px;font-size:${fs}px">${items.map(x=>`<div class="tick"><i>✓</i>${x}</div>`).join('')}</div>`;
const foot=(t,w)=>`<div class="a" style="left:0;top:${t}px;width:${w}px;height:110px;background:${G};color:${BG};display:flex;align-items:center;justify-content:space-between;padding:0 60px"><span style="font-size:40px;font-weight:900">abcthrift.store</span><span style="font-size:30px;font-weight:900">WhatsApp 0311 4139007</span></div>`;
const P={};
// ---------- A1 hero feed 4:5 ----------
P['111-ad-feed-real-brands']=[1080,1350,`<div class="a glow" style="inset:0"></div>
<img class="a" src="${LOGOW}" style="left:60px;top:50px;width:230px">
<div class="a" style="right:60px;top:54px;border:2px solid ${G};color:${G};font-weight:900;font-size:22px;letter-spacing:.14em;padding:10px 18px;border-radius:999px">1 OF 1 PIECES</div>
<div class="a an" style="left:60px;top:140px;font-size:104px">ORIGINAL BRANDS.<br><span style="color:${G}">REAL TAGS.</span></div>
<div class="a pf" style="left:62px;top:356px;font-size:56px;color:#f4ead2">at thrift prices</div>
${HERO.map(([s,b,p],i)=>card(s,b,p,60+(i%3)*325,440+Math.floor(i/3)*305,310,290)).join('')}
<div class="a" style="left:60px;top:1050px;font-size:22px;font-weight:800;letter-spacing:.12em;color:${G}">✓ REAL TAGS OF OUR ACTUAL PIECES · ASK FOR ANY TAG PHOTO</div>
${TAGS.map(([n,b],i)=>`<div class="tag a" style="left:${60+i*245}px;top:1088px;width:230px;height:112px"><img src="${T(n)}"></div>`).join('')}
<div class="a" style="left:60px;top:1172px;font-size:22px;font-weight:800;letter-spacing:.12em;color:${G}">REAL TAG OF THE ACTUAL PIECE ↓</div>
<div class="a" style="left:0;top:1220px;width:1080px;height:130px;background:${G};color:${BG};display:flex;align-items:center;justify-content:space-around;font-weight:900;font-size:27px"><span>✓ Cash on Delivery</span><span>✓ 7-day return guarantee</span><span>✓ All Pakistan</span></div>
${''}`];
// tag row fits between grid and bar? put tags on right of label instead -> overlay small tags row
P['111-ad-feed-real-brands'][2]=P['111-ad-feed-real-brands'][2].replace(`<div class="a" style="left:60px;top:1172px;font-size:22px;font-weight:800;letter-spacing:.12em;color:${G}">REAL TAG OF THE ACTUAL PIECE ↓</div>`,'');
// ---------- A2 hero story 9:16 ----------
P['112-ad-story-real-brands']=[1080,1920,`<div class="a glow" style="inset:0"></div>
<img class="a" src="${LOGOW}" style="left:390px;top:150px;width:300px">
<div class="a an" style="left:0;width:1080px;text-align:center;top:260px;font-size:118px">ORIGINAL BRANDS.<br><span style="color:${G}">REAL TAGS.</span></div>
<div class="a pf" style="left:0;width:1080px;text-align:center;top:500px;font-size:64px;color:#f4ead2">at thrift prices</div>
${HERO.map(([s,b,p],i)=>card(s,b,p,60+(i%3)*325,620+Math.floor(i/3)*370,310,355)).join('')}
<div class="a" style="left:60px;top:1385px;font-size:26px;font-weight:800;letter-spacing:.12em;color:${G}">✓ REAL TAGS OF OUR PIECES · ASK FOR ANY TAG PHOTO</div>
${tagRow(60,1430,225,13)}
<div class="a" style="left:0;top:1700px;width:1080px;text-align:center;font-size:32px;font-weight:800;color:#f4ead2">Cash on Delivery · 7-day return guarantee · All Pakistan</div>
${foot(1810,1080)}`];
// ---------- A3 trust / proof feed 4:5 ----------
P['113-ad-feed-tag-proof']=[1080,1350,`<div class="a glow" style="inset:0"></div>
<img class="a" src="${LOGOW}" style="left:60px;top:50px;width:230px">
<div class="a an" style="left:60px;top:140px;font-size:96px">DON'T TRUST US.<br><span style="color:${G}">CHECK THE TAG.</span></div>
<div class="a" style="left:62px;top:345px;font-size:32px;font-weight:600;color:#d6e0dc;width:960px;line-height:1.4">These are the real tags of our actual pieces. Want to see the tag of any item? WhatsApp us and we send the photo.</div>
${TAGS.map(([n,b],i)=>`<div class="tag a" style="left:${60+(i%2)*490}px;top:${480+Math.floor(i/2)*340}px;width:470px;height:320px"><img src="${T(n)}"><div class="a" style="left:14px;bottom:14px;background:rgba(18,32,27,.92);border-radius:12px;padding:8px 14px;font-weight:900;font-size:24px;letter-spacing:.06em">✓ ${b.toUpperCase()}</div></div>`).join('')}
<div class="a" style="left:0;top:1170px;width:1080px;display:flex;justify-content:space-around;font-weight:900;font-size:27px;color:#f4ead2"><span>Jackets from Rs 999</span><span>Hoodies from Rs 599</span><span>Kids from Rs 399</span></div>
${foot(1240,1080)}`];
// ---------- carousel 1:1 ----------
const CATS=[
 ['114-car-1-jackets','PUFFERS &amp; JACKETS','from Rs 999','Paragona · H&amp;M · Bershka · Brice · Tom Tompson',[['ST-PUF-0047','Paragona',1999],['ST-PUF-0044','H&amp;M',1999],['ST-PUF-0042','Bershka',2899],['ST-DEN-0004','Brice',1999]]],
 ['114-car-2-hoodies','HOODIES &amp; SWEATSHIRTS','Rs 599 – 1,599','OBEY · Sean John · Bershka · H&amp;M · LMA',[['ST-SWE-0039','OBEY',699],['ST-SWE-0017','Sean John',699],['ST-SWE-0050','Bershka',1599],['ST-SWE-0030','H&amp;M',999]]],
 ['114-car-3-women','WOMEN COATS','Rs 1,199 each','MIPHA · jodi · House Basic',[['ST-COA-0046','MIPHA',1199],['ST-COA-0043','jodi',1199],['ST-PUF-0009','House Basic',1199],['ST-PUF-0021','Hooded puffer',1199]]],
 ['114-car-4-kids','KIDS WINTER','from Rs 399','C&amp;A · KIABI · Okaïdi · Quiksilver · Naruto',[['ST-SWE-0058','C&amp;A',499],['ST-SWE-0057','Naruto',1499],['ST-SWE-0027','Okaïdi',499],['ST-KID-0056','Northville',699]]],
 ['114-car-5-vests','PUFFER VESTS','Rs 999','Giordano · Rivers · Klaus Feuner',[['ST-PUF-0041','Giordano',999],['ST-PUF-0019','Rivers',999],['ST-PUF-0018','Klaus Feuner',999],['ST-COA-0020','Reversible',999]]],
];
for(const [k,h,pr,br,items] of CATS){P[k]=[1080,1080,`<div class="a glow" style="inset:0"></div>
<div class="a an" style="left:50px;top:${h.length>18?52:44}px;font-size:${h.length>18?58:76}px;width:760px">${h}</div>
<div class="a" style="right:50px;top:50px;background:${G};color:${BG};font-weight:900;font-size:32px;padding:12px 22px;border-radius:999px">${pr}</div>
${items.map(([s,b,p],i)=>card(s,b,p,50+(i%2)*500,(h.length>18?230:150)+Math.floor(i/2)*(h.length>18?380:420),480,h.length>18?365:405)).join('')}
<div class="a" style="left:50px;top:1000px;font-size:25px;font-weight:800;color:#f4ead2;width:980px;display:flex;justify-content:space-between"><span>✓ Brands: ${br} · ask for any tag photo</span></div>`];}
P['114-car-0-intro']=[1080,1080,`<div class="a glow" style="inset:0"></div><img class="a" src="${LOGOW}" style="left:50px;top:50px;width:250px">
<div class="a an" style="left:50px;top:150px;font-size:100px">ORIGINAL BRANDS.<br><span style="color:${G}">THRIFT PRICES.</span></div>
${tagRow(50,430,232,17)}
<div class="a" style="left:50px;top:690px;font-size:24px;font-weight:800;letter-spacing:.12em;color:${G}">REAL TAGS OF OUR ACTUAL PIECES</div>
${trust(50,770,40,['Cash on Delivery all over Pakistan','7-day return guarantee','Every piece 1 of 1 · swipe to shop →'])}`];
P['114-car-6-order']=[1080,1080,`<div class="a glow" style="inset:0"></div><img class="a" src="${LOGOW}" style="left:50px;top:50px;width:250px">
<div class="a an" style="left:50px;top:160px;font-size:110px">ORDER IN<br><span style="color:${G}">2 MINUTES</span></div>
${trust(50,430,40,['Pick your piece on abcthrift.store','Place order or WhatsApp us','Pay cash when it arrives','Not happy? 7-day returns'])}
<div class="a" style="left:50px;top:830px;font-size:30px;font-weight:700;color:#f4ead2">Free delivery on Rs 1,999+ · Sahiwal 1-2 days</div>
<div class="a" style="left:0;top:930px;width:1080px;height:150px;background:${G};color:${BG};display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:48px;font-weight:900">abcthrift.store</span><span style="font-size:30px;font-weight:900">WhatsApp 0311 4139007</span></div>`];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({deviceScaleFactor:1});
for(const [k,[w,h,body]] of Object.entries(P)){if(process.argv[2]&&!k.startsWith(process.argv[2]))continue;await pg.setViewportSize({width:w,height:h});
fs.writeFileSync(D+'/page.html',`<html><head>${CSS}</head><body style="width:${w}px;height:${h}px;position:relative;overflow:hidden">${body}</body></html>`);await pg.goto('file://'+D+'/page.html',{waitUntil:'networkidle'});
await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(300);await pg.screenshot({path:OUT+k+'.png'});console.log(k)}
await b.close()})();
