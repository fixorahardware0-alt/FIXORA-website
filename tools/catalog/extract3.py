import fitz, json, re, os, shutil
PDF='/Users/shujingzhong/ProBuilder/FIXORA/产品册图，logo图/FIXORA DOOR HARDWARE 2026 CATALOG(高清)定稿.pdf'
BASE='/private/tmp/claude-501/-Users-shujingzhong-ProBuilder-FIXORA-website/d8118c1c-dabb-472f-8085-7ebf02b028d2/scratchpad'
OUT=BASE+'/imgs3'
shutil.rmtree(OUT,ignore_errors=True); os.makedirs(OUT)
d=fitz.open(PDF)
SKU_RE=re.compile(r'^[A-Z][A-Z0-9]*[0-9][A-Z0-9]*(\+[A-Z0-9]+)?(/[A-Z0-9]+)?$')
PROD_PAGES=[7,8,9,10,12,13,15,16,17,18,19,20,22,23,25,26,27,28,30,32,33,34,35,37]
UNION={'SLT1807','SLB1808','SLB1809','BDJ0120','BDT0220','BDA0320','FCS02'}
OVERRIDE={'WPB03':(23,(38,81,182,258)),'WPA04':(23,(38,327,182,504)),'WPC05':(23,(38,576,182,753))}
def trim(pix, thr=248):
    w,h,st,n=pix.width,pix.height,pix.stride,pix.n
    s=pix.samples
    def rowblank(y):
        b=y*st
        return all(s[b+x*n]>=thr and s[b+x*n+1]>=thr and s[b+x*n+2]>=thr for x in range(0,w,2))
    def colblank(x):
        o=x*n
        return all(s[y*st+o]>=thr and s[y*st+o+1]>=thr and s[y*st+o+2]>=thr for y in range(0,h,2))
    t=0
    while t<h-1 and rowblank(t): t+=1
    b=h-1
    while b>t and rowblank(b): b-=1
    l=0
    while l<w-1 and colblank(l): l+=1
    r=w-1
    while r>l and colblank(r): r-=1
    return fitz.IRect(max(0,l-4),max(0,t-4),min(w,r+5),min(h,b+5))
res=[]
for pn in PROD_PAGES:
    p=d[pn-1]; W,H=p.rect.width,p.rect.height
    skus=[]
    for b in p.get_text('dict')['blocks']:
        if b['type']!=0: continue
        for l in b['lines']:
            for s in l['spans']:
                t=s['text'].strip()
                if t and s['size']>16 and 'Bold' in s['font'] and SKU_RE.match(t):
                    skus.append({'sku':t,'x':s['bbox'][0],'y':s['bbox'][1]})
    uniq={}
    for s in skus: uniq.setdefault(s['sku'],s)
    skus=sorted(uniq.values(),key=lambda s:(round(s['y']/30),s['x']))
    rows=sorted({round(s['y']) for s in skus})
    def band(v,arr,end,pad=12):
        i=arr.index(min(arr,key=lambda a:abs(a-v)))
        return arr[i]-pad,(arr[i+1]-pad if i+1<len(arr) else end)
    imgs=[];seen=set()
    for im in p.get_images(full=True):
        for r in p.get_image_rects(im[0]):
            k=(im[0],round(r.x0),round(r.y0))
            if k in seen: continue
            seen.add(k)
            if r.x1<0 or r.x0>W or r.y1<0 or r.y0>H: continue
            if r.width*r.height>0.75*W*H: continue
            imgs.append((r,im[0]))
    for s in skus:
        sku=s['sku']; fn=f"{OUT}/{sku.replace('/','-').replace('+','-')}.png"
        if sku in OVERRIDE:
            pg,c=OVERRIDE[sku]
            pix=d[pg-1].get_pixmap(clip=fitz.Rect(*c),dpi=300,colorspace=fitz.csRGB)
            pix.save(fn); res.append({'sku':sku,'page':pg,'mode':'clip'}); continue
        y0,y1=band(s['y'],rows,H)
        rc=sorted({round(o['x']) for o in skus if abs(o['y']-s['y'])<20})
        x0,x1=band(s['x'],rc,W,pad=30)
        if x0<0: x0=-50
        cell=[t for t in imgs if x0<=(t[0].x0+t[0].x1)/2<=x1 and y0<=(t[0].y0+t[0].y1)/2<=y1]
        if not cell: print('NO IMG',pn,sku); continue
        if sku in UNION:
            cell=[t for t in cell if (t[0].x0+t[0].x1)/2<330] or cell
            big=max(cell,key=lambda t:t[0].width*t[0].height)[0]
            keep=[t[0] for t in cell if t[0].width*t[0].height>=0.12*big.width*big.height]
            u=keep[0]
            for r in keep[1:]: u=u|r
            u.x1=min(u.x1,333 if s["sku"]=="SLB1809" else 340)
            pix=p.get_pixmap(clip=u&p.rect,dpi=300,colorspace=fitz.csRGB)
            pix.save(fn); res.append({'sku':sku,'page':pn,'mode':'union'}); continue
        rect,xref=max(cell,key=lambda t:t[0].width*t[0].height)
        pix=fitz.Pixmap(d,xref)
        if pix.alpha:
            bg=fitz.Pixmap(fitz.csRGB,pix.irect); bg.clear_with(255)
            pix=fitz.Pixmap(bg,pix) if False else fitz.Pixmap(pix,0)
        if pix.colorspace and pix.colorspace.n==4: pix=fitz.Pixmap(fitz.csRGB,pix)
        ir=trim(pix)
        pix.set_origin(0,0)
        pix2=fitz.Pixmap(pix,pix.width,pix.height,ir) if False else None
        # crop
        pix.set_rect(fitz.IRect(0,0,0,0)) if False else None
        crop=fitz.Pixmap(pix, ir) if False else None
        # PyMuPDF crop via Pixmap(pix, clip)
        try:
            out=fitz.Pixmap(pix, ir)
        except Exception:
            out=pix
        out.save(fn); res.append({'sku':sku,'page':pn,'mode':'raster','size':[out.width,out.height]})
json.dump(res,open(BASE+'/map3.json','w'),indent=1)
print('total',len(res))
