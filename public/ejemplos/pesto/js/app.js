/* ===== STATE ===== */
const cart = new Map();
const $ = s => document.querySelector(s);
const fmt = n => "$" + n.toLocaleString("es-AR");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let CATS = [];     // [{id, name, tag, note1, note2}]
let ITEMS = {};    // { categoriaId: [{id, name, price, desc}] }
let CFG = {};      // valores de la pestaña Config (whatsapp, instagram)
let ESP = [];      // especiales (todos; se filtra por vigencia al pintar)

/* ===== MOTION ===== */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
function anim(el, keyframes, opts){
  if(reduceMotion.matches || !el.animate) return null;
  return el.animate(keyframes, { easing:EASE_OUT, ...opts });
}
const pop = (el, to = 1.16) => anim(el, [{ transform:"scale(1)" }, { transform:`scale(${to})`, offset:.35 }, { transform:"scale(1)" }], { duration:220 });
/* número que cuenta hasta el nuevo valor (ease-out cúbico) */
const _tweens = new WeakMap();
function tweenPrice(el, to){
  const from = el.dataset.v === undefined ? to : Number(el.dataset.v);
  el.dataset.v = to;
  cancelAnimationFrame(_tweens.get(el));
  if(reduceMotion.matches || from === to){ el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 260;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round(from + (to - from) * e));
    if(k < 1) _tweens.set(el, requestAnimationFrame(step));
  };
  _tweens.set(el, requestAnimationFrame(step));
}

/* ===== PRELOAD ===== */
/* Una vez por visita. Sale cuando pasó el mínimo (el nombre se arma en ~0,8 s) y la página + tipografías están listas. */
(function(){
  const pre = $("#preload"), wrap = $(".wrap");
  if(document.documentElement.classList.contains("sin-preload")){ wrap.classList.add("reveal"); return; }
  const salir = () => {
    pre.classList.add("hide");
    wrap.classList.add("reveal");
    try { sessionStorage.setItem("pesto-visto", "1"); } catch {}
  };
  const minimo = new Promise(r => setTimeout(r, reduceMotion.matches ? 400 : 1100));
  const cargada = document.readyState === "complete" ? Promise.resolve() : new Promise(r => addEventListener("load", r, { once:true }));
  const lista = Promise.all([cargada, document.fonts ? document.fonts.ready : null]);
  const tope = new Promise(r => setTimeout(r, 3500));          // nunca más de 3,5 s
  Promise.all([minimo, Promise.race([lista, tope])]).then(salir);
})();

/* ===== PLANILLA DE GOOGLE ===== */
/* CSV con comillas y saltos de línea -> array de objetos {columna: valor} */
function parseCSV(txt){
  const filas = []; let fila = [], cel = "", q = false;
  for(let i = 0; i < txt.length; i++){
    const c = txt[i];
    if(q){
      if(c === '"'){ if(txt[i+1] === '"'){ cel += '"'; i++; } else q = false; }
      else cel += c;
    } else if(c === '"') q = true;
    else if(c === ","){ fila.push(cel); cel = ""; }
    else if(c === "\n" || c === "\r"){
      if(c === "\r" && txt[i+1] === "\n") i++;
      fila.push(cel); cel = ""; filas.push(fila); fila = [];
    } else cel += c;
  }
  if(cel !== "" || fila.length){ fila.push(cel); filas.push(fila); }
  const [cab, ...datos] = filas.filter(f => f.some(x => x.trim() !== ""));
  if(!cab) return [];
  const claves = cab.map(h => h.trim().toLowerCase());
  return datos.map(f => Object.fromEntries(claves.map((k, i) => [k, (f[i] ?? "").trim()])));
}

