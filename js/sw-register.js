/* Service worker : hors ligne contre l'IA. Pas de service worker pour les tests automatiques (navigator.webdriver).
   Une nouvelle version recharge la page une fois, mais jamais pendant une partie, l'ouverture d'un paquet, la recherche d'un adversaire ou un salon de duel : on attend la fin. */
if("serviceWorker" in navigator && /^https?:/.test(location.protocol) && !navigator.webdriver){
  const had=!!navigator.serviceWorker.controller;
  const busy=()=>{ try{ return !!((S&&!S.over&&screen==="play")||packOpen||mq||myMp||roomC); }catch(_){ return false; } };
  navigator.serviceWorker.addEventListener("controllerchange",()=>{
    if(!had||window.__swReload) return; window.__swReload=1;
    const go=()=>busy()?setTimeout(go,3000):location.reload(); go(); });
  addEventListener("load",()=>navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).catch(()=>{}));
}
