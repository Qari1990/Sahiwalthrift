const {chromium}=require('playwright');const fs=require('fs');
const W='/tmp/claude-0/-home-user/f7bb48ad-37b8-553c-9b28-c0e5ee4d6caa/scratchpad/web2/public/img/';
const SOLD=['ST-PUF-0003','ST-PUF-0008','ST-PUF-0034'];
const FIX={'ST-SWE-0050':'M','ST-HOO-0052':'L','ST-PUF-0044':'14Y+ (EUR 170)','ST-SWE-0039':'S','ST-SWE-0017':'S','ST-DEN-0004':'L','ST-PUF-0019':'M'};
let it=JSON.parse(fs.readFileSync('items.json')).filter(x=>!SOLD.includes(x.sku));
it.forEach(x=>{x.size=FIX[x.sku]||x.size;x.house=/ABCThrift Select/i.test(x.brand);let n=x.title;if(n.toLowerCase().startsWith(x.brand.toLowerCase()))n=n.slice(x.brand.length).trim();x.name=n;x.brandShow=x.house?'Handpicked':x.brand;x.showEst=!x.house&&x.est;});
fs.writeFileSync('stock.json',JSON.stringify(it,null,1));
const rs=p=>'Rs '+p.toLocaleString('en-US');
const css=`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=Anton&display=swap');*{box-sizing:border-box}body{margin:0}
.w{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Inter;background:#faf8f4;color:#15201d}.a{position:absolute}`;
const logo='file://'+__dirname+'/../n11/abcthrift-logo.png',logow='file://'+__dirname+'/../n11/abcthrift-logo-white.png';
function card(x,i,n){const img=fs.existsSync(W+x.sku+'-1.jpg')?W+x.sku+'-1.jpg':W+x.sku+'-2.jpg';
 const bl=x.brandShow.length;const bs=bl>22?58:bl>14?72:92;
 const price=x.showEst?`<div style="font-size:24px;font-weight:700;color:#7b847f;letter-spacing:.04em">EST. RETAIL ABROAD*</div><div style="font-size:40px;font-weight:800;color:#9aa19d;text-decoration:line-through;text-decoration-thickness:4px">${rs(x.est)}</div>
 <div style="font-size:24px;font-weight:800;color:#c8553d;letter-spacing:.04em;margin-top:12px">ABCTHRIFT PRICE</div><div style="font-size:70px;font-weight:900;line-height:1;color:#15201d;white-space:nowrap">${rs(x.price)}</div>
 <div style="display:inline-block;margin-top:12px;background:#c8553d;color:#fff;font-weight:900;font-size:28px;padding:8px 16px;border-radius:10px">SAVE ~${Math.round(100-100*x.price/x.est)}%</div>`
 :`<div style="font-size:24px;font-weight:800;color:#c8553d;letter-spacing:.04em">ABCTHRIFT PRICE</div><div style="font-size:70px;font-weight:900;line-height:1;white-space:nowrap">${rs(x.price)}</div><div style="font-size:28px;font-weight:700;margin-top:12px;color:#24413a">1 piece only · handpicked</div>`;
 return `<div class="w"><div class="a" style="left:0;top:0;width:1080px;height:96px;background:#15201d;display:flex;align-items:center;justify-content:space-between;padding:0 40px"><img src="${logow}" style="height:84px"><div style="color:#e9c46a;font-weight:800;font-size:26px;letter-spacing:.12em">AVAILABLE NOW · ${String(i+1).padStart(2,'0')}/${n}</div></div>
 <div class="a" style="left:40px;top:126px;width:600px;height:880px;border-radius:28px;overflow:hidden;background:#fff;box-shadow:0 14px 40px rgba(21,32,29,.18)"><img src="file://${img}" style="width:100%;height:100%;object-fit:cover"></div>
 <div class="a" style="left:670px;top:126px;width:370px;height:880px;display:flex;flex-direction:column;justify-content:space-between">
  <div><div style="display:inline-block;background:#e9c46a;font-weight:900;font-size:24px;padding:6px 14px;border-radius:8px;letter-spacing:.06em">${x.house?'HANDPICKED':'ORIGINAL BRAND'}</div>
   <div style="margin-top:22px;display:grid;gap:14px">${[['GENDER',x.g],['SIZE',x.size],['CONDITION',x.cond]].map(([a,b])=>`<div style="border-left:6px solid #24413a;padding-left:16px"><div style="font-size:22px;font-weight:700;color:#7b847f;letter-spacing:.08em">${a}</div><div style="font-size:${b.length>9?32:42}px;font-weight:900;line-height:1.1">${b}</div></div>`).join('')}</div></div>
  <div style="background:#fff;border:3px solid #15201d;border-radius:24px;padding:24px">${price}</div></div>
 <div class="a" style="left:40px;top:1030px;width:1000px"><div style="font-family:Anton;text-transform:uppercase;font-size:${bs}px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${x.brandShow}</div>
  <div style="font-size:36px;font-weight:600;margin-top:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#3b4542">${x.name}</div></div>
 <div class="a" style="left:0;bottom:0;width:1080px;height:96px;background:#24413a;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 40px;font-size:28px;font-weight:800"><span>🛒 abcthrift.store</span><span>💬 WhatsApp 0311 4139007</span><span style="color:#e9c46a">COD</span></div>
 ${x.showEst?'<div class="a" style="right:40px;bottom:100px;font-size:17px;color:#7b847f">*Estimated new retail price abroad for similar items. Not this item’s tag price.</div>':''}</div>`}
