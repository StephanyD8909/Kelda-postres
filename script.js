(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const I = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  /* ---------- carruseles del menú ---------- */
  $$('.msec, .lovers, .reels, .feed').forEach(sec => {
    const rail = $('.rail', sec), dotsBox = $('.rail-dots', sec);
    if (!rail || !dotsBox) return;
    const cards = [...rail.children];
    cards.forEach((c, i) => {
      const d = document.createElement('i'); dotsBox.appendChild(d);
    });
    const dots = $$('i', dotsBox);
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth);
    const update = () => {
      const i = Math.round(rail.scrollLeft / step());
      dots.forEach((d, k) => d.classList.toggle('on', k === Math.min(i, dots.length - 1)));
      const max = rail.scrollWidth - rail.clientWidth - 4;
      const [prev, next] = $$('.rail-btn', sec);
      if (!prev || !next) return;
      prev.disabled = rail.scrollLeft <= 4; next.disabled = rail.scrollLeft >= max;
    };
    $$('.rail-btn', sec).forEach(b => b.addEventListener('click', () => {
      rail.scrollBy({ left: step() * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' });
    }));
    rail.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault(); rail.scrollBy({ left: step() * (e.key === 'ArrowRight' ? 1 : -1), behavior: reduce ? 'auto' : 'smooth' });
      }
    });
    addEventListener('resize', update); update();
  });

  // pestaña activa del menú
  const tabs = $$('.menu__tabs a');
  if ('IntersectionObserver' in window && tabs.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) tabs.forEach(t => {
        const on = t.getAttribute('href') === '#' + e.target.id; t.classList.toggle('on', on);
        if (on) t.parentElement.scrollTo({ left: t.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' });
      });
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('.msec').forEach(s => io.observe(s));
  }

  /* ---------- Cómo pedir: paso a paso ---------- */
  const order = $('#order');
  if (order) {
    const osteps = $$('.ostep', order), oprog = $$('.order__progress li', order), obar = $('.lab__bar i', order);
    const oback = $('#order-back'), onext = $('#order-next'), N = osteps.length;
    const WA_O = 'https://wa.me/18157636521';
    let oc = 1;
    const oshow = (s, dir = 1) => {
      oc = Math.max(1, Math.min(N, s));
      osteps.forEach(st => {
        const on = +st.dataset.step === oc; st.hidden = !on; st.classList.toggle('is-on', on);
        if (on && !reduce) { st.classList.remove('in-l', 'in-r'); void st.offsetWidth; st.classList.add(dir > 0 ? 'in-r' : 'in-l'); }
      });
      oprog.forEach((li, i) => { li.classList.toggle('is-on', i + 1 === oc); li.classList.toggle('is-done', i + 1 < oc); const b = $('button', li); b.setAttribute('aria-current', i + 1 === oc ? 'step' : 'false'); });
      obar.style.width = `${(oc - 1) / (N - 1) * 100}%`;
      oback.disabled = oc === 1;
      onext.innerHTML = oc === N ? 'Volver al paso 1' : 'Siguiente →';
    };
    onext.addEventListener('click', () => oshow(oc === N ? 1 : oc + 1, oc === N ? -1 : 1));
    oback.addEventListener('click', () => oshow(oc - 1, -1));
    oprog.forEach((li, i) => $('button', li).addEventListener('click', () => oshow(i + 1, i + 1 >= oc ? 1 : -1)));
    // deslizar con el dedo
    const stage = $('.order__stage', order); let x0 = null, y0 = null;
    stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) oshow(oc + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });
    order.addEventListener('keydown', e => {
      if (e.target.closest('a')) return;
      if (e.key === 'ArrowRight') oshow(oc + 1, 1); if (e.key === 'ArrowLeft') oshow(oc - 1, -1);
    });
    oshow(1);
  }

  /* ---------- Páginas: escritorio = varias páginas, móvil = una sola ---------- */
  const page = document.body.dataset.page || 'home', isHome = page === 'home';
  const wide = matchMedia('(min-width: 900px)');
  const PAGES = ['menu', 'cakelab', 'como-pedir', 'delivery', 'keldalovers', 'mis-dias', 'instagram'];
  const linkFor = s => wide.matches
    ? (s === 'top' ? 'index.html' : s + '.html')
    : (s === 'top' ? (isHome ? '#top' : 'index.html') : (isHome ? '#' + s : 'index.html#' + s));
  const setLinks = () => $$('a[data-sec]').forEach(a => a.setAttribute('href', linkFor(a.dataset.sec)));
  // un enlace de móvil (index.html#menu) abierto en laptop → su página
  if (isHome && wide.matches && PAGES.includes(location.hash.slice(1))) { location.replace(location.hash.slice(1) + '.html'); return; }
  setLinks();
  wide.addEventListener('change', setLinks);

  /* ---------- menú de la barra (hamburguesa) ---------- */
  const tog = $('.nav__toggle'), panel = $('#nav-panel');
  if (tog && panel) {
    const setOpen = o => { panel.hidden = !o; tog.setAttribute('aria-expanded', o ? 'true' : 'false'); tog.classList.toggle('is-open', o); };
    tog.addEventListener('click', e => { e.stopPropagation(); setOpen(panel.hidden); });
    $$('a', panel).forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); tog.focus(); } });
  }

  /* ---------- El gatito guía ---------- */
  const guide = $('#guide'), hero = $('.hero');
  if (guide) {
    const gcat = $('.guide__cat', guide), bub = $('.guide__bubble', guide), gmenu = $('#guide-menu'), gimg = $('img', gcat);
    const SAY = {
      menu: '¡Estás en el Menú!', cakelab: '¡Bienvenid@ al CakeLab!', 'como-pedir': 'Así pides, pasito a pasito',
      delivery: '¡Te lo llevo a casa!', keldalovers: 'Lo que dicen los KeldaLovers', 'mis-dias': '¡Así se ven mis días!',
      instagram: '¡Síguenos en Instagram!', pedir: '¿Se te antojó? ¡Escríbeme!'
    };
    const NAME = { menu: 'el Menú', cakelab: 'el CakeLab', 'como-pedir': 'Cómo pedir', delivery: 'Delivery', keldalovers: 'KeldaLovers', 'mis-dias': 'Mis días', instagram: 'Instagram' };
    const HOME_DESK = '¿A dónde vamos? ¡Tócame!';
    const next = PAGES[PAGES.indexOf(page) + 1];
    const PAGER = next ? `¿Seguimos con ${NAME[next]}?` : '¡Lo viste todo! ¿Volvemos al inicio?';
    let cur = '', tHide = 0, visible = false, heroIn = !!hero;
    const io = 'IntersectionObserver' in window;
    const anim = cls => { if (reduce) return; gimg.classList.remove('hop', 'drop'); void gimg.offsetWidth; gimg.classList.add(cls); };
    const quiet = () => { if (guide.classList.contains('open') || wide.matches) return; guide.classList.remove('talk'); guide.classList.add('tuck'); };
    const mark = key => $$('a', gmenu).forEach(a => { const on = a.dataset.sec === key; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
    const say = (key, text) => {
      if (!text || key === cur) return; cur = key;
      bub.textContent = text; guide.dataset.sec = key;
      if (!visible) return;
      guide.classList.add('talk'); guide.classList.remove('tuck'); anim('hop');
      clearTimeout(tHide); tHide = setTimeout(quiet, 2600);
    };
    // en el inicio de móvil (una sola página) el gatito sigue las secciones
    const secs = Object.keys(SAY).map(id => document.getElementById(id)).filter(Boolean);
    const pager = $('.pager');
    let ticking = false;
    const where = () => {
      ticking = false;
      if (!isHome) {
        const r = pager && pager.getBoundingClientRect();
        if (r && r.top < innerHeight * .85) say('pager', PAGER); else say(page, SAY[page]);
        return;
      }
      if (wide.matches) { mark('top'); return say('home', HOME_DESK); }
      const y = innerHeight * .45;
      const hit = secs.find(s => { if (!s.offsetParent) return false; const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
      if (hit) { mark(hit.id); say(hit.id, SAY[hit.id]); }
    };
    const setVisible = show => {
      if (show === visible) return; visible = show;
      guide.classList.toggle('on', show);
      if (show) { cur = ''; where(); anim('drop'); guide.classList.add('talk'); guide.classList.remove('tuck'); clearTimeout(tHide); tHide = setTimeout(quiet, isHome ? 3200 : 2300); }
      else { closeMenu(); guide.classList.remove('talk', 'tuck'); }
    };
    if (hero && io) {
      new IntersectionObserver(([e]) => { heroIn = e.isIntersecting; setVisible(!heroIn); }, { threshold: 0, rootMargin: '-35% 0px 0px 0px' }).observe(hero);
    } else {
      // páginas de sección: el gatito saluda apenas entras
      setTimeout(() => setVisible(true), reduce ? 0 : 450);
    }
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(where); } }, { passive: true });
    addEventListener('resize', where);
    wide.addEventListener('change', () => { cur = ''; if (wide.matches) guide.classList.remove('tuck'); where(); });
    const openMenu = () => { gmenu.hidden = false; guide.classList.add('open', 'talk'); guide.classList.remove('tuck'); gcat.setAttribute('aria-expanded', 'true'); clearTimeout(tHide); };
    function closeMenu() { if (gmenu.hidden) return; gmenu.hidden = true; guide.classList.remove('open'); gcat.setAttribute('aria-expanded', 'false'); clearTimeout(tHide); tHide = setTimeout(quiet, 1800); }
    gcat.addEventListener('click', e => { e.stopPropagation(); anim('hop'); gmenu.hidden ? openMenu() : closeMenu(); });
    $$('a', gmenu).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', e => { if (!gmenu.hidden && !guide.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !gmenu.hidden) { closeMenu(); gcat.focus(); } });
  }

  /* ---------- CakeLab ---------- */
  const lab = $('#cakelab'); if (!lab) return;
  const form = $('.lab__steps', lab);
  const steps = $$('.step', form);
  const prog = $$('.lab__progress li', lab);
  const bar = $('.lab__bar i', lab);
  const back = $('#lab-back'), next = $('#lab-next');
  const toast = $('.toast', lab);
  const sponges = $$('.cv-sponge', lab), fill = $('.cv-fill', lab), frost = $('.cv-frost', lab), top = $('.cv-top', lab), cake = $('.cv-cake', lab), label = $('.cv-label', lab);
  let cur = 1;
  const WA = 'https://wa.me/18157636521';

  // fechas: próximos lunes y martes (desde 3 días en adelante)
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const datesBox = $('#dates');
  const d0 = new Date(); d0.setHours(12, 0, 0, 0); d0.setDate(d0.getDate() + 3);
  let made = 0;
  for (let k = 0; made < 6 && k < 30; k++) {
    const d = new Date(d0); d.setDate(d0.getDate() + k);
    if (d.getDay() === 1 || d.getDay() === 2) {
      const txt = `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
      datesBox.insertAdjacentHTML('beforeend', `<label class="opt opt--date"><input type="radio" name="date" value="${txt}"><span class="opt__in"><small>${dias[d.getDay()]}</small><b>${d.getDate()}</b><small>${meses[d.getMonth()]}</small></span></label>`);
      made++;
    }
  }

  const val = n => (form.elements[n] && form.elements[n].value) || '';
  const valid = s => {
    if (s === 1) return !!val('size');
    if (s === 2) return !!val('flavor');
    if (s === 3) return !!val('filling');
    if (s === 4) return val('deco').trim().length > 1;
    if (s === 5) return !!val('date');
    return true;
  };
  const refresh = () => {
    next.disabled = !valid(cur);
    back.disabled = cur === 1;
  };
  const show = s => {
    cur = s; lab.dataset.step = s;
    steps.forEach(st => { const on = +st.dataset.step === s; st.hidden = !on; st.classList.toggle('is-on', on); });
    prog.forEach((li, i) => { li.classList.toggle('is-on', i + 1 === s); li.classList.toggle('is-done', i + 1 < s); });
    bar.style.width = `${Math.min(s - 1, 5) / 5 * 100}%`;
    $('.lab__nav', lab).hidden = s === 6;
    next.innerHTML = s === 5 ? `Ver mi receta ${I('chispa')}` : 'Siguiente →';
    if (s === 6) buildSummary();
    refresh();
    const first = steps[s - 1].querySelector('legend, h3');
    if (first && lab.dataset.touched) {
      const r = lab.querySelector('.lab__box').getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * .5) lab.querySelector('.lab__box').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };
  const pop = el => { if (reduce) return; el.classList.remove('pop'); void el.getBoundingClientRect(); el.classList.add('pop'); };

  form.addEventListener('change', e => {
    lab.dataset.touched = 1;
    const t = e.target;
    if (t.name === 'size') { cake.style.transform = `scale(${t.dataset.scale})`; label.textContent = `${t.value} · ${t.dataset.por}`; }
    if (t.name === 'flavor') { const c = t.dataset.color === 'marble' ? 'url(#marble)' : t.dataset.color; sponges.forEach(s => s.setAttribute('fill', c)); label.innerHTML = `Bizcocho de ${t.value.toLowerCase()} ${I('cake')}`; }
    if (t.name === 'filling') { fill.setAttribute('fill', t.dataset.color); fill.setAttribute('opacity', 1); label.textContent = `Relleno de ${t.value.toLowerCase()}`; }
    if (t.name === 'date') label.innerHTML = `Entrega: ${t.value} ${I('caja')}`;
    pop($('.cakeviz', lab));
    refresh();
  });
  const viz = $('.cakeviz', lab), preview = $('.lab__preview', lab);
  const THEMES = {
    spiderman: { word: 'Spider-Man', label: `¡Modo Spider-Man activado! ${I('web')}` },
    vintage: { word: 'Vintage corazón', label: `Blanco, vintage y con moños rojos ${I('bow')}` },
    ositos: { word: 'Ositos baby shower', label: `Ositos y azul bebé ${I('bear')}` },
    cumple: { word: 'Cumple pastel', label: `¡Arcoíris, chispitas y velitas! ${I('velita')}` },
    flores: { word: 'Flores', label: `Flores de crema por todos lados ${I('flor')}` },
    minimal: { word: 'Minimalista', label: `Blanquito y simple, con un drip ${I('drip')}` }
  };
  let theme = '';
  const setTheme = t => {
    viz.dataset.theme = t; preview.dataset.theme = t;
    if (THEMES[t]) label.innerHTML = THEMES[t].label;
    else if (t === 'default') label.innerHTML = `¡Con deco y todo! ${I('manga')}`;
  };
  const syncTheme = () => {
    const txt = val('deco').trim();
    if (txt.length <= 1) { theme = ''; $$('.idea', form).forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); }); return setTheme('none'); }
    if (theme && !txt.toLowerCase().includes(THEMES[theme].word.toLowerCase())) {
      theme = ''; $$('.idea', form).forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
    }
    setTheme(theme || 'default');
  };
  form.addEventListener('input', e => {
    if (e.target.name === 'deco') { syncTheme(); refresh(); }
  });
  $$('.idea', form).forEach(b => b.addEventListener('click', () => {
    const ta = form.elements.deco, t = b.dataset.theme, word = THEMES[t].word;
    let txt = ta.value.trim();
    if (theme && theme !== t) txt = txt.replace(THEMES[theme].word, word);
    if (!txt.toLowerCase().includes(word.toLowerCase())) txt = txt ? `${word}, ${txt}` : word;
    ta.value = txt; theme = t;
    $$('.idea', form).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    syncTheme(); refresh();
    pop(b); pop(viz);
  }));
  next.addEventListener('click', () => { if (valid(cur)) show(cur + 1); });
  back.addEventListener('click', () => { if (cur > 1) show(cur - 1); });
  // Enter en el input no envía el form
  form.addEventListener('submit', e => e.preventDefault());

  let text = '';
  function buildSummary() {
    const s = form.elements.size; const por = [...s].find(i => i.checked)?.dataset.por || '';
    const rows = [
      ['Tamaño', `${val('size')} (${por})`], ['Sabor', val('flavor')], ['Relleno', val('filling')],
      ['Decoración', val('deco').trim()], ...(val('msg').trim() ? [['Mensaje', `“${val('msg').trim()}”`]] : []),
      ['Entrega', `${val('date')} · a domicilio`]
    ];
    const esc = x => x.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    $('#summary').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    text = `¡Hola Kélda! Quiero un cake del CakeLab:\n` + rows.map(([k, v]) => `• ${k}: ${v}`).join('\n') + `\n¿Me confirmas disponibilidad? Gracias`;
    $('#send-wa').href = `${WA}?text=${encodeURIComponent(text)}`;
    const box = $('#done-cake');
    if (box) { const c = viz.cloneNode(true); c.classList.remove('pop'); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); box.replaceChildren(c); }
  }
  $('#send-ig').addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    toast.innerHTML = `${I('nota')} Receta copiada. Pégala en el DM`;
    toast.classList.add('on'); setTimeout(() => toast.classList.remove('on'), 3200);
  });
  $('#restart').addEventListener('click', () => {
    form.reset(); $$('.idea', form).forEach(x => x.classList.remove('on'));
    cake.style.transform = ''; sponges.forEach(s => s.setAttribute('fill', '#F7E1A6')); fill.setAttribute('opacity', .35); fill.setAttribute('fill', '#F3B7CC');
    theme = ''; setTheme('none'); $$('.idea', form).forEach(x => x.setAttribute('aria-pressed', 'false')); label.innerHTML = `Tu cake va tomando forma ${I('chispa')}`;
    show(1);
  });
  show(1);
})();
