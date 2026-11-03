(function(){
var T=window.TP,root=T.root,L={get:function(k,d){try{var v=localStorage.getItem('tp-'+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem('tp-'+k,JSON.stringify(v))}catch(e){}}};
function $(i){return document.getElementById(i)}
function all(s){return [].slice.call(document.querySelectorAll(s))}
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
function pkt(){return new Date(Date.now()+5*36e5)}
var today=pkt().toISOString().slice(0,10),deal=T.deal&&T.deal.day===today?T.deal:null;
if(deal){document.body.classList.add('deal-live');all('[data-deal-href]').forEach(function(a){a.href=a.dataset.dealHref})}
function tick(){var p=pkt(),left=86400-(p.getUTCHours()*3600+p.getUTCMinutes()*60+p.getUTCSeconds()),h=Math.floor(left/3600),m=Math.floor(left%3600/60),s=left%60,t=(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;all('[data-countdown]').forEach(function(e){e.textContent=t})}
if(deal){tick();setInterval(tick,1000)}

// announcement bar
var an=all('#ann span'),ai=0;if(an.length>1)setInterval(function(){an[ai].className='';ai=(ai+1)%an.length;an[ai].className='on'},3500);

// bag + checkout
var bag=L.get('bag',[]),wish=L.get('wish',[]),V=T.voucher,vc=L.get('voucher',null),step='cart';
function price(it){return deal&&deal.sku===it.sku?deal.price:it.p}
function totals(){var sub=0,n=bag.length;bag.forEach(function(it){sub+=price(it)});var bd=0,lbl='';(T.bundle||[]).forEach(function(b){if(n>=b.min){bd=b.off?b.off:Math.round(sub*b.pct/100);lbl=n+' items bundle'}});
 var vd=vc&&V&&n&&sub-bd>=V.minOrder?V.amount:0,goods=sub-bd-vd,del=!n||!T.fee||(T.freeOver&&goods>=T.freeOver)?0:T.fee;return {sub:sub,bd:bd,lbl:lbl,vd:vd,del:del,goods:goods,total:goods+del}}
function nextTip(){var n=bag.length,nx=(T.bundle||[]).filter(function(b){return b.min>n})[0],t=totals();if(!n)return 'Your bag is empty. Tap + on an item to add it.';
 if(T.fee&&T.freeOver&&t.goods<T.freeOver)return 'Add '+rs(T.freeOver-t.goods)+' more for free delivery!'+(nx?' Add '+(nx.min-n)+' more item(s) for '+(nx.off?rs(nx.off):nx.pct+'%')+' off.':'');
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
 '\n\nSubtotal '+rs(t.sub)+(t.bd?'\n'+t.lbl+' -'+rs(t.bd):'')+(t.vd?'\nVoucher '+V.code+' -'+rs(t.vd):'')+'\nDelivery '+(t.del?rs(t.del):'Free')+'\n*Total '+rs(t.total)+' (Cash on delivery)*\n\nName: '+c.name+'\nPhone: '+c.phone+'\nCity: '+c.city+'\nAddress: '+c.address+(c.note?'\nNote: '+c.note:'')}
 function done(no,url,onSite){var o=L.get('orders',[]);o.unshift({no:no,date:today,items:bag.length,total:t.total,phone:c.phone});L.set('orders',o.slice(0,10));L.set('cust',{name:c.name,phone:c.phone,city:c.city,address:c.address,email:c.email});
  $('co-done').innerHTML='<p class="eyebrow">Thank you, '+esc(c.name)+'!</p><h3>Order '+esc(no)+'</h3>'+(onSite?'<p>We have received your order and will confirm it soon by WhatsApp or call'+(c.email?'. A confirmation email is on its way to '+esc(c.email):'')+'.</p><a class="ask" href="'+esc(url)+'" target="_blank" rel="noopener">Also send on WhatsApp (faster confirmation)</a>':'<p>Your order has opened in WhatsApp. Please tap <b>Send</b> there to complete it.</p><a class="buy" href="'+esc(url)+'" target="_blank" rel="noopener">Open WhatsApp again</a>')+
  '<p class="bag-note">Total '+rs(t.total)+', pay when the parcel arrives. <a href="'+root+'track.html?o='+encodeURIComponent(no)+'">Track order</a></p>';
  bag=[];L.set('bag',bag);if(vc&&t.vd){vc=null;L.set('voucher',null);L.set('pop',1)}show('done');draw()}
 function viaWa(){var no=orderNo(),url='https://wa.me/'+T.wa+'?text='+encodeURIComponent(waMsg(no));if(!window.open(url,'_blank'))location.href=url;done(no,url,false)}
 if(via==='wa'||!T.api)return viaWa();
 var btn=e.submitter;btn.disabled=true;btn.textContent='Placing order...';
 api({a:'order',name:c.name,phone:c.phone,email:c.email,city:c.city,address:c.address,note:c.note,items:items,subtotal:t.sub,discount:t.bd+t.vd,delivery:t.del,total:t.total}).then(function(r){btn.disabled=false;btn.textContent='Place order · Cash on delivery';
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
