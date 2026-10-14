// ══════════════════════════════
// ESTADO GLOBAL COMPARTIDO
// ══════════════════════════════
const DS = {
  mesa7: {
    status: 'open', // closed | open | paying | paid — arranca abierta: la demo nunca debe mostrar error
    items: [],
    review: null,
    paidAt: null
  },
  tables: [
    {n:1,cap:2,st:'free'},
    {n:2,cap:4,st:'occupied',since:'20:10',amt:8200},
    {n:3,cap:6,st:'occupied',since:'19:45',amt:15600},
    {n:4,cap:4,st:'free'},
    {n:5,cap:2,st:'paid',amt:6400},
    {n:6,cap:8,st:'free'},
    {n:7,cap:4,st:'closed'},
    {n:8,cap:4,st:'paid',amt:19800},
  ],
  sessions:[
    {t:5,time:'20:32',amt:6400,st:'paid',stars:5},
    {t:8,time:'19:58',amt:19800,st:'paid',stars:4},
    {t:3,time:'19:45',amt:15600,st:'open',stars:null},
    {t:2,time:'20:10',amt:8200,st:'open',stars:null},
  ],
  star: 0
};

const MENU_ITEMS = [
  {emoji:'🍔',name:'La Clásica',price:4200},
  {emoji:'🔥',name:'La Brasa',price:6800},
  {emoji:'🌿',name:'Green Beast',price:4900},
  {emoji:'🍟',name:'Papas fritas',price:1400},
  {emoji:'🧅',name:'Aros de cebolla',price:1800},
  {emoji:'🍺',name:'Cerveza IPA',price:1600},
  {emoji:'🥤',name:'Gaseosa / Agua',price:700},
  {emoji:'🧃',name:'Limonada',price:900},
];

const fmt = n => '$'+n.toLocaleString('es-AR');

// ── VIEWS CLIENTE ──
const VIEWS = ['hub','menu','bill','pay','confirm','review'];
const SW_IDS = ['hub','menu','bill','pay','review'];

function goTo(v) {
  VIEWS.forEach(x => document.getElementById('cv-'+x).classList.toggle('active', x===v));
  SW_IDS.forEach(x => { const el=document.getElementById('sw-'+x); if(el) el.classList.toggle('active',x===v); });
  if(v==='bill') renderBill();
  if(v==='pay') {
    const total = calcTotal();
    document.getElementById('pay-amount').textContent = fmt(total);
    document.getElementById('pay-confirm-btn').textContent = `Confirmar pago · ${fmt(total)} →`;
  }
  if(v==='confirm') {
    const now=new Date();
    document.getElementById('conf-time').textContent='Hoy '+now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})+' · recibo generado';
    document.getElementById('conf-total').textContent = fmt(calcTotal());
  }
  if(v==='review') {
    document.getElementById('rev-form').style.display='block';
    document.getElementById('rev-thanks').classList.remove('show');
    DS.star=0;
    document.querySelectorAll('.star').forEach(s=>s.classList.remove('on'));
    document.getElementById('star-lbl').textContent='Tocá para calificar';
    document.getElementById('rev-btn').disabled=true;
  }
  // reset scroll interno de la vista activa (no scrollear la página)
  const activeView = document.getElementById('cv-' + v);
  if(activeView) {
    activeView.scrollTop = 0;
    const vb = activeView.querySelector('.vb');
    if(vb) vb.scrollTop = 0;
    const conf = activeView.querySelector('.conf');
    if(conf) conf.scrollTop = 0;
    const revWrap = activeView.querySelector('.rev-wrap');
    if(revWrap) revWrap.scrollTop = 0;
  }
}

function setDemo(v) {
  SW_IDS.forEach(x=>document.getElementById('sw-'+x).classList.toggle('active',x===v));
  goTo(v);
}

function calcTotal() {
  return DS.mesa7.items.reduce((acc,i)=>acc+i.price*i.qty,0);
}

