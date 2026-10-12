-- Duel d'Helvara : retours des joueurs et statistiques de cartes (étape 4 de l'audit).
-- À coller dans Supabase → SQL Editor → New query → Run, APRÈS classement-securise.sql.
-- Le script peut être relancé sans danger.
--
-- Deux collectes, toutes deux anonymes (aucun identifiant de compte, aucun pseudo n'est enregistré avec) :
--   1. Retours en fin de partie : 👍 / 👎 / « Une carte m'a paru injuste » (+ la carte). Table « feedback ».
--   2. Statistiques de cartes : pour chaque carte jouée, le résultat de la partie (victoire / défaite / nulle),
--      le mode (ia / blitz / duel) et le lieu où elle a été posée, comptés par jour. Table « card_stats ».
-- Les joueurs n'ont aucun droit de lecture ni d'écriture directe sur ces tables : ils passent par deux fonctions qui
-- vérifient tout et limitent le rythme (un compteur technique par compte, sans lien avec le contenu envoyé).
-- Toi, tu lis les résultats dans Supabase → Table Editor → schéma « public » → onglet « Views » (voir en bas).

-- 1. Tables ---------------------------------------------------------------------------------------------------------
create table if not exists public.card_stats (
  day    date   not null default (now() at time zone 'utc')::date,
  card   text   not null,
  mode   text   not null check (mode in ('ia','blitz','duel')),
  loc    text   not null,
  result text   not null check (result in ('win','lose','draw')),
  n      bigint not null default 0,
  primary key (day, card, mode, loc, result)
);

create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind       text not null check (kind in ('up','down','unfair')),
  card       text,
  mode       text,
  build      text
);
create index if not exists feedback_created_idx on public.feedback (created_at);

-- Compteur technique par compte et par type d'envoi (limite le rythme). Ne contient que des heures et des nombres.
create table if not exists public.usage_guard (
  user_id   uuid not null references auth.users(id) on delete cascade,
  kind      text not null,
  credits   real not null,
  refill_at timestamptz not null default now(),
  day       date not null default (now() at time zone 'utc')::date,
  day_n     integer not null default 0,
  primary key (user_id, kind)
);

alter table public.card_stats  enable row level security;
alter table public.feedback    enable row level security;
alter table public.usage_guard enable row level security;
revoke all on public.card_stats, public.feedback, public.usage_guard from anon, authenticated;

-- 2. Limiteur de rythme (interne) -------------------------------------------------------------------------------------
-- Renvoie vrai et consomme un crédit si le compte a le droit d'envoyer maintenant.
create or replace function public.usage_take(p_kind text, p_every numeric, p_cap numeric, p_start numeric, p_day_max int)
returns boolean
language plpgsql security definer set search_path = public as
$$
declare
  uid uuid := auth.uid(); g public.usage_guard%rowtype; cr numeric; dn int; today date := (now() at time zone 'utc')::date;
begin
  if uid is null then return false; end if;
  insert into public.usage_guard (user_id, kind, credits) values (uid, p_kind, p_start) on conflict (user_id, kind) do nothing;
  select * into g from public.usage_guard where user_id = uid and kind = p_kind for update;
  cr := least(p_cap, g.credits + greatest(0, extract(epoch from (now() - g.refill_at))) / p_every);
  dn := case when g.day = today then g.day_n else 0 end;
  if cr < 1 or dn >= p_day_max then
    update public.usage_guard set credits = cr, refill_at = now(), day = today, day_n = dn where user_id = uid and kind = p_kind;
    return false;
  end if;
  update public.usage_guard set credits = cr - 1, refill_at = now(), day = today, day_n = dn + 1 where user_id = uid and kind = p_kind;
  return true;
end $$;
revoke all on function public.usage_take(text, numeric, numeric, numeric, int) from public, anon, authenticated;

