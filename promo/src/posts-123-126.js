const {chromium}=require('playwright');const fs=require('fs');const D=require('./d.js');const rs=p=>'Rs '+p.toLocaleString('en-US');
const S=D.S;const I=D.I;const LG='file://'+D.LOGO,LW='file://'+D.LOGOW;const im=k=>'file://'+D.img(k);
const base=`*{box-sizing:border-box}body{margin:0}.w{width:1080px;height:1350px;position:relative;overflow:hidden}.a{position:absolute}`;
const foot=(c,bg)=>`<div class="a" style="left:0;right:0;bottom:0;height:90px;background:${bg};color:${c};display:flex;align-items:center;justify-content:space-between;padding:0 40px;font:800 28px Inter">${''}<span>abcthrift.store</span><span>WhatsApp 0311 4139007</span><span>COD all Pakistan</span></div>`;
const P={};
// 123 price ladder
{const L=[['SWE-0054',399],['SWE-0048',599],['PUF-0053',799],['HOO-0052',999],['COA-0046',1199],['SWE-0050',1599],['PUF-0045',1999],['PUF-0042',2899]].map(([k])=>I(k));
 P['123-post-price-ladder']=`<style>@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@600;800&display=swap');${base}</style><div class="w" style="background:#c7f9cc;font-family:Inter">
 <div class="a" style="left:50px;top:44px;font:400 84px 'Archivo Black';line-height:.95;color:#081c15">Climb the<br>price ladder 🪜</div>
 <div class="a" style="left:54px;top:236px;font:700 32px Inter;color:#2d6a4f">Original brands from ${rs(399)} to ${rs(2899)}</div>
 <img src="${LG}" class="a" style="right:44px;top:56px;height:70px">
 ${L.map((x,i)=>{const c=i%4,r=Math.floor(i/4),y=r?1260-90-330:300+(3-c)*0;const left=40+c*252,top=r?820+(3-c)*-0:300;const h=420;
  const lift=(i)*22;return `<div class="a" style="left:${left}px;top:${(r?780:330)+ (3-c)*30}px;width:236px">
  <div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 0 #081c15"><img src="${im(x.k)}" style="width:236px;height:250px;object-fit:cover;display:block">
  <div style="padding:10px 12px"><div style="font:400 26px 'Archivo Black';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#081c15">${x.brandShow.toUpperCase()}</div><div style="font:600 20px Inter;color:#555">${x.g} · ${x.size}</div></div></div>
  <div style="margin-top:12px;background:#081c15;color:#c7f9cc;font:400 38px 'Archivo Black';text-align:center;border-radius:12px;padding:6px 0">${rs(x.price)}</div></div>`}).join('')}
 ${foot('#c7f9cc','#081c15')}</div>`;}
// 124 bingo
{const B=['PUF-0047','SWE-0058','SWE-0039','COA-0043','HOO-0033','SWE-0057','PUF-0041','SWE-0030','COA-0022'].map(I);const H=['B','I','N','G','O'];
 P['124-post-thrift-bingo']=`<style>@import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@700;900&display=swap');${base}</style><div class="w" style="background:#ffe066;font-family:Nunito">
 <div class="a" style="left:0;width:1080px;top:36px;text-align:center;font:400 120px 'Lilita One';color:#e63980;letter-spacing:.08em">THRIFT BINGO</div>
 <div class="a" style="left:0;width:1080px;top:170px;text-align:center;font:900 34px Nunito;color:#3d1a78">Pick your 3 in a row 👇 comment e.g. 1-2-3 or 3-5-7</div>
 <div class="a" style="left:90px;top:240px;width:900px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;background:#3d1a78;padding:18px;border-radius:34px">
 ${B.map((x,i)=>`<div style="position:relative;background:#fff;border-radius:22px;overflow:hidden;height:300px"><img src="${im(x.k)}" style="width:100%;height:210px;object-fit:cover;display:block">
  <div style="padding:6px 12px;text-align:center"><div style="font:400 30px 'Lilita One';color:#3d1a78;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.brandShow}</div><div style="font:900 24px Nunito;color:#e63980">${rs(x.price)} · ${x.size}</div></div>
  <div style="position:absolute;left:10px;top:10px;width:54px;height:54px;border-radius:50%;background:#e63980;color:#fff;font:400 30px 'Lilita One';display:flex;align-items:center;justify-content:center;border:4px solid #fff">${i+1}</div></div>`).join('')}</div>
 <div class="a" style="left:0;width:1080px;top:1240px;text-align:center"><img src="${LG}" style="height:0"></div>
 ${foot('#fff','#3d1a78')}</div>`;}
