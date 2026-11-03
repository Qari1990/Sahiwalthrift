/**
 * ABCThrift store backend (Google Apps Script, free): website orders, order tracking,
 * email notifications, newsletter sign-ups and make-an-offer.
 *
 * Setup: create a Google Sheet, Extensions > Apps Script, paste this file, run `setup` once,
 * then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Put the web app URL in site.json as "apiUrl".
 *
 *   Orders       one row per website order. Change "status" (Confirmed, Dispatched, Delivered,
 *                Cancelled) and fill "tracking"; the customer gets an email for each change.
 *
 * Sheets it creates:
 *   Offers  one row per offer. To counter, type an amount in the "counter" column.
 *           To accept an offer straight away, set its status to "won".
 *   Items   one row per item that got an offer. "reserve" is your hidden lowest price
 *           (default 75% of the listed price); set "state" to "sold" when it sells elsewhere.
 */
const SITE = "https://qari1990.github.io/Sahiwalthrift";  // change to https://abcthrift.store when the domain is back
const SITES = [SITE, "https://abcthrift.store", "https://qari1990.github.io/Sahiwalthrift"];
const STORE = "ABCThrift";
const WHATSAPP = "923114139007";
const MIN_PCT = 0.6;       // offers below 60% of the price are refused
const RESERVE_PCT = 0.75;  // a 48-hour winner must reach this unless you change "reserve"
const WINDOW_H = 48;       // bidding window, counted from the first offer
const COUNTER_H = 24;      // a counter offer is valid this long
const STEP = 50;           // a new offer must beat the highest by at least this much

const OFFER_COLS = ["at", "sku", "name", "phone", "amount", "status", "counter", "counterAt", "note"];
const ITEM_COLS = ["sku", "title", "price", "reserve", "firstAt", "endsAt", "state", "winnerPhone", "winnerAmount"];
const ORDER_COLS = ["at", "no", "status", "name", "phone", "email", "city", "address", "note", "items", "subtotal", "discount", "delivery", "total", "tracking", "updated"];
const SUB_COLS = ["at", "email", "phone"];

function setup() {
  const ss = SpreadsheetApp.getActive();
  [["Offers", OFFER_COLS], ["Items", ITEM_COLS], ["Orders", ORDER_COLS], ["Subscribers", SUB_COLS]].forEach(([n, cols]) => {
    const sh = ss.getSheetByName(n) || ss.insertSheet(n);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight("bold");
    sh.setFrozenRows(1);
  });
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("closeExpired").timeBased().everyHours(1).create();
  ScriptApp.newTrigger("onSheetEdit").forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger("onOrderEdit").forSpreadsheet(ss).onEdit().create();
}

/* ---------- web endpoints ---------- */
function doGet(e) { return handle(e.parameter || {}); }
function doPost(e) { let b = {}; try { b = JSON.parse(e.postData.contents); } catch (x) {} return handle(b); }

function handle(p) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    closeExpired();
    const out = ({ state: () => state(p.sku), all: allStates, offer: () => makeOffer(p), mine: () => mine(p.sku, p.phone), accept: () => acceptCounter(p.sku, p.phone), order: () => placeOrder(p), track: () => track(p.no, p.phone), subscribe: () => subscribe(p) }[p.a] || (() => ({ error: "unknown action" })))();
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: String(err.message || err) })).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}

/* ---------- data helpers ---------- */
function sheet(n) { return SpreadsheetApp.getActive().getSheetByName(n); }
function rows(n, cols) {
  const v = sheet(n).getDataRange().getValues(); v.shift();
  return v.map((r, i) => { const o = { _row: i + 2 }; cols.forEach((c, j) => (o[c] = r[j])); return o; });
}
function put(n, cols, o) { sheet(n).getRange(o._row, 1, 1, cols.length).setValues([cols.map((c) => o[c] === undefined ? "" : o[c])]); }
function add(n, cols, o) { sheet(n).appendRow(cols.map((c) => o[c] === undefined ? "" : o[c])); }
const offers = () => rows("Offers", OFFER_COLS);
const items = () => rows("Items", ITEM_COLS);
const cleanPhone = (p) => { let d = String(p || "").replace(/\D/g, ""); if (d.startsWith("92")) d = "0" + d.slice(2); return /^03\d{9}$/.test(d) ? d : ""; };
const mask = (p) => String(p).slice(0, 4) + "•••" + String(p).slice(-3);
const ms = (d) => (d instanceof Date ? d.getTime() : d ? new Date(d).getTime() : 0);