/* texto de la planilla -> HTML seguro; **negrita** permitida */
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* "$15.500", "15500", "15.500,00" -> 15500 */
function aPrecio(txt){
  const n = parseInt(String(txt).replace(/[,.]\d{1,2}$/, "").replace(/\D/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

/* "17/10/2026" | "2026-10-17" | "17/10/26" -> ms (inicio o fin de ese día); vacío -> null; ilegible -> NaN (no se muestra) */
function aFecha(txt, finDelDia){
  const m = String(txt || "").trim().match(/^(\d{1,4})[\/\-.](\d{1,2})[\/\-.](\d{1,4})/);
  if(!String(txt || "").trim()) return null;
  if(!m) return NaN;
  let y, mo = +m[2], d;
  if(m[1].length === 4){ y = +m[1]; d = +m[3]; }
  else { d = +m[1]; y = +m[3]; if(y < 100) y += 2000; }
  const dt = finDelDia ? new Date(y, mo - 1, d, 23, 59, 59, 999) : new Date(y, mo - 1, d);
  return dt.getTime();   // NaN si el día no existe
}
/* filas de Especiales (planilla o respaldo) -> items con vigencia */
function armarEspeciales(filas){
  const usados = new Set();
  return (filas || []).filter(r => r.nombre && String(r.disponible || "").toUpperCase() !== "NO").map(r => {
    let id = "esp-" + slug(r.nombre), n = 2;
    while(usados.has(id)) id = `esp-${slug(r.nombre)}-${n++}`;
    usados.add(id);
    return { id, name:esc(r.nombre), desc:esc(r.descripcion), price:aPrecio(r.precio), etiqueta:esc(r.etiqueta),
             desde:aFecha(r.desde, false), hasta:aFecha(r.hasta, true) };
  });
}

/* las pestañas -> {categories, menu, cfg, especiales} */
function armarData({ carta, categorias, config, especiales }){
  const categories = categorias
    .filter(r => r.categoria_id && r.nombre)
    .map(r => ({ id:r.categoria_id, name:esc(r.nombre), tag:esc(r.bajada), note1:rich(r.nota1), note2:rich(r.nota2) }));
  const menu = {}; const usados = new Set();
  carta.forEach(r => {
    if(!r.nombre || r.disponible.toUpperCase() === "NO") return;
    if(!categories.some(c => c.id === r.categoria_id)) return;
    let id = `${r.categoria_id}-${slug(r.nombre)}`, n = 2;
    while(usados.has(id)) id = `${r.categoria_id}-${slug(r.nombre)}-${n++}`;
    usados.add(id);
    (menu[r.categoria_id] ||= []).push({ id, name:esc(r.nombre), desc:esc(r.descripcion), price:aPrecio(r.precio) });
  });
  return {
    categories: categories.filter(c => (menu[c.id] || []).length),   // categoría vacía: no se muestra
    menu,
    cfg: Object.fromEntries(config.filter(r => r.clave).map(r => [r.clave.toLowerCase(), r.valor])),
    especiales: armarEspeciales(especiales),
  };
}

/* el respaldo (menu-data.js) ya viene con la misma forma; sus textos son confiables */
const respaldo = () => ({
  categories: CATEGORIES.map(c => ({ ...c, name:esc(c.name), tag:esc(c.tag) })),
  menu: Object.fromEntries(Object.entries(MENU).map(([k, v]) =>
    [k, v.map(i => ({ ...i, name:esc(i.name), desc:esc(i.desc) }))])),
  cfg: {},
  especiales: armarEspeciales(ESPECIALES),
});

const urlHoja = nombre => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombre)}`;
const CLAVE_CACHE = "pesto-carta:" + SHEET_ID;
const leerCache = () => { try { return JSON.parse(localStorage.getItem(CLAVE_CACHE)); } catch { return null; } };
const guardarCache = d => { try { localStorage.setItem(CLAVE_CACHE, JSON.stringify(d)); } catch {} };

async function cargarHojas(){
  const leer = async (n, opcional) => {
    try {
      const r = await fetch(urlHoja(n), { cache:"no-store" });
      if(!r.ok) throw new Error(n + " " + r.status);
      return await r.text();
    } catch(e){ if(opcional) return ""; throw e; }   // una planilla sin pestaña Especiales sigue andando
  };
  const [carta, categorias, config, especiales] = await Promise.all([
    leer("Carta"), leer("Categorias"), leer("Config"), leer("Especiales", true),
  ]);
  return { carta, categorias, config, especiales };
}
const aData = t => armarData({ carta:parseCSV(t.carta), categorias:parseCSV(t.categorias), config:parseCSV(t.config), especiales:parseCSV(t.especiales || "") });

/* ===== RENDER NAV + SECTIONS ===== */
function renderSection(key){
  const container = document.querySelector(`#${key} .items`);
  container.innerHTML = (ITEMS[key] || []).map(it => `
    <article class="item" data-id="${it.id}">
      <div class="item-top">
        <h3 class="item-name">${it.name}</h3>
        <span class="dots"></span>
        <span class="item-price">${fmt(it.price)}</span>
      </div>
      ${it.desc ? `<p class="item-desc">${it.desc}</p>` : ""}
      <div class="item-foot">
        <div class="stepper" data-id="${it.id}">
          <button type="button" data-op="-1" aria-label="Quitar ${it.name}">−</button>
          <span class="qty">0</span>
          <button type="button" data-op="1" aria-label="Agregar ${it.name}">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* ===== ESPECIALES ===== */
function renderEspeciales(){
  const box = $("#especiales");
  const ahora = Date.now();
  const vigentes = ESP.filter(e => (e.desde === null || ahora >= e.desde) && (e.hasta === null || ahora <= e.hasta));   // NaN compara falso: fecha ilegible = oculto
  ITEMS._esp = vigentes;
  const habia = !box.hidden;
  if(!vigentes.length){ box.hidden = true; box.innerHTML = ""; return; }
  box.innerHTML = `
    <div class="esp-head"><span class="esp-kicker">Especiales</span></div>
    ${vigentes.map(it => `
    <article class="item esp-item" data-id="${it.id}">
      ${it.etiqueta ? `<span class="esp-tag">${it.etiqueta}</span>` : ""}
      <div class="item-top">
        <h3 class="item-name">${it.name}</h3>
        <span class="dots"></span>
        <span class="item-price">${fmt(it.price)}</span>
      </div>
      ${it.desc ? `<p class="item-desc">${it.desc}</p>` : ""}
      <div class="item-foot">
        <div class="stepper" data-id="${it.id}">
          <button type="button" data-op="-1" aria-label="Quitar ${it.name}">−</button>
          <span class="qty">0</span>
          <button type="button" data-op="1" aria-label="Agregar ${it.name}">+</button>
        </div>
      </div>
    </article>`).join("")}`;
  box.hidden = false;
  if(!habia) anim(box, [{ opacity:0, transform:"translateY(8px)" }, { opacity:1, transform:"none" }], { duration:260 });
}
/* si la página queda abierta, un especial vencido se baja al volver a la pestaña */
document.addEventListener("visibilitychange", () => {
  if(document.hidden) return;
  renderEspeciales();
  [...cart.keys()].forEach(id => { if(!findItem(id)) cart.delete(id); });
  syncUI();
});

function pintar(data){
  CATS = data.categories; ITEMS = data.menu; CFG = data.cfg || {}; ESP = data.especiales || [];
  const previa = document.querySelector("#tabsNav button.active")?.dataset.tab;
  const activa = CATS.some(c => c.id === previa) ? previa : (CATS[0] && CATS[0].id);

  $("#tabsNav").innerHTML = CATS.map(c => `
    <button class="${c.id === activa ? "active" : ""}" data-tab="${c.id}">${c.name}</button>
  `).join("");

  $("#sections").innerHTML = CATS.map(c => `
    <section id="${c.id}" class="${c.id === activa ? "visible" : ""}" aria-label="${c.name}">
      <div class="section-head">
        <h2 class="section-title">${c.name}</h2>
        <div class="section-tag">${c.tag || ""}</div>
      </div>
      <div class="items"></div>
      ${c.note1 || c.note2 ? `<div class="note">
        ${c.note1 ? `<p>${c.note1}</p>` : ""}
        ${c.note2 ? `<p>${c.note2}</p>` : ""}
      </div>` : ""}
    </section>
  `).join("");
  CATS.forEach(c => renderSection(c.id));
  renderEspeciales();

  // si la planilla sacó un plato que estaba en el carrito, se descarta
  [...cart.keys()].forEach(id => { if(!findItem(id)) cart.delete(id); });

  const ig = (CFG.instagram || "").replace(/^@/, "").trim();
  const igLink = $("#igBtn");
  if(ig){ igLink.href = `https://instagram.com/${encodeURIComponent(ig)}`; igLink.querySelector(".btn-txt").textContent = "@" + ig; }

  const dir = (CFG.direccion || DIRECCION).trim();
  $("#mapAddr").textContent = dir;
  $("#mapBtn").href = CFG.mapa && /^https?:\/\//i.test(CFG.mapa)
    ? CFG.mapa
    : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(dir + ", Argentina");

  syncUI();
}

/* ===== TABS ===== */
$("#tabsNav").addEventListener("click", e => {
  const btn = e.target.closest("button[data-tab]");
  if(!btn) return;
  document.querySelectorAll("#tabsNav button").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("#sections section").forEach(s => s.classList.remove("visible"));
  btn.classList.add("active");
  document.getElementById(btn.dataset.tab).classList.add("visible");
  window.scrollTo({top:0});
});

/* ===== CART ===== */
function findItem(id){
  for(const key in ITEMS){
    const found = ITEMS[key].find(i => i.id === id);
    if(found) return found;
  }
  return null;
}
function setQty(id, qty){
  qty = Math.max(0, Math.min(99, qty));
  if(qty === 0) cart.delete(id); else cart.set(id, qty);
  syncUI(id);
}
function syncUI(changedId){
  document.querySelectorAll(`.stepper${changedId ? `[data-id="${changedId}"]` : ""}`).forEach(st => {
    const q = cart.get(st.dataset.id) || 0;
    const qtyEl = st.querySelector(".qty");
    const cambio = qtyEl.textContent !== String(q);
    qtyEl.textContent = q;
    st.classList.toggle("filled", q > 0);
    if(cambio && changedId) pop(qtyEl);
  });
  let count = 0, total = 0;
  cart.forEach((q, id) => { count += q; total += q * findItem(id).price; });
  const countEl = $("#cartCount");
  const countCambio = countEl.textContent !== String(count);
  countEl.textContent = count;
  if(countCambio && changedId && count > 0) pop(countEl, 1.22);
  tweenPrice($("#cartTotal"), total);
  $("#cartBar").classList.toggle("show", count > 0);
  renderSheet(total);
  if(count === 0) closeSheet();
}
document.body.addEventListener("click", e => {
  const btn = e.target.closest(".stepper button");
  if(!btn) return;
  const id = btn.closest(".stepper").dataset.id;
  setQty(id, (cart.get(id) || 0) + Number(btn.dataset.op));
});

/* ===== SHEET ===== */
let _emptyTimer;
function lineHTML(id, q, it){
  return `<span class="l-qty">${q}×</span>
    <span class="l-name">${it.name}</span>
    <span class="l-sub">${fmt(q * it.price)}</span>
    <button class="l-del" data-del="${id}" aria-label="Quitar ${it.name}">✕</button>`;
}
function removeLine(el){
  el.classList.add("leaving");
  const h = el.offsetHeight;
  const a = anim(el, [
    { height:h + "px", opacity:1, transform:"none" },
    { height:"0px", opacity:0, transform:"translateX(14px)", paddingTop:"0px", paddingBottom:"0px", borderBottomWidth:"0px" },
  ], { duration:200, fill:"forwards" });
  if(a) a.onfinish = () => el.remove(); else el.remove();
}
function renderSheet(total){
  const lines = $("#sheetLines");
  clearTimeout(_emptyTimer);
  if(cart.size === 0){
    const vacio = `<div class="empty">Todavía no agregaste nada.</div>`;
    // el sheet se está cerrando: se deja el contenido hasta que termine de bajar
    if(!lines.children.length) lines.innerHTML = vacio;
    else _emptyTimer = setTimeout(() => { if(cart.size === 0) lines.innerHTML = vacio; }, 280);
  } else {
    lines.querySelector(".empty")?.remove();
    const actuales = new Map([...lines.querySelectorAll(".line:not(.leaving)")].map(el => [el.dataset.id, el]));
    actuales.forEach((el, id) => { if(!cart.has(id)) removeLine(el); });
    cart.forEach((q, id) => {
      const it = findItem(id);
      const el = actuales.get(id);
      if(el){
        const qEl = el.querySelector(".l-qty");
        if(qEl.textContent !== q + "×"){
          qEl.textContent = q + "×";
          el.querySelector(".l-sub").textContent = fmt(q * it.price);
          pop(qEl, 1.2);
        }
      } else {
        const nuevo = document.createElement("div");
        nuevo.className = "line"; nuevo.dataset.id = id;
        nuevo.innerHTML = lineHTML(id, q, it);
        lines.appendChild(nuevo);
        anim(nuevo, [{ opacity:0, transform:"translateY(8px)" }, { opacity:1, transform:"none" }], { duration:220 });
      }
    });
  }
  tweenPrice($("#sheetTotal"), total ?? 0);
}
$("#sheetLines").addEventListener("click", e => {
  const del = e.target.closest("[data-del]");
  if(del) setQty(del.dataset.del, 0);
});
function openSheet(){ $("#overlay").classList.add("show"); $("#sheet").classList.add("show"); }
function closeSheet(){ $("#overlay").classList.remove("show"); $("#sheet").classList.remove("show"); resetClear(); }
/* vaciar pedido: dos toques (el primero pide confirmar, se desarma solo a los 3 s) */
let _clearTimer;
function resetClear(){
  clearTimeout(_clearTimer);
  const b = $("#clearBtn");
  b.classList.remove("confirm"); b.textContent = "Vaciar pedido";
}
$("#clearBtn").addEventListener("click", () => {
  const b = $("#clearBtn");
  if(!b.classList.contains("confirm")){
    b.classList.add("confirm"); b.textContent = "¿Seguro? Tocá de nuevo";
    _clearTimer = setTimeout(resetClear, 3000);
    return;
  }
  resetClear();
  cart.clear();
  syncUI();
});
$("#cartBarBtn").addEventListener("click", openSheet);
$("#cartBarBtn").addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " ") openSheet(); });
$("#sheetClose").addEventListener("click", closeSheet);
$("#overlay").addEventListener("click", closeSheet);

