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

  auth.signOut = async () => {
    await sb.auth.signOut().catch(() => {});
    // La progression reste sur le compte Google ; l'appareil repart d'une partie vierge.
    try { localStorage.removeItem("duel-helvara-save-v1"); localStorage.removeItem("duel-helvara-mp"); } catch(e) {}
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
          const { error } = await sb.from(table).upsert({ user_id:id, data:obj, updated_at:new Date().toISOString() });
          if(error) throw fail(error);
        }
      };
    },
    collection(name){
      if(name !== "board") throw new Error("Collection inconnue : " + name);
      return {
        onSnapshot(cb, onErr){
          const rows = new Map(); let live = true;
          const emit = () => { if(live) cb({ docs: [...rows].map(([id, d]) => ({ id, data: () => d })) }); };
          const load = async () => {
            let res; try { res = await sb.from("board").select("user_id,data").order("updated_at", { ascending:false }).limit(1000); } catch(e) { onErr && onErr(e); return; }
            const { data, error } = res;
            if(error){ onErr && onErr(fail(error)); return; }
            rows.clear(); for(const r of data) rows.set(r.user_id, r.data); emit();
          };
          const ch = sb.channel("helvara-board")
            .on("postgres_changes", { event:"*", schema:"public", table:"board" }, m => {
              if(m.eventType === "DELETE"){ if(m.old && m.old.user_id) rows.delete(m.old.user_id); }
              else if(m.new && m.new.user_id) rows.set(m.new.user_id, m.new.data);
              emit();
            })
            .subscribe(status => { if(status === "SUBSCRIBED") load(); });
          load();
          return () => { live = false; sb.removeChannel(ch); };
        }
      };
    }
  };

  /* ---------- Salon des duels (présence en temps réel) ---------- */
  async function makeRoom(){
    const s = await sessionP;
    const uid = s && s.user ? s.user.id : null;
    const key = "t" + Math.random().toString(36).slice(2, 10);
    const ch = sb.channel("helvara-salon", { config:{ presence:{ key } } });
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
      onPeers(cb, err){ onPeers = cb; onErr = err; if(list.length) cb(); }
    };
  }

  let roomP = null;
  window.claude = {
    async use(name){
      if(name === "db") return (await sessionP) ? db : null;
      if(name === "user") return (await sessionP) ? { id: async () => ((await sessionP) || {}).user?.id || null } : null;
      if(name === "room") return roomP || (roomP = makeRoom().catch(() => { roomP = null; return null; }));
      return null;
    }
  };
})();