function catalog() {
  const c = CacheService.getScriptCache(); const hit = c.get("catalog");
  if (hit) return JSON.parse(hit);
  let list = [];
  for (const s of SITES) { try { const r = UrlFetchApp.fetch(s + "/items.json", { muteHttpExceptions: true }); if (r.getResponseCode() === 200) { list = JSON.parse(r.getContentText()); break; } } catch (e) {} }
  const map = {}; list.forEach((i) => (map[i.sku] = i));
  c.put("catalog", JSON.stringify(map), 600);
  return map;
}

function itemRow(sku, create) {
  let it = items().find((i) => i.sku === sku);
  if (!it && create) {
    const c = catalog()[sku]; if (!c) return null;
    add("Items", ITEM_COLS, { sku, title: c.title, price: c.price, reserve: Math.round(c.price * RESERVE_PCT), state: "open" });
    it = items().find((i) => i.sku === sku);
  }
  return it;
}

/* ---------- public state ---------- */
function state(sku) {
  const c = catalog()[sku]; if (!c) return { error: "Item not found" };
  const it = itemRow(sku, false);
  const live = offers().filter((o) => o.sku === sku && ["new", "countered", "won"].includes(o.status));
  const top = live.reduce((m, o) => Math.max(m, +o.amount || 0), 0);
  const st = c.status === "Sold" || (it && it.state === "sold") ? "sold" : it && it.state === "won" ? "won" : "open";
  return { sku, price: c.price, minOffer: Math.ceil(c.price * MIN_PCT / 50) * 50, highest: top, count: live.length,
    endsAt: it && it.endsAt ? ms(it.endsAt) : 0, state: st, step: STEP, windowH: WINDOW_H };
}
function allStates() {
  const out = {};
  offers().forEach((o) => { if (["new", "countered", "won"].includes(o.status)) { const s = out[o.sku] || (out[o.sku] = { highest: 0, count: 0 }); s.highest = Math.max(s.highest, +o.amount || 0); s.count++; } });
  items().forEach((i) => { if (out[i.sku]) { out[i.sku].endsAt = ms(i.endsAt); out[i.sku].state = i.state; } });
  return out;
}

/* ---------- actions ---------- */
function makeOffer(p) {
  const c = catalog()[p.sku]; if (!c) return { error: "Item not found" };
  const name = String(p.name || "").trim().slice(0, 40), phone = cleanPhone(p.phone), amount = Math.round(+p.amount || 0);
  if (!name) return { error: "Please enter your name" };
  if (!phone) return { error: "Sahi WhatsApp number likhein (03xx xxxxxxx)" };
  const s = state(p.sku);
  if (s.state !== "open") return { error: s.state === "sold" ? "This item has been sold" : "Offers are closed for this item" };
  if (amount >= c.price) return { error: "That's the full price. Just tap 'Buy now' and it's yours." };
  if (amount < s.minOffer) return { error: `The minimum offer is Rs ${s.minOffer}` };
  if (s.highest && amount < s.highest + STEP) return { error: `The highest offer is Rs ${s.highest}. Please offer at least Rs ${s.highest + STEP}.` };
  const mineOld = offers().filter((o) => o.sku === p.sku && o.phone == phone && ["new", "countered"].includes(o.status));
  mineOld.forEach((o) => { o.status = "replaced"; put("Offers", OFFER_COLS, o); });
  const it = itemRow(p.sku, true); const now = new Date();
  if (!it.firstAt) { it.firstAt = now; it.endsAt = new Date(now.getTime() + WINDOW_H * 3600e3); put("Items", ITEM_COLS, it); }
  add("Offers", OFFER_COLS, { at: now, sku: p.sku, name, phone, amount, status: "new" });
  notify(`Nayi offer: ${c.title} (${p.sku})`, `${name} (${phone}) ne Rs ${amount} offer kiye. Listed price Rs ${c.price}.\nCounter dene ke liye Offers sheet mein "counter" column mein amount likhein.\nWhatsApp: https://wa.me/92${phone.slice(1)}`);
  return Object.assign(state(p.sku), { ok: true, message: `Offer received: Rs ${amount}. The highest offer after ${WINDOW_H} hours wins the item, unless someone buys it at full price first.` });
}

function mine(sku, phone) {
  phone = cleanPhone(phone); if (!phone) return { error: "Sahi WhatsApp number likhein" };
  const o = offers().filter((x) => x.sku === sku && x.phone == phone && x.status !== "replaced").pop();
  if (!o) return { none: true };
  const counterLive = o.status === "countered" && ms(o.counterAt) + COUNTER_H * 3600e3 > Date.now();
  return { amount: +o.amount, status: o.status === "countered" && !counterLive ? "lost" : o.status, counter: counterLive ? +o.counter : 0,
    counterEnds: counterLive ? ms(o.counterAt) + COUNTER_H * 3600e3 : 0 };
}

