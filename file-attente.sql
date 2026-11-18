-- Duel d'Helvara : file d'attente des duels en ligne (« Chercher un adversaire »).
-- À coller UNE FOIS dans Supabase → SQL Editor, puis « Run ». Le relancer ne casse rien (il remplace les fonctions).
-- Prérequis : retours-stats.sql déjà lancé (il crée la fonction usage_take, le limiteur de rythme).
--
-- Principe : un seul arbitre. Chaque joueur en recherche appelle mm_seek toutes les 3 s environ. La base, une demande à la fois
-- (verrou), apparie le plus ancien joueur de même version encore actif : celui qui appelle devient l'hôte et propose le code
-- de salon ; l'autre lit ce code à son appel suivant et rejoint le salon. Un joueur qui n'appelle plus depuis 20 s
-- (téléphone en veille, onglet fermé) sort de la file tout seul.
-- Données gardées : l'identifiant de compte (déjà connu de la base), la version du jeu et deux heures. Rien d'autre.
-- Une ligne ne vit que pendant la recherche (au plus quelques minutes) : elle est effacée à l'appariement, à l'annulation
-- ou par le ménage automatique.

-- 1. La table (aucun joueur n'y a accès directement : seulement par les deux fonctions) --------------------------------------
create table if not exists public.mm_queue (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  ver       text not null,
  joined_at timestamptz not null default now(),
  seen_at   timestamptz not null default now(),
  room      text
);
alter table public.mm_queue enable row level security;
revoke all on public.mm_queue from public, anon, authenticated;

-- 2. Chercher (appelée en boucle par le jeu pendant la recherche) ----------------------------------------------------------
-- p_ver  : version du moteur (BUILD) ; seules deux versions identiques sont appariées.
-- p_room : code de salon proposé par ce joueur, utilisé seulement s'il devient l'hôte.
-- Réponse : {ok, room, role:'host'|'guest'} quand un adversaire est trouvé ; sinon {ok, room:null, waiting, other_ver}.
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
    return jsonb_build_object('ok', true, 'room', p_room, 'role', 'host');
  end if;

  select count(*) into n from public.mm_queue where user_id <> uid and ver = p_ver;
  select exists(select 1 from public.mm_queue where ver <> p_ver) into ov;
  return jsonb_build_object('ok', true, 'room', null, 'waiting', n, 'other_ver', ov);
end $$;
revoke all on function public.mm_seek(text, text) from public, anon;
grant execute on function public.mm_seek(text, text) to authenticated;

-- 3. Quitter la file (annulation, page fermée) ------------------------------------------------------------------------------
create or replace function public.mm_leave()
returns void
language plpgsql security definer set search_path = public as
$$
begin
  if auth.uid() is null then return; end if;
  delete from public.mm_queue where user_id = auth.uid() or seen_at < now() - interval '20 seconds';
end $$;
revoke all on function public.mm_leave() from public, anon;
grant execute on function public.mm_leave() to authenticated;
