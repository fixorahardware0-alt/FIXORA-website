#!/usr/bin/env python3
"""Build search-index.json for the FIXORA site.

Scans every page and emits one entry per product / category / content page,
with trilingual title, subtitle and category path plus a thumbnail.
Run from the site root:  python3 tools/search/build_index.py
"""
import glob, html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LANGS = ('en', 'es', 'fr')
SKIP = {'index_light_20260623.html', 'index-updated.html', 'FIXORA-single-file.html'}

def txt(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or ''))).strip()

def tri(tag):
    """Pull data-en/es/fr off an element's attribute string, falling back to inner text."""
    if not tag:
        return None
    attrs, inner = tag
    out = {}
    for l in LANGS:
        m = re.search(r'data-%s="([^"]*)"' % l, attrs)
        if m:
            out[l] = txt(m.group(1))
    if not out:
        t = txt(inner)
        if not t:
            return None
        out = {'en': t}
    out.setdefault('en', out.get('es') or out.get('fr') or '')
    return out

def find(pat, s, flags=0):
    m = re.search(pat, s, flags)
    return (m.group(1), m.group(2)) if m else None

PAGE_NAMES = {
    'index.html':        ('Home', 'Inicio', 'Accueil'),
    'about.html':        ('About', 'Acerca de', 'À Propos'),
    'why.html':          ('Why FIXORA', 'Por Qué FIXORA', 'Pourquoi FIXORA'),
    'products.html':     ('Products', 'Productos', 'Produits'),
    'applications.html': ('Applications', 'Aplicaciones', 'Applications'),
    'partner.html':      ('Partner', 'Asóciese', 'Partenariat'),
    'resources.html':    ('Resources', 'Recursos', 'Ressources'),
    'faq.html':          ('FAQs', 'Preguntas Frecuentes', 'FAQ'),
    'contact.html':      ('Contact Sales', 'Contactar Ventas', 'Contacter les Ventes'),
    'catalog.html':      ('Product Catalog', 'Catálogo de Productos', 'Catalogue Produits'),
}


def breadcrumb(doc):
    """Category path from the breadcrumb, skipping the leading 'Products' crumb."""
    m = re.search(r'<div class="breadcrumb">(.*?)</div>', doc, re.S)
    if not m:
        return None
    parts = []
    for am, inner in re.findall(r'<(?:a|span)([^>]*)>(.*?)</(?:a|span)>', m.group(1), re.S):
        t = tri((am, inner))
        if t and t['en'] and t['en'].lower() not in ('products', 'home'):
            parts.append(t)
    if not parts:
        return None
    # drop the last crumb when it just repeats the page's own title
    return {l: ' · '.join(p.get(l, p['en']) for p in parts) for l in LANGS}

def first_image(doc, page_dir):
    """Thumbnail for a result — the page's own hero/product shot, never the
    nav mega-menu images that sit above it."""
    body = doc.split('</nav>', 1)[-1]
    main = re.search(r'<img class="main-img"[^>]+src="([^"]+)"', body)
    if main:
        cands = [main.group(1)]
    else:
        cands = re.findall(r'<img[^>]+src="([^"]+)"', body)
    for src in cands:
        if src.startswith(('http', 'data:')) or 'logo' in src.lower():
            continue
        return os.path.normpath(os.path.join(page_dir, src)).replace(os.sep, '/')
    return None

def entry(path):
    rel = os.path.relpath(path, ROOT).replace(os.sep, '/')
    doc = open(path, encoding='utf-8').read()
    page_dir = os.path.dirname(rel)
    title_tag = find(r'<title([^>]*)>(.*?)</title>', doc, re.S)
    page_title = txt(title_tag[1]).replace(' | FIXORA', '') if title_tag else ''

    sku = re.search(r'<h1 class="sku-name">(.*?)</h1>', doc, re.S)
    head_h1 = find(r'<h1([^>]*)>(.*?)</h1>', doc, re.S)
    lead = find(r'<p class="lead"([^>]*)>(.*?)</p>', doc, re.S)
    head_p = find(r'<div class="page-head">.*?<h1[^>]*>.*?</h1>\s*<p([^>]*)>(.*?)</p>', doc, re.S)
    cat = breadcrumb(doc)

    if sku:                                    # product detail page
        kind, name = 'sku', {l: txt(sku.group(1)) for l in LANGS}
        sub = tri(lead)
    elif page_dir == 'products':               # smart-lock / category / subcategory page
        name = tri(head_h1)
        if not name:
            return None
        sub = tri(lead) or tri(head_p)
        # smart-lock detail pages carry their model in the <title>
        model = re.match(r'([A-Z][A-Z0-9\-]{3,})\s', page_title)
        if model and lead:
            kind = 'sku'
            code = model.group(1)
            name = {l: code for l in LANGS}
            sub = tri(head_h1)
        else:
            kind = 'category'
    else:                                      # root content page
        kind = 'page'
        base = os.path.basename(rel)
        if base in PAGE_NAMES:
            name = dict(zip(LANGS, PAGE_NAMES[base]))
        else:
            name = tri(head_h1) or {l: page_title for l in LANGS}
        sub = tri(head_h1) or tri(head_p) or tri(lead)

    if cat:   # drop a trailing crumb that just repeats this page's own title
        last = cat['en'].split(' · ')[-1]
        if last == name.get('en'):
            cat = ({l: v.rsplit(' · ', 1)[0] for l, v in cat.items()}
                   if ' · ' in cat['en'] else None)

    # clean URL: Vercel serves products/foo.html at /products/foo
    url = '' if rel == 'index.html' else re.sub(r'\.html$', '', rel)
    e = {'u': url, 'k': kind, 't': name}
    if sub and sub.get('en'):
        e['s'] = sub
    if cat:
        e['c'] = cat
    img = first_image(doc, page_dir)
    if img:
        e['i'] = img
    return e

def main():
    pages = sorted(glob.glob(f'{ROOT}/*.html')) + sorted(glob.glob(f'{ROOT}/products/*.html'))
    out = []
    for p in pages:
        if os.path.basename(p) in SKIP:
            continue
        try:
            e = entry(p)
        except Exception as err:                       # pragma: no cover
            print('  !! ', p, err); continue
        if e and e['t'].get('en'):
            out.append(e)
    order = {'sku': 0, 'category': 1, 'page': 2}
    out.sort(key=lambda e: (order[e['k']], e['t']['en']))
    # Emitted as JS rather than JSON so the search also works when the site is
    # opened straight from disk (file:// blocks fetch/XHR, but not <script>).
    dest = f'{ROOT}/search-index.js'
    body = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    with open(dest, 'w', encoding='utf-8') as fh:
        fh.write('window.FIXORA_SEARCH_INDEX=' + body + ';\n')
    n = {k: sum(1 for e in out if e['k'] == k) for k in order}
    print(f"{len(out)} entries -> search-index.js "
          f"({os.path.getsize(dest)/1024:.0f} KB)  {n}")

main()
