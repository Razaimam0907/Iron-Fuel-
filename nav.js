/* ============ SEARCH + HAMBURGER MENU ============ */
let sIdx = -1, sList = [], sq = { q: "", res: [], sort: "rel", cat: "All" };
const POPULAR = ["Whey protein", "Creatine", "BCAA", "Pre-workout", "Oats", "Peanut butter"];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
const stem = t => t.length > 3 ? t.replace(/s$/, "") : t;

/* ---------- search engine ---------- */
function lev(a, b) {
  const m = a.length, n = b.length; if (Math.abs(m - n) > 2) return 9;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function searchP(q) {
  const toks = norm(q).split(/\s+/).filter(Boolean).map(stem);
  if (!toks.length) return [];
  const hay = x => norm([x.n, x.c, x.flavs.join(" "), x.kw || ""].join(" "));
  let res = P.map(x => {
    const h = hay(x), n = norm(x.n);
    if (!toks.every(t => h.includes(t))) return null;
    return { x, s: toks.reduce((a, t) => a + (n.startsWith(t) ? 3 : n.includes(t) ? 2 : 1), 0) };
  }).filter(Boolean);
  if (!res.length) {                       /* typo tolerance: "protien", "creatin" */
    res = P.map(x => {
      const words = hay(x).split(/\s+/).map(stem);
      const ok = toks.every(t => words.some(w => w.includes(t) || (t.length >= 4 && lev(t, w) <= 2)));
      return ok ? { x, s: 0 } : null;
    }).filter(Boolean);
  }
  return res.sort((a, b) => b.s - a.s || a.x.id - b.x.id).map(o => o.x);
}

/* ---------- live dropdown ---------- */
function thumb(x) { return `<span class="th">${pic(x)}</span>`; }
function closeS() { $("sres").classList.remove("on"); sIdx = -1; }
function qInput() {
  const v = $("q").value.trim(), box = $("sres");
  $("qc2").style.display = v ? "block" : "none";
  sList = v ? searchP(v).slice(0, 6) : []; sIdx = -1;
  if (!v) {
    box.innerHTML = `<div class="sg2">POPULAR SEARCHES</div><div style="padding:0 12px 12px">${POPULAR.map(p => `<span class="chip" onclick="runQ('${p}')">${p}</span>`).join("")}</div>`;
  } else if (!sList.length) {
    box.innerHTML = `<div class="sg2">NO PRODUCTS FOUND FOR “${esc(v)}”</div><div style="padding:0 12px 12px;color:var(--mu);font-size:13px">Try another word, or browse:<br>${["Protein", "Creatine", "Pre-Workout", "Vitamins", "Foods"].map(c => `<span class="chip" onclick="runQ('${c}')">${c}</span>`).join("")}</div>`;
  } else {
    box.innerHTML = sList.map((x, i) => `<button type="button" class="sr" data-i="${i}" onclick="go(${x.id});closeS()">${thumb(x)}<span><b>${esc(x.n)}</b><small>${x.c} · ${x.size}</small></span><em>${money(x.p)}</em></button>`).join("")
      + `<button type="button" class="sr all" onclick="doSearch()">See all results for “${esc(v)}” →</button>`;
  }
  box.classList.add("on");
}
function runQ(t) { $("q").value = t; doSearch(); }
function doSearch(e) {
  if (e && e.preventDefault) e.preventDefault();
  const v = $("q").value.trim(); if (!v) { $("q").focus(); return false; }
  closeS(); $("sbox").classList.remove("sopen"); $("q").blur();
  location.hash = "#/search/" + encodeURIComponent(v); return false;
}
function clearQ() { $("q").value = ""; qInput(); $("q").focus(); }
function toggleS() { const b = $("sbox"); b.classList.toggle("sopen"); if (b.classList.contains("sopen")) { $("q").focus(); } else closeS(); }
function hl() { document.querySelectorAll("#sres .sr[data-i]").forEach(e => e.classList.toggle("hl", +e.dataset.i === sIdx)); }

/* ---------- results page ---------- */
function renderSearch(q) {
  $("q").value = q; $("qc2").style.display = q ? "block" : "none";
  sq = { q, res: searchP(q), sort: "rel", cat: "All" };
  document.title = `“${q}” | IRONFUEL Search`;
  drawSearch(); anim();
}
function drawSearch() {
  const { q, res } = sq, cats = ["All", ...new Set(res.map(x => x.c))];
  $("srp").innerHTML = `<div class="wrap pd"><nav class="crumb"><a href="#/">Home</a> / Search</nav>
    <h2>RESULTS FOR <span>“${esc(q)}”</span></h2><p class="sub">${res.length} product${res.length == 1 ? "" : "s"} found</p>
    ${res.length ? `<div class="sf"><div class="tabs" style="margin:0">${cats.map(c => `<button class="${c == sq.cat ? "on" : ""}" onclick="sq.cat='${c}';drawSearch()">${c}</button>`).join("")}</div>
      <label>Sort by<select onchange="sq.sort=this.value;drawSearch()"><option value="rel">Relevance</option><option value="pa" ${sq.sort == "pa" ? "selected" : ""}>Price: low to high</option><option value="pd" ${sq.sort == "pd" ? "selected" : ""}>Price: high to low</option><option value="r" ${sq.sort == "r" ? "selected" : ""}>Rating</option></select></label></div>
      <div class="grid" id="sgrid">${sorted().map(cardHTML).join("")}</div>`
      : `<div class="panel" style="text-align:center;padding:50px 20px"><h3 style="font-size:34px">NOTHING FOUND</h3><p class="sub">We couldn't find anything for “${esc(q)}”. Try a different word or browse a category.</p>
        ${["Protein", "Creatine", "Pre-Workout", "Vitamins", "Foods"].map(c => `<span class="chip" onclick="runQ('${c}')">${c}</span>`).join("")}<br><br><a class="btn" href="#shop">Browse all products</a></div>`}</div>`;
  anim();
}
function sorted() {
  let r = sq.res.filter(x => sq.cat == "All" || x.c == sq.cat);
  if (sq.sort == "pa") r = [...r].sort((a, b) => a.p - b.p);
  if (sq.sort == "pd") r = [...r].sort((a, b) => b.p - a.p);
  if (sq.sort == "r") r = [...r].sort((a, b) => b.rating - a.rating);
  return r;
}

/* ---------- hamburger menu ---------- */
function menu(v) {
  $("side").classList.toggle("on", !!v); $("mo").classList.toggle("on", !!v);
  $("hb").setAttribute("aria-expanded", !!v); $("side").setAttribute("aria-hidden", !v);
  if (typeof L !== "undefined" && L) v ? L.stop() : L.start();
  document.body.style.overflow = v ? "hidden" : "";
}
function setCat(c) { cat = c; tabs(); }

function initNav() {
  const q = $("q");
  q.addEventListener("input", qInput);
  q.addEventListener("focus", qInput);
  q.addEventListener("keydown", e => {
    const n = sList.length;
    if (e.key === "ArrowDown" && n) { e.preventDefault(); sIdx = (sIdx + 1) % n; hl(); }
    else if (e.key === "ArrowUp" && n) { e.preventDefault(); sIdx = (sIdx - 1 + n) % n; hl(); }
    else if (e.key === "Enter" && sIdx >= 0) { e.preventDefault(); const x = sList[sIdx]; closeS(); q.blur(); go(x.id); }
    else if (e.key === "Escape") { closeS(); q.blur(); }
  });
  document.addEventListener("click", e => { if (!e.target.closest("#sbox") && !e.target.closest(".si")) closeS(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") menu(0);
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); if (innerWidth < 760) toggleS(); else q.focus(); }
  });
}