function contact(){return `<div class="w" style="background:#15201d;color:#fff"><div class="a" style="left:0;width:1080px;top:110px;text-align:center"><img src="${logow}" style="height:110px">
 <div style="font-family:Anton;font-size:96px;text-transform:uppercase;margin-top:50px;line-height:1">Shop with us</div><div style="font-size:34px;color:#e9c46a;font-weight:700;margin-top:16px">Original brands · thrift prices · real photos</div></div>
 <div class="a" style="left:120px;top:460px;width:840px;display:grid;gap:22px">${[['🛒','Website','abcthrift.store'],['💬','WhatsApp / Call','0311 4139007'],['📘','Facebook','ABCThrift'],['📸','Instagram','ABCThrift']].map(([e,a,b])=>`<div style="display:flex;align-items:center;gap:28px;background:#24413a;border-radius:24px;padding:26px 34px"><div style="font-size:64px">${e}</div><div><div style="font-size:26px;font-weight:700;color:#e9c46a;letter-spacing:.08em">${a.toUpperCase()}</div><div style="font-size:52px;font-weight:900">${b}</div></div></div>`).join('')}</div>
 <div class="a" style="left:0;width:1080px;bottom:60px;text-align:center;font-size:30px;font-weight:700;line-height:1.5">💵 Cash on delivery all over Pakistan<br>🔁 7-day returns · 🚚 Free delivery over Rs 3,500</div></div>`}
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1350}});fs.mkdirSync('out',{recursive:true});
 const only=process.argv[2]?process.argv[2].split(','):null;
 const jobs=it.map((x,i)=>[`out/${String(i+1).padStart(2,'0')}-${x.sku}.jpg`,card(x,i,it.length)]).concat([[`out/${String(it.length+1).padStart(2,'0')}-contact.jpg`,contact()]]);
 for(const [f,h] of jobs){if(only&&!only.some(o=>f.includes(o)))continue;fs.writeFileSync(__dirname+'/t.html',`<html><head><meta charset="utf-8"><style>${css}</style></head><body>${h}</body></html>`);await pg.goto('file://'+__dirname+'/t.html');await pg.evaluate(()=>Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r}))));await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(300);await pg.screenshot({path:f,type:'jpeg',quality:90});}
 await b.close();console.log(jobs.length)})();
