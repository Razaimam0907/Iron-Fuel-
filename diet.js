/* ============ CALORIE CALCULATOR, BMI, DIET PLAN, PDF ============ */
const SLOTS = ["Breakfast", "Lunch", "Snack", "Dinner"];
const SHARE = { Breakfast: .25, Lunch: .35, Snack: .12, Dinner: .28 };
const TPL = {
  v: {
    Breakfast: [["Oats (cooked)", 1], ["Banana", 1], ["Peanut butter", 1]],
    Lunch: [["Dal (cooked)", 1], ["Brown rice (cooked)", 1], ["Mixed salad", 1]],
    Snack: [["Whey protein shake", 1], ["Almonds", 1]],
    Dinner: [["Paneer", 1.5], ["Roti", 2], ["Mixed veg curry", 1]]
  },
  nv: {
    Breakfast: [["Boiled egg", 3], ["Whole wheat bread", 2], ["Banana", 1]],
    Lunch: [["Chicken breast (grilled)", 1.5], ["Brown rice (cooked)", 1], ["Mixed salad", 1]],
    Snack: [["Boiled egg", 2], ["Almonds", 1]],
    Dinner: [["Grilled fish", 1.5], ["Roti", 2], ["Mixed salad", 1]]
  }
};
let U = null, plan = {};

const food = n => FOODS.find(f => f.n === n);
const bmr = (g, a, w, h) => 10 * w + 6.25 * h - 5 * a + (g == "m" ? 5 : -161);
const bmiCat = b => b < 18.5 ? ["Underweight", "#60a5fa"] : b < 25 ? ["Normal", "#4ade80"] : b < 30 ? ["Overweight", "#fbbf24"] : ["Obese", "#f87171"];
const goalName = () => U.goal < 0 ? "Fat loss" : U.goal > 0 ? "Muscle gain" : "Maintenance";

/* ---------- calorie calculator ---------- */
function renderCalc() {
  if (!gift) return;
  $("mb").innerHTML = gt(1) + `<h2>CALORIE <span>CALCULATOR</span></h2><p class="sub">Know what your body needs (Mifflin-St Jeor).</p>
  <div class="form">
    <label>Gender<select id="c_g"><option value="m">Male</option><option value="f">Female</option></select></label>
    <label>Age<input id="c_a" type="number" value="22"></label>
    <label>Weight (kg)<input id="c_w" type="number" value="70"></label>
    <label>Height (cm)<input id="c_h" type="number" value="172"></label>
    <label>Activity<select id="c_x"><option value="1.2">Sedentary</option><option value="1.375">Light (1-3 d/wk)</option><option value="1.55" selected>Moderate (3-5 d/wk)</option><option value="1.725">Heavy (6-7 d/wk)</option></select></label>
    <label>Goal<select id="c_t"><option value="-400">Fat loss</option><option value="0">Maintain</option><option value="400" selected>Muscle gain</option></select></label>
  </div>
  <button class="btn" style="margin-top:16px" onclick="calc()">Calculate</button><div class="res" id="cr"></div>`;
  calc();
}
function calc() {
  const g = $("c_g").value, a = +$("c_a").value, w = +$("c_w").value, h = +$("c_h").value;
  if (!(a > 0 && w > 0 && h > 0)) { $("cr").innerHTML = "<small>Please enter valid numbers.</small>"; return; }
  const b = bmr(g, a, w, h), t = b * +$("c_x").value, goal = t + +$("c_t").value;
  $("cr").innerHTML = [["BMR", b], ["Maintenance", t], ["Daily Target", goal], ["Protein (g)", w * 2], ["Fats (g)", goal * .25 / 9], ["Carbs (g)", (goal - w * 8 - goal * .25) / 4]]
    .map(([k, v]) => `<div><b>${Math.round(v)}</b><small>${k}</small></div>`).join("");
}

