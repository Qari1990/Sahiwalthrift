const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const D=__dirname,NUM='0322 4631990',Y='#FFD400';
const rs=n=>'Rs '+n.toLocaleString('en-US');
const CATS=[
{key:'jackets',title:'WINTER<br>JACKETS',sub:'& COATS',items:[
['PUF-0047','PARAGONA','Quilted Puffer Jacket','L',1999],['PUF-0044','H&M','Tie-Dye Puffer Jacket','L',1999],['PUF-0045','CARS JEANS','Quilted Puffer Jacket','L',1999],
['HOO-0033','SIGGI','Softshell Hooded Jacket','3XL',1199],['COA-0046','MIPHA','Women Hooded Parka','XL',1199],['COA-0043','JODI','Women Padded Coat','L',1199]]},
{key:'hoodies',title:'HOODIES &amp;<br>SWEATS',sub:'MEN · WINTER',items:[
['SWE-0050','BERSHKA','Half-Zip Sweatshirt','M',1599],['HOO-0052','BLUE GEAR','Plaid Sherpa Hoodie','XL',999],['PUF-0049','QUECHUA','Fleece V-Neck','L',599],['SWE-0048','MARINER','Crewneck Sweatshirt','XL',599]]},
{key:'kids',title:'KIDS<br>WINTER',sub:'AGES 5-12',items:[
['SWE-0057','NARUTO','Shippuden Sweatshirt','9-10Y',1499],['KID-0056','NORTHVILLE','Windproof Jacket','5-6Y',699],['SWE-0058','C&A','Unicorn Sweatshirt','9-10Y',499],['SWE-0027','OKAÏDI','Striped Sweatshirt','11-12Y',499],['SWE-0054','INEXTENSO','Two-Tone Hoodie','9-10Y',399]]}];
const CSS=`<style>@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@600;700;800;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1080px;overflow:hidden;background:#0d0d0d;color:#fff;font-family:Inter,sans-serif;position:relative}
.a{position:absolute}.an{font-family:Anton,sans-serif;letter-spacing:.01em}.cap{font-weight:800;letter-spacing:.22em;text-transform:uppercase}
.ph{position:absolute;object-fit:cover}</style>`;
const esc=s=>s.replace(/&(?!amp;)/g,'&amp;');
function card(c,it,i,N){const [sku,b,name,sz,pr]=it;const bl=b.length;const bfs=bl>9?58:bl>6?72:92;
return `<html><head>${CSS}</head><body>
<img class="ph" src="real/${sku}.jpg" style="left:0;top:0;width:700px;height:1080px">
<div class="a cap" style="left:24px;top:24px;background:#0d0d0d;color:${Y};font-size:15px;padding:10px 14px">Real photo · 1 of 1</div>
<div class="a" style="left:700px;top:0;width:380px;height:1080px;background:#0d0d0d"></div>
<div class="a" style="left:730px;top:34px;width:320px">
 <div class="cap" style="font-size:14px;color:${Y}">N° ${String(i+1).padStart(2,'0')} / ${String(N).padStart(2,'0')} · Original brand</div>
 <div class="an" style="font-size:${bfs}px;line-height:1;margin-top:10px">${esc(b)}</div>
 <div style="font-size:21px;font-weight:700;color:#cfcfcf;margin-top:8px">${name}</div>
</div>
<div class="a" style="left:730px;top:${bfs>80?262:236}px;width:320px">
 <div class="cap" style="display:inline-block;background:${Y};color:#0d0d0d;font-size:15px;padding:7px 12px">✓ Real brand tag</div>
 <img src="tagc/${sku}.jpg" style="display:block;width:320px;height:320px;object-fit:cover;border:5px solid ${Y}">
</div>
<div class="a" style="left:730px;top:690px;width:320px">
 <div class="cap" style="font-size:14px;color:#9a9a9a">Size</div>
 <div class="an" style="font-size:64px;line-height:1.05">${sz}</div>
</div>
<div class="a an" style="left:730px;top:835px;background:${Y};color:#0d0d0d;font-size:66px;line-height:1;padding:12px 18px 14px">${rs(pr)}</div>
<div class="a" style="left:730px;top:960px;width:330px;font-size:16px;font-weight:700;color:#cfcfcf;line-height:1.45">Cash on Delivery · 7-day returns<br><span style="color:#fff;font-weight:900;font-size:20px">WhatsApp ${NUM}</span></div>
</body></html>`}
function intro(c){const it=c.items;const ph=it.slice(0,3);const min=Math.min(...it.map(x=>x[4]));
return `<html><head>${CSS}</head><body>
${ph.map((x,k)=>`<img class="ph" src="real/${x[0]}.jpg" style="left:${k*360}px;top:330px;width:360px;height:555px;border-right:6px solid #0d0d0d">`).join('')}
${ph.map((x,k)=>`<img class="ph" src="tagc/${x[0]}.jpg" style="left:${k*360+190}px;top:700px;width:150px;height:150px;border:4px solid ${Y}">`).join('')}
<div class="a an" style="left:50px;top:40px;font-size:118px;line-height:.95;color:#fff">${c.title}</div>
<div class="a" style="right:50px;top:56px;text-align:right"><div class="cap" style="font-size:16px;color:${Y}">${c.sub}</div>
<div class="an" style="font-size:44px;margin-top:10px">From ${rs(min)}</div><div style="font-size:18px;font-weight:700;color:#cfcfcf;margin-top:8px">Real photos · Real brand tags</div></div>
<div class="a" style="left:0;right:0;top:885px;height:195px;background:${Y};color:#0d0d0d;padding:28px 50px">
<div class="an" style="font-size:52px;line-height:1">ORIGINAL BRANDS. THRIFT PRICES.</div>
<div style="font-size:22px;font-weight:800;margin-top:14px">Swipe → price, size + tag on every piece · COD all Pakistan · abcthrift.store</div></div>
</body></html>`}
function order(c){return `<html><head>${CSS}</head><body style="background:${Y};color:#0d0d0d">
<div class="a cap" style="left:70px;top:80px;font-size:20px">ABCThrift · Hand-picked in Sahiwal</div>
<div class="a an" style="left:70px;top:140px;font-size:150px;line-height:.95">LIKED A<br>PIECE?</div>
<div class="a" style="left:70px;top:470px;font-size:34px;font-weight:800;line-height:1.35">Send a screenshot on WhatsApp.<br>We confirm size, photos &amp; the real tag.</div>
<div class="a an" style="left:70px;top:640px;background:#0d0d0d;color:${Y};font-size:96px;padding:14px 30px 18px">${NUM}</div>
<div class="a" style="left:70px;top:860px;font-size:28px;font-weight:800;line-height:1.5">💵 Cash on Delivery all over Pakistan · 🔁 7-day returns<br>🚚 FREE delivery on Rs 1,999+ (else Rs 250) · abcthrift.store</div>
</body></html>`}
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:1080,height:1080}});
for(const c of CATS){const N=c.items.length;const pages=[['0-intro',intro(c)],...c.items.map((it,i)=>[`${i+1}-${it[1].toLowerCase().replace(/[^a-z]/g,'')}`,card(c,it,i,N)]),[`${N+1}-order`,order(c)]];
for(const [n,h] of pages){const f=path.join(D,`_129-${c.key}-${n}.html`);fs.writeFileSync(f,h);await pg.goto('file://'+f);await pg.waitForTimeout(500);await pg.evaluate(()=>document.fonts.ready);
await pg.screenshot({path:path.join(D,'out129',`129-${c.key}-${n}.jpg`),type:'jpeg',quality:92});}}
await br.close();})();