/* ===== WHATSAPP ===== */
const textoPlano = s => { const d = document.createElement("div"); d.innerHTML = s; return d.textContent; };
$("#waBtn").addEventListener("click", () => {
  if(cart.size === 0) return;
  let total = 0;
  const items = [...cart.entries()].map(([id, q]) => {
    const it = findItem(id);
    total += q * it.price;
    return `• ${q}× ${textoPlano(it.name)} — ${fmt(q * it.price)}`;
  }).join("\n");
  const numero = (CFG.whatsapp || WHATSAPP).replace(/\D/g, "");
  const msg = `[DEMO DISHub] Hola PESTO 👋 Quiero hacer este pedido:\n\n${items}\n\nTotal: ${fmt(total)}${PRECIOS_DEMO ? "\n\n(Pedido desde la carta digital)" : ""}`;
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, "_blank");
});

if(PRECIOS_DEMO) $("#hint").textContent = "Demo · precios de referencia. " + $("#hint").textContent;

/* ===== CARGA: caché/respaldo al instante, planilla en segundo plano ===== */
(async function iniciar(){
  const cache = SHEET_ID && leerCache();
  let data = null;
  try { data = cache ? aData(cache) : null; } catch { data = null; }
  pintar(data && data.categories.length ? data : respaldo());
  if(!SHEET_ID) return;
  try {
    const textos = await cargarHojas();
    const nuevo = aData(textos);
    if(!nuevo.categories.length) throw new Error("planilla vacía");
    if(JSON.stringify(textos) !== JSON.stringify(cache)){ guardarCache(textos); pintar(nuevo); }
  } catch(e){ console.warn("Carta: no se pudo leer la planilla, se usa la versión guardada.", e); }
})();
