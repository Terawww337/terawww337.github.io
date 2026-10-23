(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('.effects-toggle');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('main-nav');
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas?.getContext('2d');
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  const title = document.querySelector('.hero-title');
  const titleWrap = document.querySelector('.hero-title-wrap');
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Settings still work. */ } }
  };
  let effects = storage.get('terawwwEffects') !== 'off';
  let frame = 0, lastPaint = 0, width = 0, height = 0, step = 24;
  let drops = [];
  let pointer = null, trailing = null;
  const chars = 'TERAWWW01WRITENOR//><[]{}';

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  function closeMenu(returnFocus = false) {
    if (!menu || !navigation) return;
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    if (returnFocus) menu.focus();
  }
  if (menu && navigation) {
    root.classList.add('menu-ready');
    menu.addEventListener('click', () => {
      const opened = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(opened));
      navigation.classList.toggle('is-open', opened);
      if (opened) navigation.querySelector('a')?.focus();
    });
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('nav')) closeMenu();
    });
    navigation.addEventListener('focusout', event => {
      if (event.relatedTarget && !event.relatedTarget.closest('nav')) closeMenu();
    });
  }

  function fitTitle() {
    if (!title || !titleWrap) return;
    const stretch = innerWidth <= 768 ? 1.12 : 1.28;
    titleWrap.style.setProperty('--hero-stretch', stretch);
    titleWrap.style.setProperty('--hero-fit', '1');
    titleWrap.style.setProperty('--hero-skew', '0deg');
    const available = Math.max(1, titleWrap.clientWidth - 40);
    const actual = title.getBoundingClientRect().width;
    if (actual) titleWrap.style.setProperty('--hero-fit', String(Math.min(1, available / actual)));
  }
  function resize() {
    fitTitle();
    if (!canvas || !ctx) return;
    width = innerWidth; height = innerHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(2500000 / (width * height)));
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    step = width < 600 ? 32 : 24;
    drops = Array.from({length: Math.min(96, Math.ceil(width / step))}, () => Math.random() * height / 16);
    if (innerWidth > 900) closeMenu();
  }
  function paint() {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(2,2,2,.13)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = '12px monospace';
    drops.forEach((drop, i) => {
      ctx.fillStyle = `rgba(255,0,60,${.12 + Math.random() * .28})`;
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * step, drop * 16);
      drops[i] = drop * 16 > height && Math.random() > .965 ? 0 : drop + .4;
    });
  }
  function animate(time) {
    frame = 0;
    if (document.hidden || !effects || reduced.matches) return;
    if (time - lastPaint >= 55) { paint(); lastPaint = time; }
    if (pointer && finePointer.matches && cursor && ring) {
      trailing ??= {...pointer};
      trailing.x += (pointer.x - trailing.x) * .14;
      trailing.y += (pointer.y - trailing.y) * .14;
      cursor.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${trailing.x}px,${trailing.y}px,0) translate(-50%,-50%)`;
    }
    frame = requestAnimationFrame(animate);
  }
  function syncEffects() {
    const active = effects && !reduced.matches;
    root.classList.toggle('effects-off', !active);
    root.classList.toggle('motion-ready', active);
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute('aria-pressed', String(active));
      const ru = root.lang.startsWith('ru');
      toggle.textContent = active ? (ru ? 'Эффекты: вкл' : 'Effects: on') : (ru ? 'Эффекты: выкл' : 'Effects: off');
      toggle.disabled = reduced.matches;
      toggle.title = reduced.matches ? (ru ? 'Уменьшение движения включено в системе' : 'Reduced motion is enabled in your system') : '';
    }
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (active && !document.hidden) frame = requestAnimationFrame(animate);
    else if (ctx) ctx.clearRect(0, 0, width, height);
  }
  toggle?.addEventListener('click', () => {
    effects = !effects;
    storage.set('terawwwEffects', effects ? 'on' : 'off');
    syncEffects();
  });
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || event.pointerType === 'touch') return;
    pointer = {x: event.clientX, y: event.clientY};
    root.classList.add('pointer-present');
    ring?.classList.toggle('hovered', Boolean(event.target.closest('a,button,input,textarea')));
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => root.classList.remove('pointer-present'));
  window.addEventListener('blur', () => root.classList.remove('pointer-present'));
  document.addEventListener('visibilitychange', syncEffects);
  reduced.addEventListener('change', syncEffects);
  finePointer.addEventListener('change', () => { pointer = null; trailing = null; root.classList.remove('pointer-present'); });
  window.addEventListener('resize', resize, {passive: true});
  document.fonts?.ready.then(fitTitle);
  resize();
  syncEffects();

  // The HTML stays readable if scripting or observation is unavailable.
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          observer.unobserve(entry.target);
        }
      });
    }, {rootMargin: '0px 0px 50px 0px', threshold: .02});
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(element => {
      if (element.getBoundingClientRect().top > innerHeight) element.classList.add('reveal-pending');
      observer.observe(element);
    });
  }
})();
