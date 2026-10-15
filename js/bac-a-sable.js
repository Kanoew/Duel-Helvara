/* Bac à sable : ouvrir le jeu avec ?date=AAAA-MM-JJ simule cette date pour voir et jouer les cartes pas encore sorties.
   Rien n'est sauvegardé, ni sur l'appareil ni sur le compte : le profil du bac à sable est neuf, avec toutes les cartes, et disparaît au rechargement.
   Le vrai profil n'est jamais modifié ; le compte n'est pas lu ; les duels en ligne, le classement et les statistiques sont coupés.
   Ce script est chargé AVANT les autres (la date doit être connue dès le départ) ; sandboxSetup() est appelée par boot() (js/interface.js). */
(function () {
  const m = /[?&]date=(\d{4}-\d{2}-\d{2})(?=&|$)/.exec(location.search);
  if (!m || isNaN(new Date(m[1] + "T12:00:00")) || m[1] < "2026-10-01" || m[1] > "2030-12-31") return;
  window.__today = m[1];    /* date simulée (comme dans les tests) */
  window.__wiped = true;    /* save() n'écrit plus rien : même garde-fou que la suppression de compte */
  window.__sandbox = true;
})();
function sandboxSetup() {
  if (!window.__sandbox) return;
  window.claude = null;     /* aucun compte, aucun salon en ligne */
  const q = freshProfile(); q.name = "Bac à sable"; q.chf = 99999; q.tuto = true; q.starter = true; q.lv = 12;
  q.owned = Object.keys(CARDS).filter(id => !CARDS[id].token);
  q.fj = { helvara: 9999, primordial: 9999, desir: 9999, jugement: 9999, nikev: 9999 };
  P = clean(q);
  P.owned = q.owned;        /* toutes les cartes, y compris celles pas encore sorties à cette date (le jeu les cache lui-même) */
  const ok = avail().filter(id => !ULof(id) && !CARDS[id].token), pick = f => ok.filter(id => CARDS[id].fac === f).slice(0, ECO.deckSize);
  P.decks.forEach(d => { d.cards = pick(d.cover); });
  P.di = 0; P.deck = [...P.decks[0].cards];
  const bar = document.createElement("div"); bar.className = "sandbar";
  bar.innerHTML = '<span>Mode test · ' + window.__today + ' · rien n\'est sauvegardé</span><input type="date" value="' + window.__today + '" min="2026-10-01" max="2030-12-31" aria-label="Date simulée"><button type="button" class="sb-go">Changer</button><a href="' + location.pathname + '">Quitter</a>';
  document.body.appendChild(bar);
  bar.querySelector(".sb-go").addEventListener("click", () => { const v = bar.querySelector("input").value; if (/^\d{4}-\d{2}-\d{2}$/.test(v)) location.href = location.pathname + "?date=" + v; });
}
