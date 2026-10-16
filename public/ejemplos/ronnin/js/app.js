const CATS = ['Todo', ...new Set(MENU.map(m => m.cat))];
const fmt = n => '$' + n.toLocaleString('es-AR');

const chipsEl = document.getElementById('chips');
CATS.forEach((c, i) => {
  const b = document.createElement('button');
  b.className = 'chip' + (i === 0 ? ' active' : '');
  b.textContent = c;
  b.onclick = () => filter(c, b);
  chipsEl.appendChild(b);
});

const feed = document.getElementById('feed');
const gridInner = document.getElementById('gridInner');

MENU.forEach((item, i) => {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.cat = item.cat;
  card.innerHTML = `
    <div class="fallback"><span>ローニン</span></div>
    <img class="photo" src="${item.img}" alt="${item.name}" loading="${i < 2 ? 'eager' : 'lazy'}"
         onerror="this.closest('.card').classList.add('no-img'); this.remove()">
    <span class="kana-side">ローニン・ピザ</span>
    <div class="actions">
      <button class="action-btn like" onclick="toggleLike(this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        <span class="count">0</span>
      </button>
    </div>
    <div class="card-info">
      <span class="price-badge">${fmt(item.price)}</span>
      <h2>${item.name}</h2>
      <p>${item.desc}</p>
      <div class="tags">${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="add-row" data-idx="${i}">
        <button class="add-btn" onclick="addItem(${i})">Agregar &nbsp;+</button>
        <div class="stepper">
          <button onclick="changeQty(${i}, -1)">−</button>
          <span class="qty">1</span>
          <button onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
    </div>`;
  feed.appendChild(card);

  const g = document.createElement('div');
  g.className = 'g-card';
  g.dataset.cat = item.cat;
  g.innerHTML = `
    <img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'">
    <button class="g-add" data-idx="${i}" onclick="event.stopPropagation(); addItem(${i})">+</button>
    <div class="g-info">
      <span class="g-price">${fmt(item.price)}</span>
      <h3>${item.name}</h3>
    </div>`;
  g.onclick = () => {
    document.body.classList.remove('grid-mode');
    setView('feed');
    card.scrollIntoView({ behavior: 'instant' });
  };
  gridInner.appendChild(g);
});

const outro = document.createElement('article');
outro.className = 'card outro';
outro.dataset.cat = '*';
outro.innerHTML = `
  <div class="hanko">忍</div>
  <h2>Ronnin Pizza</h2>
  <p>Av. Siempreviva 742, CABA<br>Mar a Dom · 19:00 a 00:30<br>Takeaway y delivery propio</p>
  <div class="dev-credit">Hecho con 🧉 en Buenos Aires por <a class="cufa-name" href="https://cufadev.xyz" target="_blank" rel="noopener">CUFA.</a></div>`;
feed.appendChild(outro);

function filter(cat, btn) {
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === btn));
  document.querySelectorAll('.card:not(.outro), .g-card').forEach(el => {
    el.classList.toggle('hidden', cat !== 'Todo' && el.dataset.cat !== cat);
  });
  feed.scrollTo({ top: 0, behavior: 'instant' });
}

function toggleLike(btn) {
  const count = btn.querySelector('.count');
  const liked = btn.classList.toggle('liked');
  count.textContent = +count.textContent + (liked ? 1 : -1);
}

/* ── Carrito ── */
const cart = {};
const WA_NUMBER = '5491100000000';

function addItem(i) {
  cart[i] = (cart[i] || 0) + 1;
  syncCart();
}

function changeQty(i, delta) {
  cart[i] = (cart[i] || 0) + delta;
  if (cart[i] <= 0) delete cart[i];
  syncCart();
}

function syncCart() {
  document.querySelectorAll('.add-row').forEach(row => {
    const i = row.dataset.idx;
    const inCart = cart[i] > 0;
    row.classList.toggle('in-cart', inCart);
    if (inCart) row.querySelector('.qty').textContent = cart[i];
  });
  document.querySelectorAll('.g-add').forEach(b => {
    const i = b.dataset.idx;
    b.classList.toggle('added', cart[i] > 0);
    b.textContent = cart[i] > 0 ? cart[i] : '+';
  });

  const entries = Object.entries(cart);
  const link = document.getElementById('ctaLink');
  const summary = document.getElementById('cartSummary');

  if (!entries.length) {
    link.classList.remove('has-items');
    link.href = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent('Hola Ronnin! Quiero hacer un pedido 🍕');
    return;
  }

  let total = 0;
  const lines = entries.map(([i, qty]) => {
    const item = MENU[i];
    total += item.price * qty;
    return `${qty}x ${item.name} — ${fmt(item.price * qty)}`;
  });

  const count = entries.reduce((a, [, q]) => a + q, 0);
  link.classList.add('has-items');
  summary.textContent = `(${count}) · ${fmt(total)}`;
  const msg = `Hola Ronnin! Quiero pedir:\n\n${lines.join('\n')}\n\nTotal: ${fmt(total)}`;
  link.href = `https://wa.me/${WA_NUMBER}?text=` + encodeURIComponent(msg);
}

const btnFeed = document.getElementById('btnFeed');
const btnGrid = document.getElementById('btnGrid');

function setView(v) {
  document.body.classList.toggle('grid-mode', v === 'grid');
  btnFeed.classList.toggle('active', v === 'feed');
  btnGrid.classList.toggle('active', v === 'grid');
}

btnFeed.onclick = () => setView('feed');
btnGrid.onclick = () => setView('grid');