function acceptCounter(sku, phone) {
  phone = cleanPhone(phone);
  const o = offers().filter((x) => x.sku === sku && x.phone == phone && x.status === "countered").pop();
  if (!o || ms(o.counterAt) + COUNTER_H * 3600e3 < Date.now()) return { error: "This counter offer has expired" };
  if (state(sku).state !== "open") return { error: "This item is no longer available" };
  o.amount = +o.counter; o.status = "won"; put("Offers", OFFER_COLS, o);
  win(sku, o);
  return { ok: true, status: "won", amount: o.amount };
}

function win(sku, o) {
  const it = itemRow(sku, true); it.state = "won"; it.winnerPhone = o.phone; it.winnerAmount = o.amount; put("Items", ITEM_COLS, it);
  offers().forEach((x) => { if (x.sku === sku && x._row !== o._row && ["new", "countered"].includes(x.status)) { x.status = "lost"; put("Offers", OFFER_COLS, x); } });
  notify(`Deal final: ${it.title} (${sku}) Rs ${o.amount}`, `${o.name} (${o.phone}) ki offer final hui: Rs ${o.amount}.\nWhatsApp par address confirm karein: https://wa.me/92${String(o.phone).slice(1)}\nTool mein item ko Reserved / Sold kar dein.`);
}

/* ---------- 48-hour close (hourly trigger + every request) ---------- */
function closeExpired() {
  const now = Date.now();
  items().forEach((it) => {
    if (it.state !== "open" || !it.endsAt || ms(it.endsAt) > now) return;
    const c = catalog()[it.sku];
    if (c && c.status === "Sold") { it.state = "sold"; put("Items", ITEM_COLS, it); return; }
    const best = offers().filter((o) => o.sku === it.sku && o.status === "new").sort((a, b) => b.amount - a.amount)[0];
    if (best && +best.amount >= +it.reserve) { best.status = "won"; put("Offers", OFFER_COLS, best); win(it.sku, best); }
    else {
      it.state = "closed"; put("Items", ITEM_COLS, it);
      notify(`Offers band: ${it.title} (${it.sku})`, best ? `Sab se oonchi offer Rs ${best.amount} reserve Rs ${it.reserve} se kam thi. Chahein to Offers sheet mein us par counter dein, ya Items sheet mein state "open" kar ke endsAt barha dein.` : "Koi offer nahi aayi.");
    }
  });
}

/* ---------- owner edits in the sheet ---------- */
function onSheetEdit(e) {
  const sh = e.range.getSheet(); if (sh.getName() !== "Offers" || e.range.getRow() < 2) return;
  const col = OFFER_COLS[e.range.getColumn() - 1]; const o = rows("Offers", OFFER_COLS).find((x) => x._row === e.range.getRow()); if (!o) return;
  if (col === "counter" && +o.counter > 0) { o.status = "countered"; o.counterAt = new Date(); put("Offers", OFFER_COLS, o);
    o.note = `https://wa.me/92${String(o.phone).slice(1)}?text=` + encodeURIComponent(`Hi ${o.name}! Thanks for your offer of Rs ${o.amount} on ${o.sku}. Our counter offer is Rs ${o.counter}, valid for ${COUNTER_H} hours. To accept: ${SITE}/p/${o.sku}.html`); put("Offers", OFFER_COLS, o); }
  if (col === "status" && o.status === "won") win(o.sku, o);
}

/* ---------- website orders ---------- */
const orders = () => rows("Orders", ORDER_COLS);
const rs = (n) => "Rs " + Math.round(+n || 0).toLocaleString("en-US");
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());

