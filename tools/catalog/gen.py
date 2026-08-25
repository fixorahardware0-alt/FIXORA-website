#!/usr/bin/env python3
# Generates the Cabinet & Furniture Hardware section for the FIXORA site.
import json, os, re, html, glob

ROOT = '/Users/shujingzhong/ProBuilder/FIXORA/website'
DATA = json.load(open(os.path.dirname(os.path.abspath(__file__)) + '/products.json'))
SUBS = DATA['subcats']
IMGDIR = 'images/products/Cabinet_Furniture_Hardware'

CAT_EN = 'Cabinet &amp; Furniture Hardware'
CAT_ES = 'Herrajes para Gabinetes y Muebles'
CAT_FR = 'Quincaillerie de Meuble et d\'Armoire'

def fname(sku):
    return sku.replace('/', '-').replace('+', '-')

def page_of(sub, sku):
    """Output filename; hrefs use link() so the .html never reaches the markup."""
    return f'cf-{sub["slug"]}-{fname(sku)}.html'


def link(page):
    """Vercel serves foo.html at /foo — link to the clean form."""
    return page[:-5] if page.endswith('.html') else page

def esc(s):
    return html.escape(s, quote=True)

# ---------------------------------------------------------------- nav / footer
# The nav mega-menu lives in the pages themselves; gen.py copies it verbatim
# from the reference page instead of re-injecting its own copy.
def patch_nav(text, p):
    return text

FOOT_LI_RE = re.compile(
    r'(<li><a href="((?:\.\./)?products/)?sliding-door-hardware(?:\.html)?"[^>]*></a></li>)')

def patch_footer(text, p):
    """Add the new category to the footer Product list (once)."""
    if 'furniture-hardware.html" data-en="Cabinet' in text:
        return text
    href = 'products/furniture-hardware.html' if p == '' else 'furniture-hardware'
    add = (f'<li><a href="{href}" data-en="{CAT_EN}" data-es="{CAT_ES}" '
           f'data-fr="{CAT_FR}"></a></li>')
    def rep(m):
        return m.group(1) + '\n                        ' + add
    return FOOT_LI_RE.sub(rep, text, count=1)

# ------------------------------------------------------------------ page parts
def head(title, prefix):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | FIXORA</title>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="store.css">
</head>
<body class="dh">
'''

def crumb(*parts):
    out = []
    for i, (label, href) in enumerate(parts):
        tail = ' &nbsp;/&nbsp;' if i < len(parts) - 1 else ''
        if href:
            out.append(f'            <a href="{href}" {label}></a>{tail}')
        else:
            out.append(f'            <span {label}></span>{tail}')
    return '\n'.join(out)

L_PRODUCTS = 'data-en="Products" data-es="Productos" data-fr="Produits"'
L_CAT = f'data-en="{CAT_EN}" data-es="{CAT_ES}" data-fr="{CAT_FR}"'

def sub_label(s):
    return f'data-en="{esc(s["name"])}" data-es="{esc(s["es"])}" data-fr="{esc(s["fr"])}"'

# ------------------------------------------------------------------ generators
def gen_category(nav, footer):
    cards = []
    for s in SUBS:
        n = len(s['products'])
        first = s.get('cover', s['products'][0]['sku'])
        cards.append(f'''            <a class="product-card" href="cf-{s['slug']}">
                <div class="media"><img src="../{IMGDIR}/{s['slug']}/{fname(first)}.jpg" alt="{esc(s['name'])}" loading="lazy"></div>
                <div class="body">
                    <span class="model" {L_CAT}></span>
                    <h3 {sub_label(s)}></h3>
                    <p data-en="{esc(s['desc'])}" data-es="{esc(s['desc_es'])}" data-fr="{esc(s['desc_fr'])}"></p>
                    <span class="view" data-en="View {n} Products &rarr;" data-es="Ver {n} Productos &rarr;" data-fr="Voir {n} Produits &rarr;"></span>
                </div>
            </a>''')
    body = f'''    <div class="page">
        <div class="breadcrumb">
{crumb((L_PRODUCTS, '../products'), (L_CAT, None))}
        </div>
        <div class="page-head">
            <span class="eyebrow" data-en="Product System" data-es="Sistema de Productos" data-fr="Système de Produits"></span>
            <h1 {L_CAT}></h1>
            <p data-en="Drawer slides, cabinet hinges, handles, wire storage, sliding door fittings, sofa legs, and furniture fittings &mdash; a complete cabinet and furniture hardware program for the North American trade." data-es="Correderas de cajón, bisagras de gabinete, tiradores, almacenamiento de alambre, herrajes para puertas correderas, patas de sofá y accesorios para muebles &mdash; un programa completo de herrajes para gabinetes y muebles para el sector norteamericano." data-fr="Coulisses de tiroir, charnières de meuble, poignées, rangement filaire, ferrures coulissantes, pieds de canapé et ferrures de meuble &mdash; un programme complet de quincaillerie pour le marché nord-américain."></p>
        </div>
        <div class="product-list">
{chr(10).join(cards)}
        </div>
    </div>
