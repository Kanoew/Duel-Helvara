-- Duel d'Helvara : résultat des duels en ligne validé par le serveur (anti-triche, lot B).
-- À coller UNE FOIS dans Supabase → SQL Editor, puis « Run ». Le relancer ne casse rien (il remplace les fonctions).
-- Prérequis : retours-stats.sql déjà lancé (il crée la fonction usage_take, le limiteur de rythme).
--
-- Principe : au début d'un duel, chaque joueur s'inscrit comme hôte ou invité du salon (duel_enter). À la fin, chacun envoie
-- son résultat et l'empreinte de toute la partie (duel_report) : graine, lieux, coups des deux joueurs et puissances finales.
-- Si les deux empreintes sont identiques et les résultats concordent (victoire contre défaite, ou deux égalités),
-- la partie est « valid » ; sinon « conflict » (elle ne comptera jamais). Le serveur ne rejoue pas la partie : il vérifie
-- seulement que les deux téléphones ont vu la même. Un tricheur ne peut donc pas se donner une victoire tout seul.
-- Données gardées : les deux identifiants de compte, la version du jeu, le résultat, la graine, les lieux et les coups,
-- 15 jours (décision de Jordan du 18 novembre), pour pouvoir revoir une partie signalée. Effacées avec le compte.
-- Aucun joueur ne lit cette table : seulement Jordan, depuis le SQL Editor (requêtes en bas du fichier).
-- Le ménage des 15 jours tourne à chaque début de duel. Si personne n'a joué en ligne depuis longtemps, il peut rester des lignes
-- plus anciennes en attendant : delete from public.duel_games where created_at < now() - interval '15 days';
-- Un « conflict » n'est pas une preuve de triche (un adversaire peut en provoquer un exprès) : ne jamais sanctionner sur ce seul signal.

-- 1. La table (aucun joueur n'y a accès directement : seulement par les deux fonctions) --------------------------------------
create table if not exists public.duel_games (
  id         bigint generated always as identity primary key,
  room       text not null,
  g          int  not null,
  ver        text not null,
  host       uuid references auth.users(id) on delete cascade,
  guest      uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  host_res   text, guest_res text,
  host_hash  text, guest_hash text,
  rec        jsonb,                    -- relevé de la partie (le premier envoyé)
  rec2       jsonb,                    -- second relevé, gardé seulement en cas de désaccord
  status     text not null default 'open' check (status in ('open', 'valid', 'conflict')),
  done_at    timestamptz,
  unique (room, g)
);
create index if not exists duel_games_created on public.duel_games (created_at);
create index if not exists duel_games_host on public.duel_games (host);
create index if not exists duel_games_guest on public.duel_games (guest);
alter table public.duel_games enable row level security;
revoke all on public.duel_games from public, anon, authenticated;

-- 2. S'inscrire au début d'un duel ----------------------------------------------------------------------------------------
-- p_room : code du salon ; p_g : numéro du match dans ce salon (revanche = +1) ; p_role : 'host' ou 'guest' ; p_ver : BUILD.
-- La première personne qui prend une place la garde : un même compte ne peut pas être hôte et invité.
create or replace function public.duel_enter(p_room text, p_g int, p_role text, p_ver text)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  uid uuid := auth.uid(); d public.duel_games%rowtype;
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
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.duel_enter(text, int, text, text) from public, anon;
grant execute on function public.duel_enter(text, int, text, text) to authenticated;

-- 3. Envoyer le résultat à la fin du duel (le jeu le renvoie quelques fois pour lire la décision) --------------------------
-- p_res : résultat vu par ce joueur ('win', 'lose', 'draw') ; p_hash : empreinte SHA-256 du relevé (64 caractères hexadécimaux) ;
-- p_rec : le relevé lui-même (16 Ko au plus). Réponse : {ok, status:'open'|'valid'|'conflict'}.
create or replace function public.duel_report(p_room text, p_g int, p_role text, p_res text, p_hash text, p_rec jsonb)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  uid uuid := auth.uid(); d public.duel_games%rowtype; mirror text; other_res text; other_hash text;
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
    return jsonb_build_object('ok', true, 'status', d.status);
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
    return jsonb_build_object('ok', true, 'status', 'open');
  end if;

  mirror := case p_res when 'win' then 'lose' when 'lose' then 'win' else 'draw' end;
  if other_res = mirror and other_hash = p_hash then
    update public.duel_games set status = 'valid', done_at = now() where id = d.id;
    return jsonb_build_object('ok', true, 'status', 'valid');
  end if;
  update public.duel_games set status = 'conflict', rec2 = p_rec, done_at = now() where id = d.id;
  return jsonb_build_object('ok', true, 'status', 'conflict');
end $$;
revoke all on function public.duel_report(text, int, text, text, text, jsonb) from public, anon;
grant execute on function public.duel_report(text, int, text, text, text, jsonb) to authenticated;

-- 4. Pour toi, Jordan (à lancer quand tu veux, ne modifie rien) --------------------------------------------------------------
--    Les 30 derniers duels :
--    select id, created_at, room, g, ver, status, host_res, guest_res from public.duel_games order by id desc limit 30;
--    Les duels en désaccord (partie signalée, triche possible) :
--    select id, created_at, room, g, host, guest, host_res, guest_res, rec, rec2 from public.duel_games where status = 'conflict' order by id desc;
--    Les duels d'un joueur (remplace l'identifiant) :
--    select * from public.duel_games where host = '00000000-0000-0000-0000-000000000000' or guest = '00000000-0000-0000-0000-000000000000' order by id desc;
