/* ============ PRODUCT PAGE ============ */
let pv = { id: 0, si: 1, fi: 0, q: 1, view: 0, tab: 0 }, pio = null;
const TABS = ["Details", "Description", "Benefits", "How to Use", "FAQ"];

function go(id) { location.hash = "#/product/" + id; }
function price(x, si) { const m = szOf(x)[si][1]; return [Math.round(x.p * m), Math.round(x.o * m)]; }

function views(x) {
  const nut = `<div class="nutri"><h3>NUTRITION FACTS</h3><small>Typical values per serving</small>${NUT[x.ck||x.c].map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}</div>`;
  const v = [{ thumb: pic(x), stage: pic(x) }];
  if (x.im) v.push({ thumb: `<img src="${IMG[x.im]}" style="transform:scale(2)" alt="">`, stage: `<img src="${IMG[x.im]}" style="transform:scale(1.8);transform-origin:${x.zo||"50% 60%"}" alt="${x.n} label close-up">` });
  v.push({ thumb: `<span class="tn">NUTRITION</span>`, stage: nut });
  return v;
}

function pdp(id) {
  const x = P[id]; if (!x) { location.hash = "#/"; return; }
  pv = { id, si: 1, fi: 0, q: 1, view: 0, tab: 0 };
  document.title = x.n + " | IRONFUEL";
  const rel = P.filter(o => o.id !== id).sort((a, b) => (b.c === x.c) - (a.c === x.c));
  $("pdp").innerHTML = `<div class="wrap pd">
    <nav class="crumb"><a href="#/">Home</a> / <a href="#shop">${x.c}</a> / ${x.n}</nav>
    <div class="pg2"><div class="gal"><div class="stage" id="stage"></div><div class="thumbs" id="th"></div></div><div class="info" id="info"></div></div>
    <div class="det" id="det"></div>
    <div class="rel"><h2>YOU MIGHT <span>ALSO LIKE</span></h2><div class="rail" id="rr">${rel.slice(0, 6).map(cardHTML).join("")}</div></div></div>
    <div class="sbar" id="sbar"></div>`;
  drawGal(); drawInfo(); drawTabs();
  if (pio) pio.disconnect();
  pio = new IntersectionObserver(es => es.forEach(e => $("sbar").classList.toggle("on", !e.isIntersecting && e.boundingClientRect.top < 0)));
  pio.observe($("cta")); anim();
}
function drawGal() {
  const x = P[pv.id], v = views(x);
  $("stage").innerHTML = v[pv.view].stage;
  $("th").innerHTML = v.map((o, i) => `<button class="${i == pv.view ? "on" : ""}" onclick="pv.view=${i};drawGal()" aria-label="View ${i + 1}">${o.thumb}</button>`).join("");
}
function drawInfo() {
  const x = P[pv.id], [p, o] = price(x, pv.si), off = Math.round(100 - p / o * 100), sav = o - p;
  $("info").innerHTML = `<h1>${x.n}</h1>
    <div class="rt"><span class="star">★ ${x.rating}</span> ${x.reviews} ratings · ${x.c} · ${szOf(x)[pv.si][0]}</div>
    <div class="price"><b>${money(p)}</b><s>${money(o)}</s><span>${off}% off</span></div>
    <small class="mu">Inclusive of all taxes. You save ${money(sav)}.</small>
    <h4>Choose size</h4><div class="chips">${szOf(x).map((s, i) => `<button class="${i == pv.si ? "on" : ""}" onclick="pv.si=${i};drawInfo();drawSbar()">${s[0]}</button>`).join("")}</div>
    ${x.flavs.length > 1 ? `<h4>Choose flavour</h4><div class="chips fl">${x.flavs.map((f, i) => `<button class="${i == pv.fi ? "on" : ""}" onclick="pv.fi=${i};drawInfo();drawSbar()"><b>${f}</b></button>`).join("")}</div>` : ""}
    <div class="qrow"><div class="qty"><button onclick="qty(-1)" aria-label="Decrease">−</button><span id="qv">${pv.q}</span><button onclick="qty(1)" aria-label="Increase">+</button></div>
      <div class="cta" id="cta"><button class="btn o" onclick="pAdd()">Add to Cart</button><button class="btn" onclick="pBuy()">Buy Now</button></div></div>
    <div class="dl"><input id="pin" placeholder="Enter pincode" maxlength="6" inputmode="numeric"><button class="btn o" onclick="chkPin()">Check delivery</button></div><p id="pinr" class="mu"></p>
    <ul class="tr"><li>100% authentic, lab tested</li><li>Free shipping above ₹999</li><li>7-day easy returns</li></ul>`;
  drawSbar();
  if (pio) { pio.disconnect(); pio.observe($("cta")); }
}
function drawSbar() {
  const x = P[pv.id], [p, o] = price(x, pv.si);
  $("sbar").innerHTML = `<div class="wrap sb"><div class="sbi"><div class="sbp">${pic(x)}</div><div><b>${x.n}</b><small>${money(p)} <s>${money(o)}</s> · ${szOf(x)[pv.si][0]}</small></div></div>
    <div class="sbb"><button class="btn o" onclick="pAdd()">Add to Cart</button><button class="btn" onclick="pBuy()">Buy Now</button></div></div>`;
}
function qty(d) { pv.q = Math.max(1, Math.min(10, pv.q + d)); $("qv").textContent = pv.q; }
function pAdd() { const x = P[pv.id]; addToCart(x.id, pv.si, pv.fi, pv.q); cartOpen(1); }
function pBuy() { const x = P[pv.id]; addToCart(x.id, pv.si, pv.fi, pv.q); checkout(); }
function chkPin() {
  const v = $("pin").value.trim(), r = $("pinr");
  if (!/^\d{6}$/.test(v)) { r.textContent = "Please enter a valid 6-digit pincode."; r.style.color = "#f87171"; return; }
  const d = new Date(Date.now() + 4 * 864e5);
  r.style.color = "#4ade80"; r.textContent = "Delivery available. Estimated by " + d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + ".";
}
function drawTabs() {
  const x = P[pv.id], c = CONTENT[x.ck||x.c];
  const body = [
    c.details.map(d => `<div class="dt"><b>${d[0]}</b><p>${d[1]}</p></div>`).join(""),
    `<p class="lead">${c.desc}</p>`,
    `<ul class="ls">${c.benefits.map(b => `<li>${b}</li>`).join("")}</ul>`,
    `<ol class="ls">${c.how.map(b => `<li>${b}</li>`).join("")}</ol>`,
    c.faq.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")
  ][pv.tab];
  $("det").innerHTML = `<div class="tabs">${TABS.map((t, i) => `<button class="${i == pv.tab ? "on" : ""}" onclick="pv.tab=${i};drawTabs()">${t}</button>`).join("")}</div><div class="tb">${body}</div>`;
}