// ── BILL RENDER ──
function renderBill() {
  const body = document.getElementById('bill-view-body');
  const items = DS.mesa7.items;
  const total = calcTotal();

  if(items.length===0) {
    body.innerHTML=`<div class="bill-empty"><div class="bill-empty-icon">🍽</div><div class="bill-empty-txt">El mozo aún no cargó ítems.<br>Aguardá un momento.</div></div><div class="powered">con ♥ por <span>Dishub</span></div>`;
    return;
  }

  const rows = items.map(i=>`
    <div class="bi">
      <div class="bq">${i.qty}</div>
      <div class="bn">${i.emoji} ${i.name}</div>
      <div class="bp">${fmt(i.price*i.qty)}</div>
    </div>`).join('');

  body.innerHTML=`
    <div class="bill-card">${rows}</div>
    <div class="bill-total-card">
      <div><div class="btl">TOTAL A PAGAR</div><div class="bta">${fmt(total)}</div></div>
      <svg width="28" height="28" fill="none" stroke="rgba(245,240,232,.3)" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    </div>
    <p class="bill-notice">Al continuar aceptás los términos del servicio</p>
    <button class="cta" onclick="goTo('pay')">Pagar la cuenta →</button>
    <button class="cta-gh" onclick="goTo('hub')">Volver al inicio</button>
    <div class="powered">con ♥ por <span>Dishub</span></div>`;
}

// ── BADGE CUENTA ──
function updateBillBadge() {
  const badge = document.getElementById('bill-badge');
  const sub = document.getElementById('bill-sub');
  const total = calcTotal();
  if(DS.mesa7.items.length>0) {
    badge.classList.add('show');
    sub.textContent = fmt(total)+' · '+DS.mesa7.items.reduce((a,i)=>a+i.qty,0)+' ítems';
  } else {
    badge.classList.remove('show');
    sub.textContent = 'Sin esperar al mozo';
  }
}

// ── HUB STATE ──
// La demo nunca debe mostrar una pantalla de error: el hub del cliente
// siempre muestra las acciones reales (carta, cuenta, reseña), sin
// importar el estado de la mesa en el panel del dueño.
function updateHubState() {
  const closed = document.getElementById('hub-closed');
  const open = document.getElementById('hub-open-content');
  if (closed) closed.style.display = 'none';
  if (open) open.style.display = 'block';
}

// ── PAY ──
function selPay(el) {
  document.querySelectorAll('.pm').forEach(m=>m.classList.remove('sel'));
  el.classList.add('sel');
}

function processPayment() {
  const p=document.getElementById('proc');
  p.classList.add('show');
  setTimeout(()=>{
    p.classList.remove('show');
    DS.mesa7.status='paid';
    DS.mesa7.paidAt=new Date();
    const t7=DS.tables.find(t=>t.n===7);
    if(t7){ t7.st='paid'; t7.amt=calcTotal(); }
    const now=new Date();
    DS.sessions.push({t:7,time:now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}),amt:calcTotal(),st:'paid',stars:null});
    renderAdmin();
    goTo('confirm');
  },2200);
}

// ── REVIEW ──
const SL=['','Pésima 😤','Mala 😕','Normal 😐','Buena 👍','¡Excelente! 🔥'];
function setStar(n){
  DS.star=n;
  document.querySelectorAll('.star').forEach((s,i)=>s.classList.toggle('on',i<n));
  document.getElementById('star-lbl').textContent=SL[n];
  document.getElementById('rev-btn').disabled=false;
}

function submitReview(){
  const comment=document.getElementById('rev-comment').value;
  DS.mesa7.review={stars:DS.star,comment};
  const sess=DS.sessions.find(s=>s.t===7&&s.st==='paid');
  if(sess) sess.stars=DS.star;
  document.getElementById('rev-form').style.display='none';
  document.getElementById('rev-thanks').classList.add('show');
  renderAdmin();
}

// ══════════════════════════════
// ADMIN
// ══════════════════════════════

function renderAipGrid() {
  const grid=document.getElementById('aip-grid');
  grid.innerHTML=MENU_ITEMS.map((item,i)=>`
    <div class="aip-item">
      <div class="aip-emoji">${item.emoji}</div>
      <div>
        <div class="aip-name">${item.name}</div>
        <div class="aip-price">${fmt(item.price)}</div>
      </div>
      <button class="aip-add" onclick="addItem(${i})" ${DS.mesa7.status==='closed'?'disabled':''}>+</button>
    </div>`).join('');
}

function addItem(idx) {
  if(DS.mesa7.status==='closed') return;
  const item=MENU_ITEMS[idx];
  const existing=DS.mesa7.items.find(i=>i.name===item.name);
  if(existing) existing.qty++;
  else DS.mesa7.items.push({...item,qty:1});
  renderAipLive();
  updateBillBadge();
  if(document.getElementById('cv-bill').classList.contains('active')) renderBill();
}

