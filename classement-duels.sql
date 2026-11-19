-- Duel d'Helvara : étoiles des duels en ligne et plafonds du classement (anti-triche, lot C).
-- À coller UNE FOIS dans Supabase → SQL Editor, puis « Run ». Le relancer ne casse rien (colonnes « if not exists », fonctions remplacées).
-- Prérequis : classement-securise.sql, retours-stats.sql, file-attente.sql et duels-valides.sql déjà lancés.
--
-- Décisions de Jordan (19 novembre) :
--   - seuls les duels trouvés par la recherche (« Jouer » ou « Chercher un adversaire ») sont classés : le serveur note les deux
--     comptes au moment où il les met ensemble (mm_seek), donc personne ne peut y glisser un second compte par le code du salon.
--     La revanche dans le même salon est classée aussi. Les duels entre amis (avec code) restent hors classement ;
--   - un duel classé ne compte que sur résultat validé (duels-valides.sql), et au plus 3 victoires par jour contre un même adversaire ;
--   - parties contre l'IA (invérifiables) : 1 toutes les 2 minutes (réserve de 5), 60 par jour ;
--   - au plus 45 étoiles gagnées par jour au total (IA et duels) : un tricheur met 3 jours, pas une heure, pour le rang maximum.
-- Rien de nouveau n'est collecté : deux compteurs (victoires et défaites de duel pas encore reportées au classement) et le score du
-- début de journée, dans la table technique board_guard ; deux colonnes (classé, compté) dans duel_games.

-- 1. Colonnes ajoutées ---------------------------------------------------------------------------------------------------------
alter table public.board_guard add column if not exists duel_w   int not null default 0;  -- victoires de duel validées, pas encore reportées
alter table public.board_guard add column if not exists duel_l   int not null default 0;  -- défaites de duel validées, pas encore reportées
alter table public.board_guard add column if not exists day_base int;                     -- score (étoiles cumulées) au début du jour
alter table public.duel_games  add column if not exists ranked  boolean not null default false;  -- trouvé par la recherche : classé
alter table public.duel_games  add column if not exists counted boolean;                         -- validé et compté au classement
create index if not exists duel_games_done on public.duel_games (done_at) where ranked;

