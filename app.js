/* ============ IRONFUEL APP: router, store, cart, checkout ============ */
const $ = id => document.getElementById(id);
const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
let cart = [], cat = "All", gift = false;

/* ---------- product cards ---------- */
function pic(x) {
  return x.im ? `<img src="${IMG[x.im]}" alt="${x.n}" loading="lazy">`
    : `<div class="tub" style="background:linear-gradient(90deg,${x.col},#fff3 45%,${x.col})"><em>${x.t}</em></div>`;
}
function cardHTML(x) {
  const off = Math.round(100 - x.p / x.o * 100);
  return `<div class="card" onclick="go(${x.id})" tabindex="0" onkeydown="if(event.key==='Enter')go(${x.id})">
    <div class="pic">${pic(x)}</div><h3>${x.n}</h3><small>${x.c} · ${x.size} · ${x.flavs[0]}</small>
    <div class="pr"><b>${money(x.p)}</b><s>${money(x.o)}</s><span>${off}% off</span></div>
    <button class="btn o" onclick="event.stopPropagation();add(${x.id})">Add to Cart</button>
    <button class="btn" onclick="event.stopPropagation();buy(${x.id})">Buy Now</button></div>`;
}
const cats = ["All", ...new Set(P.map(x => x.c))];
function tabs() {
  $("tabs").innerHTML = cats.map(c => `<button class="${c == cat ? "on" : ""}" onclick="cat='${c}';tabs()">${c}</button>`).join("");
  $("pg").innerHTML = P.filter(x => cat == "All" || x.c == cat).map(cardHTML).join("");
  window.anim && setTimeout(anim, 0);
}

/* ---------- cart ---------- */
function addToCart(id, si, fi, q) {
  const x = P[id], [p, o] = price(x, si), size = szOf(x)[si][0], flav = x.flavs[fi];
  const ex = cart.find(c => c.id == id && c.size == size && c.flav == flav);
  if (ex) ex.qty += q; else cart.push({ id, n: x.n, p, o, size, flav, qty: q });
  upd();
}
const add = id => { addToCart(id, 1, 0, 1); cartOpen(1); };
const buy = id => { addToCart(id, 1, 0, 1); checkout(); };
function totals() {
  const mrp = cart.reduce((a, x) => a + x.o * x.qty, 0), pay = cart.reduce((a, x) => a + x.p * x.qty, 0);
  const del = pay && pay < 999 ? 49 : 0;
  return { mrp, disc: mrp - pay, del, total: pay + del, pay };
}
function chg(i, d) { cart[i].qty += d; if (cart[i].qty < 1) cart.splice(i, 1); upd(); }
function upd() {
  $("cc").textContent = cart.reduce((a, x) => a + x.qty, 0);
  $("ci").innerHTML = cart.length ? cart.map((x, i) => `<div class="ci"><div><b>${x.n}</b><small class="mu" style="display:block">${x.size} · ${x.flav}</small>
    <div class="qty sm"><button onclick="chg(${i},-1)">−</button><span>${x.qty}</span><button onclick="chg(${i},1)">+</button></div></div><span>${money(x.p * x.qty)}</span></div>`).join("")
    : '<p style="color:var(--mu);margin-top:20px">Your cart is empty.</p>';
  const t = totals();
  $("ct").innerHTML = cart.length ? `<div class="os"><div><span>Item total (MRP)</span><span>${money(t.mrp)}</span></div><div class="g"><span>Discount</span><span>− ${money(t.disc)}</span></div>
    <div><span>Delivery fee</span><span>${t.del ? money(t.del) : "FREE"}</span></div><div class="tot"><span>To pay</span><span>${money(t.total)}</span></div></div>` : "";
}
function cartOpen(v) { $("dr").classList.toggle("on", !!v); }