'''
    return head('Cabinet &amp; Furniture Hardware', '../') + nav + body + footer

def gen_sub(s, nav, footer):
    cards = []
    for pr in s['products']:
        sku = pr['sku']
        cards.append(f'''            <a class="product-card" href="{link(page_of(s, sku))}">
                <div class="media"><img src="../{IMGDIR}/{s['slug']}/{fname(sku)}.jpg" alt="{esc(sku)}" loading="lazy"></div>
                <div class="body">
                    <h3 class="sku-name">{esc(sku)}</h3>
                    <p>{esc(pr['name'])}</p>
                    <span class="view" data-en="View Details &rarr;" data-es="Ver Detalles &rarr;" data-fr="Voir les Détails &rarr;"></span>
                </div>
            </a>''')
    body = f'''    <div class="page">
        <div class="breadcrumb">
{crumb((L_PRODUCTS, '../products'), (L_CAT, 'furniture-hardware'), (sub_label(s), None))}
        </div>
        <div class="page-head">
            <span class="eyebrow" {L_CAT}></span>
            <h1 {sub_label(s)}></h1>
            <p data-en="{esc(s['desc'])}" data-es="{esc(s['desc_es'])}" data-fr="{esc(s['desc_fr'])}"></p>
        </div>
        <div class="product-list">
{chr(10).join(cards)}
        </div>
    </div>