-- 3. Statistiques de cartes (appelée par le jeu à la fin d'une partie) ---------------------------------------------------
-- p_plays : liste de paires [identifiant de carte, identifiant de lieu], 20 au plus.
-- Rythme : une partie toutes les 45 s en moyenne (réserve de 5), 150 parties par jour et par compte.
create or replace function public.stats_submit(p_mode text, p_result text, p_plays jsonb)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  e jsonb; cnt int := 0; c text; l text;
begin
  if auth.uid() is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if p_mode not in ('ia','blitz','duel') or p_result not in ('win','lose','draw') or jsonb_typeof(p_plays) is distinct from 'array' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if not public.usage_take('stats', 45, 5, 3, 150) then return jsonb_build_object('ok', false, 'reason', 'rate'); end if;
  for e in select value from jsonb_array_elements(p_plays) limit 20 loop
    if jsonb_typeof(e) = 'array' and jsonb_array_length(e) = 2 then
      c := e ->> 0; l := e ->> 1;
      if c ~ '^[a-z0-9_]{1,40}$' and l ~ '^[a-z0-9_]{1,40}$' then
        insert into public.card_stats (card, mode, loc, result, n) values (c, p_mode, l, p_result, 1)
        on conflict (day, card, mode, loc, result) do update set n = public.card_stats.n + 1;
        cnt := cnt + 1;
      end if;
    end if;
  end loop;
  return jsonb_build_object('ok', true, 'cards', cnt);
end $$;
revoke all on function public.stats_submit(text, text, jsonb) from public, anon;
grant execute on function public.stats_submit(text, text, jsonb) to authenticated;

-- 4. Retours des joueurs ---------------------------------------------------------------------------------------------
-- Rythme : un retour toutes les 20 s en moyenne (réserve de 3), 30 par jour et par compte, 3000 par heure au total.
create or replace function public.feedback_submit(p_kind text, p_card text, p_mode text, p_build text)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare c text; m text; b text;
begin
  if auth.uid() is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if p_kind not in ('up','down','unfair') then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  c := case when p_kind = 'unfair' and p_card ~ '^[a-z0-9_]{1,40}$' then p_card else null end;
  if p_kind = 'unfair' and c is null then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  m := case when p_mode in ('ia','blitz','duel') then p_mode else null end;
  b := case when p_build ~ '^[A-Za-z0-9._-]{1,20}$' then p_build else null end;
  if (select count(*) from public.feedback where created_at > now() - interval '1 hour') >= 3000 then
    return jsonb_build_object('ok', false, 'reason', 'busy');
  end if;
  if not public.usage_take('feedback', 20, 3, 3, 30) then return jsonb_build_object('ok', false, 'reason', 'rate'); end if;
  insert into public.feedback (kind, card, mode, build) values (p_kind, c, m, b);
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.feedback_submit(text, text, text, text) from public, anon;
grant execute on function public.feedback_submit(text, text, text, text) to authenticated;

-- 5. Pour lire les résultats (vues, visibles dans le Table Editor ; les joueurs n'y ont pas accès) ------------------------
-- Les cartes sont désignées par leur identifiant (ex. « qetesh_v » = Qetesh de la Saint-Valentin).
-- « taux_victoire_pct » = victoires / parties où la carte a été jouée. Compare-le à « ecart_moyenne_pts » (écart avec
-- le taux moyen de toutes les cartes) et regarde « parties » : en dessous de 30 parties, ne conclus rien.
create or replace view public.v_taux_victoire_cartes with (security_invoker = true) as
select card as carte,
       sum(n)::int as parties,
       (sum(n) filter (where result = 'win'))::int  as victoires,
       (sum(n) filter (where result = 'lose'))::int as defaites,
       (sum(n) filter (where result = 'draw'))::int as nulles,
       round(100.0 * sum(n) filter (where result = 'win') / nullif(sum(n), 0), 1) as taux_victoire_pct,
       round(100.0 * sum(n) filter (where result = 'win') / nullif(sum(n), 0)
             - (select 100.0 * sum(n) filter (where result = 'win') / nullif(sum(n), 0) from public.card_stats), 1) as ecart_moyenne_pts
from public.card_stats group by card order by sum(n) desc;

create or replace view public.v_taux_victoire_par_mode with (security_invoker = true) as
select card as carte, mode,
       sum(n)::int as parties,
       round(100.0 * sum(n) filter (where result = 'win') / nullif(sum(n), 0), 1) as taux_victoire_pct
from public.card_stats group by card, mode order by card, mode;

create or replace view public.v_taux_victoire_par_lieu with (security_invoker = true) as
select card as carte, loc as lieu,
       sum(n)::int as parties,
       round(100.0 * sum(n) filter (where result = 'win') / nullif(sum(n), 0), 1) as taux_victoire_pct
from public.card_stats group by card, loc order by card, loc;

create or replace view public.v_cartes_signalees with (security_invoker = true) as
select card as carte, count(*)::int as signalements, max(created_at) as dernier_signalement,
       count(*) filter (where mode = 'ia')::int as en_ia, count(*) filter (where mode = 'blitz')::int as en_blitz, count(*) filter (where mode = 'duel')::int as en_duel
from public.feedback where kind = 'unfair' group by card order by count(*) desc;

create or replace view public.v_retours_par_jour with (security_invoker = true) as
select created_at::date as jour,
       count(*) filter (where kind = 'up')::int as pouce_haut,
       count(*) filter (where kind = 'down')::int as pouce_bas,
       count(*) filter (where kind = 'unfair')::int as carte_injuste
from public.feedback group by created_at::date order by 1 desc;

revoke all on public.v_taux_victoire_cartes, public.v_taux_victoire_par_mode, public.v_taux_victoire_par_lieu,
              public.v_cartes_signalees, public.v_retours_par_jour from anon, authenticated;

-- En SQL, si tu préfères : select * from public.v_taux_victoire_cartes;   select * from public.v_cartes_signalees;
