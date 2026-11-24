/* Duel d'Helvara : bouton de partage (24 novembre, chantier 3.5).
   Une image dessinée dans le téléphone (canvas 1080 × 1350, format des réseaux) + une phrase avec le lien du jeu,
   envoyées par le menu de partage du téléphone (navigator.share). Sans partage de fichiers : l'image est téléchargée et la phrase copiée.
   Le jeu n'envoie rien lui-même : c'est le joueur qui choisit l'application. Aucune image ni police venue d'ailleurs (CSP : tout est sur ce site).
   Deux images : une carte tirée (fin d'ouverture de paquet) et une victoire (écran de fin de partie). */
const SHARE_URL = "https://kanoew.github.io/Duel-Helvara/";
const SHARE_W = 1080, SHARE_H = 1350;
const shareTr = t => (typeof trUI === "function" ? trUI(t) : t);
/* couleur de rareté (les var(--…) du jeu ne se lisent pas dans un canvas) */
const SHARE_RC = { C: "#b9c4d4", R: "#7fb6e6", E: "#b58cf0", L: "#dba862", U: "#f2c6ff", D: "#8b97ab", T: "#8b97ab" };
let shareBusy = false;

function shareLoadImg(src){
  return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
}
async function shareFonts(){
  if(!document.fonts || !document.fonts.load) return;
  try { await Promise.all(['64px "Marcellus"', '44px "Marcellus SC"', '600 34px "Manrope"', '34px "Manrope"'].map(f => document.fonts.load(f))); } catch(e){ /* polices de secours */ }
}
function shareRound(ctx, l, t, w, h, r){
  ctx.beginPath(); ctx.moveTo(l + r, t); ctx.arcTo(l + w, t, l + w, t + h, r); ctx.arcTo(l + w, t + h, l, t + h, r); ctx.arcTo(l, t + h, l, t, r); ctx.arcTo(l, t, l + w, t, r); ctx.closePath();
}
/* image « cover » dans un rectangle (comme background-size:cover) */
function shareCover(ctx, im, l, t, w, h){
  const k = Math.max(w / im.width, h / im.height), sw = w / k, sh = h / k;
  ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, l, t, w, h);
}
/* texte centré, réduit jusqu'à tenir dans la largeur */
function shareText(ctx, txt, x, y, font, size, color, maxW){
  let s = size; do { ctx.font = font.replace("%", s + "px"); s -= 2; } while(ctx.measureText(txt).width > maxW && s > 16);
  ctx.fillStyle = color; ctx.textAlign = "center"; ctx.fillText(txt, x, y);
}
function shareBg(ctx, glow){
  const g = ctx.createLinearGradient(0, 0, 0, SHARE_H); g.addColorStop(0, "#111827"); g.addColorStop(1, "#0a0e16");
  ctx.fillStyle = g; ctx.fillRect(0, 0, SHARE_W, SHARE_H);
  const r = ctx.createRadialGradient(SHARE_W / 2, 560, 40, SHARE_W / 2, 560, 720); r.addColorStop(0, glow + "55"); r.addColorStop(1, glow + "00");
  ctx.fillStyle = r; ctx.fillRect(0, 0, SHARE_W, SHARE_H);
}
function shareFooter(ctx){
  ctx.fillStyle = "rgba(226,234,245,.18)"; ctx.fillRect(140, SHARE_H - 178, SHARE_W - 280, 2);
  shareText(ctx, "Duel d'Helvara", SHARE_W / 2, SHARE_H - 104, '%"Marcellus SC", "Marcellus", Georgia, serif', 52, "#e2eaf5", 900);
  shareText(ctx, shareTr("Jeu de cartes gratuit, dans ton navigateur") + " · kanoew.github.io/Duel-Helvara", SHARE_W / 2, SHARE_H - 52, '%"Manrope", system-ui, sans-serif', 28, "#8b97ab", 960);
}
const shareBlob = cv => new Promise(res => cv.toBlob(b => res(b), "image/png"));

