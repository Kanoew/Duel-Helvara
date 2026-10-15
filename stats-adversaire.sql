-- Duel d'Helvara : statistiques de cartes, type d'adversaire (humain ou IA) — 15 octobre 2026
-- À coller dans Supabase → SQL Editor → Run, APRÈS retours-stats.sql. Peut être relancé sans risque.
-- Reste anonyme : aucune donnée sur le compte ni sur l'adversaire, seulement « humain » ou « ia ».
-- Tant que ce script n'est pas lancé, le jeu continue d'envoyer ses statistiques comme avant (sans le type d'adversaire).

-- 1. Nouvelle colonne, dans la clé de la table ; les anciennes lignes de duel étaient toutes contre un humain
alter table public.card_stats add column if not exists opp text not null default 'ia';
alter table public.card_stats drop constraint if exists card_stats_opp_check;
alter table public.card_stats add constraint card_stats_opp_check check (opp in ('ia', 'humain'));
update public.card_stats set opp = 'humain' where mode = 'duel' and opp <> 'humain';
alter table public.card_stats drop constraint if exists card_stats_pkey;
alter table public.card_stats add primary key (day, card, mode, loc, result, opp);

-- 2. Envoi avec le type d'adversaire (même rythme qu'avant : une partie toutes les 45 s en moyenne, 150 par jour et par compte)
create or replace function public.stats_submit(p_mode text, p_result text, p_plays jsonb, p_opp text)
returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  e jsonb; cnt int := 0; c text; l text;
begin
  if auth.uid() is null then raise exception 'Connexion requise' using errcode = '28000'; end if;
  if p_mode not in ('ia','blitz','duel') or p_result not in ('win','lose','draw') or p_opp not in ('ia','humain')
     or jsonb_typeof(p_plays) is distinct from 'array' then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;
  if not public.usage_take('stats', 45, 5, 3, 150) then return jsonb_build_object('ok', false, 'reason', 'rate'); end if;
  for e in select value from jsonb_array_elements(p_plays) limit 20 loop
    if jsonb_typeof(e) = 'array' and jsonb_array_length(e) = 2 then
      c := e ->> 0; l := e ->> 1;
      if c ~ '^[a-z0-9_]{1,40}$' and l ~ '^[a-z0-9_]{1,40}$' then
        insert into public.card_stats (card, mode, loc, result, opp, n) values (c, p_mode, l, p_result, p_opp, 1)
        on conflict (day, card, mode, loc, result, opp) do update set n = public.card_stats.n + 1;
        cnt := cnt + 1;
      end if;
    end if;
  end loop;
  return jsonb_build_object('ok', true, 'cards', cnt);
end $$;
revoke all on function public.stats_submit(text, text, jsonb, text) from public, anon;
grant execute on function public.stats_submit(text, text, jsonb, text) to authenticated;

-- 3. L'ancienne version (sans adversaire) reste pour les pages pas encore rechargées : elle déduit l'adversaire du mode
create or replace function public.stats_submit(p_mode text, p_result text, p_plays jsonb)
returns jsonb
language sql security definer set search_path = public as
$$ select public.stats_submit(p_mode, p_result, p_plays, case when p_mode = 'duel' then 'humain' else 'ia' end) $$;
revoke all on function public.stats_submit(text, text, jsonb) from public, anon;
grant execute on function public.stats_submit(text, text, jsonb) to authenticated;

-- 4. Lecture : taux de victoire par carte et par type d'adversaire
create or replace view public.v_taux_victoire_par_adversaire with (security_invoker = true) as
select card as carte, opp as adversaire,
       sum(n)::int as parties,
       round(100.0 * sum(n) filter (where result = 'win') / nullif(sum(n), 0), 1) as taux_victoire_pct
from public.card_stats group by card, opp order by card, opp;
