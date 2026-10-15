import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage as ndi

def load(c):
    im = cv2.cvtColor(np.array(Image.open(f'cards/{c}/src.webp').convert('RGB')), cv2.COLOR_RGB2BGR)
    rem = cv2.imread(f'cards/{c}/rem.png', 0)
    return im, rem

class Ctx:
    def __init__(self, c):
        self.c = c
        self.im, self.rem = load(c)
        self.H, self.W = self.im.shape[:2]
        self.P = self.W / 1342.0           # display coords (1342 wide) -> full res
        os.makedirs(f'cards/{c}/out', exist_ok=True)
    def poly(self, pts):
        m = np.zeros((self.H, self.W), np.uint8)
        cv2.fillPoly(m, [np.array([(int(x*self.P), int(y*self.P)) for x, y in pts], np.int32)], 255)
        return m

K = lambda n: np.ones((n, n), np.uint8)
def ell(n): return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))

def solid(mask, close=9, minarea=0):
    m = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, K(close))
    m = ndi.binary_fill_holes(m > 128).astype(np.uint8) * 255
    if minarea:
        n, lab, st, _ = cv2.connectedComponentsWithStats((m > 128).astype(np.uint8), 8)
        for i in range(1, n):
            if st[i, cv2.CC_STAT_AREA] < minarea: m[lab == i] = 0
    return m

def lowres_fill(im, mask, f=0.25, radius=8, blur=3):
    s = cv2.resize(im, None, fx=f, fy=f, interpolation=cv2.INTER_AREA)
    m = (cv2.resize(mask, (s.shape[1], s.shape[0]), interpolation=cv2.INTER_AREA) > 20).astype(np.uint8) * 255
    out = cv2.inpaint(s, m, radius, cv2.INPAINT_TELEA)
    if blur: out = cv2.GaussianBlur(out, (0, 0), blur)
    return cv2.resize(out, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_CUBIC)

def far_layer(im, covered, reach=26, ring=51):
    """Background with the covered area replaced by a smooth fill; original pixels kept beyond `reach` px."""
    fillmask = cv2.dilate(covered, K(ring))
    fill = lowres_fill(im, fillmask)
    dist = cv2.distanceTransform((covered < 128).astype(np.uint8), cv2.DIST_L2, 5)
    w = np.clip((reach - dist) / (reach - 4.0), 0, 1)[..., None]
    return (fill.astype(float) * w + im.astype(float) * (1 - w)).astype(np.uint8)

def under_fill(im, hide, near=15):
    """Layer image where `hide` (a nearer layer's footprint) is filled in with a blur of what surrounds it."""
    hm = cv2.dilate(hide, K(near))
    fill = lowres_fill(im, hm, radius=6, blur=0)
    keep = (hm == 0)[..., None]
    return np.where(keep, im, fill)

def sky_remove(wing, im, lo=98, hi=125, smin=35, vmin=55):
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    sky = ((hsv[..., 0] >= lo) & (hsv[..., 0] <= hi) & (hsv[..., 1] > smin) & (hsv[..., 2] > vmin)).astype(np.uint8) * 255
    sky = cv2.dilate(cv2.morphologyEx(sky, cv2.MORPH_OPEN, K(5)), K(3))
    return cv2.bitwise_and(wing, cv2.bitwise_not(sky))

def drop_small(mask, minarea):
    m = mask.copy()
    n, lab, st, _ = cv2.connectedComponentsWithStats((m > 128).astype(np.uint8), 8)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < minarea: m[lab == i] = 0
    return m

def grabcut_poly(im, poly_mask, sure_erode=45, grow=31, scale=0.5, iters=6):
    s = cv2.resize(im, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    wp = cv2.resize(poly_mask, (s.shape[1], s.shape[0]), interpolation=cv2.INTER_NEAREST)
    gc = np.full(wp.shape, cv2.GC_BGD, np.uint8)
    gc[cv2.dilate(wp, K(grow)) > 0] = cv2.GC_PR_BGD
    gc[wp > 0] = cv2.GC_PR_FGD
    gc[cv2.erode(wp, K(sure_erode)) > 0] = cv2.GC_FGD
    cv2.grabCut(s, gc, None, np.zeros((1, 65)), np.zeros((1, 65)), iters, cv2.GC_INIT_WITH_MASK)
    out = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    out = cv2.morphologyEx(out, cv2.MORPH_CLOSE, K(9))
    return cv2.resize(out, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_LINEAR)

def gold_mask(im, hlo=12, hhi=35, smin=70, vmin=130):
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    g = (((h >= hlo) & (h <= hhi)) & (s > smin) & (v > vmin)).astype(np.uint8) * 255
    return g

def comp(base, rgb, a):
    a = (a.astype(float) / 255)[..., None]
    return base * (1 - a) + rgb.astype(float) * a

def export_rgba(path, im, alpha, W=1060, q=86):
    H0, W0 = im.shape[:2]
    h = int(round(H0 * W / W0))
    rgb = cv2.cvtColor(cv2.resize(im, (W, h), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB)
    a = cv2.resize(alpha, (W, h), interpolation=cv2.INTER_AREA)
    Image.fromarray(np.dstack([rgb, a]), 'RGBA').save(path, 'WEBP', quality=q, alpha_quality=100, method=6)

def export_rgb(path, im, W=1060, q=86):
    H0, W0 = im.shape[:2]
    h = int(round(H0 * W / W0))
    Image.fromarray(cv2.cvtColor(cv2.resize(im, (W, h), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB)).save(path, 'WEBP', quality=q, method=6)

def export_mask(path, alpha, W=530, q=50):
    H0, W0 = alpha.shape[:2]
    h = int(round(H0 * W / W0))
    a = cv2.resize(cv2.GaussianBlur(alpha, (0, 0), 1.2), (W, h), interpolation=cv2.INTER_AREA)
    rgb = np.full((h, W, 3), 255, np.uint8)
    Image.fromarray(np.dstack([rgb, a]), 'RGBA').save(path, 'WEBP', quality=q, alpha_quality=75, method=6)

def shift(a, dx, dy=0):
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(a, M, (a.shape[1], a.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def shift_test(ctx, layers, amps, tag, dx=24):
    """layers: list of (rgb, alpha) back->front; amps relative shift per layer (fraction of dx)."""
    out = None
    for (rgb, a), k in zip(layers, amps):
        r = shift(rgb, dx * k); aa = shift(a, dx * k) if a is not None else np.full(rgb.shape[:2], 255, np.uint8)
        out = rgb.astype(float) if out is None and a is None else (comp(out, r, aa) if out is not None else comp(np.zeros_like(rgb, float), r, aa))
    cv2.imwrite(f'cards/{ctx.c}/shift_{tag}.jpg', cv2.resize(out.astype(np.uint8), (600, int(600 * ctx.H / ctx.W))))

def save_prev(ctx, name, arr, w=600):
    cv2.imwrite(f'cards/{ctx.c}/{name}.jpg', cv2.resize(arr, (w, int(w * ctx.H / ctx.W))))

def checker(H, W):
    chk = np.indices((H // 20 + 1, W // 20 + 1)).sum(0) % 2
    chk = cv2.resize((chk * 60 + 90).astype(np.uint8), (W + 20, H + 20), interpolation=cv2.INTER_NEAREST)[:H, :W]
    return np.dstack([chk] * 3).astype(float)

def thumb(path, im, W=150):
    export_rgb(path, im, W=W, q=70)