-- 2. Classement : plafonds revus, victoires et défaites de duel validées en plus de la réserve IA -------------------------------
create or replace function public.board_submit(
  p_nick text, p_av text, p_lv int, p_st int, p_best int, p_sw int, p_sl int, p_season text, p_rv int default 2
) returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  k_every    constant numeric := 120;  -- une partie contre l'IA toutes les 2 minutes
  k_cap      constant numeric := 5;    -- réserve maximale
  k_day      constant int     := 60;   -- parties contre l'IA par jour
  k_stars    constant int     := 4;    -- étoiles maximales par victoire (serment croisé)
  k_daystars constant int     := 45;   -- étoiles gagnées par jour au plus (IA et duels)
  uid      uuid := auth.uid();
  starts   constant int[] := array[0,3,6,9,12,17,22];
  cur      text := to_char(now() at time zone 'utc', 'YYYY-MM');
  today    date := (now() at time zone 'utc')::date;
  nick text; av text; season text; ose text;
  g public.board_guard%rowtype; o jsonb;
  cr numeric; dg int; allowed int; db int;
  blv int; bst int; bsw int; bsl int; bbest int; tier int;
  dw int; dl int; uw int; ul int; aw int; al int; nsw int; nsl int;
  claim_lv int; claim_st int; cs int; bs int; ns int; nlv int; nst int; nbest int; arr int[];
  row_data jsonb; clamped boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;

  -- pseudo : sans caractères de contrôle ni < >, espaces simplifiés, 24 caractères au plus
  nick := regexp_replace(coalesce(p_nick, ''), '[\u0001-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩<>]', '', 'g');
  nick := left(btrim(regexp_replace(nick, '\s+', ' ', 'g')), 24);
  if nick = '' then nick := 'Joueur'; end if;
  -- avatar : un identifiant simple (le jeu ne l'affiche que s'il fait partie de ses images)
  av := case when p_av ~ '^[a-z0-9_]{1,40}$' then p_av else null end;
  -- saison : la courante ou une voisine (décalage d'horloge), sinon celle du serveur
  season := case when p_season ~ '^20[2-9][0-9]-(0[1-9]|1[0-2])$'
                   and abs((substr(p_season,1,4)::int*12 + substr(p_season,6,2)::int)
                         - (substr(cur,1,4)::int*12 + substr(cur,6,2)::int)) <= 1
                 then p_season else cur end;

  insert into public.board_guard (user_id) values (uid) on conflict (user_id) do nothing;
  select * into g from public.board_guard where user_id = uid for update;
  select data into o from public.board where user_id = uid for update;

  cr := least(k_cap, g.credits + greatest(0, extract(epoch from (now() - g.refill_at))) / k_every);
  dg := case when g.day = today then g.day_games else 0 end;

  -- point de départ : la ligne enregistrée, ou une ligne neuve au changement de saison
  ose := coalesce(o ->> 'season', '');
  if o is not null and ose >= season then
    season := ose;                                     -- jamais de retour en arrière sur la saison
    blv := public.board_int(o,'lv'); bst := public.board_int(o,'st'); bsw := public.board_int(o,'sw');
    bsl := public.board_int(o,'sl'); bbest := public.board_int(o,'best');
  elsif o is null then
    blv := 0; bst := 0; bsw := 0; bsl := 0; bbest := 0;
  else                                                 -- nouvelle saison : même reprise que le jeu (3 paliers plus bas)
    tier := (select count(*) from unnest(starts) s where public.board_int(o,'lv') >= s) - 1;
    blv := starts[greatest(0, tier - 3) + 1]; bst := 0; bsw := 0; bsl := 0; bbest := blv;
  end if;
  bs := public.board_base(blv) + bst;
  db := case when g.day = today and g.day_base is not null then g.day_base else bs end;   -- score au début du jour

  -- parties : d'abord les duels validés (sans limite de réserve), puis la réserve IA ; jamais de baisse des compteurs
  dw := least(999, greatest(0, coalesce(p_sw, 0) - bsw));
  dl := least(999, greatest(0, coalesce(p_sl, 0) - bsl));
  uw := least(dw, g.duel_w); ul := least(dl, g.duel_l);
  allowed := greatest(0, least(floor(cr)::int, k_day - dg));
  aw := least(dw - uw, allowed); al := least(dl - ul, allowed - aw);
  nsw := least(999, bsw + uw + aw); nsl := least(999, bsl + ul + al);

  -- rang : on peut descendre librement ; monter d'au plus 4 étoiles par victoire acceptée, et de 45 par jour au total
  claim_lv := least(22, greatest(0, coalesce(p_lv, 0)));
  claim_st := least(case when claim_lv < 22 then public.board_maxst(claim_lv) else 999 end, greatest(0, coalesce(p_st, 0)));
  cs := public.board_base(claim_lv) + claim_st;
  ns := least(cs, bs + k_stars * (uw + aw), greatest(bs, db + k_daystars));
  if ns = cs then nlv := claim_lv; nst := claim_st;
  else arr := public.board_from_score(ns); nlv := arr[1]; nst := arr[2]; end if;
  nbest := least(22, greatest(bbest, nlv));

  clamped := (uw + aw < dw) or (ul + al < dl) or (ns < cs);
  row_data := jsonb_build_object('nick', nick, 'av', av, 'lv', nlv, 'st', nst, 'best', nbest, 'sw', nsw, 'sl', nsl,
                                 'season', season, 'uid', uid, 'rv', 2, 'at', (extract(epoch from now()) * 1000)::bigint);
  insert into public.board (user_id, data, updated_at) values (uid, row_data, now())
  on conflict (user_id) do update set data = excluded.data, updated_at = excluded.updated_at;

  update public.board_guard
     set credits = cr - (aw + al), refill_at = now(), day = today, day_games = dg + aw + al,
         duel_w = g.duel_w - uw, duel_l = g.duel_l - ul, day_base = db
   where user_id = uid;

  return jsonb_build_object('ok', true, 'row', row_data, 'clamped', clamped);
end $$;
revoke all on function public.board_submit(text,text,int,int,int,int,int,text,int) from public, anon;
grant execute on function public.board_submit(text,text,int,int,int,int,int,text,int) to authenticated;

-- 3. File d'attente : à l'appariement, le serveur inscrit lui-même les deux comptes (duel classé) ---------------------------------
create or replace function public.mm_seek(p_ver text, p_room text)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  uid uuid := auth.uid(); mine public.mm_queue%rowtype; foe uuid; n int; ov boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if p_ver is null or p_ver !~ '^[A-Za-z0-9._-]{1,20}$' or p_room is null or p_room !~ '^[A-Z]{2,12}-[2-9A-HJKMNP-Z]{6}$' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  -- un appel toutes les 1,5 s en moyenne au plus (réserve de 20), 3000 par jour et par compte
  if not public.usage_take('mm', 1.5, 20, 20, 3000) then return jsonb_build_object('ok', false, 'reason', 'rate'); end if;

  -- une seule recherche traitée à la fois : jamais deux appariements pour le même joueur
  perform pg_advisory_xact_lock(hashtext('helvara_mm_queue'));
  delete from public.mm_queue where seen_at < now() - interval '20 seconds';

  -- déjà choisi par un hôte : on lui donne le code et on sort de la file
  select * into mine from public.mm_queue where user_id = uid;
  if found and mine.room is not null then
    delete from public.mm_queue where user_id = uid;
    return jsonb_build_object('ok', true, 'room', mine.room, 'role', 'guest');
  end if;

  if not found and (select count(*) from public.mm_queue) >= 2000 then
    return jsonb_build_object('ok', false, 'reason', 'busy');
  end if;
  insert into public.mm_queue (user_id, ver) values (uid, p_ver)
  on conflict (user_id) do update set seen_at = now(), ver = excluded.ver;

  -- le plus ancien adversaire de même version, encore actif (vu il y a moins de 8 s)
  select user_id into foe from public.mm_queue
   where user_id <> uid and ver = p_ver and room is null and seen_at > now() - interval '8 seconds'
   order by joined_at limit 1;
  if foe is not null then
    update public.mm_queue set room = p_room, seen_at = now() where user_id = foe;
    delete from public.mm_queue where user_id = uid;
    -- lot C : le duel est classé, et ses deux places sont déjà prises par ces deux comptes
    insert into public.duel_games (room, g, ver, host, guest, ranked) values (p_room, 1, p_ver, uid, foe, true)
    on conflict (room, g) do nothing;
    return jsonb_build_object('ok', true, 'room', p_room, 'role', 'host');
  end if;

  select count(*) into n from public.mm_queue where user_id <> uid and ver = p_ver;
  select exists(select 1 from public.mm_queue where ver <> p_ver) into ov;
  return jsonb_build_object('ok', true, 'room', null, 'waiting', n, 'other_ver', ov);
end $$;
revoke all on function public.mm_seek(text, text) from public, anon;
grant execute on function public.mm_seek(text, text) to authenticated;

-- 4. Inscription : une revanche d'un duel classé est classée aussi, avec les deux mêmes comptes ----------------------------------
create or replace function public.duel_enter(p_room text, p_g int, p_role text, p_ver text)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  uid uuid := auth.uid(); d public.duel_games%rowtype; d1 public.duel_games%rowtype;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if p_room is null or p_room !~ '^[A-Z]{2,12}-([0-9]{4}|[2-9A-HJKMNP-Z]{6})$' or p_g is null or p_g < 1 or p_g > 999
     or p_role not in ('host', 'guest') or p_ver is null or p_ver !~ '^[A-Za-z0-9._-]{1,20}$' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  -- une inscription toutes les 10 s en moyenne au plus (réserve de 20), 500 par jour et par compte
  if not public.usage_take('duel', 10, 20, 20, 500) then return jsonb_build_object('ok', false, 'reason', 'rate'); end if;

  -- ménage : rien n'est gardé plus de 15 jours
  delete from public.duel_games where created_at < now() - interval '15 days';

  if p_g > 1 then
    select * into d1 from public.duel_games where room = p_room and g = 1;
    if found and d1.ranked then
      insert into public.duel_games (room, g, ver, host, guest, ranked) values (p_room, p_g, p_ver, d1.host, d1.guest, true)
      on conflict (room, g) do nothing;
    end if;
  end if;
  insert into public.duel_games (room, g, ver) values (p_room, p_g, p_ver) on conflict (room, g) do nothing;
  select * into d from public.duel_games where room = p_room and g = p_g for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'busy'); end if;

  if p_role = 'host' then
    if d.host is null and d.guest is distinct from uid then update public.duel_games set host = uid where id = d.id;
    elsif d.host is distinct from uid then return jsonb_build_object('ok', false, 'reason', 'taken'); end if;
  else
    if d.guest is null and d.host is distinct from uid then update public.duel_games set guest = uid where id = d.id;
    elsif d.guest is distinct from uid then return jsonb_build_object('ok', false, 'reason', 'taken'); end if;
  end if;
  return jsonb_build_object('ok', true, 'ranked', d.ranked);
