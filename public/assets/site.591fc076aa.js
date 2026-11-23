window.TPL={"name": "Website Grand Launch", "start": 1795374000000, "end": 1795978799000, "min": 1999, "endTxt": "29 Nov, 11:59 PM", "q": ["ST-PUF-0047", "ST-PUF-0045", "ST-PUF-0044", "ST-PUF-0042", "ST-PUF-0040", "ST-PUF-0011", "ST-DEN-0004", "ST-PUF-0002", "ST-PUF-0001"], "kids": [{"sku": "ST-SWE-0024", "b": "Quiksilver", "n": "Crewneck Sweatshirt", "p": 499, "s": "7-8Y", "i": "img/ST-SWE-0024-1.jpg"}, {"sku": "ST-SWE-0027", "b": "Okaïdi", "n": "Striped Sweatshirt with Fisherman Embroidery", "p": 499, "s": "11-12Y", "i": "img/ST-SWE-0027-1.jpg"}, {"sku": "ST-SWE-0028", "b": "Squared & Cubed", "n": "Striped Sweatshirt with 'smile' embroidery", "p": 499, "s": "11-12Y", "i": "img/ST-SWE-0028-1.jpg"}, {"sku": "ST-SWE-0029", "b": "TAPE A L'OEIL", "n": "Printed Crewneck Sweatshirt", "p": 499, "s": "11-12Y", "i": "img/ST-SWE-0029-1.jpg"}, {"sku": "ST-SWE-0058", "b": "C&A", "n": "Unicorn Sweatshirt with Faux Fur Cuffs", "p": 499, "s": "9-10Y", "i": "img/ST-SWE-0058-1.jpg"}, {"sku": "ST-SWE-0035", "b": "KIABI", "n": "Amore Solamente Crew Neck Sweatshirt", "p": 399, "s": "5-6Y", "i": "img/ST-SWE-0035-1.jpg"}, {"sku": "ST-SWE-0036", "b": "ORCHESTRA", "n": "Say It With Flowers Printed Sweatshirt", "p": 399, "s": "9-10Y", "i": "img/ST-SWE-0036-1.jpg"}, {"sku": "ST-SWE-0054", "b": "Inextenso", "n": "Two-Tone Funnel Neck Sweatshirt with BRKLYN Print", "p": 399, "s": "9-10Y", "i": "img/ST-SWE-0054-1.jpg"}, {"sku": "ST-SWE-0014", "b": "ABCThrift Select", "n": "Raglan Sweatshirt with Elbow Patches", "p": 499, "s": "2-3Y", "i": "img/ST-SWE-0014-1.jpg"}, {"sku": "ST-SWE-0015", "b": "ABCThrift Select", "n": "Puff Sleeve Sweatshirt", "p": 499, "s": "2-3Y", "i": "img/ST-SWE-0015-1.jpg"}, {"sku": "ST-SWE-0023", "b": "ABCThrift Select", "n": "Awesome Dog Team Sweatshirt", "p": 499, "s": "7-8Y", "i": "img/ST-SWE-0023-1.jpg"}, {"sku": "ST-SWE-0025", "b": "ABCThrift Select", "n": "Christmas Teddy Bear Graphic Sweatshirt", "p": 499, "s": "7-8Y", "i": "img/ST-SWE-0025-1.jpg"}], "men": [{"sku": "ST-SWE-0017", "b": "Sean John", "n": "19 Quarter-Zip Sweatshirt", "p": 699, "s": "S", "i": "img/ST-SWE-0017-1.jpg"}, {"sku": "ST-SWE-0031", "b": "LMA", "n": "Half-Zip Sweatshirt with Shoulder and Elbow Panels", "p": 699, "s": "M", "i": "img/ST-SWE-0031-1.jpg"}, {"sku": "ST-SWE-0039", "b": "OBEY", "n": "Half-Zip Sweatshirt", "p": 699, "s": "S", "i": "img/ST-SWE-0039-1.jpg"}, {"sku": "ST-SWE-0048", "b": "Mariner", "n": "Embroidered Crewneck Sweatshirt", "p": 599, "s": "XL", "i": "img/ST-SWE-0048-1.jpg"}, {"sku": "ST-SWE-0051", "b": "DASSY", "n": "Half-Zip Stand Collar Sweatshirt", "p": 599, "s": "L", "i": "img/ST-SWE-0051-1.jpg"}]};
(function(){
var T=window.TP,root=T.root,L={get:function(k,d){try{var v=localStorage.getItem('tp-'+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem('tp-'+k,JSON.stringify(v))}catch(e){}}};
function $(i){return document.getElementById(i)}
function all(s){return [].slice.call(document.querySelectorAll(s))}
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
// Meta Pixel (site.json "metaPixel"): standard events for ads and the catalog; content_ids are SKUs, same as feed.xml
function px(ev,d){try{if(window.fbq)fbq('track',ev,Object.assign({currency:'PKR'},d||{}))}catch(e){}}
function pxItems(a){return {content_ids:a.map(function(x){return x.sku}),content_type:'product',num_items:a.length}}
function pkt(){return new Date(Date.now()+5*36e5)}
// sitewide sale (site.json "campaign"): live only between start and end; the Deal of the Day pauses while it runs
var C=T.camp,camp=C&&Date.now()>=C.start&&Date.now()<C.end?C:null;
function cp(p){return camp?Math.floor(p*(100-camp.pct)/100):p}
if(camp){document.body.classList.add('camp-live');all('[data-camp-href]').forEach(function(a){a.href=a.dataset.campHref})}
function p2(n){return (n<10?'0':'')+n}
function campTick(){var left=Math.max(0,Math.floor((camp.end-Date.now())/1000)),d=Math.floor(left/86400),h=Math.floor(left%86400/3600),m=Math.floor(left%3600/60),s=left%60;
 all('[data-camp-left]').forEach(function(e){e.textContent=(d?d+'d ':'')+p2(h)+':'+p2(m)+':'+p2(s)});
 all('[data-camp-clock]').forEach(function(e){var u={d:d,h:p2(h),m:p2(m),s:p2(s)};[].forEach.call(e.querySelectorAll('[data-u]'),function(b){b.textContent=u[b.dataset.u]})});
 if(!left){camp=null;document.body.classList.remove('camp-live');clearInterval(campT);draw()}}
var campT;if(camp){campTick();campT=setInterval(campTick,1000)}
var today=pkt().toISOString().slice(0,10),deal=T.deal&&T.deal.day===today&&!camp?T.deal:null;
if(deal){document.body.classList.add('deal-live');all('[data-deal-href]').forEach(function(a){a.href=a.dataset.dealHref})}
function tick(){var p=pkt(),left=86400-(p.getUTCHours()*3600+p.getUTCMinutes()*60+p.getUTCSeconds()),h=Math.floor(left/3600),m=Math.floor(left%3600/60),s=left%60,t=(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;all('[data-countdown]').forEach(function(e){e.textContent=t})}
if(deal){tick();setInterval(tick,1000)}

// announcement bar
var an=all('#ann span'),ai=0;if(an.length>1)setInterval(function(){an[ai].className='';ai=(ai+1)%an.length;an[ai].className='on'},3500);

// bag + checkout
var bag=L.get('bag',[]),wish=L.get('wish',[]),V=T.voucher,vc=L.get('voucher',null),step='cart';
// Website Grand Launch (site.json "launch", gift pools from launch.py as window.TPL): 1 jacket of Rs 1,999+ = a kids sweatshirt free,
// 2+ jackets = a men's sweatshirt free, plus free delivery. The gift is a real piece added to the bag (f:'kids'|'men', price 0); same rule in Code.gs
var G=window.TPL,gl=G&&Date.now()>=G.start&&Date.now()<G.end?G:null,liveM={};
function isQ(it){return !!gl&&!it.f&&gl.q.indexOf(it.sku)>-1}
function glGone(sku){var s=liveM[sku];return !!s&&(s.state==='sold'||s.state==='ordered')}
function glPool(k,keep){return gl?gl[k].filter(function(x){return x.sku===keep||(!glGone(x.sku)&&!bag.some(function(y){return y.sku===x.sku}))}):[]}
function glTier(){var n=bag.filter(isQ).length;return n>=2?'men':n?'kids':''}
function glGift(){return bag.filter(function(x){return x.f})[0]}
function glOpts(t){return t==='men'?glPool('men').map(function(x){return Object.assign({},x,{f:'men'})}).concat(glPool('kids').map(function(x){return Object.assign({},x,{f:'kids'})})):t?glPool('kids').map(function(x){return Object.assign({},x,{f:'kids'})}):[]}
// the customer picks the free gift (WAQAR 23 Nov: never auto-add); a gift that no longer fits the bag is taken out
function glSync(){if(!G)return;var tier=gl?glTier():'',g=glGift(),ch=0,b0=bag.length;
 bag=bag.filter(function(x){return !x.f||x===g});if(bag.length<b0)ch=1;
 if(g&&(!tier||glGone(g.sku)||(tier==='kids'&&g.f==='men'))){bag=bag.filter(function(x){return x!==g});ch=1}
 if(ch)L.set('bag',bag);return ch}
function price(it){return it.f?0:deal&&deal.sku===it.sku?deal.price:cp(it.p)}
// free delivery counts items at their regular price, so a sale never takes free delivery away (same rule in Code.gs)
// a Grand Launch gift replaces the bundle discount and voucher on that order; qualifying jackets always ship free
function totals(){var paid=bag.filter(function(x){return !x.f}),g=glGift(),sub=0,reg=0,n=paid.length;paid.forEach(function(it){sub+=price(it);reg+=it.p});var bd=0,lbl='';if(!g)(T.bundle||[]).forEach(function(b){if(n>=b.min){bd=b.off?b.off:Math.round(sub*b.pct/100);lbl=n+' items bundle'}});
 var vd=!g&&vc&&V&&n&&sub-bd>=V.minOrder?V.amount:0,goods=sub-bd-vd,del=!n||!T.fee||paid.some(isQ)||(T.freeOver&&Math.max(goods,reg)>=T.freeOver)?0:T.fee;return {sub:sub,reg:reg,bd:bd,lbl:lbl,vd:vd,del:del,goods:goods,total:goods+del,gift:g}}
function nextTip(){var gt=glTip();if(gt)return gt;var n=bag.length,nx=(T.bundle||[]).filter(function(b){return b.min>n})[0],t=totals();if(!n)return 'Your bag is empty. Tap + on an item to add it.';
 if(t.del)return 'Add '+rs(T.freeOver-Math.max(t.goods,t.reg))+' more for free delivery!'+(nx?' Add '+(nx.min-n)+' more item(s) for '+(nx.off?rs(nx.off):nx.pct+'%')+' off.':'');
 if(nx)return 'Add '+(nx.min-n)+' more item(s) and save '+(nx.off?rs(nx.off):nx.pct+'%')+'!';return 'Bundle discount and free delivery applied.'}
function glTip(){if(!gl||!bag.length)return '';var t=glTier(),g=glGift(),m=rs(gl.min);
 if(!t)return 'Grand Launch: add a men\'s jacket of '+m+'+ and pick a FREE sweatshirt + free delivery.';
 var left=glOpts(t).length;if(!g&&left)return '🎁 Your free gift is unlocked! Pick it below'+(t==='kids'?' (add 1 more jacket for a men\'s sweatshirt).':'.');
 if(t==='kids')return 'Free gift in your bag! Add 1 more jacket ('+m+'+) and you can pick a men\'s sweatshirt instead.';
 return g?'Grand Launch: free gift and free delivery applied.':'Grand Launch: free delivery applied. All free gifts are claimed right now.'}
function sumHtml(t){var vline=V?(vc?(t.vd?'<div><span>Voucher '+esc(V.code)+'</span><b>-'+rs(t.vd)+'</b></div>':'<div class="mut"><span>Voucher '+esc(V.code)+' (on '+rs(V.minOrder)+'+)</span><b>-</b></div>'):'<button type="button" class="o-link" data-voucher>Free '+rs(V.amount)+' voucher: claim it</button>'):'';
 if(t.gift)vline='<div class="ok gl-line"><span>🎁 '+esc(gl?gl.name:'Grand Launch')+' gift</span><b>FREE</b></div>';
 return '<div><span>Subtotal</span><b>'+rs(t.sub)+'</b></div>'+(t.bd?'<div class="ok"><span>'+t.lbl+'</span><b>-'+rs(t.bd)+'</b></div>':'')+vline+'<div><span>Delivery</span><b>'+(t.del?rs(t.del):'Free')+'</b></div><div class="tot"><span>Total (cash on delivery)</span><b>'+rs(t.total)+'</b></div>'}
function counts(){[$('bag-n')].concat(all('[data-bag-n]')).forEach(function(c){if(c){c.textContent=bag.length;c.hidden=!bag.length}});all('[data-wish-n]').forEach(function(c){c.textContent=wish.length;c.hidden=!wish.length})}
function draw(){counts();
 all('[data-add]').forEach(function(b){var it=JSON.parse(b.dataset.add),in_=bag.some(function(x){return x.sku===it.sku});b.classList.toggle('in',in_);if(b.classList.contains('addbag'))b.textContent=in_?'In your bag ✓':'Add to bag';else b.textContent=in_?'✓':'+'});
 all('[data-wish]').forEach(function(b){var it=JSON.parse(b.dataset.wish);b.classList.toggle('on',wish.some(function(x){return x.sku===it.sku}))});
 if(!$('bag-list'))return;var t=totals();$('bag-tip').textContent=nextTip();
 $('bag-list').innerHTML=bag.map(function(it,i){return '<div class="bi'+(it.f?' bi-gift':'')+'">'+(it.i?'<img src="'+root+esc(it.i)+'" alt="">':'<span></span>')+'<div>'+(it.f?'<i class="bi-gl">🎁 Free gift</i>':'')+'<b>'+esc(it.b)+'</b><span>'+esc(it.n)+(it.s?' · '+esc(it.s):'')+'</span><em>'+(it.f?'<s>'+rs(it.p)+'</s> FREE':rs(price(it))+(price(it)<it.p?' <s>'+rs(it.p)+'</s>':''))+'</em>'+(it.f?'<small class="gl-chg">Want another? Remove it (×) and pick again.</small>':'')+'</div><button type="button" data-rm="'+i+'" aria-label="Remove">×</button></div>'}).join('')+glChooser();
 $('bag-sum').innerHTML=bag.length?sumHtml(t):'';$('co-sum').innerHTML=bag.length?sumHtml(t):'';$('bag-go').hidden=!bag.length;
 if(!bag.length&&step==='co')show('cart')}
function glChooser(){var t=gl?glTier():'',g=glGift();if(!t||(g&&!(t==='men'&&g.f==='kids')))return '';var o=glOpts(t).filter(function(x){return !g||x.f==='men'});if(!o.length)return '';
 return '<div class="gl-ch"><b>🎁 '+(g?'Upgrade: swap for a men\'s sweatshirt':'Choose your FREE gift')+'</b><span>'+(g?'You have 2 jackets, so a men\'s sweatshirt is free too. Tap one to swap.':t==='men'?'2 jackets: pick a men\'s sweatshirt (or a kids one)':'1 jacket: pick a kids sweatshirt · add 1 more jacket for a men\'s sweatshirt')+'</span><div class="gl-ch-row">'+o.map(function(x){return '<button type="button" class="gl-opt" data-glopt="'+esc(x.sku)+'|'+x.f+'">'+(x.i?'<img src="'+root+esc(x.i)+'" alt="" loading="lazy">':'')+'<b>'+esc(x.b)+'</b><small>'+esc(x.s||'')+'</small><s>'+rs(x.p)+'</s><em>FREE</em><i>Add free</i></button>'}).join('')+'</div></div>'}
document.addEventListener('click',function(e){var o=e.target.closest('[data-glopt]');if(!o||!gl)return;var v=o.dataset.glopt.split('|'),x=gl[v[1]].filter(function(y){return y.sku===v[0]})[0];if(!x||glGone(x.sku))return;
 bag=bag.filter(function(y){return !y.f});bag.push(Object.assign({},x,{f:v[1]}));L.set('bag',bag);px('AddToCart',{content_ids:[x.sku],content_type:'product',value:0});draw();toast('🎁 Free gift added: '+x.b)});
function show(s){if(s==='co'&&step!=='co'&&bag.length)px('InitiateCheckout',Object.assign(pxItems(bag),{value:totals().total}));step=s;$('bag-cart').hidden=s!=='cart';$('co').hidden=s!=='co';$('co-done').hidden=s!=='done';$('bag-title').textContent=s==='co'?'Checkout':s==='done'?'Order sent':'Your bag';
 if(s==='co'){var c=L.get('cust',{}),f=$('co');['name','phone','city','address','email'].forEach(function(k){if(c[k]&&!f[k].value)f[k].value=c[k]})}}
function open_(s){var b=$('bag');b.hidden=false;document.body.classList.add('noscroll');show(s||'cart');draw()}
function close_(id){$(id).hidden=true;document.body.classList.remove('noscroll')}
function add(it){if(!bag.some(function(x){return x.sku===it.sku})){bag.push(it);L.set('bag',bag);glSync();px('AddToCart',{content_ids:[it.sku],content_type:'product',content_name:(it.b+' '+it.n).trim(),value:price(it)})}}
function orderNo(){var d=pkt(),p=function(n){return (n<10?'0':'')+n};return 'AT-'+String(d.getUTCFullYear()).slice(2)+p(d.getUTCMonth()+1)+p(d.getUTCDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
function api(body){var j=JSON.stringify(body);function get(){return fetch(T.api+(T.api.indexOf('?')<0?'?':'&')+'p='+encodeURIComponent(j)).then(function(r){return r.json()})}return fetch(T.api,{method:'POST',body:j}).then(function(r){return r.json()}).then(function(r){return r&&r.error==='unknown action'?get():r},get)}
$('co')&&($('co').onsubmit=function(e){e.preventDefault();var f=e.target,err=$('co-err'),c={},via=(e.submitter&&e.submitter.dataset.via)||'site';['name','phone','city','address','note','email'].forEach(function(k){c[k]=f[k].value.trim()});
 var ph=c.phone.replace(/\D/g,'');if(!c.name||!c.city||c.address.length<8){err.textContent='Please enter your name, city and full address.';return}
 if(!/^(92|0)?3\d{9}$/.test(ph)){err.textContent='Please enter a valid mobile number (03xx xxxxxxx).';return}
 if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)){err.textContent='Please enter a valid email or leave it blank.';return}
 if(!f.agree.checked){err.textContent='Please accept the terms and return policy.';return}err.textContent='';
 var t=totals(),items=bag.map(function(it){return {sku:it.sku,b:it.b,n:(it.f?'FREE GIFT ('+(gl?gl.name:'Grand Launch')+') ':'')+it.n,s:it.s,price:price(it),gift:it.f?1:0}});
 function waMsg(no){return 'Hi! '+(via==='site'?'Website order':'New order')+' *'+no+'* ('+T.store+')\n\n'+bag.map(function(it,i){return (i+1)+'. '+(it.f?'🎁 FREE GIFT: ':'')+it.b+' '+it.n+(it.s?' (size '+it.s+')':'')+' ['+it.sku+'] '+(it.f?'FREE':rs(price(it)))}).join('\n')+
 '\n\n'+(camp?camp.name+' prices ('+camp.pct+'% off)\n':'')+(t.gift?'🎁 '+(gl?gl.name:'Grand Launch')+': free gift + free delivery\n':'')+'Subtotal '+rs(t.sub)+(t.bd?'\n'+t.lbl+' -'+rs(t.bd):'')+(t.vd?'\nVoucher '+V.code+' -'+rs(t.vd):'')+'\nDelivery '+(t.del?rs(t.del):'Free')+'\n*Total '+rs(t.total)+' (Cash on delivery)*\n\nName: '+c.name+'\nPhone: '+c.phone+'\nCity: '+c.city+'\nAddress: '+c.address+(c.note?'\nNote: '+c.note:'')}
 function done(no,url,onSite){px('Purchase',Object.assign(pxItems(bag),{value:t.total,order_id:no}));var o=L.get('orders',[]);o.unshift({no:no,date:today,items:bag.length,total:t.total,phone:c.phone});L.set('orders',o.slice(0,10));L.set('cust',{name:c.name,phone:c.phone,city:c.city,address:c.address,email:c.email});
  $('co-done').innerHTML='<p class="eyebrow">Thank you, '+esc(c.name)+'!</p><h3>Order '+esc(no)+'</h3>'+(onSite?'<p>We have received your order and will confirm it soon by WhatsApp or call'+(c.email?'. A confirmation email is on its way to '+esc(c.email):'')+'.</p><a class="ask" href="'+esc(url)+'" target="_blank" rel="noopener">Also send on WhatsApp (faster confirmation)</a>':'<p>Your order has opened in WhatsApp. Please tap <b>Send</b> there to complete it.</p><a class="buy" href="'+esc(url)+'" target="_blank" rel="noopener">Open WhatsApp again</a>')+
  '<p class="bag-note">Total '+rs(t.total)+', pay when the parcel arrives. <a href="'+root+'track.html?o='+encodeURIComponent(no)+'">Track order</a></p>';
  bag=[];L.set('bag',bag);if(vc&&t.vd){vc=null;L.set('voucher',null);L.set('pop',1)}show('done');draw()}
 function viaWa(){var no=orderNo(),url='https://wa.me/'+T.wa+'?text='+encodeURIComponent(waMsg(no));if(!window.open(url,'_blank'))location.href=url;done(no,url,false)}
 if(via==='wa'||!T.api)return viaWa();
 var btn=e.submitter;btn.disabled=true;btn.textContent='Placing order...';
 api({a:'order',name:c.name,phone:c.phone,email:c.email,city:c.city,address:c.address,note:c.note,items:items,subtotal:t.sub,regular:t.reg,discount:t.bd+t.vd,delivery:t.del,total:t.total,gift:t.gift?t.gift.sku:''}).then(function(r){btn.disabled=false;btn.textContent='Place order · Cash on delivery';
  if(r.error){err.textContent=r.error;if(r.gone){bag=bag.filter(function(x){return r.gone.indexOf(x.sku)<0});L.set('bag',bag);draw()}return}
  done(r.no,'https://wa.me/'+T.wa+'?text='+encodeURIComponent(waMsg(r.no)),true)}).catch(function(){btn.disabled=false;btn.textContent='Place order · Cash on delivery';err.textContent='We could not reach our order system, so your order is opening in WhatsApp instead.';viaWa()})});
var nf=$('news');nf&&(nf.onsubmit=function(e){e.preventDefault();var m=$('news-msg'),em=nf.email.value.trim();if(!T.api){location.href='https://wa.me/'+T.wa+'?text='+encodeURIComponent('Please tell me about new drops. Email: '+em);return}
 m.className='o-msg ok';m.textContent='...';api({a:'subscribe',email:em}).then(function(r){m.className='o-msg '+(r.error?'err':'ok');m.textContent=r.error||r.message;if(!r.error){nf.reset();px('Lead',{content_category:'newsletter'})}}).catch(function(){m.textContent='Connection problem. Please try again.'})});
document.addEventListener('click',function(e){var a=e.target.closest('[data-add]');if(a){e.preventDefault();var it=JSON.parse(a.dataset.add),had=bag.some(function(x){return x.sku===it.sku});add(it);draw();if(!had&&a.classList.contains('cadd'))toast('Added to bag · '+nextTip());else open_();return}
 var bu=e.target.closest('[data-buy]');if(bu){add(JSON.parse(bu.dataset.buy));open_('co');return}
 var wi=e.target.closest('[data-wish]');if(wi){e.preventDefault();var w=JSON.parse(wi.dataset.wish),j=wish.findIndex(function(x){return x.sku===w.sku});if(j<0){wish.unshift(w);toast('Saved to wishlist');px('AddToWishlist',{content_ids:[w.sku],content_type:'product'})}else{wish.splice(j,1);if(wi.closest('#wl'))wi.closest('.card').remove()}L.set('wish',wish);draw();return}
 if(e.target.closest('[data-bag-open]'))return open_();
 if(e.target.id==='bag-go')return show('co');
 if(e.target.closest('[data-co-back]'))return show('cart');
 if(e.target.closest('[data-bag-close]')||e.target.id==='bag')return close_('bag');
 if(e.target.closest('[data-menu-open]')){$('menu').hidden=false;document.body.classList.add('noscroll');return}
 if(e.target.closest('[data-menu-close]')||e.target.id==='menu')return close_('menu');
 var r=e.target.closest('[data-rm]');if(r){var gone_=bag.splice(+r.dataset.rm,1)[0];L.set('bag',bag);glSync();draw();return}
 if(e.target.closest('[data-voucher]'))return pop(true);
 if(e.target.closest('[data-pop-close]')||e.target.id==='pop'){$('pop').hidden=true;L.set('pop',1)}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){['bag','menu','pop'].forEach(function(i){if($(i)&&!$(i).hidden)close_(i)})}});
function toast(t){var d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2600)}

// voucher
function pop(force){if(!V)return;var p=$('pop');if(!p)return;if(!force&&(vc||L.get('pop',0)))return;
 $('pop-h').textContent=vc?'Your voucher is ready':'Free '+rs(V.amount)+' voucher';$('pop-p').textContent=rs(V.amount)+' off your first order of '+rs(V.minOrder)+' or more. Applied automatically in your bag.';
 var code=$('pop-code'),go=$('pop-go');function shw(){code.hidden=false;code.textContent=V.code;go.textContent='Start shopping';go.onclick=function(){p.hidden=true}}
 if(vc)shw();else go.onclick=function(){vc=V.code;L.set('voucher',vc);shw();draw()};p.hidden=false}
if(V&&!vc&&!L.get('pop',0))setTimeout(function(){if($('bag').hidden&&$('menu').hidden)pop()},9000);

// recently viewed
T.seen=function(it){px('ViewContent',{content_ids:[it.sku],content_type:'product',content_name:(it.b+' '+it.n).trim(),value:cp(it.p)});var a=L.get('rv',[]).filter(function(x){return x.sku!==it.sku});a.unshift(it);L.set('rv',a.slice(0,8))};
var rv=$('rv');if(rv){var a=L.get('rv',[]);if(a.length){rv.hidden=false;rv.querySelector('.rv-row').innerHTML=a.map(function(it){return '<a href="p/'+esc(it.sku)+'.html">'+(it.i?'<img src="'+esc(it.i)+'" alt="" loading="lazy">':'')+'<b>'+esc(it.b)+'</b><span>'+esc(it.n)+'</span></a>'}).join('')}}
// search box (debounced, each term once) · make-an-offer form · WhatsApp taps
var sq=$('q'),sqT,sqLast='';sq&&sq.addEventListener('input',function(){clearTimeout(sqT);sqT=setTimeout(function(){var v=sq.value.trim().toLowerCase();if(v.length>1&&v!==sqLast){sqLast=v;px('Search',{search_string:v})}},1500)});
document.addEventListener('submit',function(e){if(e.target.id==='o-form'){var a=e.target.querySelector('[name=amount]');px('Lead',{content_category:'offer',value:+(a&&a.value)||0})}},true);
document.addEventListener('click',function(e){var a=e.target.closest('a[href*="wa.me/"]');if(a)px('Contact',{content_category:'whatsapp'})},true);
// live stock (no rebuild needed): an item marked sold in the sheet (one tap from the order email or the Landa Lister tool), or in an open website order, shows as sold / reserved on every page within a few minutes
(function(){if(!T.api)return;var K='tp-live',c=null;try{c=JSON.parse(sessionStorage.getItem(K)||'null')}catch(e){}
 function gone(s){return s&&(s.state==='sold'||s.state==='ordered')}
 function apply(m){var sf=$('sold');all('.card[data-sku]').forEach(function(el){var s=m[el.dataset.sku];if(!gone(s)||el.classList.contains('is-sold'))return;el.classList.add('is-sold');var ci=el.querySelector('.ci');if(ci){[].forEach.call(ci.querySelectorAll('.b-new,.b-camp,.b-deal,.b-offer'),function(b){b.remove()});var b=document.createElement('span');b.className='b-sold';b.textContent=s.state==='sold'?'Sold out':'Reserved';ci.appendChild(b)}var a=el.querySelector('.cadd');a&&a.remove();if(sf&&!sf.checked)el.hidden=true});
  var bt=document.querySelector('.cta [data-buy]'),sku='';try{sku=bt&&JSON.parse(bt.dataset.buy).sku}catch(e){}
  if(sku&&gone(m[sku])){var cta=bt.closest('.cta'),p=document.createElement('p');p.className='soldmsg';p.textContent=m[sku].state==='sold'?'This item has been sold. See similar items below or ask us on WhatsApp.':'This item is reserved for another order right now. Ask us on WhatsApp and we will tell you if it comes back.';cta.parentNode.insertBefore(p,cta);cta.remove();var o=document.querySelector('.offer');o&&o.remove()}
  liveM=m;var nb=bag.filter(function(x){return !gone(m[x.sku])});if(nb.length<bag.length){bag=nb;L.set('bag',bag)}glSync();draw();glMark()}
 if(c&&Date.now()-c.t<120000)apply(c.m);else fetch(T.api+'?a=all').then(function(r){return r.json()}).then(function(m){if(m&&!m.error){try{sessionStorage.setItem(K,JSON.stringify({t:Date.now(),m:m}))}catch(e){}apply(m)}}).catch(function(){})})();
// WhatsApp order message carries the item's size and page link, so the customer never has to explain which piece
(function(){var bt=document.querySelector('.cta [data-buy]');if(!bt)return;var it;try{it=JSON.parse(bt.dataset.buy)}catch(e){return}var url=location.href.split('#')[0].split('?')[0];
 all('a[href*="wa.me/"],[data-deal-href],[data-camp-href]').forEach(function(a){['href','data-deal-href','data-camp-href'].forEach(function(k){var h=a.getAttribute(k);if(!h||h.indexOf('wa.me/')<0||h.indexOf('text=')<0)return;var u=h.split('text='),t=decodeURIComponent(u[1]);if(t.indexOf(it.sku)<0||t.indexOf('/p/')>-1)return;t=t.replace('Is it available?','')+(it.s&&t.indexOf('size')<0?'\nSize: '+it.s:'')+'\nLink: '+url+'\nIs it available?';a.setAttribute(k,u[0]+'text='+encodeURIComponent(t))})})})();
// Grand Launch on every page (works on pages built before the offer): top bar, nav link, card badges, product-page note, homepage banner, countdown
function glMark(){if(!gl)return;all('.card[data-sku]').forEach(function(el){if(gl.q.indexOf(el.dataset.sku)<0||el.classList.contains('is-sold')||el.querySelector('.b-gl'))return;var ci=el.querySelector('.ci');if(!ci)return;var b=document.createElement('span');b.className='b-gl';b.textContent='🎁 Free gift inside';ci.insertBefore(b,ci.firstChild)})}
function glUI(){if(!gl)return;document.body.classList.add('gl-live');var R=root+'grand-launch.html',m=rs(gl.min);
 var bar=document.createElement('a');bar.className='glbar';bar.href=R;bar.innerHTML='<b>'+esc(gl.name)+'</b><span>Buy 1 jacket: kids sweatshirt FREE · Buy 2: men\'s sweatshirt FREE · Free delivery</span><span class="glbar-t">Ends in <time data-gl-left>--</time></span><i>Shop →</i>';document.body.insertBefore(bar,document.body.firstChild);
 all('.nav-deals').forEach(function(a){a.href=R;a.textContent='Grand Launch 🎁'});
 glMark();
 var bt=document.querySelector('.cta [data-buy]'),sku='';try{sku=bt&&JSON.parse(bt.dataset.buy).sku}catch(e){}
 if(sku&&gl.q.indexOf(sku)>-1){var cta=bt.closest('.cta'),n=document.createElement('a');n.className='gl-note';n.href=R;n.innerHTML='<b>🎁 '+esc(gl.name)+': this jacket comes with a FREE kids sweatshirt + free delivery</b><span>Buy any 2 jackets of '+m+'+ and get a men\'s sweatshirt FREE instead. Pick your free gift in the bag · ends in <time data-gl-left></time></span>';cta.parentNode.insertBefore(n,cta)}
 var sl=$('slider');if(sl&&!document.querySelector('.glp')){var h=document.createElement('a');h.className='glhome';h.href=R;h.innerHTML='<span class="glhome-k">'+esc(gl.name)+' · until '+esc(gl.endTxt)+'</span><b>Buy a jacket. Get a sweatshirt <em>FREE</em>.</b><span class="glhome-t"><span>1 jacket '+m+'+ → kids sweatshirt free</span><span>2 jackets → men\'s sweatshirt free</span><span>Free delivery</span></span><i>See the offer →</i>';sl.parentNode.insertBefore(h,sl)}
 function tk(){var left=Math.max(0,Math.floor((gl.end-Date.now())/1000)),d=Math.floor(left/86400),h=Math.floor(left%86400/3600),mi=Math.floor(left%3600/60),se=left%60;
  all('[data-gl-left]').forEach(function(e){e.textContent=(d?d+'d ':'')+p2(h)+':'+p2(mi)+':'+p2(se)});
  all('[data-gl-clock]').forEach(function(e){var u={d:d,h:p2(h),m:p2(mi),s:p2(se)};[].forEach.call(e.querySelectorAll('[data-u]'),function(b){b.textContent=u[b.dataset.u]})});
  if(!left){gl=null;document.body.classList.remove('gl-live');clearInterval(glT);all('.glbar,.gl-note,.glhome,.b-gl').forEach(function(x){x.remove()});glSync();draw()}}
 var glT=setInterval(tk,1000);tk()}
glSync();draw();glUI()})();
/* Product photo zoom: hover zoom on desktop, full-screen viewer with pinch / double-tap zoom and swipe on mobile */
(function(){
var gal=document.getElementById('gal');if(!gal)return;
var figs=[].slice.call(gal.querySelectorAll('.gi')),n=figs.length;if(!n)return;
var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
figs.forEach(function(f,i){var im=f.querySelector('img');
 if(fine){f.addEventListener('mousemove',function(e){var r=f.getBoundingClientRect();im.style.transformOrigin=((e.clientX-r.left)/r.width*100).toFixed(1)+'% '+((e.clientY-r.top)/r.height*100).toFixed(1)+'%';f.classList.add('zooming')});
  f.addEventListener('mouseleave',function(){f.classList.remove('zooming')})}
 f.addEventListener('click',function(){open(i)})});
var zb=document.querySelector('[data-zoom]');zb&&(zb.onclick=function(){open(Math.round(gal.scrollLeft/(gal.clientWidth||1)))});
var lb,st,img,cap,idx=0,sc=1,tx=0,ty=0,pts={},g=null,lastTap=0,lastTouch=0;
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h)e.innerHTML=h;return e}
function make(){lb=el('div','lb');lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Photo viewer');
 st=el('div','lb-st');img=el('img');img.alt='';img.draggable=false;st.appendChild(img);lb.appendChild(st);
 var x=el('button','lb-x','&times;');x.type='button';x.setAttribute('aria-label','Close');x.onclick=close;lb.appendChild(x);
 if(n>1){var pv=el('button','lb-nav lb-p','&#8249;'),nx=el('button','lb-nav lb-n','&#8250;');pv.type=nx.type='button';pv.setAttribute('aria-label','Previous photo');nx.setAttribute('aria-label','Next photo');pv.onclick=function(){show(idx-1)};nx.onclick=function(){show(idx+1)};lb.appendChild(pv);lb.appendChild(nx)}
 cap=el('p','lb-c');lb.appendChild(cap);document.body.appendChild(lb);
 st.addEventListener('pointerdown',down);st.addEventListener('pointermove',move);st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
 st.addEventListener('wheel',function(e){e.preventDefault();zoomAt(sc*(e.deltaY<0?1.2:1/1.2),e.clientX,e.clientY)},{passive:false});
 st.addEventListener('dblclick',function(e){if(Date.now()-lastTouch>800)zoomAt(sc>1?1:2.5,e.clientX,e.clientY)});
 document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(idx-1);else if(e.key==='ArrowRight')show(idx+1)})}
