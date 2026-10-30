(function(){
var T=window.TP,root=T.root,L={get:function(k,d){try{var v=localStorage.getItem('tp-'+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem('tp-'+k,JSON.stringify(v))}catch(e){}}};
function $(i){return document.getElementById(i)}
function rs(n){return 'Rs '+Math.round(n).toLocaleString('en-PK')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return '&#'+c.charCodeAt(0)+';'})}
function pkt(){return new Date(Date.now()+5*36e5)}
var today=pkt().toISOString().slice(0,10),deal=T.deal&&T.deal.day===today?T.deal:null;
if(deal){document.body.classList.add('deal-live');[].forEach.call(document.querySelectorAll('[data-deal-href]'),function(a){a.href=a.dataset.dealHref})}
function tick(){var p=pkt(),left=86400-(p.getUTCHours()*3600+p.getUTCMinutes()*60+p.getUTCSeconds()),h=Math.floor(left/3600),m=Math.floor(left%3600/60),s=left%60,t=(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;[].forEach.call(document.querySelectorAll('[data-countdown]'),function(e){e.textContent=t})}
if(deal){tick();setInterval(tick,1000)}

// bag
var bag=L.get('bag',[]),V=T.voucher,vc=L.get('voucher',null);
function price(it){return deal&&deal.sku===it.sku?deal.price:it.p}
function totals(){var sub=0,n=bag.length;bag.forEach(function(it){sub+=price(it)});var bd=0,lbl='';(T.bundle||[]).forEach(function(b){if(n>=b.min){bd=b.off?b.off:Math.round(sub*b.pct/100);lbl=n+' items bundle'}});
 var vd=vc&&V&&n&&sub-bd>=V.minOrder?V.amount:0;return {sub:sub,bd:bd,lbl:lbl,vd:vd,total:sub-bd-vd}}
function nextTip(){var n=bag.length,nx=(T.bundle||[]).filter(function(b){return b.min>n})[0];if(!n)return 'Bag khali hai. Items par + dabayein.';if(nx)return 'Sirf '+(nx.min-n)+' aur item add karein aur '+(nx.off?rs(nx.off):nx.pct+'%')+' bachayein!';return 'Bundle discount laag ho gaya.'}
function draw(){var c=$('bag-n');if(c){c.textContent=bag.length;c.hidden=!bag.length}
 [].forEach.call(document.querySelectorAll('[data-add]'),function(b){var it=JSON.parse(b.dataset.add),in_=bag.some(function(x){return x.sku===it.sku});b.classList.toggle('in',in_);if(b.classList.contains('addbag'))b.textContent=in_?'In your bag ✓':'Add to bag';else b.textContent=in_?'✓':'+'});
 if(!$('bag-list'))return;var t=totals();$('bag-tip').textContent=nextTip();
 $('bag-list').innerHTML=bag.map(function(it,i){return '<div class="bi">'+(it.i?'<img src="'+root+esc(it.i)+'" alt="">':'<span></span>')+'<div><b>'+esc(it.b)+'</b><span>'+esc(it.n)+'</span><em>'+rs(price(it))+(price(it)<it.p?' <s>'+rs(it.p)+'</s>':'')+'</em></div><button type="button" data-rm="'+i+'" aria-label="Remove">×</button></div>'}).join('');
 var vline=V?(vc?(t.vd?'<div><span>Voucher '+esc(V.code)+'</span><b>-'+rs(t.vd)+'</b></div>':'<div class="mut"><span>Voucher '+esc(V.code)+' ('+rs(V.minOrder)+'+ par)</span><b>-</b></div>'):'<button type="button" class="o-link" data-voucher>Free '+rs(V.amount)+' voucher claim karein</button>'):'';
 $('bag-sum').innerHTML=bag.length?'<div><span>Subtotal</span><b>'+rs(t.sub)+'</b></div>'+(t.bd?'<div class="ok"><span>'+t.lbl+'</span><b>-'+rs(t.bd)+'</b></div>':'')+vline+'<div class="tot"><span>Total (COD)</span><b>'+rs(t.total)+'</b></div>':'';
 var go=$('bag-go');go.hidden=!bag.length;var msg='Assalam o alaikum! '+T.store+' se ye items chahiye:\n'+bag.map(function(it,i){return (i+1)+'. '+it.b+' '+it.n+' ('+it.sku+') '+rs(price(it))}).join('\n')+'\nSubtotal '+rs(t.sub)+(t.bd?'\n'+t.lbl+' -'+rs(t.bd):'')+(t.vd?'\nVoucher '+V.code+' -'+rs(t.vd):'')+'\nTotal '+rs(t.total)+' (COD)\nMera naam aur address: ';
 go.href='https://wa.me/'+T.wa+'?text='+encodeURIComponent(msg)}
function open_(){var b=$('bag');b.hidden=false;document.body.classList.add('noscroll');draw()}
document.addEventListener('click',function(e){var a=e.target.closest('[data-add]');if(a){e.preventDefault();var it=JSON.parse(a.dataset.add),i=bag.findIndex(function(x){return x.sku===it.sku});if(i<0){bag.push(it);L.set('bag',bag);draw();if(!a.classList.contains('cadd'))open_();else toast('Bag mein add ho gaya · '+nextTip())}else open_();return}
 if(e.target.closest('[data-bag-open]'))return open_();
 if(e.target.closest('[data-bag-close]')||e.target.id==='bag'){$('bag').hidden=true;document.body.classList.remove('noscroll');return}
 var r=e.target.closest('[data-rm]');if(r){bag.splice(+r.dataset.rm,1);L.set('bag',bag);draw();return}
 if(e.target.closest('[data-voucher]'))return pop(true);
 if(e.target.closest('[data-pop-close]')||e.target.id==='pop'){$('pop').hidden=true;L.set('pop',1)}});
function toast(t){var d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove()},2600)}

// voucher
function pop(force){if(!V)return;var p=$('pop');if(!p)return;if(!force&&(vc||L.get('pop',0)))return;
 $('pop-h').textContent=vc?'Aap ka voucher tayyar hai':'Free '+rs(V.amount)+' voucher';$('pop-p').textContent='Pehle order par '+rs(V.amount)+' off, '+rs(V.minOrder)+' ya zyada ke order par. Bag mein khud lag jayega.';
 var code=$('pop-code'),go=$('pop-go');function show(){code.hidden=false;code.textContent=V.code;go.textContent='Shopping shuru karein';go.onclick=function(){p.hidden=true}}
 if(vc)show();else go.onclick=function(){vc=V.code;L.set('voucher',vc);show();draw()};p.hidden=false}
if(V&&!vc&&!L.get('pop',0))setTimeout(function(){if($('bag').hidden)pop()},9000);

// recently viewed
T.seen=function(it){var a=L.get('rv',[]).filter(function(x){return x.sku!==it.sku});a.unshift(it);L.set('rv',a.slice(0,8))};
var rv=$('rv');if(rv){var a=L.get('rv',[]);if(a.length){rv.hidden=false;rv.querySelector('.rv-row').innerHTML=a.map(function(it){return '<a href="p/'+esc(it.sku)+'.html">'+(it.i?'<img src="'+esc(it.i)+'" alt="" loading="lazy">':'')+'<b>'+esc(it.b)+'</b><span>'+esc(it.n)+'</span></a>'}).join('')}}
draw()})();