/* ---------- profile form ---------- */
function profile() {
  if (!gift) return;
  $("mb").innerHTML = `${gt(0)}<h2>YOUR <span>PROFILE</span></h2><p class="sub">Your free gift: tell us about yourself and we will build your plan.</p>
  <div class="form">
    <label>Age<input id="p_a" type="number" value="22"></label>
    <label>Weight (kg)<input id="p_w" type="number" value="70"></label>
    <label>Height (cm)<input id="p_h" type="number" value="172"></label>
    <label>Gender<select id="p_g"><option value="m">Male</option><option value="f">Female</option></select></label>
    <label>Diet<select id="p_d"><option value="v">Vegetarian</option><option value="nv">Non-vegetarian</option></select></label>
    <label>Goal<select id="p_t"><option value="-400">Fat loss</option><option value="0">Maintain</option><option value="400" selected>Muscle gain</option></select></label>
    <label>Activity<select id="p_x"><option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55" selected>Moderate</option><option value="1.725">Heavy</option></select></label>
  </div>
  <p id="pe" style="color:#f87171;margin-top:10px"></p><button class="btn" style="margin-top:14px" onclick="gen()">Generate My Plan</button>`;
}
function gen() {
  const a = +$("p_a").value, w = +$("p_w").value, h = +$("p_h").value;
  if (!(a >= 10 && a <= 90 && w >= 25 && w <= 250 && h >= 100 && h <= 250)) {
    $("pe").textContent = "Please enter realistic age (10-90), weight (25-250 kg) and height (100-250 cm)."; return;
  }
  const g = $("p_g").value, t = bmr(g, a, w, h) * +$("p_x").value + +$("p_t").value;
  U = { a, w, h, g, diet: $("p_d").value, goal: +$("p_t").value, kcal: Math.round(t), bmi: w / ((h / 100) ** 2) };
  buildPlan(); show();
}
function buildPlan() {
  plan = {};
  SLOTS.forEach(s => {
    const base = TPL[U.diet][s].map(([n, q]) => ({ f: food(n), q }));
    const baseK = base.reduce((a, it) => a + it.f.k * it.q, 0);
    const factor = U.kcal * SHARE[s] / baseK;
    plan[s] = base.map(it => ({ f: it.f, q: Math.max(.5, Math.round(it.q * factor * 2) / 2) }));
  });
}