function apply(anim){st.classList.toggle('drag',!anim);img.style.transform='translate('+tx+'px,'+ty+'px) scale('+sc+')';st.classList.toggle('zoomed',sc>1)}
function bound(){var r=st.getBoundingClientRect(),mx=Math.max(0,(img.offsetWidth*sc-r.width)/2),my=Math.max(0,(img.offsetHeight*sc-r.height)/2);tx=Math.max(-mx,Math.min(mx,tx));ty=Math.max(-my,Math.min(my,ty))}
function zoomAt(s,cx,cy){var r=st.getBoundingClientRect(),px=cx-r.left-r.width/2,py=cy-r.top-r.height/2,ns=Math.max(1,Math.min(4,s));tx=px-(px-tx)*ns/sc;ty=py-(py-ty)*ns/sc;sc=ns;if(sc===1)tx=ty=0;bound();apply(true)}
function show(i){idx=(i+n)%n;sc=1;tx=ty=0;var s=figs[idx].querySelector('img');img.src=s.currentSrc||s.src;img.alt=s.alt;cap.textContent=(n>1?(idx+1)+' / '+n+' · ':'')+(fine?'Scroll or double-click to zoom':'Pinch or double-tap to zoom');apply(true)}
function open(i){if(!lb)make();show(i);lb.hidden=false;document.documentElement.classList.add('lb-open');lb.querySelector('.lb-x').focus({preventScroll:true})}
function close(){lb.hidden=true;document.documentElement.classList.remove('lb-open');gal.scrollTo({left:gal.clientWidth*idx});(zb||figs[idx]).focus&&(zb||figs[idx]).focus({preventScroll:true})}
function ids(){return Object.keys(pts)}
function mid(){var k=ids(),a=pts[k[0]],b=pts[k[1]];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)||1}}
function begin(){var k=ids();if(k.length>=2){var m=mid();g={pinch:1,d:m.d,sc:sc,x:m.x,y:m.y,tx:tx,ty:ty}}else if(k.length===1){var p=pts[k[0]];g={x:p.x,y:p.y,tx:tx,ty:ty,t:Date.now(),moved:0}}else g=null}
function down(e){if(e.pointerType==='touch')lastTouch=Date.now();st.setPointerCapture&&st.setPointerCapture(e.pointerId);pts[e.pointerId]={x:e.clientX,y:e.clientY};begin()}
function move(e){if(!pts[e.pointerId]||!g)return;pts[e.pointerId]={x:e.clientX,y:e.clientY};
 if(g.pinch&&ids().length>=2){var m=mid(),ns=Math.max(1,Math.min(4,g.sc*m.d/g.d)),r=st.getBoundingClientRect(),px=g.x-r.left-r.width/2,py=g.y-r.top-r.height/2;tx=px-(px-g.tx)*ns/g.sc+(m.x-g.x);ty=py-(py-g.ty)*ns/g.sc+(m.y-g.y);sc=ns;bound();apply(false);return}
 var dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)+Math.abs(dy)>8)g.moved=1;
 if(sc>1){tx=g.tx+dx;ty=g.ty+dy;bound();apply(false)}else if(n>1){tx=dx;apply(false)}}