function placeOrder(p) {
  const name = String(p.name || "").trim().slice(0, 60), phone = cleanPhone(p.phone), email = validEmail(p.email) ? String(p.email).trim() : "";
  const city = String(p.city || "").trim().slice(0, 40), address = String(p.address || "").trim().slice(0, 300), note = String(p.note || "").trim().slice(0, 140);
  if (!name || !city || address.length < 8) return { error: "Please enter your name, city and full address" };
  if (!phone) return { error: "Sahi mobile number likhein (03xx xxxxxxx)" };
  const cat = catalog(), list = (p.items || []).slice(0, 20);
  if (!list.length) return { error: "Your bag is empty" };
  const gone = list.filter((i) => !cat[i.sku] || cat[i.sku].status === "Sold" || orders().some((o) => !/cancel/i.test(o.status) && String(o.items).indexOf("[" + i.sku + "]") > -1));
  if (gone.length) return { error: "Sorry, already sold: " + gone.map((i) => i.sku).join(", ") + ". We removed it from your bag; please place the order again.", gone: gone.map((i) => i.sku) };
  const d = Utilities.formatDate(new Date(), "Asia/Karachi", "yyMMdd");
  const no = "AT-" + d + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  const lines = list.map((i) => `${i.b || ""} ${i.n || ""}${i.s ? " (size " + i.s + ")" : ""} [${i.sku}] ${rs(i.price)}`);
  const o = { at: new Date(), no, status: "New", name, phone, email, city, address, note, items: lines.join("\n"), subtotal: +p.subtotal || 0, discount: +p.discount || 0, delivery: +p.delivery || 0, total: +p.total || 0, updated: new Date() };
  add("Orders", ORDER_COLS, o);
  const wa = `https://wa.me/92${phone.slice(1)}?text=` + encodeURIComponent(`Hi ${name}! ${STORE} here. We received your order ${no} (${rs(o.total)}). Please reply "Yes" to confirm.`);
  notify(`Naya order ${no}: ${rs(o.total)} (${city})`, `${name}\n${phone}${email ? "\n" + email : ""}\n${city}\n${address}${note ? "\nNote: " + note : ""}\n\n${o.items}\n\nSubtotal ${rs(o.subtotal)}\nDiscount -${rs(o.discount)}\nDelivery ${rs(o.delivery)}\nTotal ${rs(o.total)} (COD)\n\nCustomer ko confirm karein: ${wa}\nStatus badalne ke liye Orders sheet mein "status" column badlein.`);
  if (email) mailCustomer(o, "Order received", `Thank you, ${name}! We have received your order and will confirm it soon by WhatsApp or call.`);
  return { ok: true, no, total: o.total };
}

function track(no, phone) {
  no = String(no || "").trim().toUpperCase(); phone = cleanPhone(phone);
  const o = orders().find((x) => String(x.no).toUpperCase() === no);
  if (!o || (phone && String(o.phone).replace(/\D/g, "").slice(-10) !== phone.slice(-10))) return { error: "Order not found. Please check the order number and phone." };
  return { no: o.no, status: o.status, tracking: o.tracking, total: +o.total, items: String(o.items).split("\n").length, at: ms(o.at), updated: ms(o.updated) };
}

function subscribe(p) {
  const email = validEmail(p.email) ? String(p.email).trim() : "", phone = cleanPhone(p.phone);
  if (!email && !phone) return { error: "Email ya WhatsApp number likhein" };
  add("Subscribers", SUB_COLS, { at: new Date(), email, phone });
  return { ok: true, message: "Thanks! You'll hear about new drops and offers first." };
}

const STATUS_TEXT = {
  confirmed: "Your order is confirmed. We will dispatch it within 24 hours.",
  dispatched: "Your parcel is on its way.",
  delivered: "Your parcel has been delivered. Thank you for shopping with us! If anything is wrong, message us on WhatsApp within 7 days.",
  cancelled: "Your order has been cancelled. If you have any questions, message us on WhatsApp.",
};

function mailCustomer(o, title, msg) {
  if (!validEmail(o.email)) return;
  const items = String(o.items).split("\n").map((l) => `<li>${l}</li>`).join("");
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#15201d">
<h2 style="margin:0 0 4px">${STORE}</h2><p style="color:#66706c;margin:0 0 16px">${title}</p>
<p>${msg}</p><p><b>Order ${o.no}</b> · ${o.status}</p><ul>${items}</ul>
<p>Total <b>${rs(o.total)}</b> (cash on delivery)${o.tracking ? `<br>Tracking: <b>${o.tracking}</b>` : ""}</p>
<p><a href="${SITE}/track.html?o=${encodeURIComponent(o.no)}" style="background:#15201d;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Track order</a>
&nbsp; <a href="https://wa.me/${WHATSAPP}" style="color:#1f8f4e">WhatsApp us</a></p>
<p style="color:#66706c;font-size:12px">${SITE} · 7-day returns · Cash on delivery all over Pakistan</p></div>`;
  try { MailApp.sendEmail({ to: o.email, subject: `${STORE} order ${o.no}: ${title}`, htmlBody: html, name: STORE }); } catch (e) {}
}

function onOrderEdit(e) {
  const sh = e.range.getSheet(); if (sh.getName() !== "Orders" || e.range.getRow() < 2) return;
  const col = ORDER_COLS[e.range.getColumn() - 1]; if (col !== "status" && col !== "tracking") return;
  const o = orders().find((x) => x._row === e.range.getRow()); if (!o) return;
  o.updated = new Date(); put("Orders", ORDER_COLS, o);
  const k = String(o.status).toLowerCase();
  if (col === "status" && STATUS_TEXT[k]) mailCustomer(o, "Order " + o.status, STATUS_TEXT[k]);
  if (col === "tracking" && o.tracking) mailCustomer(o, "Tracking number", "Here is the tracking number for your parcel.");
}

function notify(subject, body) { try { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), subject, body); } catch (e) {} }