/* ---------- plan view ---------- */
function show() {
  const [bc, col] = bmiCat(U.bmi);
  $("mb").innerHTML = `${gt(0)}<h2>YOUR <span>PLAN</span></h2>
  <p class="sub">${U.diet == "v" ? "Vegetarian" : "Non-vegetarian"} · ${goalName()} · Type any food to add it and see its calories instantly. Change quantities freely.</p>
  <div class="res">
    <div><b style="color:${col}">${U.bmi.toFixed(1)}</b><small>BMI · ${bc}</small></div>
    <div><b>${U.kcal}</b><small>Target kcal</small></div>
    <div><b id="t_k">0</b><small>Plan kcal</small></div>
    <div><b id="t_p">0g</b><small>Protein</small></div>
    <div><b id="t_c">0g</b><small>Carbs</small></div>
    <div><b id="t_f">0g</b><small>Fat</small></div>
  </div>
  <div class="bar"><i id="bar"></i></div>
  ${SLOTS.map(s => `<div class="slot"><h4>${s.toUpperCase()} <span id="sk_${s}"></span></h4>
    <div id="rows_${s}">${rows(s)}</div>
    <div class="addr"><input id="in_${s}" placeholder="Type a food: e.g. 2 eggs, paneer, banana, dal" oninput="sug('${s}')" onkeydown="if(event.key==='Enter')addTop('${s}')" autocomplete="off"><div class="sg" id="sg_${s}"></div></div></div>`).join("")}
  <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn" onclick="dlPdf()">Download PDF</button><button class="btn o" onclick="profile()">Edit Details</button></div>
  <p style="color:var(--mu);font-size:12px;margin-top:14px">General guidance only. Consult a doctor or dietitian for medical conditions. Calorie values are typical averages.</p>`;
  updT();
}
const kc = it => Math.round(it.f.k * it.q);
function rows(s) {
  if (!plan[s].length) return '<p style="color:var(--mu);font-size:13px;padding:10px 0">No food yet. Type below to add.</p>';
  return plan[s].map((it, i) => `<div class="fr"><div><b>${it.f.n}</b><small>${it.f.s} per serving</small></div>
    <input type="number" min="0" step="0.5" value="${it.q}" oninput="setQ('${s}',${i},this.value)" aria-label="Servings">
    <span id="fk_${s}_${i}">${kc(it)} kcal</span><button onclick="del('${s}',${i})" aria-label="Remove">✕</button></div>`).join("");
}
function updT() {
  let k = 0, p = 0, c = 0, f = 0;
  SLOTS.forEach(s => {
    let sk = 0;
    plan[s].forEach(it => { sk += it.f.k * it.q; p += it.f.p * it.q; c += it.f.c * it.q; f += it.f.f * it.q; });
    k += sk; const e = $("sk_" + s); if (e) e.textContent = "· " + Math.round(sk) + " kcal";
  });
  $("t_k").textContent = Math.round(k); $("t_p").textContent = Math.round(p) + "g"; $("t_c").textContent = Math.round(c) + "g"; $("t_f").textContent = Math.round(f) + "g";
  const b = $("bar"); b.style.width = Math.min(100, k / U.kcal * 100) + "%"; b.style.background = k > U.kcal * 1.1 ? "#f87171" : "var(--ac)";
  return { k, p, c, f };
}
function setQ(s, i, v) {
  const it = plan[s][i]; it.q = Math.max(0, +v || 0);
  $(`fk_${s}_${i}`).textContent = kc(it) + " kcal"; updT();
}
function del(s, i) { plan[s].splice(i, 1); $("rows_" + s).innerHTML = rows(s); updT(); }

/* ---------- real-time food search ---------- */
function parseQ(v) {
  const m = v.match(/^\s*(\d+(?:\.\d+)?)\s*(?:x|×)?\s*(.*)$/i);
  return m ? { q: Math.min(50, +m[1]), name: m[2].trim() } : { q: 1, name: v.trim() };
}
function find(name) {
  const toks = name.toLowerCase().split(/\s+/).filter(Boolean).map(t => ALIAS[t] || t.replace(/s$/, ""));
  if (!toks.length) return [];
  return FOODS.map((f, i) => ({ f, i, n: f.n.toLowerCase() }))
    .filter(o => toks.every(t => o.n.includes(t)))
    .sort((a, b) => (b.n.startsWith(toks[0]) - a.n.startsWith(toks[0])) || a.i - b.i)
    .slice(0, 6);
}
function sug(s) {
  const v = $("in_" + s).value, box = $("sg_" + s), { q, name } = parseQ(v);
  if (!name) { box.innerHTML = ""; return; }
  const res = find(name);
  if (!res.length) {
    box.innerHTML = `<div class="no">No match for “${name.replace(/</g, "&lt;")}”. Add it with your own calories:
      <input id="cu_${s}" type="number" min="0" placeholder="kcal per serving"><button class="btn" onclick="addCustom('${s}','${encodeURIComponent(name)}',${q})">Add custom</button></div>`;
    return;
  }
  box.innerHTML = res.map(o => {
    const blocked = U.diet == "v" && !o.f.v;
    return `<button class="opt" ${blocked ? "disabled" : ""} onclick="addFood('${s}',${o.i},${q})">
      <span><b>${q} × ${o.f.n}</b><small>${o.f.s}${blocked ? " · non-veg, not in your vegetarian plan" : ""}</small></span>
      <em>${Math.round(o.f.k * q)} kcal<small>${(o.f.p * q).toFixed(1)}g protein</small></em></button>`;
  }).join("");
}
function addTop(s) {
  const first = $("sg_" + s).querySelector(".opt:not([disabled])"); if (first) first.click();
}
function addFood(s, fi, q) {
  plan[s].push({ f: FOODS[fi], q });
  $("in_" + s).value = ""; $("sg_" + s).innerHTML = ""; $("rows_" + s).innerHTML = rows(s); updT();
}
function addCustom(s, name, q) {
  const k = +$("cu_" + s).value;
  if (!(k >= 0) || $("cu_" + s).value === "") { $("cu_" + s).focus(); return; }
  plan[s].push({ f: { n: decodeURIComponent(name), s: "1 serving", k, p: 0, c: 0, f: 0, v: 1 }, q });
  $("in_" + s).value = ""; $("sg_" + s).innerHTML = ""; $("rows_" + s).innerHTML = rows(s); updT();
}