/* ---------- Carte tirée ---------- */
async function shareCardImage(id, isNew){
  const d = CARDS[id]; if(!d) return null;
  await shareFonts();
  const cv = document.createElement("canvas"); cv.width = SHARE_W; cv.height = SHARE_H; const ctx = cv.getContext("2d");
  const rc = SHARE_RC[d.r] || "#b9c4d4";
  shareBg(ctx, rc);
  shareText(ctx, shareTr(isNew ? "Nouvelle carte tirée" : "Carte tirée"), SHARE_W / 2, 96, '%"Marcellus SC", "Marcellus", Georgia, serif', 40, rc, 900);
  const cw = 560, ch = 840, cl = (SHARE_W - cw) / 2, ct = 140, im = await shareLoadImg(d.img);
  ctx.save(); ctx.shadowColor = rc + "aa"; ctx.shadowBlur = 60; shareRound(ctx, cl, ct, cw, ch, 30); ctx.fillStyle = "#0a0e16"; ctx.fill(); ctx.restore();
  ctx.save(); shareRound(ctx, cl, ct, cw, ch, 30); ctx.clip(); if(im) shareCover(ctx, im, cl, ct, cw, ch); ctx.restore();
  ctx.save(); shareRound(ctx, cl, ct, cw, ch, 30); ctx.lineWidth = 6; ctx.strokeStyle = rc; ctx.stroke(); ctx.restore();
  shareText(ctx, d.name, SHARE_W / 2, 1052, '%"Marcellus", Georgia, serif', 66, "#f4f6fb", 960);
  const fac = FAC[d.fac] ? FAC[d.fac].n : "", rar = RAR[d.r] ? RAR[d.r].n : "";
  shareText(ctx, [rar, fac, `${shareTr("Coût")} ${d.cost} · ${shareTr("Puissance")} ${d.pow}`].filter(Boolean).join(" · "), SHARE_W / 2, 1106, '600 %"Manrope", system-ui, sans-serif', 32, rc, 960);
  shareFooter(ctx);
  return shareBlob(cv);
}

/* ---------- Victoire ---------- */
function shareModeLabel(o){
  if(o.chron) return o.done ? shareTr("Chronique I terminée") : shareTr("Chronique I") + ` · ${shareTr("match")} ${o.step + 1}/3`;
  if(o.daily) return shareTr("Défi du jour");
  if(o.blitz) return `Blitz · ${o.wins}/3`;
  if(o.mp) return shareTr("Duel en ligne");
  return shareTr("Partie classée");
}
async function shareWinImage(){
  const o = S && S.over; if(!o || o.res !== "win" || !S.locs) return null;
  await shareFonts();
  const cv = document.createElement("canvas"); cv.width = SHARE_W; cv.height = SHARE_H; const ctx = cv.getContext("2d");
  shareBg(ctx, "#6fb8de");
  const tw = 300, th = 224, gap = 30, x0 = (SHARE_W - 3 * tw - 2 * gap) / 2, ty = 360;
  const lines = [];
  if(o.tie) lines.push(`${shareTr("Départage à la puissance totale")} : ${o.pt} – ${o.et}`);
  if(o.oath) lines.push(`⚖ ${shareTr(o.oath.cross ? (o.oath.kept ? "Serment croisé tenu" : "Serment croisé rompu") : (o.oath.kept ? "Serment tenu" : "Serment rompu"))}`);
  else if(o.rk && o.rk.oath) lines.push(`⚖ ${shareTr(o.rk.oath === "kept" ? "Serment tenu" : "Serment rompu")}`);
  if(o.chron && o.done && typeof CHRON !== "undefined") lines.push(`${shareTr("Titre gagné :")} ${shareTr(CHRON.title)}`);
  if(!o.mp && !o.chron && !o.daily && !o.blitz && typeof TIERS !== "undefined" && typeof tierOf === "function") lines.push(`${shareTr("Rang")} : ${TIERS[tierOf(P.lv)]}`);
  /* contenu centré verticalement au-dessus du pied de page (de 40 à la dernière ligne) */
  const bottom = lines.length ? ty + th + 230 + (lines.length - 1) * 64 : ty + th + 140;
  ctx.save(); ctx.translate(0, Math.max(0, Math.round((1150 - bottom - 40) / 2)));
  shareText(ctx, shareModeLabel(o), SHARE_W / 2, 100, '%"Marcellus SC", "Marcellus", Georgia, serif', 40, "#dba862", 960);
  shareText(ctx, shareTr("Victoire"), SHARE_W / 2, 226, '%"Marcellus SC", "Marcellus", Georgia, serif', 128, "#f4f6fb", 960);
  const foe = o.mp && S.mp ? S.mp.oppNick : (typeof foeName === "function" ? foeName() : "IA");
  shareText(ctx, `${P.name} ${shareTr("contre")} ${foe}`, SHARE_W / 2, 296, '600 %"Manrope", system-ui, sans-serif', 36, "#aab6c8", 960);
  /* les trois lieux : illustration, nom, score (toi en bleu, l'adversaire en violet), le gagnant cerclé */
  const ims = await Promise.all(S.locs.map(L => shareLoadImg(LOCS[L.id].img)));
  o.rows.forEach((r, i) => {
    const l = x0 + i * (tw + gap), win = r.w === "p", lose = r.w === "e";
    ctx.save(); shareRound(ctx, l, ty, tw, th, 20); ctx.clip(); if(ims[i]) shareCover(ctx, ims[i], l, ty, tw, th); ctx.fillStyle = "rgba(10,14,22,.35)"; ctx.fillRect(l, ty, tw, th); ctx.restore();
    ctx.save(); shareRound(ctx, l, ty, tw, th, 20); ctx.lineWidth = win ? 6 : 2; ctx.strokeStyle = win ? "#6fb8de" : lose ? "rgba(154,140,208,.6)" : "rgba(226,234,245,.25)"; ctx.stroke(); ctx.restore();
    if(r.x2){ ctx.fillStyle = "rgba(10,14,22,.8)"; shareRound(ctx, l + 12, ty + 12, 64, 40, 20); ctx.fill(); shareText(ctx, "×2", l + 44, ty + 42, '700 %"Manrope", system-ui, sans-serif', 26, "#dba862", 60); }
    shareText(ctx, r.n, l + tw / 2, ty + th + 52, '%"Marcellus", Georgia, serif', 30, "#e2eaf5", tw);
    ctx.font = '600 56px "Manrope", system-ui, sans-serif'; ctx.textAlign = "center";
    const a = String(r.a), b = String(r.b), sep = "  –  ", wa = ctx.measureText(a).width, ws = ctx.measureText(sep).width, wb = ctx.measureText(b).width, sx = l + tw / 2 - (wa + ws + wb) / 2;
    ctx.textAlign = "left"; ctx.fillStyle = win ? "#6fb8de" : "#7d8aa0"; ctx.fillText(a, sx, ty + th + 128);
    ctx.fillStyle = "#4b5568"; ctx.fillText(sep, sx + wa, ty + th + 128);
    ctx.fillStyle = lose ? "#9a8cd0" : "#7d8aa0"; ctx.fillText(b, sx + wa + ws, ty + th + 128);
  });
  let y = ty + th + 230;
  for(const t of lines){ shareText(ctx, t, SHARE_W / 2, y, '600 %"Manrope", system-ui, sans-serif', 38, "#dba862", 960); y += 64; }
  ctx.restore();
  shareFooter(ctx);
  return shareBlob(cv);
}

