/*
 * holo-card.js — carte holographique 2.5D (parallaxe par couches + foil + particules).
 * Un seul fichier, aucune dépendance, aucun build. Prévu pour les Ultra légendaires de faction.
 *
 *   import { HoloCard } from './holo-card.js';
 *   const holo = await HoloCard.load(conteneur, 'assets/holo/nike/manifest.json');
 *   ...
 *   holo.destroy();            // à appeler quand la carte est fermée ou retirée de l'écran
 *
 * Le conteneur doit avoir une largeur (la hauteur suit via aspect-ratio).
 * Voir README.md pour le format du manifest.json.
 */

const CSS = `
.hc-host { position: relative; width: 100%; perspective: 1300px; --hc-radius: 22px; }
.hc-card {
  --hc-fx: .5; --hc-fy: .5; --hc-foil: .7;
  position: relative; width: 100%; height: 100%;
  border-radius: var(--hc-radius); overflow: hidden; background: #070a10;
  touch-action: none; will-change: transform; opacity: 0; transition: opacity .25s ease;
  -webkit-user-select: none; user-select: none;
  box-shadow: 0 40px 70px -28px rgba(0,0,0,.85), 0 0 90px -34px rgba(232,184,90,.28);
}
.hc-card.hc-ready { opacity: 1; }
.hc-layer { position: absolute; inset: 0; will-change: transform; transform: scale(1.06); }
.hc-layer img { position: absolute; inset: 0; width: 100%; height: 100%; display: block; max-width: none; pointer-events: none; -webkit-user-drag: none; }
.hc-fx { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.hc-foil { position: absolute; inset: 0; pointer-events: none;
  -webkit-mask-image: var(--hc-mask); mask-image: var(--hc-mask);
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; }
.hc-goldhue { mix-blend-mode: hue; opacity: calc(var(--hc-foil) * .62);
  background: linear-gradient(115deg, hsl(calc(var(--hc-fx) * 360 + 20) 90% 55%), hsl(calc(var(--hc-fx) * 360 + 130) 90% 55%), hsl(calc(var(--hc-fx) * 360 + 240) 90% 55%)) calc(var(--hc-fx) * 100%) calc(var(--hc-fy) * 100%) / 220% 220%; }
.hc-goldshine { mix-blend-mode: color-dodge; opacity: calc(var(--hc-foil) * .5);
  background: linear-gradient(104deg, transparent 42%, rgba(255,255,255,.9) 50%, transparent 58%) calc(var(--hc-fx) * 120% - 10%) 0 / 260% 100% no-repeat; }
.hc-prism { mix-blend-mode: overlay; opacity: calc(var(--hc-foil) * .38);
  background: linear-gradient(110deg, #ff6aa8, #ffd25a, #5affc1, #5ab4ff, #b46aff, #ff6aa8) calc(var(--hc-fx) * 100%) calc(var(--hc-fy) * 100%) / 300% 300%; }
.hc-shimmer { mix-blend-mode: screen; opacity: calc(var(--hc-foil) * .28);
  background: linear-gradient(110deg, #ff6aa8, #ffd25a, #5affc1, #5ab4ff, #b46aff, #ff6aa8) calc(var(--hc-fx) * 100%) calc(var(--hc-fy) * 100%) / 300% 300%; }
.hc-volt { mix-blend-mode: screen; opacity: calc(var(--hc-foil) * 1.1);
  background: linear-gradient(105deg, #4fa8ff, #ffffff 28%, #9a7bff 52%, #5ff0ff 78%, #4fa8ff) calc(var(--hc-fx) * 100%) calc(var(--hc-fy) * 100%) / 260% 260%;
  animation: hc-volt 3s ease-in-out infinite; }
@keyframes hc-volt { 0%, 100% { filter: brightness(.7); } 42% { filter: brightness(1.25); } 48% { filter: brightness(.85); } 54% { filter: brightness(1.75); } 62% { filter: brightness(.95); } }
.hc-still .hc-volt { animation: none; }
@media (prefers-reduced-motion: reduce) { .hc-volt { animation: none; } }
.hc-flash { position: absolute; inset: 0; opacity: 0; mix-blend-mode: screen; pointer-events: none;
  background: radial-gradient(ellipse 62% 34% at 62% 13%, rgba(255,246,226,.95), rgba(150,185,255,.28) 55%, transparent 76%); }
.hc-glare { position: absolute; inset: 0; pointer-events: none; mix-blend-mode: soft-light;
  background: radial-gradient(circle at calc(var(--hc-fx) * 100%) calc(var(--hc-fy) * 100%), rgba(255,240,214,.34), transparent 46%); }
.hc-frame { position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  box-shadow: inset 0 0 0 1px rgba(232,184,90,.42), inset 0 0 0 6px rgba(5,7,12,.38), inset 0 0 50px rgba(0,0,0,.45); }
`;