// 125 shop by size
{const cnt={};S.forEach(x=>{let z=x.size.startsWith('14Y')?'14Y+':x.size;cnt[z]=(cnt[z]||0)+1});
 const ad=['S','M','L','XL','XXL','3XL'],kd=['2-3Y','5-6Y','7-8Y','9-10Y','11-12Y','14Y+'];
 const chip=(z,c)=>`<div style="background:#fffaf0;border:4px solid #3b2a1a;border-radius:22px;padding:14px 10px;text-align:center"><div style="font:900 64px Fraunces;color:#3b2a1a;line-height:1">${z}</div><div style="font:700 22px 'DM Sans';color:#b5651d;margin-top:6px;white-space:nowrap">${c||0} piece${c==1?'':'s'}</div></div>`;
 P['125-post-shop-by-size']=`<style>@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,900&family=DM+Sans:wght@500;700&display=swap');${base}</style><div class="w" style="background:#e9d8bd;font-family:'DM Sans'">
 <div class="a" style="left:0;top:70px;width:1080px;height:70px;background:repeating-linear-gradient(90deg,#ffd34d 0 2px,#ffd34d 2px 18px,#3b2a1a 18px 20px),#ffd34d;border-top:4px solid #3b2a1a;border-bottom:4px solid #3b2a1a"></div>
 <div class="a" style="left:60px;top:180px;font:900 104px Fraunces;color:#3b2a1a;line-height:.95">Find your size,<br>find your fit.</div>
 <div class="a" style="left:64px;top:410px;font:500 34px 'DM Sans';color:#5a4632">${S.length} pieces in stock right now. Sizes as per the tag.</div>
 <div class="a" style="left:60px;top:490px;font:700 30px 'DM Sans';letter-spacing:.2em;color:#b5651d">MEN · WOMEN · UNISEX</div>
 <div class="a" style="left:60px;top:540px;width:960px;display:grid;grid-template-columns:repeat(6,1fr);gap:14px">${ad.map(z=>chip(z,cnt[z])).join('')}</div>
 <div class="a" style="left:60px;top:760px;font:700 30px 'DM Sans';letter-spacing:.2em;color:#b5651d">KIDS (AGE)</div>
 <div class="a" style="left:60px;top:810px;width:960px;display:grid;grid-template-columns:repeat(6,1fr);gap:14px">${kd.map(z=>chip(z.replace('-','–'),cnt[z])).join('').replace(/font:900 64px Fraunces;/g,'font:900 40px Fraunces;white-space:nowrap;')}</div>
 <div class="a" style="left:60px;top:1030px;width:960px;background:#3b2a1a;color:#fffaf0;border-radius:24px;padding:26px 34px;font:500 34px 'DM Sans';line-height:1.4">📏 Send your size on WhatsApp and we'll send you every piece in stock that fits you.</div>
 ${foot('#fffaf0','#b5651d')}</div>`;}
// 126 brand wall
{const seen={},br=[];S.forEach(x=>{if(x.house)return;const n=x.brandShow.replace('jodi by Kim Dong Su','jodi');const k=n.toLowerCase();if(!seen[k]){seen[k]=1;br.push(n)}});br.sort((a,b)=>a.localeCompare(b));
 const fonts=["'Anton'","'Playfair Display'","'Bebas Neue'","'Inter'","'Abril Fatface'","'Oswald'"];const cols=['#fff','#ffb703','#8ecae6','#fb8500','#fff','#e9c46a'];
 P['126-post-brand-wall']=`<style>@import url('https://fonts.googleapis.com/css2?family=Anton&family=Playfair+Display:ital,wght@1,800&family=Bebas+Neue&family=Inter:wght@900&family=Abril+Fatface&family=Oswald:wght@600&display=swap');${base}</style><div class="w" style="background:#0b0b0b">
 <div class="a" style="left:50px;top:50px;font:400 40px 'Bebas Neue';letter-spacing:.3em;color:#ffb703">IN STOCK NOW · A TO Z</div>
 <div class="a" style="left:50px;top:110px;width:980px;height:1000px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px 26px;line-height:1.05">${br.map((b,i)=>`<span style="font-family:${fonts[i%6]};font-weight:${i%6==3?900:i%6==1?800:400};${i%6==1?'font-style:italic;':''}font-size:${[58,50,64,44,54,52][i%6]}px;color:${cols[i%6]};text-transform:${i%6==1||i%6==4?'none':'uppercase'}">${b}</span>`).join('')}</div>
 <div class="a" style="left:50px;bottom:120px;width:980px;display:flex;justify-content:space-between;align-items:flex-end"><div style="font:400 80px Anton;color:#fff;line-height:.95;text-transform:uppercase">${br.length} original brands.<br><span style="color:#ffb703">1 thrift store.</span></div><img src="${LW}" style="height:90px"></div>
 ${foot('#0b0b0b','#ffb703')}</div>`;}
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1350}});
 for(const [n,h] of Object.entries(P)){fs.writeFileSync(__dirname+'/t.html',`<html><head><meta charset="utf-8"></head><body>${h}</body></html>`);await pg.goto('file://'+__dirname+'/t.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(800);await pg.screenshot({path:D.OUT+n+'.jpg',type:'jpeg',quality:92});}
 await b.close();console.log('done')})();
