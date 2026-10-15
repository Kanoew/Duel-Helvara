/* Duel d'Helvara : ouverture de paquet « Le Tirage ».
   Quatre phases : Attente → Tension → Révélation → Récompense. Plus la carte est rare, plus le moment dure.
   Le calque est monté hors de #app (render() réécrit #app à chaque changement) : il ne dépend d'aucun rendu du jeu.
   Les cartes sont déjà ajoutées à la collection et sauvegardées par buyPack() avant l'ouverture : fermer à tout moment ne perd rien. */

/* ---- Durées (ms), le SEUL endroit où elles sont définies. reward:null = la carte reste jusqu'à ce que le joueur touche l'écran ---- */
const OUV_TIMING = {
  C: { wait: 220, tension: 0,    reveal: 300, reward: 450 },
  R: { wait: 240, tension: 380,  reveal: 380, reward: 800 },
  E: { wait: 300, tension: 650,  reveal: 400, reward: 1000 },
  L: { wait: 380, tension: 1250, reveal: 450, reward: null },
  U: { wait: 800, tension: 2300, reveal: 550, reward: null }
};
/* Couleurs et palettes du ciel par rareté (lettres du jeu : C R E L U) */
const OUV_LOOK = {
  C: { color: "#9aa9bf", glow: "transparent" },
  R: { color: "#6aa2d8", glow: "rgba(106,162,216,.75)",
       sky: { neb: ["#2b5fa8", "#5aa0e0", "#3a3f9e"], stars: ["#ffffff", "#bcd8ff", "#8fc0ff"], arms: 2, n: 90 } },
  E: { color: "#a77bea", glow: "rgba(167,123,234,.8)", nebCss: ["rgba(167,123,234,.75)", "rgba(42,138,168,.55)", "rgba(106,63,192,.5)"],
       sky: { neb: ["#6a3fc0", "#a77bea", "#2a8aa8"], stars: ["#ffffff", "#e0d0ff", "#9fe6f0"], arms: 2, n: 130 } },
  L: { color: "#f0c94d", glow: "rgba(240,201,77,.8)", nebCss: ["rgba(240,201,77,.75)", "rgba(176,83,46,.6)", "rgba(122,75,184,.5)"],
       sky: { neb: ["#c0782a", "#f0c94d", "#7a4bb8", "#b0532e"], stars: ["#ffffff", "#ffe6a8", "#f0c94d", "#ffd0f0"], arms: 3, n: 170 } },
  U: { color: "#e86aa6", glow: "rgba(232,106,166,.85)", nebCss: ["rgba(232,106,166,.8)", "rgba(122,75,224,.7)", "rgba(44,90,216,.55)"],
       sky: { neb: ["#d23c8c", "#7a4be0", "#2c5ad8", "#f0c94d", "#ff7ab6"], stars: ["#ffffff", "#ffd0ea", "#c8b4ff", "#ffe6a8", "#9fd0ff"], arms: 4, n: 260 } }
};