end $$;
revoke all on function public.duel_enter(text, int, text, text) from public, anon;
grant execute on function public.duel_enter(text, int, text, text) to authenticated;

-- 5. Résultat : un duel classé validé est compté (3 victoires par jour au plus contre un même adversaire) -------------------------
create or replace function public.duel_report(p_room text, p_g int, p_role text, p_res text, p_hash text, p_rec jsonb)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  uid uuid := auth.uid(); d public.duel_games%rowtype; mirror text; other_res text; other_hash text;
  w uuid; l uuid; n int; ok_count boolean;
begin
  if uid is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if p_role not in ('host', 'guest') or p_res not in ('win', 'lose', 'draw') or p_hash is null or p_hash !~ '^[0-9a-f]{64}$'
     or jsonb_typeof(p_rec) is distinct from 'object' or octet_length(p_rec::text) > 16000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if not public.usage_take('duel', 10, 20, 20, 500) then return jsonb_build_object('ok', false, 'reason', 'rate'); end if;

  select * into d from public.duel_games where room = p_room and g = p_g for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'unknown'); end if;
  if (p_role = 'host' and d.host is distinct from uid) or (p_role = 'guest' and d.guest is distinct from uid) then
    return jsonb_build_object('ok', false, 'reason', 'not_player');
  end if;
  -- déjà décidé, ou déjà envoyé par ce joueur : on renvoie seulement l'état (rien ne change après coup)
  if d.status <> 'open' or (p_role = 'host' and d.host_res is not null) or (p_role = 'guest' and d.guest_res is not null) then
    return jsonb_build_object('ok', true, 'status', d.status, 'ranked', d.ranked, 'counted', coalesce(d.counted, false));
  end if;

  if p_role = 'host' then
    update public.duel_games set host_res = p_res, host_hash = p_hash where id = d.id;
    other_res := d.guest_res; other_hash := d.guest_hash;
  else
    update public.duel_games set guest_res = p_res, guest_hash = p_hash where id = d.id;
    other_res := d.host_res; other_hash := d.host_hash;
  end if;

  if other_res is null then                       -- premier à envoyer : on garde son relevé et on attend l'autre
    update public.duel_games set rec = p_rec where id = d.id;
    return jsonb_build_object('ok', true, 'status', 'open', 'ranked', d.ranked, 'counted', false);
  end if;

  mirror := case p_res when 'win' then 'lose' when 'lose' then 'win' else 'draw' end;
  if not (other_res = mirror and other_hash = p_hash) then
    update public.duel_games set status = 'conflict', rec2 = p_rec, done_at = now(), counted = false where id = d.id;
    return jsonb_build_object('ok', true, 'status', 'conflict', 'ranked', d.ranked, 'counted', false);
  end if;

  ok_count := false;
  if d.ranked then
    if p_res = 'draw' then ok_count := true;      -- égalité : comptée, sans étoile ni défaite
    else
      w := case when (p_role = 'host') = (p_res = 'win') then d.host else d.guest end;
      l := case when w = d.host then d.guest else d.host end;
      -- les deux compteurs, toujours dans le même ordre (pas de blocage mutuel), et AVANT de compter (pas de 4e victoire)
      insert into public.board_guard (user_id) select u from unnest(array[w, l]) u order by u on conflict (user_id) do nothing;
      perform 1 from public.board_guard where user_id in (w, l) order by user_id for update;
      select count(*) into n from public.duel_games x
       where x.ranked and x.counted and x.status = 'valid' and x.id <> d.id
         and x.done_at >= (date_trunc('day', now() at time zone 'utc') at time zone 'utc')
         and ((x.host = w and x.guest = l and x.host_res = 'win') or (x.guest = w and x.host = l and x.guest_res = 'win'));
      ok_count := n < 3;
      if ok_count then
        update public.board_guard set duel_w = least(duel_w + 1, 50) where user_id = w;
        update public.board_guard set duel_l = least(duel_l + 1, 50) where user_id = l;
      end if;
    end if;
  end if;
  update public.duel_games set status = 'valid', done_at = now(), counted = ok_count where id = d.id;
  return jsonb_build_object('ok', true, 'status', 'valid', 'ranked', d.ranked, 'counted', ok_count);
end $$;
revoke all on function public.duel_report(text, int, text, text, text, jsonb) from public, anon;
grant execute on function public.duel_report(text, int, text, text, text, jsonb) to authenticated;

-- 6. Pour toi, Jordan (à lancer quand tu veux, ne modifie rien) --------------------------------------------------------------
--    Les derniers duels classés :
--    select id, done_at, room, g, status, counted, host_res, guest_res from public.duel_games where ranked order by id desc limit 30;
--    Les comptes qui ont le plus de duels classés comptés aujourd'hui (repérer un « second compte ») :
--    select w, count(*) from (select case when host_res = 'win' then host else guest end as w from public.duel_games
--      where ranked and counted and status = 'valid' and host_res <> 'draw' and done_at > now() - interval '1 day') t group by w order by 2 desc;