/* ---------- PDF download ---------- */
async function dlPdf() {
  const lib = window.jspdf && window.jspdf.jsPDF;
  if (!lib) { alert("The PDF library could not load. Please check your internet connection and try again."); return; }
  const d = new lib({ unit: "mm", format: "a4" }), W = 210, t = updT();
  d.setFillColor(10, 10, 11); d.rect(0, 0, W, 30, "F");
  d.setTextColor(200, 255, 0); d.setFont("helvetica", "bold"); d.setFontSize(24); d.text("IRONFUEL", 15, 19);
  d.setTextColor(255); d.setFontSize(10); d.text("Personalised Diet Plan", W - 15, 19, { align: "right" });
  let y = 42; d.setTextColor(30); d.setFont("helvetica", "normal"); d.setFontSize(11);
  d.text(`Age ${U.a}  |  ${U.w} kg  |  ${U.h} cm  |  ${U.diet == "v" ? "Vegetarian" : "Non-vegetarian"}  |  Goal: ${goalName()}`, 15, y); y += 7;
  d.text(`BMI ${U.bmi.toFixed(1)} (${bmiCat(U.bmi)[0]})  |  Daily target: ${U.kcal} kcal`, 15, y); y += 7;
  d.setFont("helvetica", "bold");
  d.text(`Plan total: ${Math.round(t.k)} kcal  |  Protein ${Math.round(t.p)} g  |  Carbs ${Math.round(t.c)} g  |  Fat ${Math.round(t.f)} g`, 15, y); y += 12;
  SLOTS.forEach(s => {
    if (y > 250) { d.addPage(); y = 20; }
    const sk = plan[s].reduce((a, it) => a + it.f.k * it.q, 0);
    d.setFillColor(238, 238, 238); d.rect(15, y - 5, 180, 8, "F");
    d.setFont("helvetica", "bold"); d.setFontSize(12); d.text(`${s}  -  ${Math.round(sk)} kcal`, 17, y + .8); y += 9;
    d.setFont("helvetica", "normal"); d.setFontSize(10);
    if (!plan[s].length) { d.text("No items", 17, y); y += 6; }
    plan[s].forEach(it => {
      if (y > 278) { d.addPage(); y = 20; }
      d.text(`${it.q} x ${it.f.n} (${it.f.s})`, 17, y);
      d.text(`${kc(it)} kcal  |  ${(it.f.p * it.q).toFixed(1)} g protein`, 193, y, { align: "right" }); y += 6;
    });
    y += 5;
  });
  d.setFontSize(8); d.setTextColor(120);
  d.text("General guidance only. Consult a doctor or dietitian for medical conditions. Values are typical averages.", 15, 288);
  const name = "IronFuel-Diet-Plan.pdf";
  let dl = null;
  try { dl = window.claude && await claude.use("downloads"); } catch (e) { }
  if (dl) { try { await dl.save({ filename: name, data: d.output("arraybuffer") }); } catch (e) { } }
  else d.save(name);
}