let cssInjected = false;
function injectCss() {
  if (cssInjected || typeof document === 'undefined') return;
  const s = document.createElement('style');
  s.setAttribute('data-holo-card', '');
  s.textContent = CSS;
  document.head.appendChild(s);
  cssInjected = true;
}

const rnd = (a, b) => a + Math.random() * (b - a);
const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

/* ---------- sprites (dessinés une seule fois, partagés par toutes les cartes) ---------- */
let SPR = null;
function sprite(size, draw) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); return c; }
function radial(stops) {
  return (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); stops.forEach(st => r.addColorStop(st[0], st[1])); g.fillStyle = r; g.fillRect(0, 0, s, s); };
}
function sprites() {
  if (SPR) return SPR;
  SPR = {
    gold: sprite(64, radial([[0, 'rgba(255,250,235,1)'], [.18, 'rgba(255,222,140,.95)'], [.5, 'rgba(235,170,70,.28)'], [1, 'rgba(235,170,70,0)']])),
    star: sprite(64, radial([[0, 'rgba(255,255,255,1)'], [.14, 'rgba(225,230,255,.95)'], [.42, 'rgba(150,120,255,.3)'], [1, 'rgba(150,120,255,0)']])),
    volt: sprite(64, radial([[0, 'rgba(255,255,255,1)'], [.16, 'rgba(190,230,255,.95)'], [.45, 'rgba(90,160,255,.32)'], [1, 'rgba(90,160,255,0)']])),
    pinkGlow: sprite(64, radial([[0, 'rgba(255,170,215,.8)'], [.45, 'rgba(255,110,185,.28)'], [1, 'rgba(255,110,185,0)']])),
    petal: sprite(64, (g) => {
      const gr = g.createLinearGradient(8, 20, 56, 44); gr.addColorStop(0, '#d0345a'); gr.addColorStop(.6, '#8c1236'); gr.addColorStop(1, '#5e0c26');
      g.fillStyle = gr; g.beginPath(); g.moveTo(6, 34); g.bezierCurveTo(10, 8, 46, 6, 58, 30); g.bezierCurveTo(46, 54, 14, 58, 6, 34); g.fill();
      g.strokeStyle = 'rgba(255,170,190,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 34); g.quadraticCurveTo(32, 22, 54, 31); g.stroke();
    }),
    heart: sprite(64, (g) => {
      const gr = g.createLinearGradient(10, 6, 54, 58); gr.addColorStop(0, '#ffe3f1'); gr.addColorStop(.5, '#ff9ac8'); gr.addColorStop(1, '#e0549a');
      g.fillStyle = gr; g.beginPath(); g.moveTo(32, 56); g.bezierCurveTo(4, 36, 6, 10, 24, 10); g.bezierCurveTo(30, 10, 32, 16, 32, 18); g.bezierCurveTo(32, 16, 34, 10, 40, 10); g.bezierCurveTo(58, 10, 60, 36, 32, 56); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(21, 20, 6, 3.4, -.6, 0, 6.3); g.fill();
    })
  };
  return SPR;
}

/* ---------- particules ---------- */
const mkSparks = (n, s0, s1, v0, v1, spr) => Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), s: rnd(s0, s1), v: rnd(v0, v1), sw: rnd(.4, 1.2), sa: rnd(.004, .016), ph: rnd(0, 6.28), tw: rnd(1.2, 3.4), spr }));
const mkDrops = (n, l0, l1, v0, v1, a0, a1) => Array.from({ length: n }, () => ({ x: rnd(-.1, 1.2), y: Math.random(), l: rnd(l0, l1), v: rnd(v0, v1), a: rnd(a0, a1) }));
const mkPetals = (n) => Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), s: rnd(8, 15), v: rnd(.03, .07), rot: rnd(0, 6.28), rv: rnd(-1.4, 1.4), fl: rnd(1.5, 3.2), ph: rnd(0, 6.28), sw: rnd(.012, .03) }));
const mkHearts = (n) => Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), s: rnd(12, 24), v: rnd(.012, .03), ph: rnd(0, 6.28), sw: rnd(.01, .025), tw: rnd(1, 2.2) }));

