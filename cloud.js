/* Pont Supabase pour Duel d'Helvara.
   Le jeu a été écrit pour les artefacts Claude, qui lui fournissent window.claude.use("db" | "user" | "room").
   Ce fichier recrée exactement ces trois objets avec Supabase, pour que index.html reste presque intact :
   - "user" : un compte par joueur. Anonyme au départ (lié à l'appareil), puis Google pour retrouver sa partie partout.
   - "db"   : la sauvegarde (table saves) et le classement (table board, mis à jour en direct).
   - "room" : le salon des duels, via la présence en temps réel de Supabase. */
(function(){
  const cfg = window.HELVARA_CONFIG || {};
  const home = () => location.origin + location.pathname;
  const LINK_FLAG = "helvara-google-link";

  // État de connexion lu par le pied de page du jeu.
  const auth = window.helvara = { ready:false, google:false, email:null, error:null, signIn(){}, signOut(){} };
  const LOCAL_KEYS = ["duel-helvara-save-v1", "duel-helvara-mp", "duel-helvara-save-owner"];
  const wipeLocal = () => { window.__wiped = true; try { LOCAL_KEYS.forEach(k => localStorage.removeItem(k)); } catch(e) {} };
  // Hors ligne : « supprimer mon compte » efface la copie locale.
  auth.deleteAccount = async () => { wipeLocal(); location.replace(home()); return { ok:true }; };

  if(!cfg.supabaseUrl || !cfg.supabaseKey || !window.supabase){
    auth.ready = true; auth.error = "Supabase n'est pas configuré : le jeu tourne hors ligne.";
    return; // pas de window.claude : le jeu passe en mode local, comme avant
  }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
    auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:"pkce" }
  });

  function readUser(user){
    auth.google = !!(user && (user.identities||[]).some(i => i.provider === "google"));
    auth.email = auth.google ? (user.email || null) : null;
  }

  /* ---------- Compte ---------- */
  const sessionP = (async () => {
    const params = new URLSearchParams(location.search + "&" + location.hash.replace(/^#/, ""));
    const errCode = params.get("error_code") || params.get("error");
    let session = null;
    try { session = (await sb.auth.getSession()).data.session; } catch(e) {}
    if(params.has("code") || errCode) history.replaceState(null, "", home());

    // Ce compte Google est déjà lié à un autre joueur (autre appareil) : on s'y connecte directement.
    let linking = false; try { linking = sessionStorage.getItem(LINK_FLAG) === "1"; sessionStorage.removeItem(LINK_FLAG); } catch(e) {}
    if(linking && errCode && errCode !== "access_denied"){
      // La partie anonyme de cet appareil est abandonnée : on retire sa ligne du classement.
      if(session && session.user) await sb.from("board").delete().eq("user_id", session.user.id).then(() => {}, () => {});
      await sb.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: home() } });
      return new Promise(() => {}); // la page part vers Google
    }

    if(!session){
      const r = await sb.auth.signInAnonymously();
      if(r.error) auth.error = "Connexion impossible : " + r.error.message;
      session = r.data && r.data.session;
    }
    readUser(session && session.user);
    auth.ready = true;
    return session || null;
  })().catch(e => { auth.ready = true; auth.error = String(e && e.message || e); return null; });

  auth.signIn = async () => {
    const s = await sessionP;
    if(s && s.user && s.user.is_anonymous){
      // On garde le même identifiant : la progression de cet appareil suit le compte Google.
      try { sessionStorage.setItem(LINK_FLAG, "1"); } catch(e) {}
      const r = await sb.auth.linkIdentity({ provider:"google", options:{ redirectTo: home() } });
      if(!r.error) return;
      try { sessionStorage.removeItem(LINK_FLAG); } catch(e) {}
    }
    await sb.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: home() } });
  };

  // Supprime le compte (fonction delete_my_account de supabase.sql), puis repart d'une partie vierge.
  auth.deleteAccount = async () => {
    await sessionP;
    const r = await sb.rpc("delete_my_account");
    if(r.error) return { ok:false, error:r.error.message };
    wipeLocal();
    await sb.auth.signOut().catch(() => {});
    location.replace(home());
    return { ok:true };
  };

  auth.signOut = async () => {
    await sb.auth.signOut().catch(() => {});
    // La progression reste sur le compte Google ; l'appareil repart d'une partie vierge.
    try { localStorage.removeItem("duel-helvara-save-v1"); localStorage.removeItem("duel-helvara-mp"); localStorage.removeItem("duel-helvara-save-owner"); } catch(e) {}
    location.replace(home());
  };

  /* ---------- Base de données ---------- */
  function fail(error){
    const e = new Error(error.message || "Erreur Supabase");
    e.code = (error.code === "42501" || error.status === 401 || error.status === 403) ? "permission_denied" : error.code;
    return e;
  }
  function route(path){
    const p = String(path).split("/");
    if(p[0] === "data" && p[1] === "users" && p[3] === "save" && p.length === 4) return { table:"saves", id:p[2] };
    if(p[0] === "board" && p.length === 2) return { table:"board", id:p[1] };
    throw new Error("Chemin non pris en charge : " + path);
  }
  const db = {
    doc(path){
      const { table, id } = route(path);
      return {
        async get(){
          const { data, error } = await sb.from(table).select("data").eq("user_id", id).maybeSingle();
          if(error) throw fail(error);
          return { exists: !!data, data: () => data ? data.data : undefined };
        },
        async set(obj){
          if(table === "board"){
            /* Classement : le jeu ne l'écrit plus lui-même. La fonction board_submit (classement-securise.sql) tourne côté
               serveur, lit l'identité dans la connexion et ne retient que des changements plausibles. */
            const n = v => Number.isFinite(v) ? Math.floor(v) : null;
            const r = await sb.rpc("board_submit", { p_nick: obj.nick ?? null, p_av: obj.av ?? null, p_lv: n(obj.lv), p_st: n(obj.st),
              p_best: n(obj.best), p_sw: n(obj.sw), p_sl: n(obj.sl), p_season: obj.season ?? null, p_rv: 2 });
            if(!r.error) return;
            /* Transition : tant que classement-securise.sql n'a pas été lancé dans Supabase, la fonction n'existe pas.
               On écrit alors comme avant (la règle d'écriture directe est encore en place). */
            const e = r.error, missing = e.code === "PGRST202" || e.code === "42883" || r.status === 404 || /could not find the function/i.test(e.message || "");
            if(!missing) throw fail(e);
          }
          const { error } = await sb.from(table).upsert({ user_id:id, data:obj, updated_at:new Date().toISOString() });
          if(error) throw fail(error);
        }
      };
    },
    /* Retours des joueurs et statistiques de cartes (retours-stats.sql) : anonymes, envoyés en fin de partie, sans nouvel essai. */
    async feedback(kind, card, mode, build){
      const r = await sb.rpc("feedback_submit", { p_kind:kind, p_card:card || null, p_mode:mode || null, p_build:build || null });
      if(r.error) throw fail(r.error);
    },
    async stats(mode, result, plays, opp){
      let r = await sb.rpc("stats_submit", { p_mode:mode, p_result:result, p_plays:plays, p_opp:opp === "humain" ? "humain" : "ia" });
      /* stats-adversaire.sql pas encore lancé dans Supabase : l'ancienne fonction (sans adversaire) */
      if(r.error && r.error.code === "PGRST202") r = await sb.rpc("stats_submit", { p_mode:mode, p_result:result, p_plays:plays });
      if(r.error) throw fail(r.error);
    },
    /* Classement : les 100 meilleurs de la saison (+ quelques joueurs du mois d'avant) et ta ligne, triés par la base.
       Fonction board_top (classement-allege.sql). Tant qu'elle n'existe pas, on lit les 200 dernières lignes mises à jour. */
    async boardTop(season){
      let res = await sb.rpc("board_top", { p_limit:100, p_season: season || null });
      if(res.error){
        const e = res.error;
        if(!(e.code === "PGRST202" || e.code === "42883" || res.status === 404 || /could not find the function/i.test(e.message || ""))) throw fail(e);
        res = await sb.from("board").select("user_id,data").order("updated_at", { ascending:false }).limit(200);
        if(res.error) throw fail(res.error);
      }
      return (res.data || []).map(r => ({ id:r.user_id, data:r.data }));
    }
  };

  /* ---------- Salon des duels (présence en temps réel) ---------- */
  async function makeRoom(name){
    const s = await sessionP;
    const uid = s && s.user ? s.user.id : null;
    const key = "t" + Math.random().toString(36).slice(2, 10);
    const ch = sb.channel(name, { config:{ presence:{ key } } });
    let state = {}, list = [], onPeers = null, onErr = null, joined = false, errTimer = null;

    const rebuild = () => {
      list = Object.entries(ch.presenceState()).map(([k, metas]) => {
        const m = metas[metas.length - 1] || {};
        const by = typeof m.uid === "string" ? m.uid : null;
        return { by, presence: m.p || {}, sameTab: k === key, isMe: k === key || (!!uid && by === uid) };
      });
      if(onPeers) onPeers();
    };
    ch.on("presence", { event:"sync" }, rebuild);

    await new Promise(resolve => {
      const t = setTimeout(resolve, 8000);
      ch.subscribe(async status => {
        if(status === "SUBSCRIBED"){
          joined = true; clearTimeout(errTimer); errTimer = null;
          await ch.track({ uid, p:state }); clearTimeout(t); resolve();
        } else if(status === "CHANNEL_ERROR" || status === "TIMED_OUT"){
          // Supabase se reconnecte seul ; on ne prévient le joueur que si ça dure.
          if(!errTimer) errTimer = setTimeout(() => { errTimer = null; if(onErr) onErr(new Error(status)); }, 30000);
        }
      });
    });

    return {
      presence(patch){ state = Object.assign({}, state, patch); return joined ? ch.track({ uid, p:state }) : Promise.resolve(); },
      peers(){ return list; },
      onPeers(cb, err){ onPeers = cb; onErr = err; if(list.length) cb(); },
      leave(){ onPeers = null; onErr = null; clearTimeout(errTimer); try { sb.removeChannel(ch); } catch(e) {} }
    };
  }

  window.claude = {
    async use(name){
      if(name === "db") return (await sessionP) ? db : null;
      if(name === "user") return (await sessionP) ? { id: async () => ((await sessionP) || {}).user?.id || null } : null;
      /* « room:<nom du canal> » : un canal de présence à part (salon avec code, file d'attente). Le jeu l'ouvre seulement
         quand il en a besoin, et le ferme avec leave(). */
      if(typeof name === "string" && name.startsWith("room:") && /^[A-Za-z0-9_-]{3,64}$/.test(name.slice(5))) return makeRoom("helvara-" + name.slice(5).replace(/^helvara-/, "")).catch(() => null);
      return null;
    }
  };
})();