/* ---------- Envoi ---------- */
async function shareSend(blob, text, name){
  if(!blob) return "erreur";
  const full = text + " " + SHARE_URL;
  let file = null; try { file = new File([blob], name, { type: "image/png" }); } catch(e){ /* très vieux navigateur */ }
  if(file && navigator.canShare && navigator.share){
    try { if(navigator.canShare({ files: [file] })){ await navigator.share({ files: [file], text: full }); return "ok"; } }
    catch(e){ if(e && e.name === "AbortError") return "annule"; }
  }
  if(navigator.share){ try { await navigator.share({ text: full, url: SHARE_URL }); return "ok"; } catch(e){ if(e && e.name === "AbortError") return "annule"; } }
  /* repli : l'image est téléchargée, la phrase copiée */
  try { const a = document.createElement("a"), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 5000); } catch(e){ /* rien */ }
  try { await navigator.clipboard.writeText(full); } catch(e){ /* presse-papiers refusé */ }
  return "telecharge";
}
let shareMsg = "", shareMsgAt = 0;
function shareSay(res){
  shareMsg = res === "telecharge" ? "Image enregistrée, phrase copiée" : res === "erreur" ? "Partage impossible sur ce navigateur" : "";
  shareMsgAt = Date.now(); if(typeof render === "function" && S && S.over) render();
}
const shareLabel = def => Date.now() - shareMsgAt < 3000 && shareMsg ? shareMsg : def;

async function shareWin(){
  if(shareBusy) return; shareBusy = true;
  try {
    const o = S && S.over; if(!o) return;
    const won = o.rows.filter(r => r.w === "p").length;
    const what = o.chron && o.done ? shareTr("J'ai pris le Trône de Tiamat dans Duel d'Helvara") : `${shareTr("Victoire dans Duel d'Helvara")} (${won}/3 ${shareTr("lieux")})`;
    shareSay(await shareSend(await shareWinImage(), what + ". " + shareTr("Tu relèves le défi ?"), "helvara-victoire.png"));
  } finally { shareBusy = false; }
}
async function shareCard(id, isNew){
  if(shareBusy || !CARDS[id]) return "erreur"; shareBusy = true;
  try { return await shareSend(await shareCardImage(id, isNew), `${shareTr("Je viens de tirer")} ${CARDS[id].name} ${shareTr("dans Duel d'Helvara")}.`, "helvara-" + id + ".png"); }
  finally { shareBusy = false; }
}
/* meilleure carte d'un paquet : la plus rare, une nouvelle d'abord */
function shareBest(res){
  const RK = { C: 1, R: 2, E: 3, L: 4, U: 5 };
  return (res || []).slice().sort((a, b) => ((RK[CARDS[b.id].r] || 0) - (RK[CARDS[a.id].r] || 0)) || ((b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)))[0] || null;
}
