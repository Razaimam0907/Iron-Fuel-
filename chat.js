/* ============ CHATBOT (rule-based) ============ */
const KB=[[/hello|hi\b|hey/,"Hey! 💪 I'm your IronFuel coach. Ask me about protein, creatine, diet plans or BMI."],
[/whey|protein/,"Whey is great post‑workout: 1 scoop (≈25 g protein) after training. Aim for ~1.6–2.2 g protein per kg body weight daily. Isolate suits lactose‑sensitive users."],
[/creatine/,"Creatine monohydrate: 3–5 g daily, any time, with water. It's one of the most researched supplements for strength."],
[/pre.?workout|pre\b/,"Take pre‑workout 20–30 min before training. Avoid late evening if you're caffeine‑sensitive."],
[/bcaa/,"If your daily protein is high, BCAAs add little. They help mainly when training fasted."],
[/gain|bulk|mass/,"For muscle gain eat ~300–500 kcal above maintenance with high protein. The calorie calculator in your post-payment gift helps."],
[/lose|fat|cut/,"For fat loss use a ~400 kcal deficit, keep protein high and lift weights. Your post-payment gift includes a calorie calculator."],
[/veg/,"Our diet plans have both vegetarian and non‑vegetarian modes – paneer, soya, dal and whey cover protein for vegetarians."],
[/bmi/,"BMI = weight(kg) ÷ height(m)². 18.5–24.9 is 'normal'. After any successful payment you unlock a one-time gift: BMI check, calorie calculator and diet plan."],
[/diet|plan|meal/,"After payment you unlock a one-time gift: enter age, weight, height and veg/non-veg preference to get an editable meal plan."],
[/calorie|tdee|bmr/,"The Calorie Calculator is part of the free one-time gift that opens after your payment."],
[/ship|deliver/,"We dispatch within 24 hours; delivery takes 3–6 days across India."],
[/return|refund/,"Unopened products can be returned within 7 days."],
[/price|offer|discount|code/,"Price Drop Fest is live – up to 40% off, plus a free diet plan on every order!"]];
const qs=["Best protein?","Creatine dosage","How does diet plan work?","Fat loss tips"];
function say(t,c){const d=document.createElement("div");d.className="m "+c;d.textContent=t;$("msgs").append(d);$("msgs").scrollTop=1e9}
function ask(q){say(q,"u");const r=KB.find(k=>k[0].test(q.toLowerCase()));setTimeout(()=>say(r?r[1]:"I can help with supplements, diet plans, BMI and calories. Try one of the suggestions below!","b"),350)}
function send(e){e.preventDefault();const v=$("qi").value.trim();if(v){$("qi").value="";ask(v)}return false}
$("qc").innerHTML=qs.map(q=>`<span class="chip" onclick="ask(this.textContent)">${q}</span>`).join("");
say("Hey! 💪 I'm your IronFuel coach. How can I help?","b");
