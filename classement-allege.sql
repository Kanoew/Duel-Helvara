-- Duel d'Helvara : lecture allégée du classement (étape 2 de l'audit).
-- À coller dans Supabase → SQL Editor → New query → Run, APRÈS classement-securise.sql.
-- Le script peut être relancé sans danger.
--
-- Avant : chaque joueur relisait jusqu'à 1000 lignes toutes les 60 secondes, en plus du temps réel.
-- Après : le jeu demande à la base les 100 meilleurs de la saison (triés par la base : rang, étoiles, victoires),
--         quelques joueurs du mois précédent et la ligne du joueur. Relecture seulement à l'ouverture, au retour au
--         premier plan et en ouvrant l'accueil ou le classement (au plus toutes les 30 s).

-- Index pour trier vite même avec des dizaines de milliers de joueurs.
create index if not exists board_rang_idx on public.board (
  (data ->> 'season'),
  (public.board_int(data, 'lv')) desc,
  (public.board_int(data, 'st')) desc,
  (public.board_int(data, 'sw')) desc
);

create or replace function public.board_top(p_limit int default 100, p_season text default null)
returns table (user_id uuid, data jsonb)
language plpgsql stable security definer set search_path = public as
$$
declare
  cur  text := to_char(now() at time zone 'utc', 'YYYY-MM');
  k    text;
  prev text;
  lim  int  := least(greatest(coalesce(p_limit, 100), 1), 200);
begin
  k    := case when p_season ~ '^20[2-9][0-9]-(0[1-9]|1[0-2])$' then p_season else cur end;
  prev := to_char((k || '-01')::date - interval '1 month', 'YYYY-MM');
  return query
    (select b.user_id, b.data from public.board b where b.data ->> 'season' = k
       order by public.board_int(b.data,'lv') desc, public.board_int(b.data,'st') desc, public.board_int(b.data,'sw') desc
       limit lim)
    union
    (select b.user_id, b.data from public.board b where b.data ->> 'season' = prev
       order by public.board_int(b.data,'lv') desc, public.board_int(b.data,'st') desc, public.board_int(b.data,'sw') desc
       limit 30)
    union
    (select b.user_id, b.data from public.board b where b.user_id = auth.uid());
end $$;

revoke all on function public.board_top(int, text) from public, anon;
grant execute on function public.board_top(int, text) to authenticated;
