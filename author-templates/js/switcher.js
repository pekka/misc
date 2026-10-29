/*
 * Template switcher for the author-page proof of concept.
 *
 * - Swaps the theme stylesheet (css/themes/<id>.css).
 * - Clones the single .book in .books to the chosen count and tells the
 *   theme which layout to use via data-layout: single | pair | grid.
 * - Overrides the theme's --bg and sets data-tone="light|dark" on <html>
 *   so every theme can keep text readable on any background.
 *
 * State comes from the URL (?theme=&books=&bg=) first, then localStorage.
 */
(() => {
  const THEMES = [
    { id: 'orchard',    name: 'Orchard',    note: 'Warm, rustic, hand-made', swatch: ['#f4ecdc', '#2f4a2b', '#b3322a'] },
    { id: 'broadsheet', name: 'Broadsheet', note: 'Newspaper front page',    swatch: ['#f3efe4', '#111111', '#b4141e'] },
    { id: 'cellar',     name: 'Cellar',     note: 'Dark and cinematic',      swatch: ['#15110e', '#d8b26a', '#efe6d6'] },
    { id: 'poppress',   name: 'Pop Press',  note: 'Loud neo-brutalist zine', swatch: ['#ffe14d', '#ff4f9a', '#111111'] },
    { id: 'gallery',    name: 'Gallery',    note: 'Quiet museum minimal',    swatch: ['#f1f0ec', '#1d1d1b', '#9a978f'] },
    { id: 'daylight',   name: 'Daylight',   note: 'Bright, calm, neutral',   swatch: ['#f7f5f0', '#22201c', '#a08a68'] },
    { id: 'keynote',    name: 'Keynote',    note: 'Clean product-launch tech', swatch: ['#ffffff', '#f5f5f7', '#0071e3'] },
    { id: 'thriller',   name: 'Thriller',   note: 'Bold, dark, high tension', swatch: ['#0b0b0c', '#e10600', '#f2f2f2'] },
    { id: 'orbit',      name: 'Orbit',      note: 'Neon sci-fi HUD',         swatch: ['#060a14', '#36e2ff', '#ff3dbb'] },
  ];
  const BG_PRESETS = ['#ffffff', '#f4ecdc', '#e8efe2', '#f6e2dc', '#dfe7f0', '#ffe14d', '#1c1c1c', '#15231b', '#2b1a22', '#0c1430'];
  const MIN_BOOKS = 1;
  const MAX_BOOKS = 12;
  const MAX_STACK = 5;
  // Columns per row for each book count, chosen so rows stay balanced
  // (5 → 3+2, 7 → 4+3) instead of leaving a single orphan.
  const COLS = [1, 1, 2, 3, 4, 3, 3, 4, 4, 5, 5, 4, 4];
  const STORE = 'authorTemplateState';

  const root = document.documentElement;
  const books = document.querySelector('.books');
  const bookTemplate = books.querySelector('.book').cloneNode(true);
  const stack = document.querySelector('.series-stack');
  const stackTemplate = stack ? stack.querySelector('img').cloneNode(true) : null;

  const state = { theme: 'orchard', count: 1, bg: null };

  function readSaved() {
    try {
      Object.assign(state, JSON.parse(localStorage.getItem(STORE)) || {});
    } catch (e) { /* storage unavailable: use defaults */ }
    const q = new URLSearchParams(location.search);
    if (q.has('theme')) state.theme = q.get('theme');
    if (q.has('books')) state.count = parseInt(q.get('books'), 10);
    if (q.has('bg')) state.bg = q.get('bg') === 'default' ? null : q.get('bg');
    if (!THEMES.some(t => t.id === state.theme)) state.theme = 'orchard';
    state.count = clampCount(state.count);
    if (state.bg && !/^#[0-9a-f]{6}$/i.test(state.bg)) state.bg = null;
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function clampCount(n) {
    return Math.min(MAX_BOOKS, Math.max(MIN_BOOKS, Number.isFinite(n) ? n : 1));
  }

  /* ---------- books ---------- */

  function renderBooks() {
    const n = state.count;
    const items = Array.from({ length: n }, (_, i) => {
      const book = bookTemplate.cloneNode(true);
      book.style.setProperty('--i', i);
      const no = book.querySelector('.book-series-no');
      if (no) no.textContent = `(Book ${i + 1})`;
      return book;
    });
    books.replaceChildren(...items);
    books.style.setProperty('--n', n);
    books.style.setProperty('--cols', COLS[n] || 4);
    books.dataset.count = n;
    books.dataset.layout = n === 1 ? 'single' : n === 2 ? 'pair' : 'grid';
    books.dataset.density = n >= 6 ? 'dense' : 'normal';
    root.dataset.books = n;

    if (stack) {
      const s = Math.min(n, MAX_STACK);
      stack.replaceChildren(...Array.from({ length: s }, (_, i) => {
        const img = stackTemplate.cloneNode(true);
        img.style.setProperty('--i', i);
        return img;
      }));
      stack.style.setProperty('--n', s);
      stack.dataset.count = s;
    }
  }

  /* ---------- theme ---------- */

  function applyTheme(onDone) {
    const current = document.getElementById('theme-css');
    const href = `css/themes/${state.theme}.css`;
    root.dataset.theme = state.theme;
    if (current.getAttribute('href') === href) { onDone && onDone(); return; }
    // Load the new sheet next to the old one, then drop the old one, so the
    // page never shows up unstyled in between.
    const next = document.createElement('link');
    next.rel = 'stylesheet';
    next.href = href;
    const finish = () => {
      current.remove();
      next.id = 'theme-css';
      onDone && onDone();
    };
    next.addEventListener('load', finish, { once: true });
    next.addEventListener('error', finish, { once: true });
    current.after(next);
  }

  /* ---------- background ---------- */

  const probe = document.createElement('span');
  function toRgb(color) {
    probe.style.color = '';
    probe.style.color = color;
    document.body.appendChild(probe);
    const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [255, 255, 255];
    probe.remove();
    return m.slice(0, 3).map(Number);
  }
  function toHex(rgb) {
    return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
  function luminance([r, g, b]) {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }

  function applyBg() {
    if (state.bg) root.style.setProperty('--bg', state.bg);
    else root.style.removeProperty('--bg');
    const value = state.bg || getComputedStyle(root).getPropertyValue('--bg').trim() || '#ffffff';
    const rgb = toRgb(value);
    root.dataset.tone = luminance(rgb) < 0.22 ? 'dark' : 'light';
    if (ui.color) ui.color.value = toHex(rgb);
    ui.swatches.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bg === state.bg)));
    if (ui.reset) ui.reset.setAttribute('aria-pressed', String(!state.bg));
  }

  /* ---------- sticky header ---------- */

  // Publish header measurements for the sticky-menu rules in base.css.
  function watchHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return () => {};
    const nav = header.querySelector('.site-nav');
    const measure = () => {
      root.style.setProperty('--header-h', `${header.offsetHeight}px`);
      if (nav) root.style.setProperty('--nav-offset', `${nav.offsetTop}px`);
    };
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header);
    addEventListener('resize', measure);
    const onScroll = () => root.toggleAttribute('data-scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    measure();
    return measure;
  }

  /* ---------- UI ---------- */

  const ui = { swatches: [] };

  function buildUI() {
    const wrap = document.createElement('div');
    wrap.className = 'tpl-switcher';
    wrap.innerHTML = `
      <button type="button" class="tpl-toggle" aria-expanded="false" aria-controls="tpl-panel" title="Page style">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c2.5 0 4.6-2.1 4.6-4.6C22 6.1 17.5 3 12 3zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
        <span class="tpl-toggle-label">Style</span>
      </button>
      <div class="tpl-panel" id="tpl-panel" role="dialog" aria-label="Page style settings" hidden>
        <fieldset class="tpl-group">
          <legend>Template</legend>
          <div class="tpl-themes">
            ${THEMES.map(t => `
              <button type="button" class="tpl-theme" data-theme="${t.id}" aria-pressed="false">
                <span class="tpl-sw">${t.swatch.map(c => `<i style="background:${c}"></i>`).join('')}</span>
                <span class="tpl-theme-text"><b>${t.name}</b><small>${t.note}</small></span>
              </button>`).join('')}
          </div>
        </fieldset>
        <fieldset class="tpl-group">
          <legend>Books on the page</legend>
          <div class="tpl-count">
            <button type="button" class="tpl-step" data-step="-1" aria-label="Fewer books">−</button>
            <input type="range" class="tpl-range" min="${MIN_BOOKS}" max="${MAX_BOOKS}" step="1" aria-label="Number of books">
            <button type="button" class="tpl-step" data-step="1" aria-label="More books">+</button>
            <output class="tpl-count-out"></output>
          </div>
        </fieldset>
        <fieldset class="tpl-group">
          <legend>Background colour</legend>
          <div class="tpl-bg">
            <button type="button" class="tpl-reset" aria-pressed="true">Template default</button>
            ${BG_PRESETS.map(c => `<button type="button" class="tpl-swatch" data-bg="${c}" style="background:${c}" aria-label="Background ${c}" aria-pressed="false"></button>`).join('')}
            <label class="tpl-custom" title="Pick any colour"><input type="color" class="tpl-color" aria-label="Custom background colour"><span>Custom</span></label>
          </div>
        </fieldset>
      </div>`;
    document.body.appendChild(wrap);

    ui.wrap = wrap;
    ui.toggle = wrap.querySelector('.tpl-toggle');
    ui.panel = wrap.querySelector('.tpl-panel');
    ui.themes = [...wrap.querySelectorAll('.tpl-theme')];
    ui.range = wrap.querySelector('.tpl-range');
    ui.out = wrap.querySelector('.tpl-count-out');
    ui.color = wrap.querySelector('.tpl-color');
    ui.reset = wrap.querySelector('.tpl-reset');
    ui.swatches = [...wrap.querySelectorAll('.tpl-swatch')];

    const setOpen = open => {
      ui.panel.hidden = !open;
      ui.toggle.setAttribute('aria-expanded', String(open));
    };
    ui.toggle.addEventListener('click', () => setOpen(ui.panel.hidden));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !ui.panel.hidden) { setOpen(false); ui.toggle.focus(); }
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) setOpen(false); });

    ui.themes.forEach(b => b.addEventListener('click', () => {
      state.theme = b.dataset.theme;
      state.bg = null; // each template starts on its own background
      syncThemeButtons();
      applyTheme(() => { applyBg(); measureHeader(); });
      save();
    }));

    const setCount = n => {
      state.count = clampCount(n);
      syncCount();
      renderBooks();
      save();
    };
    ui.range.addEventListener('input', () => setCount(parseInt(ui.range.value, 10)));
    wrap.querySelectorAll('.tpl-step').forEach(b =>
      b.addEventListener('click', () => setCount(state.count + Number(b.dataset.step))));

    const setBg = c => { state.bg = c; applyBg(); save(); };
    ui.reset.addEventListener('click', () => setBg(null));
    ui.swatches.forEach(b => b.addEventListener('click', () => setBg(b.dataset.bg)));
    ui.color.addEventListener('input', () => setBg(ui.color.value));
  }

  function syncThemeButtons() {
    ui.themes.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === state.theme)));
  }
  function syncCount() {
    ui.range.value = state.count;
    ui.out.textContent = state.count === 1 ? '1 book' : `${state.count} books`;
  }

  /* ---------- init ---------- */

  readSaved();
  const measureHeader = watchHeader();
  buildUI();
  syncThemeButtons();
  syncCount();
  renderBooks();
  applyTheme(() => { applyBg(); measureHeader(); });
  // Web fonts change the header height after load
  if (document.fonts) document.fonts.ready.then(measureHeader);
})();