function buildFx(spec, kind, q) {
  const S = sprites(); spec = spec || {};
  const f = { rain: [], sparks: [], petals: [], hearts: [], rainColor: kind === 'back' ? '170,195,235' : '205,222,255' };
  const back = kind === 'back';
  if (spec.rain && q.rain) f.rain = back ? mkDrops(Math.round(spec.rain * q.n), .03, .07, .7, 1.2, .05, .13) : mkDrops(Math.round(spec.rain * q.n), .07, .15, 1.3, 2.1, .1, .26);
  if (spec.sparks) f.sparks = f.sparks.concat(mkSparks(Math.round(spec.sparks * q.n), back ? 4 : 6, back ? 11 : 15, back ? .008 : .015, back ? .03 : .05, S.gold));
  if (spec.stars) f.sparks = f.sparks.concat(mkSparks(Math.round(spec.stars * q.n), back ? 3 : 7, back ? 9 : 14, .002, .008, S.star));
  if (spec.volt) f.sparks = f.sparks.concat(mkSparks(Math.round(spec.volt * q.n), back ? 3 : 5, back ? 8 : 11, .012, .045, S.volt));
  if (spec.petals && q.motion) f.petals = mkPetals(Math.round(spec.petals * q.n));
  if (spec.hearts) f.hearts = mkHearts(Math.max(1, Math.round(spec.hearts * q.n)));
  return f;
}

const SLANT = -0.085; // la pluie penche légèrement vers la gauche en descendant