/* ---------- modal + one-time gift ---------- */
function closeM() {
  if (gift && !confirm("Your one-time gift will close and can't be reopened until your next order. Download your plan first if you need it. Close anyway?")) return;
  gift = false; $("ov").classList.remove("on");
}
const gt = a => `<div class="tabs"><button class="${a ? "on" : ""}" onclick="renderCalc()">Calorie Calculator</button><button class="${a ? "" : "on"}" onclick="profile()">BMI &amp; Diet Plan</button></div>`;
function checkout() {
  if (!cart.length) return; cartOpen(0); $("ov").classList.add("on");
  const t = totals().total;
  $("mb").innerHTML = `<h2>SECURE <span>CHECKOUT</span></h2><p class="sub">Demo checkout: no real payment is taken.</p>
  <div class="form"><label>Full name<input id="k_n"></label><label>Email<input id="k_e" type="email"></label>
  <label>Payment method<select id="k_m"><option>UPI</option><option>Credit / Debit card</option><option>Net banking</option></select></label></div>
  <div class="ci"><span>${cart.reduce((a, x) => a + x.qty, 0)} item(s)</span><b>${money(t)}</b></div><p id="ke" style="color:#f87171"></p>
  <button class="btn" style="margin-top:10px" onclick="pay()">Pay ${money(t)}</button>
  <p class="sub" style="margin-top:14px">🎁 Complete payment to unlock your free one-time wellness gift.</p>`;
}
function pay() {
  const n = $("k_n").value.trim(), e = $("k_e").value.trim();
  if (!n || !/^\S+@\S+\.\S+$/.test(e)) { $("ke").textContent = "Please enter your name and a valid email."; return; }
  $("mb").innerHTML = '<h2>PROCESSING <span>PAYMENT…</span></h2><p class="sub">Please wait.</p>';
  setTimeout(() => {
    cart = []; upd(); gift = true;
    $("mb").innerHTML = `<h2>PAYMENT <span>SUCCESSFUL ✓</span></h2><p class="sub">Thank you, ${n.split(" ")[0].replace(/</g, "&lt;")}! Order #IF${Date.now().toString().slice(-6)} is confirmed. A receipt will be sent to ${e.replace(/</g, "&lt;")}.</p>
    <div class="gift"><h3 style="font-size:32px">🎁 A GIFT FROM US</h3><p style="color:var(--mu);margin:8px 0 16px;line-height:1.6">Because we care about your progress: a free calorie calculator, BMI check and personalised diet plan. It opens once, so download your plan before closing.</p><button class="btn" onclick="renderCalc()">Open my gift</button></div>`;
  }, 1300);
}

/* ---------- router (home / product page / search page) ---------- */
let L = null;
function scrollToHash(h) {
  const el = h && h.length > 1 && !h.startsWith("#/") ? document.querySelector(h) : null;
  if (!el) return;
  if (L) L.scrollTo(el); else el.scrollIntoView({ behavior: "smooth" });
}
const showV = v => ["home", "pdp", "srp"].forEach(k => $(k).hidden = k !== v);
function top0() { window.scrollTo(0, 0); if (L) L.scrollTo(0, { immediate: true }); }
function route() {
  const h = location.hash, m = h.match(/^#\/product\/(\d+)/), q = h.match(/^#\/search\/(.*)/);
  closeS(); menu(0);
  if (m) { showV("pdp"); pdp(+m[1]); top0(); }
  else if (q) { showV("srp"); renderSearch(decodeURIComponent(q[1])); top0(); }
  else {
    const wasOther = $("home").hidden;
    $("q").value = ""; $("qc2").style.display = "none";
    showV("home"); document.title = "IRONFUEL | Premium Gym Supplements"; anim();
    if (wasOther) setTimeout(() => scrollToHash(h), 60);
  }
}
addEventListener("hashchange", route);
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const h = a.getAttribute("href");
  if (h.startsWith("#/") && h !== "#/") return;           /* real page routes: let the browser change the hash */
  e.preventDefault();
  if (h === "#/") { if ($("home").hidden) location.hash = "#/"; else scrollToHash("#top"); return; }
  if ($("home").hidden) location.hash = h; else scrollToHash(h);
});

/* ---------- scroll animations (in and out, both directions) ---------- */
const SEL = "h2,.pill,.sub,.sh p,.eyebrow,.hero h1,.hero p,.hero .row,.stats>div,.hv,.card,.tabs,.arr,.rail>div,.steps div,.gift,.nl form,.nl p,.big,footer .g>div,footer>.wrap>p,.pd .crumb,.pd .gal,.pd .info,.pd .det";
const io = new IntersectionObserver(es => es.forEach(e => {
  const t = e.target;
  if (e.isIntersecting) { t.style.transitionDelay = (t._i % 6 * 70) + "ms"; t.classList.remove("up"); t.classList.add("in"); }
  else { t.style.transitionDelay = "0ms"; t.classList.remove("in"); t.classList.toggle("up", e.boundingClientRect.top < 0); }
}), { threshold: .12 });
window.anim = () => document.querySelectorAll(SEL).forEach(e => {
  if (!e._o && !e.closest("#ov")) { e._o = 1; e._i = [...e.parentNode.children].indexOf(e); e.classList.add("an"); io.observe(e); }
});
function rail(id, d) { $(id).scrollBy({ left: d * 350, behavior: "smooth" }); }

/* ---------- home: hero image + SKU count ---------- */
function initHome() {
  $("hi").src = IMG.creaMicro;
  document.querySelector("#shop .pill").textContent = "ELITE FUEL · " + String(P.length).padStart(2, "0") + " SKUS";
}

/* ---------- init ---------- */
initHome(); initNav();
tabs(); upd(); anim();
try {
  L = new Lenis({ lerp: .09 });
  const raf = t => { L.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
} catch (e) { }
route();