/* op = { res:[{id,isNew,v}], name, img, pid, price } */
function ouvrirTirage(op){
  if(document.getElementById("tirage")) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, K = reduced ? 0.25 : 1;
  const tr = t => (typeof trUI === "function" ? trUI(t) : t);
  const rk = id => (OUV_TIMING[CARDS[id].r] ? CARDS[id].r : "C");
  const cards = op.res.map(r => ({ id: r.id, isNew: r.isNew, v: r.v, r: rk(r.id), open: false }));
  const N = cards.length, grid = N > 5;

  const root = document.createElement("div");
  root.id = "tirage"; root.className = "tirage"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", tr("Ouverture du paquet"));
  root.innerHTML = `<div class="t-status" aria-live="polite"></div>
    <button class="t-skip" type="button">${tr("Passer")}</button>
    <button class="t-pack" type="button" aria-label="${tr("Ouvrir le paquet")}"><span class="t-body"></span><span class="t-flap"></span></button>
    <div class="t-fan${grid ? " grid" : ""}" hidden></div>
    <div class="t-dim"></div><canvas class="t-sky"></canvas>
    <div class="t-focus" hidden></div>
    <canvas class="t-fx"></canvas><div class="t-flash"></div><div class="t-banner"></div><div class="t-badge"></div>
    <div class="t-end" hidden></div>`;
  document.body.appendChild(root);
  const $ = s => root.querySelector(s);
  const statusEl = $(".t-status"), skipBtn = $(".t-skip"), pack = $(".t-pack"), fan = $(".t-fan"), dim = $(".t-dim"), skyCv = $(".t-sky"),
        focus = $(".t-focus"), cv = $(".t-fx"), flashEl = $(".t-flash"), banner = $(".t-banner"), badge = $(".t-badge"), endEl = $(".t-end");

  let curHolo = null; /* effet holo de la carte en cours de révélation (Ultra-légendaires de faction qui en ont un) */
  let state = "pack", opened = 0, current = -1, skipped = false, closed = false, twinkle = 0, raf = 0;
  const timers = new Set();
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sleep = ms => (skipped || closed) ? Promise.resolve() : new Promise(r => { const t = setTimeout(() => { timers.delete(t); r(); }, ms * K); timers.add(t); });
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if(!closed) fn(); }, ms * K); timers.add(t); };
  function anim(el, frames, o){
    if(!el || closed) return Promise.resolve();
    const a = el.animate(frames, Object.assign({ fill: "forwards" }, o, { duration: skipped ? 1 : Math.max(1, o.duration * K), delay: skipped ? 0 : (o.delay || 0) * K }));
    /* commit : l'état final est écrit en style, puis l'animation est retirée (une animation « fill: forwards » empilée sur la même propriété peut être retirée par le navigateur et laisser un état faux) */
    return a.finished.then(() => { if(o.commit && !closed){ try{ a.commitStyles(); }catch(e){} a.cancel(); } }).catch(() => {});
  }
  const say = t => { statusEl.textContent = t ? tr(t) : ""; };
  const sfxQ = n => { try{ sfx(n); }catch(e){} };

  /* ---------- Canvas ---------- */
  const ctx = cv.getContext("2d"), sctx = skyCv.getContext("2d");
  let SW = 0, SH = 0;
  function sizeCanvas(){
    const d = Math.min(2, window.devicePixelRatio || 1);
    SW = root.clientWidth; SH = root.clientHeight;
    for(const [c, x] of [[cv, ctx], [skyCv, sctx]]){ c.width = SW * d; c.height = SH * d; x.setTransform(d, 0, 0, d, 0, 0); }
  }
  addEventListener("resize", sizeCanvas);

  /* ---------- Étincelles et ondes ---------- */
  let parts = [], waves = [], fxRunning = false;
  function sparkle(x, y, colors, n, speed){
    if(reduced) n = Math.round(n / 4);
    for(let i = 0; i < n; i++){
      const a = Math.random() * Math.PI * 2, s = rand(.25, 1) * speed;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - .6, life: 0, max: rand(35, 75), size: rand(1.2, 3.4), color: pick(colors), star: Math.random() < .45, rot: rand(0, 6) });
    }
    fxLoop();
  }
  function wave(x, y, color, speed, max){ waves.push({ x, y, r: 6, v: speed, life: 0, max: max || 40, color }); fxLoop(); }
  function drawStar(c, x, y, s, rot){
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    for(let i = 0; i < 4; i++){
      c.lineTo(Math.cos(i * Math.PI / 2) * s * 2.6, Math.sin(i * Math.PI / 2) * s * 2.6);
      c.lineTo(Math.cos(i * Math.PI / 2 + Math.PI / 4) * s * .55, Math.sin(i * Math.PI / 2 + Math.PI / 4) * s * .55);
    }
    c.closePath(); c.fill(); c.restore();
  }
  function fxLoop(){
    if(fxRunning || closed) return; fxRunning = true;
    (function frame(){
      if(closed){ fxRunning = false; return; }
      ctx.clearRect(0, 0, SW, SH);
      ctx.globalCompositeOperation = "lighter";
      waves = waves.filter(g => g.life < g.max);
      for(const g of waves){
        g.life++; g.r += g.v * (1 - g.life / g.max);
        const gr = ctx.createRadialGradient(g.x, g.y, g.r * .55, g.x, g.y, g.r);
        gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(.75, g.color); gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = (1 - g.life / g.max) * .55; ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
      }
      parts = parts.filter(p => p.life < p.max);
      for(const p of parts){
        p.life++; p.x += p.vx; p.y += p.vy; p.vx *= .955; p.vy = p.vy * .955 + .035; p.rot += .08;
        ctx.globalAlpha = (1 - p.life / p.max) * (.6 + .4 * Math.sin(p.life * .5)); ctx.fillStyle = p.color;
        if(p.star) drawStar(ctx, p.x, p.y, p.size, p.rot); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * .8, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
      if(parts.length || waves.length) requestAnimationFrame(frame);
      else { fxRunning = false; ctx.clearRect(0, 0, SW, SH); }
    })();
  }

  /* ---------- Ciel : nébuleuse + galaxie spirale (disque incliné, y × 0.58) ---------- */
  const sprites = {};
  function puff(color){
    if(sprites[color]) return sprites[color];
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, color); g.addColorStop(.35, color + "99"); g.addColorStop(1, color + "00");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return (sprites[color] = c);
  }
  const sky = { on: false, loop: false, I: 0, target: 0, spin: 0, inflow: 0, flare: 0, freeze: false, cx: 0, cy: 0, stars: [], puffs: [], pal: null, burst: false, t: 0, R: 0 };
  function seedStars(pal, n, rMin, rMax){
    const out = [];
    for(let i = 0; i < n; i++){
      const r = rand(rMin, rMax), arm = i % pal.arms;
      out.push({ r, th: arm * Math.PI * 2 / pal.arms + r * .016 + rand(-.32, .32), s: rand(.5, 1.9), c: pick(pal.stars), tw: rand(0, 6), vx: 0, vy: 0, x: 0, y: 0, px: null, py: null });
    }
    return out;
  }
  function skyStart(r, cx, cy){
    const pal = OUV_LOOK[r].sky; if(!pal) return;
    Object.assign(sky, { on: true, I: 0, target: 0, spin: .010, inflow: 0, flare: 0, freeze: false, burst: false, cx, cy, pal, t: 0 });
    sky.R = Math.max(SW, SH) * .75;
    sky.stars = seedStars(pal, reduced ? Math.round(pal.n / 3) : pal.n, 30, sky.R);
    sky.puffs = Array.from({ length: pal.neb.length * 2 }, (_, i) => ({ a: rand(0, 6.28), d: rand(10, 120), s: rand(160, 320), c: pal.neb[i % pal.neb.length], w: rand(-.6, .6) }));
    skyLoop();
  }
  function skyBurst(power){
    sky.burst = true; sky.flare = 1;
    for(const st of sky.stars){
      const dx = st.x - sky.cx, dy = st.y - sky.cy, d = Math.hypot(dx, dy) || 1, sp = rand(5, 15) * power * (.6 + 120 / (d + 80));
      st.vx = dx / d * sp; st.vy = dy / d * sp;
    }
    later(() => { sky.burst = false; sky.stars = seedStars(sky.pal, Math.round(sky.stars.length * .6), 60, sky.R); sky.spin = .004; sky.inflow = 0; sky.target = .5; }, 700);
  }
  function skyLoop(){
    if(sky.loop || closed) return; sky.loop = true;
    (function frame(){
      if(closed){ sky.loop = false; return; }
      sky.t++; sky.I += (sky.target - sky.I) * .07; sky.flare *= .93;
      sctx.clearRect(0, 0, SW, SH); sctx.globalCompositeOperation = "lighter";
      const { cx, cy } = sky, spin = sky.freeze ? 0 : sky.spin;
      for(const p of sky.puffs){
        p.a += spin * .35 + p.w * .002;
        const s = p.s * (1 + sky.flare * 1.2), x = cx + Math.cos(p.a) * p.d * 1.3, y = cy + Math.sin(p.a) * p.d * .7;
        sctx.globalAlpha = Math.min(1, sky.I * .42 + sky.flare * .5); sctx.drawImage(puff(p.c), x - s / 2, y - s / 2, s, s);
      }
      const core = 70 + sky.flare * 260, g = sctx.createRadialGradient(cx, cy, 0, cx, cy, core);
      g.addColorStop(0, `rgba(255,248,240,${.35 * sky.I + .9 * sky.flare})`); g.addColorStop(1, "rgba(255,255,255,0)");
      sctx.globalAlpha = 1; sctx.fillStyle = g; sctx.beginPath(); sctx.arc(cx, cy, core, 0, 6.29); sctx.fill();
      for(const st of sky.stars){
        st.px = st.x; st.py = st.y;
        if(sky.burst){ st.x += st.vx; st.y += st.vy; st.vx *= .965; st.vy *= .965; }
        else {
          if(!sky.freeze){ st.th += spin * (60 / (st.r * .35 + 20)); st.r -= sky.inflow * st.r * .012; if(st.r < 16){ st.r = sky.R * rand(.75, 1); st.px = st.py = null; } }
          st.x = cx + Math.cos(st.th) * st.r; st.y = cy + Math.sin(st.th) * st.r * .58;
        }
        const a = Math.min(1, sky.I * (.55 + .45 * Math.sin(sky.t * .12 + st.tw)) * (sky.burst ? 1.4 : 1));
        if(a < .02) continue;
        sctx.globalAlpha = a;
        if(sky.burst && st.px != null){ sctx.strokeStyle = st.c; sctx.lineWidth = st.s; sctx.beginPath(); sctx.moveTo(st.px, st.py); sctx.lineTo(st.x, st.y); sctx.stroke(); }
        else { sctx.fillStyle = st.c; sctx.beginPath(); sctx.arc(st.x, st.y, st.s, 0, 6.29); sctx.fill(); }
      }
      sctx.globalAlpha = 1; sctx.globalCompositeOperation = "source-over";
      if(sky.on || sky.I > .01 || sky.flare > .01) requestAnimationFrame(frame);
      else { sky.loop = false; sctx.clearRect(0, 0, SW, SH); }
    })();
  }
  const skyStop = () => { sky.on = false; sky.target = 0; };

  function shakeFrames(a0, a1, n){
    const f = [];
    for(let i = 0; i < n; i++){ const a = a0 + (a1 - a0) * (i / n); f.push({ transform: `translate(${rand(-a, a)}px,${rand(-a, a)}px) rotate(${rand(-a / 4, a / 4)}deg)` }); }
    f.push({ transform: "none" }); return f;
  }

  /* ---------- Cartes ---------- */
  function backHTML(r){
    const n = OUV_LOOK[r].nebCss;
    return `<div class="t-face t-back">${n ? `<div class="t-neb" style="--n1:${n[0]};--n2:${n[1]};--n3:${n[2]}"><div class="t-spin"></div></div>` : ""}</div>`;
  }
  const miniFront = c => `<div class="t-face t-mfront" style="--rc:${OUV_LOOK[c.r].color}">${art(c.id)}<span class="cost">${CARDS[c.id].cost}</span><span class="pw">${CARDS[c.id].pow}</span></div>`;
  const bigFront = c => `<div class="t-face t-bfront">${fullCard(c.id, "t-full")}</div>`;
  const badgeText = c => c.isNew ? tr("Nouvelle") : `${tr("Doublon")} · +${c.v} CHF`;

  function buildFan(){
    fan.innerHTML = "";
    /* largeur des cartes : tout l'éventail doit tenir dans l'écran (390 px de large : 5 cartes de 64 px) */
    const cw = grid ? Math.max(48, Math.min(84, Math.floor((SW - 24 - 8 * 3) / 4))) : Math.max(52, Math.min(112, Math.floor((SW - 28 - 10 * (N - 1)) / N)));
    fan.style.setProperty("--cw", cw + "px");
    cards.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "t-slot h-" + c.r;
      if(!grid){ const mid = (N - 1) / 2; b.style.setProperty("--rot", (i - mid) * 6 + "deg"); b.style.setProperty("--ty", Math.pow(Math.abs(i - mid), 2) * 4 + "px"); }
      else { b.style.setProperty("--rot", "0deg"); b.style.setProperty("--ty", "0px"); }
      b.setAttribute("aria-label", tr("Carte") + " " + (i + 1) + ", " + tr("face cachée"));
      b.innerHTML = `<div class="t-dealer"><div class="t-mini">${backHTML(c.r)}${miniFront(c)}</div></div><span class="t-tag"></span>`;
      b.addEventListener("click", e => { e.stopPropagation(); if(state === "idle" && !c.open) reveal(i); else if(state === "waiting") settle(); });
      fan.appendChild(b);
    });
  }

  /* ---------- Paquet → distribution ---------- */
  function sizePack(){
    const W = Math.round(Math.min(200, SW * .5)), H = Math.round(W * 1.49);
    pack.style.width = W + "px"; pack.style.height = H + "px"; pack.style.setProperty("--pw", W + "px"); pack.style.setProperty("--ph", H + "px");
    const img = `url('${op.img}')`; $(".t-body").style.backgroundImage = img; $(".t-flap").style.backgroundImage = img;
    const zig = (top, n) => Array.from({ length: n + 1 }, (_, i) => `${(i / n * 100).toFixed(1)}% ${top + (i % 2 ? 2.2 : 0)}%`).join(",");
    $(".t-body").style.clipPath = `polygon(${zig(12, 14)},100% 100%,0 100%)`;
    $(".t-flap").style.clipPath = `polygon(0 0,100% 0,${zig(14.2, 14).split(",").reverse().join(",")})`;
  }
  async function openPack(){
    if(state !== "pack") return;
    state = "busy"; say(""); sfxQ("pack");
    pack.style.animation = "none";
    await anim(pack, shakeFrames(1, 5, 8), { duration: 300 });
    if(closed) return;
    const flap = $(".t-flap");
    anim(flap, [{ transform: "none", opacity: 1 }, { transform: "translate(60px,-90px) rotate(28deg)", opacity: 0 }], { duration: 380, easing: "cubic-bezier(.3,.6,.4,1)" });
    const pr = pack.getBoundingClientRect();
    sparkle(pr.left + pr.width / 2, pr.top + 20, ["#f0c94d", "#ffffff", "#c8b4ff"], 26, 4);
    await sleep(110);
    fan.hidden = false;
    const slots = [...fan.children];
    slots.forEach(s => (s.querySelector(".t-dealer").style.opacity = 0));
    anim(pack, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(24px) scale(.9)" }], { duration: 320 });
    for(let i = 0; i < slots.length; i++){
      const d = slots[i].querySelector(".t-dealer"), r = slots[i].getBoundingClientRect();
      const dx = pr.left + pr.width / 2 - (r.left + r.width / 2), dy = pr.top + pr.height / 2 - (r.top + r.height / 2);
      d.style.opacity = "";
      anim(d, [{ transform: `translate(${dx}px,${dy}px) scale(.7) rotate(${rand(-14, 14)}deg)`, opacity: 0 }, { opacity: 1, offset: .2 }, { transform: "none", opacity: 1 }], { duration: 440, easing: "cubic-bezier(.34,1.45,.64,1)" });
      await sleep(grid ? 40 : 70);
    }
    await sleep(380);
    if(closed || skipped) return;
    pack.hidden = true; state = "idle"; say("Choisis une carte");
  }

  /* ---------- Révélation ---------- */
  async function reveal(i){
    state = "busy"; current = i; say("");
    const c = cards[i], T = OUV_TIMING[c.r], L = OUV_LOOK[c.r], slot = fan.children[i];
    const W = Math.round(Math.min(280, SW * .6, (SH - 200) / 1.5)), H = Math.round(W * 1.5);
    const fx = Math.round((SW - W) / 2), fy = Math.max(48, Math.round((SH - H) / 2 - 36));
    focus.getAnimations().forEach(a => a.cancel());
    Object.assign(focus.style, { left: fx + "px", top: fy + "px", width: W + "px", height: H + "px" });
    focus.innerHTML = `<div class="t-glow" style="--gc:${L.glow}"></div><div class="t-shaker"><div class="t-inner">${backHTML(c.r)}${bigFront(c)}</div></div>`;
    let holoOver = null;
    if(holoDir(c.id)){ holoOver = document.createElement("div"); holoOver.className = "t-holoover"; focus.appendChild(holoOver); curHolo = holoMount(holoOver, c.id, { idle: true }); }
    const glow = focus.querySelector(".t-glow"), shaker = focus.querySelector(".t-shaker"), inner = focus.querySelector(".t-inner"), neb = focus.querySelector(".t-neb");
    const sr = root.getBoundingClientRect(), r = slot.getBoundingClientRect();
    const start = `translate(${r.left - sr.left - fx}px,${r.top - sr.top - fy}px) scale(${r.width / W})`;
    slot.style.visibility = "hidden"; focus.hidden = false; fan.classList.add("focusing");
    const cx = fx + W / 2, cy = fy + H / 2;
    const heavy = c.r === "L" || c.r === "U";

    /* 1 · Attente */
    if(heavy) anim(dim, [{ opacity: 0 }, { opacity: c.r === "U" ? .82 : .5 }], { duration: 420, commit: true });
    if(c.r !== "C") skyStart(c.r, cx, cy);
    await anim(focus, [{ transform: start }, { transform: "none" }], { duration: T.wait, easing: c.r === "U" ? "cubic-bezier(.45,0,.2,1)" : "cubic-bezier(.34,1.4,.64,1)" });
    if(closed || skipped) return;

    /* 2 · Tension (les sous-étapes sont des parts de T.tension : une seule durée à régler) */
    const part = (...fr) => fr.map(f => T.tension * f);
    if(c.r === "R"){
      sky.target = .55; sky.spin = .02; sky.inflow = .5;
      anim(glow, [{ opacity: 0 }, { opacity: .9 }], { duration: T.tension });
      await sleep(T.tension);
    } else if(c.r === "E"){
      const [a, b] = part(350 / 650, 300 / 650);
      sky.target = .8; sky.spin = .02; sky.inflow = .4;
      anim(glow, [{ opacity: 0 }, { opacity: 1 }], { duration: T.tension });
      anim(neb, [{ opacity: 0 }, { opacity: .7 }], { duration: T.tension, easing: "ease-in" });
      if(!reduced) anim(shaker, shakeFrames(.3, 2, 10), { duration: T.tension });
      await sleep(a); sky.spin = .04; sky.inflow = 1;
      await sleep(b);
    } else if(c.r === "L"){
      const [a, b, d] = part(600 / 1250, 500 / 1250, 150 / 1250);
      sky.target = 1; sky.spin = .018; sky.inflow = .35;
      anim(glow, [{ opacity: 0 }, { opacity: .5 }, { opacity: 1 }], { duration: T.tension * .88 });
      anim(neb, [{ opacity: 0 }, { opacity: 1 }], { duration: T.tension * .8, easing: "ease-in" });
      if(!reduced) anim(shaker, shakeFrames(.5, 3.5, 20), { duration: T.tension * .88 });
      await sleep(a); sky.spin = .03; sky.inflow = .8;
      await sleep(b); sky.spin = .05; sky.inflow = 1.4;
      await sleep(d);
    } else if(c.r === "U"){
      /* deux battements → la galaxie s'enroule en accélérant → FAUX ARRÊT → explosion */
      const [b1, b2, b3, w1, w2, w3, stop] = part(160 / 2300, 220 / 2300, 320 / 2300, 450 / 2300, 400 / 2300, 300 / 2300, 450 / 2300);
      const beats = b1 + b2 + b3, wind = w1 + w2 + w3;
      sky.target = .45; sky.spin = .012; sky.inflow = .2;
      anim(glow, [{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: .3, offset: .4 }, { opacity: 1, offset: .55 }, { opacity: .45 }], { duration: beats });
      anim(neb, [{ opacity: 0 }, { opacity: .5 }], { duration: beats });
      await sleep(b1); sky.flare = .35; await sleep(b2); sky.flare = .35; await sleep(b3);
      sky.target = 1.15; sky.spin = .025; sky.inflow = .6;
      anim(glow, [{ opacity: .45 }, { opacity: 1 }], { duration: wind });
      anim(neb, [{ opacity: .5 }, { opacity: 1 }], { duration: wind });
      if(!reduced) anim(shaker, shakeFrames(.5, 6, 30), { duration: wind });
      await sleep(w1); sky.spin = .045; sky.inflow = 1.1;
      await sleep(w2); sky.spin = .075; sky.inflow = 1.8;
      await sleep(w3);
      if(closed || skipped) return;
      sky.freeze = true;                                     /* tout se fige : galaxie immobile, halo qui retombe, plus de tremblement */
      anim(glow, [{ opacity: 1 }, { opacity: .12 }], { duration: 180 });
      sky.target = .6;
      shaker.getAnimations().forEach(a => a.cancel());
      await sleep(stop);
      sky.freeze = false;
    }
    if(closed || skipped) return;

    /* 3 · Révélation */
    const flip = d => anim(inner, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(196deg)", offset: .78 }, { transform: "rotateY(180deg)" }], { duration: d, easing: "cubic-bezier(.3,0,.2,1)" });
    if(c.r === "R" || c.r === "E" || c.r === "L" || c.r === "U") sfxQ(heavy ? "legend" : "rare");
    if(c.r === "C"){
      sparkle(cx, cy, ["#ffffff", "#c9d3e2"], 10, 2.4);
      anim(shaker, [{ transform: "scale(1)" }, { transform: "scale(1.05)", offset: .5 }, { transform: "scale(1)" }], { duration: T.reveal });
    } else if(c.r === "R"){
      skyBurst(.8); wave(cx, cy, "rgba(106,162,216,1)", 5);
      sparkle(cx, cy, ["#6aa2d8", "#bcd8ff", "#ffffff"], 22, 4);
      anim(shaker, [{ transform: "scale(1)" }, { transform: "scale(1.08)", offset: .45 }, { transform: "scale(1)" }], { duration: T.reveal });
    } else if(c.r === "E"){
      anim(flashEl, [{ opacity: 0 }, { opacity: .35, offset: .2 }, { opacity: 0 }], { duration: 320 });
      skyBurst(.95); wave(cx, cy, "rgba(167,123,234,1)", 6);
      sparkle(cx, cy, ["#a77bea", "#e0d0ff", "#9fe6f0", "#ffffff"], 36, 5);
      anim(shaker, [{ transform: "scale(.96)" }, { transform: "scale(1.1)", offset: .42 }, { transform: "scale(1)" }], { duration: T.reveal });
    } else if(c.r === "L"){
      anim(flashEl, [{ opacity: 0 }, { opacity: .65, offset: .18 }, { opacity: 0 }], { duration: 420 });
      skyBurst(1.1); wave(cx, cy, "rgba(240,201,77,1)", 7, 44);
      if(!reduced) anim(root, shakeFrames(3, .5, 8), { duration: 240 });
      sparkle(cx, cy, ["#f0c94d", "#ffe6a8", "#ffffff", "#ffd0f0"], 60, 6.5);
      anim(shaker, [{ transform: "scale(.94)" }, { transform: "scale(1.14)", offset: .4 }, { transform: "scale(1)" }], { duration: T.reveal, easing: "ease-out" });
    } else {
      anim(flashEl, [{ opacity: 0 }, { opacity: 1, offset: .1 }, { opacity: 0 }], { duration: 600 });
      if(!reduced) anim(root, shakeFrames(7, 1, 12), { duration: 360 });
      skyBurst(1.5);
      wave(cx, cy, "rgba(232,106,166,1)", 9, 46); later(() => wave(cx, cy, "rgba(122,75,224,1)", 7, 50), 120); later(() => wave(cx, cy, "rgba(240,201,77,1)", 5, 54), 240);
      sparkle(cx, cy, ["#ff7ab6", "#c8b4ff", "#f0c94d", "#ffffff", "#9fd0ff"], 120, 9);
      anim(glow, [{ opacity: .12 }, { opacity: 1 }], { duration: 260 });
      anim(shaker, [{ transform: "scale(.9)" }, { transform: "scale(1.2)", offset: .38 }, { transform: "scale(.98)", offset: .7 }, { transform: "scale(1)" }], { duration: T.reveal, easing: "ease-out" });
    }
    await flip(T.reveal);
    if(closed || skipped) return;
    if(holoOver) holoOver.classList.add("on");

    /* 4 · Récompense */
    c.open = true;
    badge.textContent = badgeText(c); badge.className = "t-badge " + (c.isNew ? "new" : "dup");
    badge.style.top = fy + H + (heavy ? 64 : 22) + "px";
    anim(badge, [{ opacity: 0, transform: "translate(-50%,6px)" }, { opacity: 1, transform: "translate(-50%,0)" }], { duration: 260, commit: true });
    if(heavy){
      focus.classList.add("sheen");
      banner.textContent = RAR[c.r].n; banner.style.color = L.color; banner.style.top = fy + H + 22 + "px"; banner.style.textShadow = `0 0 16px ${L.color}`;
      anim(banner, [{ opacity: 0, transform: "scale(1.6)" }, { opacity: 1, transform: "scale(.96)", offset: .7 }, { opacity: 1, transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)", commit: true });
      const tw = c.r === "U" ? ["#ffd0ea", "#ffffff", "#c8b4ff"] : ["#ffe6a8", "#ffffff"];
      twinkle = setInterval(() => sparkle(cx + rand(-W / 2, W / 2), cy + rand(-H / 2, H / 2), tw, 2, .6), 260);
      await sleep(450);
      if(closed || skipped) return;
      state = "waiting"; say("Touche pour continuer");
    } else {
      if(c.r === "R") skyStop();
      if(c.r === "E"){
        banner.textContent = RAR.E.n; banner.style.color = L.color; banner.style.top = fy + H + 22 + "px"; banner.style.textShadow = `0 0 12px ${L.color}`;
        anim(banner, [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 260, commit: true });
        later(skyStop, 500);
      }
      await sleep(T.reward);
      if(closed || skipped) return;
      settle();
    }
  }

  /* La carte retourne dans l'éventail */
  async function settle(){
    if(state !== "waiting" && state !== "busy") return;
    state = "busy"; say("");
    clearInterval(twinkle); twinkle = 0;
    const i = current, slot = fan.children[i];
    banner.getAnimations().forEach(a => a.cancel()); banner.style.opacity = 0; badge.getAnimations().forEach(a => a.cancel()); badge.style.opacity = 0;
    skyStop(); focus.classList.remove("sheen");
    { const from = parseFloat(getComputedStyle(dim).opacity) || 0;
      if(from > 0){ dim.getAnimations().forEach(a => a.cancel()); anim(dim, [{ opacity: from }, { opacity: 0 }], { duration: 320, commit: true }); } }
    markOpen(i);
    const mini = slot.querySelector(".t-mini"); mini.style.transition = "none"; void mini.offsetWidth; mini.style.transition = "";
    const sr = root.getBoundingClientRect(), r = slot.getBoundingClientRect();
    const fx = parseFloat(focus.style.left), fy = parseFloat(focus.style.top), W = parseFloat(focus.style.width);
    const end = `translate(${r.left - sr.left - fx}px,${r.top - sr.top - fy}px) scale(${r.width / W})`;
    fan.classList.remove("focusing");
    focus.getAnimations().forEach(a => a.cancel());
    await anim(focus, [{ transform: "none" }, { transform: end }], { duration: 300, easing: "cubic-bezier(.5,0,.75,0)" });
    if(closed) return;
    slot.style.visibility = "";
    anim(slot.querySelector(".t-dealer"), [{ transform: "scale(1.18)" }, { transform: "scale(.96)", offset: .6 }, { transform: "none" }], { duration: 260 });
    focus.hidden = true; focus.getAnimations().forEach(a => a.cancel()); holoKill(curHolo); curHolo = null; focus.innerHTML = "";
    afterOpen();
  }
  function markOpen(i){
    const c = cards[i], slot = fan.children[i];
    if(!c.open) c.open = true;
    if(!slot.classList.contains("open")){ slot.classList.add("open"); opened++; }
    slot.setAttribute("aria-label", CARDS[c.id].name + ", " + RAR[c.r].n);
    const tag = slot.querySelector(".t-tag"); tag.textContent = c.isNew ? tr("Nouvelle") : "+" + c.v; tag.className = "t-tag " + (c.isNew ? "new" : "dup");
  }
  function afterOpen(){
    if(opened >= N) return finishPack();
    state = "idle"; say("Choisis une carte");
  }

  /* ---------- Fin de paquet ---------- */
  function finishPack(){
    state = "done"; say("Paquet terminé"); skipBtn.hidden = true;
    const refund = cards.reduce((a, c) => a + (c.isNew ? 0 : c.v || 0), 0);
    if(refund) sfxQ("coin");
    const pk = op.pid && PACKS.find(x => x.id === op.pid);
    const again = pk && !pk.starter && typeof packBuyable === "function" && packBuyable(pk);
    const lack = pk && !pk.starter ? pk.price - P.chf : 0;
    endEl.innerHTML = `${refund ? `<div class="t-refund">${tr("Doublons")} : +${refund} CHF</div>` : ""}
      <div class="t-btns">${pk && !pk.starter ? `<button class="primary" type="button" data-t="again" ${again ? "" : "disabled"}>${again ? tr("Ouvrir un autre paquet") : (lack > 0 ? tr("Il manque") + " " + lack + " CHF" : tr("Paquet indisponible"))}</button>` : ""}
      <button class="ghost" type="button" data-t="close">${tr("Continuer")}</button></div>`;
    endEl.hidden = false;
    anim(endEl, [{ opacity: 0, transform: "translate(-50%,-44%)" }, { opacity: 1, transform: "translate(-50%,-50%)" }], { duration: 320, commit: true });
    const first = endEl.querySelector("button:not([disabled])"); if(first) first.focus({ preventScroll: true });
  }

  /* ---------- Passer : tout retourner, sans animation ---------- */
  function skipAll(){
    if(skipped || closed || state === "done") return;
    skipped = true; clearInterval(twinkle); twinkle = 0;
    root.getAnimations({ subtree: true }).forEach(a => { try{ a.cancel(); }catch(e){} });
    timers.forEach(t => clearTimeout(t)); timers.clear();
    parts = []; waves = []; skyStop(); sky.freeze = false; sky.burst = false; sky.I = 0; sky.flare = 0;
    focus.hidden = true; holoKill(curHolo); curHolo = null; focus.innerHTML = ""; fan.classList.remove("focusing");
    banner.style.opacity = 0; badge.style.opacity = 0; dim.style.opacity = 0; flashEl.style.opacity = 0; root.style.transform = "";
    pack.hidden = true; fan.hidden = false;
    [...fan.children].forEach((s, i) => { s.style.visibility = ""; s.querySelector(".t-dealer").style.opacity = ""; s.querySelector(".t-dealer").style.transform = ""; markOpen(i); });
    finishPack();
  }

  /* ---------- Fermeture ---------- */
  function destroy(){
    if(closed) return; closed = true; holoKill(curHolo); curHolo = null;
    clearInterval(twinkle); timers.forEach(t => clearTimeout(t)); timers.clear();
    removeEventListener("resize", sizeCanvas); document.removeEventListener("keydown", onKey);
    root.remove();
    if(typeof packOpen !== "undefined") packOpen = null;
  }
  function close(){ destroy(); if(typeof render === "function") render(); }
  function onKey(e){ if(e.key === "Escape"){ e.preventDefault(); if(state === "done") close(); else skipAll(); } }
  document.addEventListener("keydown", onKey);

  root.addEventListener("click", e => {
    const t = e.target.closest("[data-t]");
    if(t){ e.stopPropagation(); if(t.disabled) return;
      if(t.dataset.t === "close") close();
      else if(t.dataset.t === "again"){ const pid = op.pid; destroy(); if(typeof buyPack === "function") buyPack(pid); }
      return; }
    if(state === "waiting") settle();
  });
  skipBtn.addEventListener("click", e => { e.stopPropagation(); skipAll(); });
  pack.addEventListener("click", e => { e.stopPropagation(); openPack(); });

  sizeCanvas(); sizePack(); buildFan();
  say("Touche le paquet");
  pack.focus({ preventScroll: true });
}
