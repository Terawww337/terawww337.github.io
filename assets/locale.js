(() => {
  'use strict';
  const supported = ['en', 'ru', 'uk', 'pl', 'de', 'es', 'ja', 'zh'];
  const aliases = {ua: 'uk', jp: 'ja', cn: 'zh'};
  const normalize = value => {
    const short = String(value || '').toLowerCase().split(/[-_]/)[0];
    return aliases[short] || short;
  };
  const get = () => { try { return localStorage.getItem('terawwwLanguage'); } catch { return null; } };
  const save = value => { try { localStorage.setItem('terawwwLanguage', value); } catch { /* URL also retains manual selection. */ } };
  const browser = () => (navigator.languages || [navigator.language]).map(normalize).find(code => supported.includes(code)) || 'en';
  const current = document.documentElement.dataset.locale || normalize(document.documentElement.lang) || 'en';
  const valid = choice => choice === 'auto' || supported.includes(choice);
  const query = new URLSearchParams(location.search).get('lang');
  let selected = query && valid(query) ? query : get();
  if (selected && !valid(selected)) selected = null;
  if (query && valid(query)) save(query);
  const route = code => code === 'en' ? '/' : `/${code}/`;
  const go = (choice, replace = false) => {
    const code = choice === 'auto' ? browser() : choice;
    const target = new URL(route(code), location.origin);
    target.searchParams.set('lang', choice);
    target.hash = location.hash;
    if (replace) location.replace(target.href);
    else location.assign(target.href);
  };
  // Explicit translated URLs remain shareable. Root is the automatic entry point.
  if (location.pathname === '/' || location.pathname === '/index.html') {
    selected ||= 'auto';
    save(selected);
    const target = selected === 'auto' ? browser() : selected;
    if (target !== current) { go(selected, true); return; }
  } else if (!query || !valid(query)) {
    selected = current;
  } else {
    const target = selected === 'auto' ? browser() : selected;
    if (target !== current) { go(selected, true); return; }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('language');
    if (!select) return;
    select.value = selected || current;
    const auto = select.querySelector('option[value="auto"]');
    if (auto) auto.textContent = `${select.dataset.auto || 'Auto'} · ${browser().toUpperCase()}`;
    select.addEventListener('change', () => {
      const choice = select.value;
      if (!valid(choice)) return;
      selected = choice;
      save(choice);
      const target = choice === 'auto' ? browser() : choice;
      if (target !== current) go(choice);
      else {
        const url = new URL(location.href);
        url.searchParams.set('lang', choice);
        history.replaceState(null, '', url);
      }
    });
  });
  window.addEventListener('languagechange', () => {
    if (selected === 'auto' && browser() !== current) go('auto', true);
  });
})();
