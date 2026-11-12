(function(){
var T=window.TP,root=T.root,L={get:function(k,d){try{var v=localStorage.getItem('tp-'+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem('tp-'+k,JSON.stringify(v))}catch(e){}}};
function $(i){return document.getElementById(i)}
function all(s){return [].slice.call(document.querySelectorAll(s))}
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
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
function price(it){return deal&&deal.sku===it.sku?deal.price:cp(it.p)}
// free delivery counts items at their regular price, so a sale never takes free delivery away (same rule in Code.gs)
function totals(){var sub=0,reg=0,n=bag.length;bag.forEach(function(it){sub+=price(it);reg+=it.p});var bd=0,lbl='';(T.bundle||[]).forEach(function(b){if(n>=b.min){bd=b.off?b.off:Math.round(sub*b.pct/100);lbl=n+' items bundle'}});
 var vd=vc&&V&&n&&sub-bd>=V.minOrder?V.amount:0,goods=sub-bd-vd,del=!n||!T.fee||(T.freeOver&&Math.max(goods,reg)>=T.freeOver)?0:T.fee;return {sub:sub,reg:reg,bd:bd,lbl:lbl,vd:vd,del:del,goods:goods,total:goods+del}}
function nextTip(){var n=bag.length,nx=(T.bundle||[]).filter(function(b){return b.min>n})[0],t=totals();if(!n)return 'Your bag is empty. Tap + on an item to add it.';
 if(t.del)return 'Add '+rs(T.freeOver-Math.max(t.goods,t.reg))+' more for free delivery!'+(nx?' Add '+(nx.min-n)+' more item(s) for '+(nx.off?rs(nx.off):nx.pct+'%')+' off.':'');
 if(nx)return 'Add '+(nx.min-n)+' more item(s) and save '+(nx.off?rs(nx.off):nx.pct+'%')+'!';return 'Bundle discount and free delivery applied.'}
function sumHtml(t){var vline=V?(vc?(t.vd?'<div><span>Voucher '+esc(V.code)+'</span><b>-'+rs(t.vd)+'</b></div>':'<div class="mut"><span>Voucher '+esc(V.code)+' (on '+rs(V.minOrder)+'+)</span><b>-</b></div>'):'<button type="button" class="o-link" data-voucher>Free '+rs(V.amount)+' voucher: claim it</button>'):'';
 return '<div><span>Subtotal</span><b>'+rs(t.sub)+'</b></div>'+(t.bd?'<div class="ok"><span>'+t.lbl+'</span><b>-'+rs(t.bd)+'</b></div>':'')+vline+'<div><span>Delivery</span><b>'+(t.del?rs(t.del):'Free')+'</b></div><div class="tot"><span>Total (cash on delivery)</span><b>'+rs(t.total)+'</b></div>'}
function counts(){[$('bag-n')].concat(all('[data-bag-n]')).forEach(function(c){if(c){c.textContent=bag.length;c.hidden=!bag.length}});all('[data-wish-n]').forEach(function(c){c.textContent=wish.length;c.hidden=!wish.length})}
function draw(){counts();
 all('[data-add]').forEach(function(b){var it=JSON.parse(b.dataset.add),in_=bag.some(function(x){return x.sku===it.sku});b.classList.toggle('in',in_);if(b.classList.contains('addbag'))b.textContent=in_?'In your bag ✓':'Add to bag';else b.textContent=in_?'✓':'+'});
 all('[data-wish]').forEach(function(b){var it=JSON.parse(b.dataset.wish);b.classList.toggle('on',wish.some(function(x){return x.sku===it.sku}))});
 if(!$('bag-list'))return;var t=totals();$('bag-tip').textContent=nextTip();
 $('bag-list').innerHTML=bag.map(function(it,i){return '<div class="bi">'+(it.i?'<img src="'+root+esc(it.i)+'" alt="">':'<span></span>')+'<div><b>'+esc(it.b)+'</b><span>'+esc(it.n)+(it.s?' · '+esc(it.s):'')+'</span><em>'+rs(price(it))+(price(it)<it.p?' <s>'+rs(it.p)+'</s>':'')+'</em></div><button type="button" data-rm="'+i+'" aria-label="Remove">×</button></div>'}).join('');
 $('bag-sum').innerHTML=bag.length?sumHtml(t):'';$('co-sum').innerHTML=bag.length?sumHtml(t):'';$('bag-go').hidden=!bag.length;
 if(!bag.length&&step==='co')show('cart')}
function show(s){step=s;$('bag-cart').hidden=s!=='cart';$('co').hidden=s!=='co';$('co-done').hidden=s!=='done';$('bag-title').textContent=s==='co'?'Checkout':s==='done'?'Order sent':'Your bag';
 if(s==='co'){var c=L.get('cust',{}),f=$('co');['name','phone','city','address','email'].forEach(function(k){if(c[k]&&!f[k].value)f[k].value=c[k]})}}
function open_(s){var b=$('bag');b.hidden=false;document.body.classList.add('noscroll');show(s||'cart');draw()}
function close_(id){$(id).hidden=true;document.body.classList.remove('noscroll')}
function add(it){if(!bag.some(function(x){return x.sku===it.sku})){bag.push(it);L.set('bag',bag)}}
function orderNo(){var d=pkt(),p=function(n){return (n<10?'0':'')+n};return 'AT-'+String(d.getUTCFullYear()).slice(2)+p(d.getUTCMonth()+1)+p(d.getUTCDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
function api(body){var j=JSON.stringify(body);function get(){return fetch(T.api+(T.api.indexOf('?')<0?'?':'&')+'p='+encodeURIComponent(j)).then(function(r){return r.json()})}return fetch(T.api,{method:'POST',body:j}).then(function(r){return r.json()}).then(function(r){return r&&r.error==='unknown action'?get():r},get)}
$('co')&&($('co').onsubmit=function(e){e.preventDefault();var f=e.target,err=$('co-err'),c={},via=(e.submitter&&e.submitter.dataset.via)||'site';['name','phone','city','address','note','email'].forEach(function(k){c[k]=f[k].value.trim()});
 var ph=c.phone.replace(/\D/g,'');if(!c.name||!c.city||c.address.length<8){err.textContent='Please enter your name, city and full address.';return}
 if(!/^(92|0)?3\d{9}$/.test(ph)){err.textContent='Please enter a valid mobile number (03xx xxxxxxx).';return}
 if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)){err.textContent='Please enter a valid email or leave it blank.';return}
 if(!f.agree.checked){err.textContent='Please accept the terms and return policy.';return}err.textContent='';
 var t=totals(),items=bag.map(function(it){return {sku:it.sku,b:it.b,n:it.n,s:it.s,price:price(it)}});
 function waMsg(no){return 'Hi! '+(via==='site'?'Website order':'New order')+' *'+no+'* ('+T.store+')\n\n'+bag.map(function(it,i){return (i+1)+'. '+it.b+' '+it.n+(it.s?' (size '+it.s+')':'')+' ['+it.sku+'] '+rs(price(it))}).join('\n')+
 '\n\n'+(camp?camp.name+' prices ('+camp.pct+'% off)\n':'')+'Subtotal '+rs(t.sub)+(t.bd?'\n'+t.lbl+' -'+rs(t.bd):'')+(t.vd?'\nVoucher '+V.code+' -'+rs(t.vd):'')+'\nDelivery '+(t.del?rs(t.del):'Free')+'\n*Total '+rs(t.total)+' (Cash on delivery)*\n\nName: '+c.name+'\nPhone: '+c.phone+'\nCity: '+c.city+'\nAddress: '+c.address+(c.note?'\nNote: '+c.note:'')}
 function done(no,url,onSite){var o=L.get('orders',[]);o.unshift({no:no,date:today,items:bag.length,total:t.total,phone:c.phone});L.set('orders',o.slice(0,10));L.set('cust',{name:c.name,phone:c.phone,city:c.city,address:c.address,email:c.email});
  $('co-done').innerHTML='<p class="eyebrow">Thank you, '+esc(c.name)+'!</p><h3>Order '+esc(no)+'</h3>'+(onSite?'<p>We have received your order and will confirm it soon by WhatsApp or call'+(c.email?'. A confirmation email is on its way to '+esc(c.email):'')+'.</p><a class="ask" href="'+esc(url)+'" target="_blank" rel="noopener">Also send on WhatsApp (faster confirmation)</a>':'<p>Your order has opened in WhatsApp. Please tap <b>Send</b> there to complete it.</p><a class="buy" href="'+esc(url)+'" target="_blank" rel="noopener">Open WhatsApp again</a>')+
  '<p class="bag-note">Total '+rs(t.total)+', pay when the parcel arrives. <a href="'+root+'track.html?o='+encodeURIComponent(no)+'">Track order</a></p>';
  bag=[];L.set('bag',bag);if(vc&&t.vd){vc=null;L.set('voucher',null);L.set('pop',1)}show('done');draw()}
 function viaWa(){var no=orderNo(),url='https://wa.me/'+T.wa+'?text='+encodeURIComponent(waMsg(no));if(!window.open(url,'_blank'))location.href=url;done(no,url,false)}
 if(via==='wa'||!T.api)return viaWa();
 var btn=e.submitter;btn.disabled=true;btn.textContent='Placing order...';
 api({a:'order',name:c.name,phone:c.phone,email:c.email,city:c.city,address:c.address,note:c.note,items:items,subtotal:t.sub,regular:t.reg,discount:t.bd+t.vd,delivery:t.del,total:t.total}).then(function(r){btn.disabled=false;btn.textContent='Place order · Cash on delivery';
  if(r.error){err.textContent=r.error;if(r.gone){bag=bag.filter(function(x){return r.gone.indexOf(x.sku)<0});L.set('bag',bag);draw()}return}
  done(r.no,'https://wa.me/'+T.wa+'?text='+encodeURIComponent(waMsg(r.no)),true)}).catch(function(){btn.disabled=false;btn.textContent='Place order · Cash on delivery';err.textContent='We could not reach our order system, so your order is opening in WhatsApp instead.';viaWa()})});
var nf=$('news');nf&&(nf.onsubmit=function(e){e.preventDefault();var m=$('news-msg'),em=nf.email.value.trim();if(!T.api){location.href='https://wa.me/'+T.wa+'?text='+encodeURIComponent('Please tell me about new drops. Email: '+em);return}
 m.className='o-msg ok';m.textContent='...';api({a:'subscribe',email:em}).then(function(r){m.className='o-msg '+(r.error?'err':'ok');m.textContent=r.error||r.message;if(!r.error)nf.reset()}).catch(function(){m.textContent='Connection problem. Please try again.'})});
document.addEventListener('click',function(e){var a=e.target.closest('[data-add]');if(a){e.preventDefault();var it=JSON.parse(a.dataset.add),had=bag.some(function(x){return x.sku===it.sku});add(it);draw();if(!had&&a.classList.contains('cadd'))toast('Added to bag · '+nextTip());else open_();return}
 var bu=e.target.closest('[data-buy]');if(bu){add(JSON.parse(bu.dataset.buy));open_('co');return}
 var wi=e.target.closest('[data-wish]');if(wi){e.preventDefault();var w=JSON.parse(wi.dataset.wish),j=wish.findIndex(function(x){return x.sku===w.sku});if(j<0){wish.unshift(w);toast('Saved to wishlist')}else{wish.splice(j,1);if(wi.closest('#wl'))wi.closest('.card').remove()}L.set('wish',wish);draw();return}
 if(e.target.closest('[data-bag-open]'))return open_();
 if(e.target.id==='bag-go')return show('co');
 if(e.target.closest('[data-co-back]'))return show('cart');
 if(e.target.closest('[data-bag-close]')||e.target.id==='bag')return close_('bag');
 if(e.target.closest('[data-menu-open]')){$('menu').hidden=false;document.body.classList.add('noscroll');return}
 if(e.target.closest('[data-menu-close]')||e.target.id==='menu')return close_('menu');
 var r=e.target.closest('[data-rm]');if(r){bag.splice(+r.dataset.rm,1);L.set('bag',bag);draw();return}
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
T.seen=function(it){var a=L.get('rv',[]).filter(function(x){return x.sku!==it.sku});a.unshift(it);L.set('rv',a.slice(0,8))};
var rv=$('rv');if(rv){var a=L.get('rv',[]);if(a.length){rv.hidden=false;rv.querySelector('.rv-row').innerHTML=a.map(function(it){return '<a href="p/'+esc(it.sku)+'.html">'+(it.i?'<img src="'+esc(it.i)+'" alt="" loading="lazy">':'')+'<b>'+esc(it.b)+'</b><span>'+esc(it.n)+'</span></a>'}).join('')}}
draw()})();
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