function renderAipLive() {
  const rows=document.getElementById('aip-rows');
  const totalEl=document.getElementById('aip-total');
  const items=DS.mesa7.items;
  const total=calcTotal();
  totalEl.textContent=fmt(total);

  if(items.length===0){
    rows.innerHTML='<div class="aip-empty">Sin ítems cargados</div>';
    return;
  }

  rows.innerHTML=items.map(i=>`
    <div class="aip-row">
      <div class="aip-row-qty">${i.qty}x</div>
      <div class="aip-row-name">${i.emoji} ${i.name}</div>
      <div class="aip-row-price">${fmt(i.price*i.qty)}</div>
    </div>`).join('');
}

function renderTables() {
  const grid=document.getElementById('tables-grid');
  grid.innerHTML='';
  let occ=0,paid=0,rec=0;

  DS.tables.forEach(t=>{
    if(t.st==='occupied') occ++;
    if(t.st==='paid'){ paid++; rec+=t.amt||0; }

    const stLabel={free:'Libre',occupied:'Ocupada',paid:'Pagada',closed:'Sin abrir',paying:'Pagando...'}[t.st]||t.st;
    const c=document.createElement('div');
    c.className='tc '+t.st;
    c.innerHTML=`
      <div class="t-num">${t.n}</div>
      <div class="t-st">${stLabel} ${t.cap?'· '+t.cap+' pax':''}</div>
      <div class="t-inf">${t.st==='occupied'?`Desde ${t.since} · ${fmt(t.amt||0)}`:t.st==='paid'?`Cobrada · ${fmt(t.amt||0)}`:t.st==='paying'?'Procesando pago...':'—'}</div>
      <div class="t-acts">
        ${t.st==='free'||t.st==='closed'?`<button class="tbtn" onclick="adminOpenTable(${t.n})">Abrir</button>`:''}
        ${t.st==='occupied'?`<button class="tbtn g" onclick="adminPayTable(${t.n})">Cobrar</button>`:''}
        ${t.st==='paid'?`<button class="tbtn" onclick="adminResetTable(${t.n})">Cerrar</button>`:''}
        <button class="tbtn" onclick="openQrModal(${t.n})">QR</button>
      </div>`;
    grid.appendChild(c);
  });

  document.getElementById('s-tot').textContent=DS.tables.length;
  document.getElementById('s-occ').textContent=occ;
  document.getElementById('s-paid').textContent=paid;
  document.getElementById('s-rec').textContent=fmt(rec);

  const t7=DS.tables.find(t=>t.n===7);
  const aipStatus=document.getElementById('aip-status');
  aipStatus.textContent=t7?.st==='closed'?'mesa cerrada':t7?.st==='occupied'?'mesa abierta ✓':t7?.st==='paid'?'cuenta pagada':'—';
  renderAipGrid();
}

