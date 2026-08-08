// ===========================================================================
// Applexium bilingual engine (Română = default, English = alternative)
// ---------------------------------------------------------------------------
// The page ships with Romanian as the real, crawlable HTML text. Every
// translatable node carries the English version in a `data-en` attribute
// (and `data-en-placeholder` / `data-en-aria-label` for those attributes).
// Switching to English swaps innerHTML to the data-en value; switching back
// restores the original Romanian, which we cache once on first run.
//
// SEO note: the default rendered language (Romanian) is what search engines
// index, because it lives in the static HTML. English is a client-side
// convenience layer only. See CLAUDE.md / the language-switcher decision.
// ===========================================================================
(function () {
  'use strict';

  var STORAGE_KEY = 'applexium-lang';
  var SUPPORTED = ['ro', 'en'];
  var DEFAULT_LANG = 'ro';

  function getStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v && SUPPORTED.indexOf(v) !== -1) return v;
    } catch (e) { /* localStorage blocked (private mode) — fall back */ }
    return DEFAULT_LANG;
  }

  // A ?lang=en / ?lang=ro query wins over the stored preference, so links can
  // be shared in a specific language (e.g. an English deep link for partners).
  function getInitialLang() {
    try {
      var q = new URLSearchParams(window.location.search).get('lang');
      if (q && SUPPORTED.indexOf(q) !== -1) return q;
    } catch (e) { /* URLSearchParams unsupported — ignore */ }
    return getStoredLang();
  }

  function storeLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var toEn = lang === 'en';

    // Text / inline-markup nodes
    var nodes = document.querySelectorAll('[data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute('data-ro') === null) {
        el.setAttribute('data-ro', el.innerHTML); // cache original Romanian once
      }
      el.innerHTML = toEn ? el.getAttribute('data-en') : el.getAttribute('data-ro');
    }

    // placeholder="" attributes (form inputs, textareas)
    var ph = document.querySelectorAll('[data-en-placeholder]');
    for (var p = 0; p < ph.length; p++) {
      var pe = ph[p];
      if (pe.getAttribute('data-ro-placeholder') === null) {
        pe.setAttribute('data-ro-placeholder', pe.getAttribute('placeholder') || '');
      }
      pe.setAttribute('placeholder', toEn
        ? pe.getAttribute('data-en-placeholder')
        : pe.getAttribute('data-ro-placeholder'));
    }

    // aria-label="" attributes (icon buttons, etc.)
    var al = document.querySelectorAll('[data-en-aria-label]');
    for (var a = 0; a < al.length; a++) {
      var ae = al[a];
      if (ae.getAttribute('data-ro-aria-label') === null) {
        ae.setAttribute('data-ro-aria-label', ae.getAttribute('aria-label') || '');
      }
      ae.setAttribute('aria-label', toEn
        ? ae.getAttribute('data-en-aria-label')
        : ae.getAttribute('data-ro-aria-label'));
    }

    // <title> tab text (read English from its own data-en attribute)
    var titleEl = document.querySelector('title[data-en]');
    if (titleEl) {
      if (titleEl.getAttribute('data-ro') === null) {
        titleEl.setAttribute('data-ro', titleEl.textContent);
      }
      document.title = toEn ? titleEl.getAttribute('data-en') : titleEl.getAttribute('data-ro');
    }

    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    // keep ARIA pressed state honest for assistive tech
    var btns = document.querySelectorAll('[data-lang-switch]');
    for (var b = 0; b < btns.length; b++) {
      btns[b].setAttribute('aria-pressed',
        btns[b].getAttribute('data-lang-switch') === lang ? 'true' : 'false');
    }

    storeLang(lang);

    // let other scripts (e.g. footer year) react to a language change
    try {
      document.dispatchEvent(new CustomEvent('applexium:langchange', { detail: { lang: lang } }));
    } catch (e) { /* CustomEvent unsupported — non-critical */ }
  }

  function init() {
    applyLang(getInitialLang());
    var btns = document.querySelectorAll('[data-lang-switch]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) {
        e.preventDefault();
        applyLang(this.getAttribute('data-lang-switch'));
      });
    }
  }

  // Public hook (used by script.js footer-year, and handy for debugging)
  window.ApplexiumI18n = { apply: applyLang, current: getStoredLang };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
