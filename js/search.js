/* FIXORA site search — SKU + category lookup over a static index.
   Self-mounting: builds its own nav button and overlay, so every page only
   needs <script src=".../js/search.js"></script> after site.js / store.js. */
(function () {
    'use strict';

    var BASE = (document.currentScript && document.currentScript.src || '')
        .replace(/js\/search\.js(\?.*)?$/, '');

    var UI = {
        placeholder: ['Search SKU or category…', 'Buscar SKU o categoría…', 'Rechercher SKU ou catégorie…'],
        label: ['Search', 'Buscar', 'Rechercher'],
        browse: ['Browse categories', 'Explorar categorías', 'Parcourir les catégories'],
        empty: ['No matches for', 'Sin resultados para', 'Aucun résultat pour'],
        hint: ['Try a SKU (DL38336) or a category (drawer slide).',
               'Pruebe un SKU (DL38336) o una categoría (drawer slide).',
               'Essayez un SKU (DL38336) ou une catégorie (drawer slide).'],
        count: ['results', 'resultados', 'résultats'],
        more: ['more', 'más', 'de plus'],
        kind: { sku: ['SKU', 'SKU', 'SKU'], category: ['Category', 'Categoría', 'Catégorie'], page: ['Page', 'Página', 'Page'] }
    };
    var LANGS = ['en', 'es', 'fr'];
    function lang() {
        var l = (typeof currentLanguage !== 'undefined' && currentLanguage) ||
            localStorage.getItem('fixora-language') || 'en';
        return LANGS.indexOf(l) < 0 ? 'en' : l;
    }
    function t(key) { var v = UI[key]; return v[LANGS.indexOf(lang())] || v[0]; }
    function pick(obj) { return obj ? (obj[lang()] || obj.en || '') : ''; }

    function norm(s) {
        return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    function squash(s) { return norm(s).replace(/[^a-z0-9]+/g, ''); }
    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    /* ---------------------------------------------------------------- index */
    var index = null, loading = null, cacheLang = null;

    // Loaded as a plain <script> so the panel also works over file://.
    function load() {
        if (index) return Promise.resolve(index);
        if (!loading) {
            loading = new Promise(function (resolve) {
                if (window.FIXORA_SEARCH_INDEX) { resolve(window.FIXORA_SEARCH_INDEX); return; }
                var s = document.createElement('script');
                s.src = BASE + 'search-index.js';
                s.onload = function () { resolve(window.FIXORA_SEARCH_INDEX || []); };
                s.onerror = function () { resolve([]); };
                document.head.appendChild(s);
            }).then(function (d) { index = d; return d; });
        }
        return loading;
    }

    // Per-language haystacks, rebuilt when the visitor switches language.
    function prepare() {
        if (cacheLang === lang()) return;
        cacheLang = lang();
        index.forEach(function (e) {
            e._t = pick(e.t);
            e._c = pick(e.c);
            e._s = pick(e.s);
            e._tS = squash(e._t);
            e._cN = norm(e._c);
            e._sN = norm(e._s);
            // match against every language's title so an English SKU/category
            // still resolves while browsing in Spanish or French
            e._allS = LANGS.map(function (l) { return squash((e.t || {})[l]); }).join(' ');
            e._allN = LANGS.map(function (l) {
                return norm(((e.t || {})[l] || '') + ' ' + ((e.c || {})[l] || ''));
            }).join(' ');
        });
    }

    var KIND_BONUS = { sku: 30, category: 22, page: 0 };

    function scoreToken(e, tok) {
        var ts = squash(tok);
        if (!ts) return 0;
        if (e._tS === ts) return 1000;
        if (e._tS.indexOf(ts) === 0) return 600;
        if (e._tS.indexOf(ts) >= 0) return 350;
        if (e._allS.indexOf(ts) >= 0) return 300;          // other-language title
        if (e._cN.indexOf(tok) >= 0) return 150;
        if (e._allN.indexOf(tok) >= 0) return 130;         // other-language category
        if (e._sN.indexOf(tok) >= 0) return 70;
        return 0;
    }

    function search(q) {
        prepare();
        var toks = norm(q).split(/\s+/).filter(Boolean);
        if (!toks.length) return [];
        var out = [];
        for (var i = 0; i < index.length; i++) {
            var e = index[i], total = 0, ok = true;
            for (var j = 0; j < toks.length; j++) {
                var tok = toks[j];
                var s = scoreToken(e, tok);
                // tolerate a plural the catalogue writes in the singular
                if (!s && tok.length > 3 && tok.slice(-1) === 's') s = scoreToken(e, tok.slice(0, -1)) * 0.9;
                if (!s) { ok = false; break; }
                total += s;
            }
            if (ok) out.push({ e: e, score: total + (KIND_BONUS[e.k] || 0) });
        }
        out.sort(function (a, b) {
            return b.score - a.score || a.e._t.length - b.e._t.length || a.e._t.localeCompare(b.e._t);
        });
        return out;
    }

    /* ------------------------------------------------------------------- ui */
    var panel, input, list, status, toggle, hits = [], active = -1;

    function mount() {
        var menu = document.getElementById('navMenu');
        if (!menu || document.getElementById('siteSearchToggle')) return;

        var li = document.createElement('li');
        li.className = 'nav-search';
        li.innerHTML = '<button type="button" class="search-toggle" id="siteSearchToggle" ' +
            'aria-label="' + esc(t('label')) + '" aria-expanded="false">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
            '<circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line>' +
            '</svg></button>';
        var langLi = menu.querySelector('.language-selector');
        menu.insertBefore(li, langLi || null);
        toggle = li.firstChild;

        panel = document.createElement('div');
        panel.className = 'site-search';
        panel.id = 'siteSearch';
        panel.hidden = true;
        panel.innerHTML =
            '<div class="ss-backdrop" data-close></div>' +
            '<div class="ss-panel" role="dialog" aria-modal="true" aria-label="' + esc(t('label')) + '">' +
            '  <div class="ss-field">' +
            '    <svg class="ss-icon" viewBox="0 0 24 24" aria-hidden="true">' +
            '<circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>' +
            '    <input type="search" id="siteSearchInput" autocomplete="off" spellcheck="false"' +
            '           aria-controls="siteSearchList" aria-autocomplete="list">' +
            '    <button type="button" class="ss-close" data-close aria-label="Close">&times;</button>' +
            '  </div>' +
            '  <div class="ss-status" id="siteSearchStatus"></div>' +
            '  <div class="ss-list" id="siteSearchList" role="listbox"></div>' +
            '</div>';
        document.body.appendChild(panel);

        input = panel.querySelector('#siteSearchInput');
        list = panel.querySelector('#siteSearchList');
        status = panel.querySelector('#siteSearchStatus');
        localize();

        toggle.addEventListener('click', function () { panel.hidden ? open() : close(); });
        panel.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) close(); });
        input.addEventListener('input', function () { render(input.value); });
        input.addEventListener('keydown', onKey);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !panel.hidden) { close(); return; }
            if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); return; }
            if (e.key === '/' && panel.hidden && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
                e.preventDefault(); open();
            }
        });

        // keep placeholder + results in sync with the language switcher
        var orig = window.changeLanguage;
        if (typeof orig === 'function') {
            window.changeLanguage = function (l) {
                orig.apply(this, arguments);
                localize();
                if (!panel.hidden) render(input.value);
            };
        }
    }

    function localize() {
        input.placeholder = t('placeholder');
        if (toggle) toggle.setAttribute('aria-label', t('label'));
    }

    function open() {
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('ss-open');
        load().then(function () { render(input.value); });
        setTimeout(function () { input.focus(); input.select(); }, 20);
    }

    function close() {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('ss-open');
        active = -1;
    }

    var MAX = 24;

    function render(q) {
        if (!index) return;
        q = (q || '').trim();
        active = -1;
        if (!q) {
            prepare();
            hits = index.filter(function (e) { return e.k === 'category'; })
                .sort(function (a, b) { return a._t.localeCompare(b._t); })
                .slice(0, 10).map(function (e) { return { e: e, score: 0 }; });
            status.textContent = t('browse');
            paint('');
            return;
        }
        var res = search(q);
        hits = res.slice(0, MAX);
        if (!res.length) {
            status.textContent = t('empty') + ' “' + q + '”';
            list.innerHTML = '<p class="ss-hint">' + esc(t('hint')) + '</p>';
            return;
        }
        status.textContent = res.length + ' ' + t('count') +
            (res.length > MAX ? ' · ' + (res.length - MAX) + ' ' + t('more') : '');
        paint(q);
    }

    function mark(text, q) {
        var toks = norm(q).split(/\s+/).filter(Boolean);
        if (!toks.length) return esc(text);
        var n = norm(text), best = null;
        toks.forEach(function (tok) {
            var i = n.indexOf(tok);
            if (i >= 0 && (!best || i < best[0])) best = [i, tok.length];
        });
        if (!best) return esc(text);
        return esc(text.slice(0, best[0])) + '<mark>' +
            esc(text.slice(best[0], best[0] + best[1])) + '</mark>' +
            esc(text.slice(best[0] + best[1]));
    }

    function paint(q) {
        list.innerHTML = hits.map(function (h, i) {
            var e = h.e;
            // SKUs show just their leaf category; categories show the full path
            var cat = e.k === 'sku' && e._c ? e._c.split(' · ').pop() : e._c;
            var meta = [cat, e._s].filter(Boolean).join(' · ');
            var img = e.i
                ? '<img src="' + esc(BASE + e.i) + '" alt="" loading="lazy" onerror="this.remove()">'
                : '';
            return '<a class="ss-hit" role="option" id="ss-hit-' + i + '" href="' + esc(BASE + e.u) + '">' +
                '<span class="ss-thumb">' + img + '</span>' +
                '<span class="ss-body"><span class="ss-title">' + mark(e._t, q) + '</span>' +
                (meta ? '<span class="ss-meta">' + esc(meta) + '</span>' : '') + '</span>' +
                '<span class="ss-kind ss-' + e.k + '">' + esc(UI.kind[e.k][LANGS.indexOf(lang())] || e.k) + '</span>' +
                '</a>';
        }).join('');
        list.scrollTop = 0;
    }

    function setActive(i) {
        var nodes = list.querySelectorAll('.ss-hit');
        if (!nodes.length) return;
        if (active >= 0 && nodes[active]) nodes[active].classList.remove('is-active');
        active = (i + nodes.length) % nodes.length;
        nodes[active].classList.add('is-active');
        nodes[active].scrollIntoView({ block: 'nearest' });
        input.setAttribute('aria-activedescendant', nodes[active].id);
    }

    function onKey(e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
        else if (e.key === 'Enter') {
            var nodes = list.querySelectorAll('.ss-hit');
            var target = nodes[active >= 0 ? active : 0];
            if (target) { e.preventDefault(); location.href = target.href; }
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
})();