function renderSessions() {
  const body=document.getElementById('sess-body');
  if(!body) return;
  body.innerHTML='';
  [...DS.sessions].reverse().forEach(s=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td><strong>Mesa ${s.t}</strong></td>
      <td style="color:#555;font-family:'Space Mono',monospace;font-size:11px">${s.time}</td>
      <td><strong>${fmt(s.amt)}</strong></td>
      <td>${s.st==='paid'?'<span class="badge bg">PAGADA</span>':s.st==='paying'?'<span class="badge br">PAGANDO</span>':'<span class="badge by">ABIERTA</span>'}</td>
      <td>${s.stars?'⭐'.repeat(s.stars):'<span style="color:#333">—</span>'}</td>`;
    body.appendChild(tr);
  });
}

function renderAdmin() {
  renderTables();
  renderSessions();
  renderAipLive();
  updateHubState();
  updateBillBadge();
}

function adminOpenTable(n) {
  const t=DS.tables.find(x=>x.n===n);
  if(!t) return;
  t.st='occupied';
  t.since=new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
  t.amt=0;
  if(n===7) {
    DS.mesa7.status='open';
    DS.mesa7.items=[];
    DS.sessions.push({t:7,time:t.since,amt:0,st:'open',stars:null});
  }
  renderAdmin();
}

function adminPayTable(n) {
  const t=DS.tables.find(x=>x.n===n);
  if(t) { t.st='paid'; t.amt=n===7?calcTotal():t.amt; }
  if(n===7) DS.mesa7.status='paid';
  renderAdmin();
}

function adminResetTable(n) {
  const t=DS.tables.find(x=>x.n===n);
  if(t){ t.st=n===7?'closed':'free'; delete t.since; delete t.amt; }
  if(n===7){ DS.mesa7.status='closed'; DS.mesa7.items=[]; DS.mesa7.review=null; }
  DS.sessions=DS.sessions.filter(s=>s.t!==n||s.st!=='open');
  renderAdmin();
}

function addTable(){
  const n=parseInt(document.getElementById('new-num').value);
  const c=parseInt(document.getElementById('new-cap').value);
  if(!n||!c) return;
  if(DS.tables.find(t=>t.n===n)){alert('Ya existe esa mesa');return;}
  DS.tables.push({n,cap:c,st:'free'});
  DS.tables.sort((a,b)=>a.n-b.n);
  closeModal('mo-add');
  renderAdmin();
}

// ── QR MODAL ──
const QR_PATTERN = [
  [1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,0,0,1,1,0,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,1,0,1,1,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0],
  [1,1,0,1,0,0,1,0,1,0,1,0,0,0,1,0,1,1,0,1,0],
  [0,0,1,0,1,1,0,1,0,1,0,0,1,1,0,1,0,0,1,0,1],
  [1,0,0,1,0,0,1,0,1,0,1,1,0,0,1,0,1,0,0,1,0],
  [0,1,1,0,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,0,1],
  [1,0,0,1,0,0,1,0,1,0,1,0,0,1,1,0,1,0,0,1,0],
  [0,0,0,0,0,0,0,1,0,1,0,1,1,0,0,1,0,1,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0],
  [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,1,0,1,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0],
  [1,0,1,1,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0],
  [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,1,0,0,1,1,0],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,0,1],
];

let _currentQrMesa = 7;

function openQrModal(n) {
  _currentQrMesa = n;
  document.getElementById('qr-modal-title').textContent = 'QR Mesa Nº ' + n;
  document.getElementById('qr-modal-sub').textContent = '// labrasa.getdishub.app/mesa/' + n;
  openModal('mo-qr');
  setTimeout(drawQrCanvas, 30);
}

function drawQrCanvas() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CELL = 9;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 189, 189);
  ctx.fillStyle = '#1a1410';
  QR_PATTERN.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
    });
  });
}

function downloadQr() {
  drawQrCanvas();
  const canvas = document.getElementById('qr-canvas');
  const link = document.createElement('a');
  link.download = 'qr-mesa-' + _currentQrMesa + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ── MODALS ──
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.mo').forEach(o=>o.addEventListener('click',e=>{ if(e.target===o) o.classList.remove('open'); }));

// ── SYNC LOOP ──
setInterval(()=>{
  const t7=DS.tables.find(t=>t.n===7);
  if(t7) t7.amt=calcTotal();
  const sess7=DS.sessions.find(s=>s.t===7&&s.st==='open');
  if(sess7) sess7.amt=calcTotal();
  updateHubState();
  updateBillBadge();
  if(document.getElementById('cv-bill').classList.contains('active')) renderBill();
},600);

// ── PARTICLES ──
function initHeroParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const COUNT = 42, MAX_DIST = 130, ACCENT = '232,116,59';
  let w = 0, h = 0;

  const resize = () => {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;
  };
  resize();
  window.addEventListener('resize', resize);

  const pts = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
  }));

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT},${(1 - dist / MAX_DIST) * 0.3})`;
          ctx.lineWidth = 1;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT},0.55)`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
}

// ── EXIT ──
function exitDemo(e) {
  e.preventDefault();
  if (typeof gsap !== 'undefined') {
    gsap.to('body', {
      opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => { window.top.location.href = '/'; }
    });
  } else {
    window.top.location.href = '/';
  }
}

// ── SCROLL REVEAL ──
function initScrollReveal() {
  // IntersectionObserver para .reveal — igual al landing principal, sin depender del CDN
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Hero entrance con GSAP (si está disponible)
  if (typeof gsap !== 'undefined') {
    gsap.set(['.demo-hero-tag', '.demo-hero-title', '.demo-hero-sub'], { opacity: 0, y: 22 });
    gsap.to(['.demo-hero-tag', '.demo-hero-title', '.demo-hero-sub'], {
      opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.14, delay: 0.3
    });

    // Hero parallax
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to('#hero-particles', {
        yPercent: 28, ease: 'none',
        scrollTrigger: { trigger: '.demo-hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }
  }
}

// ── INIT ──
renderAdmin();
initHeroParticles();
window.addEventListener('load', initScrollReveal);
