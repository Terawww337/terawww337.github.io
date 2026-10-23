(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
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
  const digits = '0123456789';
  const signature = '4678126748912';
  const paintInterval = 1000 / 24;
  let effects = storage.get('terawwwEffects') !== 'off';
  let frame = 0, lastPaint = 0, width = 0, height = 0;
  let streams = [], pointer = null, trailing = null;
  let heroVisible = true, nextTwitch = 0, twitchUntil = 0;
  const random = (min, max) => min + Math.random() * (max - min);
  const active = () => effects && !reduced.matches && !document.hidden;

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
      if (!(event.target instanceof Element) || !event.target.closest('nav')) closeMenu();
    });
    navigation.addEventListener('focusout', event => {
      if (event.relatedTarget instanceof Element && !event.relatedTarget.closest('nav')) closeMenu();
    });
  }

  function resetTwitch() {
    if (!titleWrap) return;
    titleWrap.style.setProperty('--jitter-x', '0px');
    titleWrap.style.setProperty('--jitter-y', '0px');
    titleWrap.style.setProperty('--jitter-skew', '0deg');
    titleWrap.style.setProperty('--jitter-stretch', '1');
    twitchUntil = 0;
  }
  function fitTitle() {
    if (!title || !titleWrap) return;
    const stretch = innerWidth <= 768 ? 1.12 : 1.28;
    titleWrap.style.setProperty('--hero-stretch', String(stretch));
    // scrollWidth measures the lettering before transforms, including during a twitch.
    const intrinsic = title.scrollWidth;
    const safeMargin = innerWidth < 600 ? 48 : 72;
    const available = Math.max(1, titleWrap.clientWidth - safeMargin);
    if (intrinsic) titleWrap.style.setProperty('--hero-fit', String(Math.min(1, available / (intrinsic * stretch * 1.045))));
  }
  function newStream(index, count, initial = false) {
    const mobile = width < 700;
    const length = Math.floor(random(mobile ? 7 : 9, mobile ? 18 : 28));
    const slot = width / count;
    const useSignature = Math.random() < .23;
    return {
      x: (index + random(.16, .84)) * slot,
      y: initial ? random(0, height + length * 15) : -random(20, height * .3),
      speed: random(mobile ? 38 : 48, mobile ? 105 : 145),
      length,
      alpha: random(.24, .63),
      cells: Array.from({length}, (_, cell) => useSignature ? signature[cell % signature.length] : digits[Math.floor(Math.random() * 10)])
    };
  }
  function resize() {
    fitTitle();
    if (innerWidth > 1040) closeMenu();
    if (!canvas || !ctx) return;
    width = Math.max(1, root.clientWidth);
    height = Math.max(1, innerHeight);
    const scale = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(2500000 / (width * height)));
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const count = Math.max(10, Math.min(width < 700 ? 26 : 128, Math.floor(width / (width < 700 ? 26 : 22))));
    streams = Array.from({length: count}, (_, index) => newStream(index, count, true));
    if (active()) paint(0);
  }
  function paint(delta) {
    if (!ctx) return;
    // Explicit transparent trails keep the red rain visible without laying black over the page.
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${width < 700 ? 12 : 13}px monospace`;
    ctx.textAlign = 'center';
    streams.forEach((stream, index) => {
      stream.y += stream.speed * delta;
      if (stream.y - stream.length * 15 > height) {
        streams[index] = newStream(index, streams.length);
        return;
      }
      for (let cell = stream.length - 1; cell >= 0; cell--) {
        const y = stream.y - cell * 15;
        if (y < -15 || y > height + 15) continue;
        if (Math.random() < .035) stream.cells[cell] = digits[Math.floor(Math.random() * 10)];
        const opacity = stream.alpha * Math.pow(1 - cell / stream.length, 1.25);
        ctx.fillStyle = cell === 0 ? `rgba(255,87,112,${Math.min(.88, opacity + .2)})` : `rgba(255,15,57,${opacity})`;
        if (cell === 0) {
          ctx.shadowColor = 'rgba(255,0,45,.6)';
          ctx.shadowBlur = 5;
        }
        ctx.fillText(stream.cells[cell], stream.x, y);
        if (cell === 0) ctx.shadowBlur = 0;
      }
    });
  }
  function twitch(time) {
    if (!titleWrap || !heroVisible) return;
    if (time >= nextTwitch && time >= twitchUntil) {
      twitchUntil = time + random(110, 260);
      nextTwitch = twitchUntil + random(330, 1500);
    }
    if (time < twitchUntil) {
      const intensity = innerWidth < 600 ? .7 : 1;
      titleWrap.style.setProperty('--jitter-x', `${random(-10, 10) * intensity}px`);
      titleWrap.style.setProperty('--jitter-y', `${random(-3, 3) * intensity}px`);
      titleWrap.style.setProperty('--jitter-skew', `${random(-2.1, 2.1) * intensity}deg`);
      titleWrap.style.setProperty('--jitter-stretch', String(random(.975, 1.035)));
    } else {
      resetTwitch();
    }
  }
  function positionCursor() {
    if (!pointer || !trailing || !cursor || !ring) return;
    cursor.style.transform = `translate3d(${pointer.x}px,${pointer.y}px,0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${trailing.x}px,${trailing.y}px,0) translate(-50%,-50%)`;
  }
  function releaseCursor() {
    pointer = null;
    trailing = null;
    root.classList.remove('pointer-present', 'custom-cursor');
    ring?.classList.remove('hovered');
  }
  function animate(time) {
    frame = 0;
    if (!active()) return;
    if (time - lastPaint >= paintInterval) {
      paint(Math.min(.08, (time - lastPaint) / 1000));
      twitch(time);
      lastPaint = time;
    }
    if (pointer && trailing && finePointer.matches) {
      trailing.x += (pointer.x - trailing.x) * .2;
      trailing.y += (pointer.y - trailing.y) * .2;
      positionCursor();
    }
    frame = requestAnimationFrame(animate);
  }
  function syncEffects() {
    const enabled = effects && !reduced.matches;
    root.classList.toggle('effects-off', !enabled);
    root.classList.toggle('motion-ready', enabled);
    if (toggle) {
      toggle.hidden = false;
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.textContent = reduced.matches ? (toggle.dataset.reduced || 'Effects: reduced') : enabled ? (toggle.dataset.on || 'Effects: on') : (toggle.dataset.off || 'Effects: off');
      toggle.disabled = reduced.matches;
      toggle.title = reduced.matches ? (toggle.dataset.reducedTitle || 'Reduced motion is enabled in your system') : '';
    }
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    releaseCursor();
    resetTwitch();
    if (enabled && !document.hidden) {
      lastPaint = performance.now();
      paint(0);
      frame = requestAnimationFrame(animate);
    } else if (ctx) ctx.clearRect(0, 0, width, height);
  }
  toggle?.addEventListener('click', () => {
    effects = !effects;
    storage.set('terawwwEffects', effects ? 'on' : 'off');
    syncEffects();
  });
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') { releaseCursor(); return; }
    if (!finePointer.matches || !active() || !cursor || !ring) return;
    pointer = {x: event.clientX, y: event.clientY};
    trailing ??= {...pointer};
    // Place both parts first; the native cursor is hidden only when a replacement is ready.
    positionCursor();
    root.classList.add('pointer-present', 'custom-cursor');
    ring.classList.toggle('hovered', event.target instanceof Element && Boolean(event.target.closest('a,button,input,textarea,select,label')));
  }, {passive: true});
  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') releaseCursor();
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', releaseCursor);
  document.addEventListener('pointercancel', releaseCursor);
  window.addEventListener('blur', releaseCursor);
  document.addEventListener('visibilitychange', syncEffects);
  reduced.addEventListener('change', syncEffects);
  finePointer.addEventListener('change', releaseCursor);
  window.addEventListener('resize', resize, {passive: true});
  document.fonts?.ready.then(fitTitle);

  titleWrap?.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch' && active()) nextTwitch = 0;
  });
  if (titleWrap && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      if (!heroVisible) resetTwitch();
    }).observe(titleWrap);
  }
  // Small local responses supplement CSS hover states without moving the layout.
  document.querySelectorAll('.btn, .link-item, .philosophy-block').forEach(element => {
    element.addEventListener('pointerdown', event => {
      if (active() && event.button === 0 && typeof element.animate === 'function') {
        element.animate([{filter: 'brightness(1)'}, {filter: 'brightness(1.7)'}, {filter: 'brightness(1)'}], {duration: 270, easing: 'ease-out'});
      }
    });
  });
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