function drawFx(canvas, f, t, dt, px, py, W, H, dpr, motion) {
  const S = sprites(), g = canvas.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const k = W / 520; let i, p, tw, X, Y, r;
  g.lineCap = 'round'; g.lineWidth = Math.max(1, k) * 1.1;
  for (i = 0; i < f.rain.length; i++) {
    p = f.rain[i]; p.y += p.v * dt; if (p.y > 1.1) { p.y = -.1; p.x = rnd(-.1, 1.2); }
    X = p.x * W + px; Y = p.y * H + py; const L = p.l * H;
    g.strokeStyle = 'rgba(' + f.rainColor + ',' + p.a + ')'; g.beginPath(); g.moveTo(X, Y); g.lineTo(X + SLANT * L, Y - L); g.stroke();
  }
  for (i = 0; i < f.petals.length; i++) {
    p = f.petals[i]; p.y += p.v * dt; p.rot += p.rv * dt; if (p.y > 1.06) { p.y = -.06; p.x = Math.random(); }
    X = (p.x + Math.sin(t * .7 + p.ph) * p.sw) * W + px; Y = p.y * H + py; r = p.s * k;
    g.save(); g.translate(X, Y); g.rotate(p.rot); g.scale(1, .35 + .65 * Math.abs(Math.sin(t * p.fl + p.ph)));
    g.globalAlpha = .92; g.drawImage(S.petal, -r, -r * .7, r * 2, r * 1.4); g.restore();
  }
  g.globalAlpha = 1;
  for (i = 0; i < f.hearts.length; i++) {
    p = f.hearts[i]; if (motion) p.y -= p.v * dt; if (p.y < -.06) { p.y = 1.06; p.x = Math.random(); }
    tw = .6 + .4 * Math.sin(t * p.tw + p.ph); X = (p.x + Math.sin(t * .6 + p.ph) * p.sw) * W + px; Y = p.y * H + py; r = p.s * k;
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .55 * tw; g.drawImage(S.pinkGlow, X - r * 1.5, Y - r * 1.5, r * 3, r * 3);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = .9; g.drawImage(S.heart, X - r * .55, Y - r * .55, r * 1.1, r * 1.1);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
  for (i = 0; i < f.sparks.length; i++) {
    p = f.sparks[i]; if (motion) p.y -= p.v * dt; if (p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
    tw = motion ? (.55 + .45 * Math.sin(t * p.tw + p.ph)) : .8;
    X = (p.x + Math.sin(t * p.sw + p.ph) * p.sa) * W + px; Y = p.y * H + py; r = p.s * k * (.7 + .3 * tw);
    g.globalAlpha = tw * .95; g.drawImage(p.spr, X - r, Y - r, r * 2, r * 2);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ---------- la carte ---------- */
export class HoloCard {
  /**
   * @param {HTMLElement} host        conteneur (sa largeur fixe la taille de la carte)
   * @param {object} manifest         contenu du manifest.json
   * @param {object} [opts]
   * @param {string} [opts.baseUrl]   dossier qui contient les images du manifest (se termine par /)
   * @param {number} [opts.depth=1]   0 à 2, amplitude de la parallaxe
   * @param {number} [opts.foil=0.7]  0 à 1, intensité du foil
   * @param {boolean} [opts.idle=true] la carte oscille doucement quand personne ne la touche
   * @param {'auto'|'high'|'low'} [opts.quality='auto']  'low' réduit les particules et la résolution du canvas
   * @param {number} [opts.radius]    rayon des coins en px (22 par défaut)
   */
  constructor(host, manifest, opts = {}) {
    injectCss();
    this.host = host; this.m = manifest; this.o = opts;
    this.base = opts.baseUrl || '';
    this.depth = opts.depth ?? 1; this.foil = opts.foil ?? .7;
    const mm = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    this.reduce = opts.reducedMotion ?? mm;
    const weak = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    const low = opts.quality === 'low' || (opts.quality !== 'high' && weak);
    this.q = { n: this.reduce ? .25 : (low ? .45 : 1), rain: !this.reduce, motion: !this.reduce, dprCap: low ? 1.25 : 2 };
    this.target = { x: 0, y: 0 }; this.cur = { x: 0, y: 0 };
    this.active = false; this.running = false; this.visible = true; this.W = 1; this.H = 1; this.dpr = 1;
    this._timers = []; this._off = [];
    this._build();
    this.ready = this._loadImages();
  }

  static async load(host, manifestUrl, opts = {}) {
    const res = await fetch(manifestUrl);
    if (!res.ok) throw new Error('holo-card : manifest introuvable (' + manifestUrl + ')');
    const manifest = await res.json();
    const baseUrl = opts.baseUrl || manifestUrl.replace(/[^/]*$/, '');
    const card = new HoloCard(host, manifest, Object.assign({}, opts, { baseUrl }));
    try { await card.ready; } catch (e) { card.destroy(); throw e; }
    return card;
  }

  _build() {
    const { host, m } = this;
    host.classList.add('hc-host');
    host.style.aspectRatio = m.aspect[0] + ' / ' + m.aspect[1];
    if (this.o.radius != null) host.style.setProperty('--hc-radius', this.o.radius + 'px');
    const card = this.card = el('div', 'hc-card');
    this.layers = []; this.imgs = []; this.flash = null;
    const cBack = this.cBack = el('canvas', 'hc-fx'), cFront = this.cFront = el('canvas', 'hc-fx');
    let z = 1;
    m.layers.forEach((L, i) => {
      const d = el('div', 'hc-layer'); d.style.zIndex = z++;
      const im = el('img'); im.alt = ''; im.decoding = 'async'; im.src = this.base + L.src; d.appendChild(im); this.imgs.push(im);
      (L.foils || []).forEach(F => {
        (F.type === 'gold' ? ['goldhue', 'goldshine'] : [F.type]).forEach(cls => {
          const e = el('div', 'hc-foil hc-' + cls); e.style.setProperty('--hc-mask', 'url("' + this.base + F.mask + '")'); d.appendChild(e);
        });
      });
      if (L.flash) { const f = el('div', 'hc-flash'); d.appendChild(f); this.flash = f; }
      card.appendChild(d); this.layers.push({ el: d, amp: L.amp || 0 });
      if (i === m.backAfter) { cBack.style.zIndex = z++; card.appendChild(cBack); }
    });
    cFront.style.zIndex = z++; card.appendChild(cFront);
    const gl = el('div', 'hc-glare'), fr = el('div', 'hc-frame'); gl.style.zIndex = 80; fr.style.zIndex = 90; card.appendChild(gl); card.appendChild(fr);
    if (this.reduce) card.classList.add('hc-still');
    host.appendChild(card);
    const fx = m.fx || {};
    this.fb = buildFx(fx.back, 'back', this.q); this.ff = buildFx(fx.front, 'front', this.q);
    this.storm = !!fx.storm && !this.reduce;
  }

  async _loadImages() {
    await Promise.all(this.imgs.map(im => (im.decode ? im.decode().catch(() => {}) : Promise.resolve())));
    if (this.destroyed) return;
    const bad = this.imgs.find(im => !im.naturalWidth);
    if (bad) throw new Error('holo-card : image introuvable (' + bad.src + ')');
    this._measure();
    this._bind();
    this.card.classList.add('hc-ready');
    this.start();
    if (this.storm) this._timers.push(setTimeout(() => this._storm(), 2800));
  }

  _measure() {
    this.W = this.card.offsetWidth || 1; this.H = this.card.offsetHeight || 1;
    this.dpr = Math.min(window.devicePixelRatio || 1, this.q.dprCap);
    [this.cBack, this.cFront].forEach(c => { c.width = Math.round(this.W * this.dpr); c.height = Math.round(this.H * this.dpr); });
  }

  _bind() {
    const card = this.card;
    const setTarget = (e) => {
      const r = card.getBoundingClientRect();
      this.target.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      this.target.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const engage = (e) => { this.active = true; clearTimeout(this._idleT); setTarget(e); };
    const release = () => { clearTimeout(this._idleT); this._idleT = setTimeout(() => { this.active = false; }, 1400); };
    const on = (t, type, fn, opt) => { t.addEventListener(type, fn, opt); this._off.push(() => t.removeEventListener(type, fn, opt)); };
    on(card, 'pointerenter', engage);
    on(card, 'pointerdown', (e) => { engage(e); try { card.setPointerCapture(e.pointerId); } catch (_) {} });
    on(card, 'pointermove', engage);
    on(card, 'pointerleave', release); on(card, 'pointerup', release); on(card, 'pointercancel', release);
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => this._measure()); ro.observe(this.host); this._off.push(() => ro.disconnect()); }
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((en) => { this.visible = en[0].isIntersecting; this._sync(); }); io.observe(this.host); this._off.push(() => io.disconnect());
    }
    on(document, 'visibilitychange', () => this._sync());
  }

  _sync() {
    const should = !document.hidden && this.visible && !this.destroyed;
    if (should && !this.running) this.start(); else if (!should && this.running) this.running = false;
  }

  start() {
    if (this.running || this.destroyed) return;
    this.running = true; this.last = performance.now(); if (this.t0 == null) this.t0 = this.last;
    requestAnimationFrame(this._frame);
  }

  _frame = (now) => {
    if (!this.running) return;
    /* option maxFps (ajout Duel d'Helvara, petites cartes) : saute les images en trop pour ménager le téléphone */
    if (this.o.maxFps && now - (this._drawn || 0) < 1000 / this.o.maxFps - 3) { requestAnimationFrame(this._frame); return; }
    this._drawn = now;
    const dt = Math.min(.05, (now - this.last) / 1000); this.last = now; const t = (now - this.t0) / 1000;
    const idle = this.o.idle !== false && !this.reduce;
    if (!this.active) { this.target.x = idle ? Math.sin(t * .55) * .75 : 0; this.target.y = idle ? Math.cos(t * .4) * .5 : 0; }
    const k = 1 - Math.pow(.0009, dt); const cur = this.cur;
    cur.x += (this.target.x - cur.x) * k; cur.y += (this.target.y - cur.y) * k;
    const { W, H, depth, card } = this;
    card.style.setProperty('--hc-fx', ((cur.x + 1) / 2).toFixed(4)); card.style.setProperty('--hc-fy', ((cur.y + 1) / 2).toFixed(4));
    card.style.setProperty('--hc-foil', this.foil.toFixed(2));
    card.style.transform = 'rotateY(' + (cur.x * 11).toFixed(2) + 'deg) rotateX(' + (-cur.y * 9).toFixed(2) + 'deg)';
    this.layers.forEach(L => { L.el.style.transform = 'translate3d(' + (cur.x * L.amp * W * depth).toFixed(2) + 'px,' + (cur.y * L.amp * W * .6 * depth).toFixed(2) + 'px,0) scale(1.06)'; });
    drawFx(this.cBack, this.fb, t, dt, cur.x * .006 * W * depth, cur.y * .006 * W * .6 * depth, W, H, this.dpr, this.q.motion);
    drawFx(this.cFront, this.ff, t, dt, cur.x * .022 * W * depth, cur.y * .022 * W * .6 * depth, W, H, this.dpr, this.q.motion);
    requestAnimationFrame(this._frame);
  };

  _storm() {
    if (this.destroyed || !this.flash || !this.flash.animate) return;
    this.flash.animate([{ opacity: 0 }, { opacity: .5, offset: .08 }, { opacity: .1, offset: .24 }, { opacity: .72, offset: .38 }, { opacity: 0 }], { duration: 720, easing: 'ease-out' });
    this._timers.push(setTimeout(() => this._storm(), rnd(6500, 12500)));
  }

  setDepth(v) { this.depth = v; }
  setFoil(v) { this.foil = v; }

  destroy() {
    this.destroyed = true; this.running = false;
    this._timers.forEach(clearTimeout); clearTimeout(this._idleT);
    this._off.forEach(fn => fn()); this._off = [];
    this.host.innerHTML = ''; this.host.classList.remove('hc-host'); this.host.style.aspectRatio = '';
  }
}

export default HoloCard;