function up(e){var was=g;delete pts[e.pointerId];
 if(was&&!was.pinch&&ids().length===0){var dx=e.clientX-was.x;
  if(sc===1&&n>1&&Math.abs(dx)>60&&was.moved){show(idx+(dx<0?1:-1))}
  else if(sc===1){tx=ty=0;apply(true)}
  if(!was.moved&&e.pointerType==='touch'){var now=Date.now();if(now-lastTap<300){zoomAt(sc>1?1:2.5,e.clientX,e.clientY);lastTap=0}else lastTap=now}
  else if(!was.moved&&e.pointerType!=='touch'&&sc===1&&e.target===st)close()}
 if(sc<1.02&&ids().length===0){sc=1;tx=ty=0;apply(true)}
 begin()}
})();
// ---------- Engagement: share, follow, WhatsApp new-arrivals list ----------
(function(){
var T=window.TP||{},R=T.root||'',FB=T.fb||'https://www.facebook.com/abcthrift.store',WA=T.wa||'923224631990';
function q(s,r){return (r||document).querySelector(s)}
function get(k,d){try{var v=localStorage.getItem('tp-'+k);return v?JSON.parse(v):d}catch(e){return d}}
function put(k,v){try{localStorage.setItem('tp-'+k,JSON.stringify(v))}catch(e){}}
function ev(n,d){try{if(window.fbq)fbq('trackCustom',n,d||{})}catch(e){}}
function wa(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t)}
// the welcome-voucher popup opens at ~9s: never stack on top of it
function busy(){var p=document.getElementById('pop');return (p&&performance.now()<12000)||(p&&!p.hidden)||q('.flw.on,.nudge.on,.bag.on,[aria-modal="true"]:not([hidden])')}
function h(html){var d=document.createElement('div');d.innerHTML=html;return d.firstChild}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
var JOIN='Hi ABCThrift! Please add me to your new arrivals updates on WhatsApp.';
var IC={wa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z"/></svg>',
 fb:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.6v3.6h2.7V22H14v-9.9h2.8l.4-3.6H14Z"/></svg>',
 ln:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'};
// visits count (for when to show the follow card)
var vis=get('visits',0)+1;put('visits',vis);

// 1) Product page: share with friends + ask about this piece
var buy=q('.pd [data-buy]');
if(buy){
 var it={};try{it=JSON.parse(buy.dataset.buy)}catch(e){}
 var url=location.href.split('#')[0].split('?')[0]+'?utm_source=share&utm_medium=whatsapp';
 var name=(it.b?it.b+' ':'')+(it.n||document.title);
 var price=q('.pp.camp b')&&document.body.classList.contains('camp-live')?q('.pp.camp b').textContent:(it.p?'Rs '+Number(it.p).toLocaleString('en-PK'):'');
 var house=/ABCThrift Select/i.test(it.b||'');
 var msg='Look what I found on ABCThrift: '+name+(it.s?', size '+it.s:'')+(price?', '+price:'')+(house?'. Hand-picked, only 1 piece. ':'. Original brand, only 1 piece. ')+url;
 var box=h('<div class="shr"><span class="shr-t">Ask a friend: should I buy this?</span><div class="shr-b">'+
  '<a class="shr-wa" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(msg)+'">'+IC.wa+'WhatsApp</a>'+
  '<a class="shr-fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url.replace('medium=whatsapp','medium=facebook'))+'">'+IC.fb+'Facebook</a>'+
  '<button type="button" class="shr-cp">'+IC.ln+'<span>Copy link</span></button></div></div>');
 var anchor=q('.pd .ask')||q('.pd .cta');anchor.parentNode.insertBefore(box,anchor.nextSibling);
 box.addEventListener('click',function(e){var a=e.target.closest('a,button');if(!a)return;
  if(a.classList.contains('shr-cp')){e.preventDefault();var done=function(){a.querySelector('span').textContent='Link copied'};
   if(navigator.share){navigator.share({title:name,text:msg.replace(' '+url,''),url:url}).catch(function(){})}
   else if(navigator.clipboard){navigator.clipboard.writeText(url).then(done,done)}else{prompt('Copy this link',url)}}
  ev('SharePiece',{method:a.className,content_ids:[it.sku]})});
 // after 25s on a piece, one gentle offer to send the brand-tag photo (once per visit)
 if(!sessionStorage.getItem('tp-nudge')){setTimeout(function tryN(){if(q('.nudge'))return;if(document.hidden||busy())return setTimeout(tryN,8000);sessionStorage.setItem('tp-nudge','1');
  var n=h('<div class="nudge" role="dialog" aria-label="Ask about this piece"><button type="button" class="nudge-x" aria-label="Close">×</button><b>Want a closer look?</b><span>We can send you a photo of the brand tag and measurements of this exact piece on WhatsApp.</span><a target="_blank" rel="noopener" href="'+wa('Hi! Please send me the brand tag photo and measurements of '+name+' ('+(it.sku||'')+'). '+url.split('?')[0])+'">'+IC.wa+'Ask on WhatsApp</a></div>');
  document.body.appendChild(n);requestAnimationFrame(function(){n.classList.add('on')});
  n.addEventListener('click',function(e){if(e.target.closest('.nudge-x')){n.remove()}else if(e.target.closest('a')){ev('AskTagPhoto',{content_ids:[it.sku]});n.remove()}})},25000)}
}

// 2) Homepage: "Never miss a drop" block with the Facebook page (follow button) and the WhatsApp list
var hiw=q('section.conds')||q('section.faqs');
if(hiw&&q('#shop')&&q('section.hiw')){
 var blk=h('<section class="drops"><div class="drops-in"><div class="drops-txt"><span class="drops-k">One piece of each, gone when it is sold</span><h2>Never miss a new drop</h2><p>We add new hand-picked pieces every week. Followers see them first, before they sell out.</p>'+
  '<div class="drops-b"><a class="d-fb" target="_blank" rel="noopener" href="'+FB+'">'+IC.fb+'Follow on Facebook</a><a class="d-wa" target="_blank" rel="noopener" href="'+wa(JOIN)+'">'+IC.wa+'Get new arrivals on WhatsApp</a></div>'+
  '<small>WhatsApp updates only if you ask for them. Reply STOP any time.</small></div><div class="drops-fb" aria-hidden="true"></div></div></section>');
 hiw.parentNode.insertBefore(blk,hiw);
 blk.addEventListener('click',function(e){var a=e.target.closest('a');if(a){ev(a.classList.contains('d-fb')?'FollowFacebook':'JoinWhatsApp',{place:'home'});put('followed',Date.now())}});
 // Facebook page box (real Follow button), loaded only when scrolled near it
 var slot=q('.drops-fb',blk),load=function(){if(slot.firstChild)return;var w=Math.min(500,Math.max(280,slot.clientWidth||320));
  slot.innerHTML='<iframe title="ABCThrift on Facebook" src="https://www.facebook.com/plugins/page.php?href='+encodeURIComponent(FB)+'&tabs=&width='+w+'&height=180&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true" width="'+w+'" height="180" style="border:none;overflow:hidden;max-width:100%" scrolling="no" frameborder="0" allowfullscreen="true" loading="lazy" allow="encrypted-media"></iframe>';slot.removeAttribute('aria-hidden')};
 if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){load();io.disconnect()}},{rootMargin:'400px'});io.observe(slot)}else load();
}

