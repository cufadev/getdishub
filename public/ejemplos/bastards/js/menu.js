(function () {
  const CATS = [
    ['burgas', 'Burgas'],
    ['papas', 'Papas'],
    ['batatas', 'Batatas'],
    ['bebidas', 'Bebidas'],
    ['postres', 'Postres'],
  ];
  const $ = (id) => document.getElementById(id);
  const money = (n) => '$ ' + n.toLocaleString('es-AR');
  const ICON_PLUS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const ICON_MINUS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>';

  const qty = {};
  let sent = false;
  let ticket = 1;

  // ---------- render del menú ----------
  const sections = $('sections');
  const rail = $('rail');
  CATS.forEach(([id, label]) => {
    const items = MENU.filter((i) => i.cat === id);
    const li = document.createElement('li');
    li.innerHTML = `<a href="#${id}">${label}</a>`;
    rail.appendChild(li);

    const sec = document.createElement('section');
    sec.className = 'section';
    sec.id = id;
    sec.setAttribute('aria-labelledby', id + '-h');
    sec.innerHTML =
      `<div class="section__head"><h2 id="${id}-h">${label}</h2><span class="section__count">${items.length} renglones</span></div>` +
      items.map((it, n) => itemHTML(it, n === 0)).join('');
    sections.appendChild(sec);
  });

  function itemHTML(it, feature) {
    const desc = it.desc ? `<p class="item__desc">${it.desc}</p>` : '';
    return `<article class="item${feature ? ' item--feature' : ''}" data-id="${it.id}">
      <img class="item__img" src="img/w/${it.id}.webp" width="720" height="720" loading="lazy" alt="${it.name}">
      <h3 class="item__name">${it.name}</h3>
      ${desc}
      <div class="item__buy">
        <span class="item__price"><i>$</i> ${it.price.toLocaleString('es-AR')}</span>
        <span class="item__ctl"></span>
      </div>
    </article>`;
  }

  function paintControls() {
    document.querySelectorAll('.item').forEach((el) => {
      const id = el.dataset.id;
      const q = qty[id] || 0;
      const name = MENU.find((m) => m.id === id).name;
      el.querySelector('.item__ctl').innerHTML = q
        ? `<span class="stepper" role="group" aria-label="${name}">
             <button class="step" type="button" data-act="dec" data-id="${id}" aria-label="Quitar uno">${ICON_MINUS}</button>
             <output aria-label="Cantidad">${q}</output>
             <button class="step" type="button" data-act="inc" data-id="${id}" aria-label="Sumar uno">${ICON_PLUS}</button>
           </span>`
        : `<button class="btn add" type="button" data-act="inc" data-id="${id}" aria-label="Anotar ${name}">${ICON_PLUS}Anotar</button>`;
    });
  }

  // ---------- comanda ----------
  function renderComanda() {
    const rows = MENU.filter((m) => qty[m.id]);
    const total = rows.reduce((s, m) => s + m.price * qty[m.id], 0);
    const count = rows.reduce((s, m) => s + qty[m.id], 0);
    $('lines').innerHTML = rows
      .map((m) => `<li class="line"><span class="line__name"><b>${qty[m.id]}×</b>${m.name}</span><span class="line__sum">${money(m.price * qty[m.id])}</span></li>`)
      .join('');
    $('empty').hidden = rows.length > 0;
    $('total').textContent = money(total);
    $('barTotal').textContent = money(total);
    $('barCount').textContent = count;
    $('bar').classList.toggle('has-items', count > 0 && !sent);
    $('send').disabled = count === 0 || sent;
    $('comandaNo').textContent = 'N.º ' + String(ticket).padStart(4, '0');
  }

  function update() { paintControls(); renderComanda(); }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const id = b.dataset.id;
    if (sent) resetTicket();
    qty[id] = Math.max(0, (qty[id] || 0) + (b.dataset.act === 'inc' ? 1 : -1));
    if (!qty[id]) delete qty[id];
    const had = document.activeElement && document.activeElement.closest('.item');
    update();
    if (had) {
      const again = document.querySelector(`.item[data-id="${id}"] [data-act]`);
      const pick = document.querySelector(`.item[data-id="${id}"] [data-act="${b.dataset.act}"]`) || again;
      if (pick) pick.focus({ preventScroll: true });
    }
  });

  // ---------- sello ----------
  $('send').addEventListener('click', () => {
    sent = true;
    $('comanda').classList.add('is-sent');
    $('send').disabled = true;
    $('send').textContent = 'Comanda enviada';
    $('bar').classList.remove('has-items');
  });

  function resetTicket() {
    sent = false;
    ticket += 1;
    Object.keys(qty).forEach((k) => delete qty[k]);
    $('comanda').classList.remove('is-sent');
    $('send').textContent = 'Mandar comanda';
  }

  // ---------- hoja en móvil ----------
  const col = $('comandaCol');
  const bar = $('bar');
  function sheet(open) {
    col.classList.toggle('is-open', open);
    document.body.classList.toggle('sheet-open', open);
    bar.setAttribute('aria-expanded', String(open));
    if (open) $('close').focus();
    else if (window.matchMedia('(max-width: 959px)').matches) bar.focus({ preventScroll: true });
  }
  bar.addEventListener('click', () => sheet(true));
  $('close').addEventListener('click', () => sheet(false));
  $('scrim').addEventListener('click', () => sheet(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && col.classList.contains('is-open')) sheet(false); });

  // ---------- riel con scroll-spy ----------
  const links = [...rail.querySelectorAll('a')];
  function mark(id) {
    links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      if (on) { a.setAttribute('aria-current', 'true'); a.scrollIntoView({ inline: 'center', block: 'nearest' }); }
      else a.removeAttribute('aria-current');
    });
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) mark(en.target.id); }),
    { rootMargin: '-30% 0px -65% 0px' }
  );
  document.querySelectorAll('.section').forEach((s) => io.observe(s));
  mark(CATS[0][0]);

  $('year').textContent = new Date().getFullYear();
  update();
})();
