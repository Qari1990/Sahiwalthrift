// Builds public/ from inventory JSON (items/*.json) and photos (assets/<id>.jpg) using the tool's own page generator.
// Usage: node scripts/build-site.js <itemsDir> <assetsDir> [siteUrl]
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
(async () => {
  const [itemsDir, assetsDir, siteUrl = ""] = process.argv.slice(2);
  const items = fs.readdirSync(itemsDir).filter((f) => f.endsWith(".json")).map((f) => { const d = JSON.parse(fs.readFileSync(path.join(itemsDir, f), "utf8")); return d.data || d; });
  const imgs = {}; for (const it of items) for (const id of it.images || []) { const f = path.join(assetsDir, id + ".jpg"); if (fs.existsSync(f)) imgs[id] = fs.readFileSync(f).toString("base64"); }
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto("file://" + path.resolve(__dirname, "tool.html")); await p.addScriptTag({ path: path.resolve(__dirname, "jszip.min.js") }); await p.waitForTimeout(300);
  const files = await p.evaluate(async ({ items, imgs, siteUrl, settings }) => {
    Object.assign(S, settings || {}); S.siteUrl = siteUrl; ITEMS = items;
    fetchBlob = async (u) => { const id = u.split("/").pop(); if (!imgs[id]) throw new Error("missing"); return new Blob([Uint8Array.from(atob(imgs[id]), (c) => c.charCodeAt(0))], { type: "image/jpeg" }); };
    let out; save = async (n, bl) => { out = bl; return true; }; await buildSite();
    const z = await JSZip.loadAsync(out); const r = {};
    for (const [n, f] of Object.entries(z.files)) if (!f.dir) r[n] = await f.async("base64");
    return r;
  }, { items, imgs, siteUrl, settings: fs.existsSync("settings.json") ? JSON.parse(fs.readFileSync("settings.json", "utf8")) : {} });
  fs.rmSync("public", { recursive: true, force: true });
  for (const [n, d] of Object.entries(files)) { const f = path.join("public", n); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, Buffer.from(d, "base64")); }
  console.log(Object.keys(files).length + " files", errs.length ? errs : ""); await b.close();
})();