'''
    return head(esc(s['name']), '../') + nav + body + footer

def spec_rows(specs):
    li = '\n'.join(
        f'                    <li><span class="k">{esc(k)}</span><span class="v">{esc(v)}</span></li>'
        for k, v in specs)
    return f'                <ul class="spec-rows">\n{li}\n                </ul>'

def spec_table(t):
    thead = ''.join(f'<th>{esc(c)}</th>' for c in t['cols'])
    rows = '\n'.join(
        '                        <tr>' + ''.join(f'<td>{esc(c)}</td>' for c in r) + '</tr>'
        for r in t['rows'])
    title = t.get('title', '')
    h = (f'                <h2>{esc(title)}</h2>\n' if title else '')
    return (h + '                <div class="table-wrap">\n                    <table class="spec-table">\n'
            f'                        <thead><tr>{thead}</tr></thead>\n                        <tbody>\n{rows}\n'
            '                        </tbody>\n                    </table>\n                </div>')

def gen_product(s, pr, nav, footer):
    sku = pr['sku']
    img = f'../{IMGDIR}/{s["slug"]}/{fname(sku)}.jpg'
    info = []
    if 'bullets' in pr:
        info.append(f'                <h2>{esc(pr.get("bullets_title", "Technical Specification"))}</h2>')
        li = '\n'.join(f'                    <li>{esc(b)}</li>' for b in pr['bullets'])
        info.append(f'                <ul class="spec-list">\n{li}\n                </ul>')
    if pr.get('specs'):
        info.append('                <h2 data-en="Key Specifications" data-es="Especificaciones Clave" data-fr="Spécifications Clés"></h2>')
        info.append(spec_rows(pr['specs']))
    for blk in pr.get('blocks', []):
        info.append(f'                <h2>{esc(blk["label"])}</h2>')
        info.append(spec_rows(blk['specs']))
    if 'features' in pr:
        info.append(f'                <h2>{esc(pr.get("features_title", "Features"))}</h2>')
        li = '\n'.join(f'                    <li>{esc(b)}</li>' for b in pr['features'])
        info.append(f'                <ul class="spec-list">\n{li}\n                </ul>')
    if 'parts' in pr:
        info.append('                <h2 data-en="Package Contents" data-es="Contenido del Paquete" data-fr="Contenu de l\'Emballage"></h2>')
        li = '\n'.join(f'                    <li>{esc(b)}</li>' for b in pr['parts'])
        info.append(f'                <ul class="spec-list">\n{li}\n                </ul>')
    if 'note' in pr:
        info.append(f'                <p class="spec-note">{esc(pr["note"])}</p>')
    if 'notes' in pr:
        li = '\n'.join(f'                    <li>{esc(b)}</li>' for b in pr['notes'])
        info.append(f'                <ul class="spec-notes">\n{li}\n                </ul>')
    info.append('                <a class="btn" href="../partner" data-en="Enquire / Become a Partner" data-es="Consultar / Asóciese" data-fr="Demander / Devenir Partenaire"></a>')

    table = ('\n        ' + spec_table(pr['table']).strip() if 'table' in pr else '')

    body = f'''    <div class="page">
        <div class="breadcrumb">
{crumb((L_PRODUCTS, '../products'), (L_CAT, 'furniture-hardware'), (sub_label(s), f'cf-{s["slug"]}'))}
 &nbsp;/&nbsp;
            <span>{esc(sku)}</span>
        </div>
        <div class="detail" style="padding-top:3rem;">
            <div class="gallery">
                <img class="main-img" src="{img}" alt="{esc(sku)} {esc(pr['name'])}">
            </div>
            <div class="detail-info">
                <h1 class="sku-name">{esc(sku)}</h1>
                <p class="lead">{esc(pr['name'])}</p>
{chr(10).join(info)}
            </div>
        </div>{table}
    </div>
'''
    return head(esc(sku), '../') + nav + body + footer

# ---------------------------------------------------------------------- driver
def main():
    src = open(f'{ROOT}/products/dh-door-lever.html').read()
    nav = src[src.index('<nav class="navbar">'):src.index('</nav>') + len('</nav>')] + '\n'
    nav = patch_nav(nav, '../')
    footer = src[src.index('    <footer class="footer">'):]
    footer = patch_footer(footer, '../')
    # the source page ends with the store.js script + closing tags already
    assert '</html>' in footer

    os.makedirs(f'{ROOT}/products', exist_ok=True)
    written = []
    p = f'{ROOT}/products/furniture-hardware.html'
    open(p, 'w').write(gen_category(nav, footer)); written.append(p)
    for s in SUBS:
        p = f'{ROOT}/products/cf-{s["slug"]}.html'
        open(p, 'w').write(gen_sub(s, nav, footer)); written.append(p)
        for pr in s['products']:
            p = f'{ROOT}/products/{page_of(s, pr["sku"])}'
            open(p, 'w').write(gen_product(s, pr, nav, footer)); written.append(p)
    print(f'wrote {len(written)} pages')

    # patch nav + footer on every existing page
    n = 0
    for f in glob.glob(f'{ROOT}/*.html') + glob.glob(f'{ROOT}/products/*.html'):
        base = os.path.basename(f)
        if base in ('index_light_20260623.html', 'index-updated.html', 'FIXORA-single-file.html'):
            continue
        t = open(f).read()
        pre = '../' if '/products/' in f else ''
        new = patch_footer(patch_nav(t, pre), pre)
        if new != t:
            open(f, 'w').write(new); n += 1
    print(f'patched {n} existing pages')

    # keep the site search index in step with the pages just written
    idx = os.path.join(ROOT, 'tools', 'search', 'build_index.py')
    if os.path.exists(idx):
        import subprocess
        subprocess.run(['python3', idx], check=False)

main()