// 3) Follow card: shown once after some browsing; dismissed = hidden 4 days, followed = hidden 60 days
var hide=get('follow-hide',0),fol=get('followed',0),page=location.pathname;
if(Date.now()>hide&&Date.now()-fol>60*864e5&&!/track|wishlist|404/.test(page)){
 var shown=0,show=function(){if(shown)return;if(document.hidden||busy())return setTimeout(show,15000);shown=1;
  var c=h('<div class="flw" role="dialog" aria-label="Follow ABCThrift"><button type="button" class="flw-x" aria-label="Close">×</button><img src="'+R+'logo.png" alt="" width="44" height="44"><div><b>New pieces every week</b><span>Every piece is one of one. Follow us to see new jackets, hoodies and kids winter wear before they sell.</span><div class="flw-b"><a class="d-fb" target="_blank" rel="noopener" href="'+FB+'">'+IC.fb+'Follow</a><a class="d-wa" target="_blank" rel="noopener" href="'+wa(JOIN)+'">'+IC.wa+'WhatsApp updates</a></div></div></div>');
  document.body.appendChild(c);requestAnimationFrame(function(){c.classList.add('on')});
  c.addEventListener('click',function(e){if(e.target.closest('.flw-x')){put('follow-hide',Date.now()+4*864e5);c.remove()}else{var a=e.target.closest('a');if(a){ev(a.classList.contains('d-fb')?'FollowFacebook':'JoinWhatsApp',{place:'card'});put('followed',Date.now());c.remove()}}})};
 // first visit: after 40s or 65% scroll; returning visitor: after 20s
 setTimeout(show,vis>1?20000:40000);
 window.addEventListener('scroll',function s(){var d=document.documentElement;if((d.scrollTop+innerHeight)/d.scrollHeight>.65){window.removeEventListener('scroll',s);setTimeout(show,1500)}},{passive:true});
}
})();
