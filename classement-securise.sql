-- Duel d'Helvara : classement non falsifiable.
-- À coller dans Supabase → SQL Editor → New query → Run, APRÈS supabase.sql.
-- Le script peut être relancé sans danger.
--
-- Avant : le jeu écrivait lui-même sa ligne dans la table « board ». N'importe qui pouvait, depuis la console
--         de son navigateur, s'écrire 9999 victoires.
-- Après : les joueurs n'ont plus aucun droit d'écriture sur « board ». Le jeu appelle la fonction
--         board_submit() en fin de partie ; elle tourne côté serveur, lit l'identité du joueur dans sa
--         connexion (auth.uid(), impossible à falsifier) et ne retient que des changements plausibles.
--
-- Réglages (modifiables plus bas, dans la fonction board_submit) :
--   - 1 partie par minute au maximum, avec une réserve de 10 parties (pour rattraper un retard réseau) ;
--   - 200 parties par jour au maximum ;
--   - au plus 4 étoiles gagnées par victoire (le maximum possible avec un serment croisé) ;
--   - pseudo nettoyé (24 caractères, pas de caractères de contrôle ni de < >), avatar limité à des identifiants simples.
-- Quand un joueur annonce plus que le plausible, la fonction ne refuse pas : elle retient la part plausible
-- et le reste se rattrape aux parties suivantes (rien ne reste bloqué).

-- 1. Les joueurs ne peuvent plus écrire dans « board » (ils peuvent toujours le lire, et supprimer leur ligne).
drop policy if exists "board: ajout perso" on public.board;
drop policy if exists "board: modif perso" on public.board;
revoke insert, update on public.board from anon, authenticated;

-- 2. Compteur privé par joueur (réserve de parties, plafond du jour). Aucun joueur n'y a accès.
create table if not exists public.board_guard (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  credits    real    not null default 5,
  refill_at  timestamptz not null default now(),
  day        date    not null default (now() at time zone 'utc')::date,
  day_games  integer not null default 0
);
alter table public.board_guard enable row level security;
revoke all on public.board_guard from anon, authenticated;

-- 3. Petites fonctions de calcul des rangs (même échelle que le jeu : 23 niveaux, 3 à 5 étoiles par niveau).
create or replace function public.board_maxst(lv int) returns int
language sql immutable set search_path = public as
$$ select case when lv < 6 then 3 when lv < 12 then 4 else 5 end $$;

create or replace function public.board_base(lv int) returns int
language sql immutable set search_path = public as
$$ select coalesce(sum(public.board_maxst(i)), 0)::int from generate_series(0, greatest(lv, 0) - 1) i $$;

create or replace function public.board_from_score(x int) returns int[]
language plpgsql immutable set search_path = public as
$$
declare l int;
begin
  for l in 0..21 loop
    if x <= public.board_base(l) + public.board_maxst(l) then
      return array[l, greatest(0, x - public.board_base(l))];
    end if;
  end loop;
  return array[22, least(999, x - public.board_base(22))];
end $$;

-- Lit un entier dans une ligne existante, sans jamais planter sur une valeur bizarre.
create or replace function public.board_int(j jsonb, k text) returns int
language sql immutable set search_path = public as
$$ select case when j is not null and (j ->> k) ~ '^[0-9]{1,6}$' then (j ->> k)::int else 0 end $$;

-- 4. La fonction appelée par le jeu en fin de partie (et au chargement, ou après un changement de pseudo ou d'avatar).
create or replace function public.board_submit(
  p_nick text, p_av text, p_lv int, p_st int, p_best int, p_sw int, p_sl int, p_season text, p_rv int default 2
) returns jsonb
language plpgsql security definer set search_path = public as
$$
declare
  k_every  constant numeric := 60;   -- une partie de crédit par minute
  k_cap    constant numeric := 10;   -- réserve maximale
  k_day    constant int     := 200;  -- parties par jour
  k_stars  constant int     := 4;    -- étoiles maximales par victoire
  uid      uuid := auth.uid();
  starts   constant int[] := array[0,3,6,9,12,17,22];
  cur      text := to_char(now() at time zone 'utc', 'YYYY-MM');
  nick text; av text; season text; ose text;
  g public.board_guard%rowtype; o jsonb;
  cr numeric; dg int; allowed int;
  blv int; bst int; bsw int; bsl int; bbest int; tier int;
  dw int; dl int; aw int; al int; nsw int; nsl int;
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
  dg := case when g.day = (now() at time zone 'utc')::date then g.day_games else 0 end;

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

  -- parties : au plus ce que la réserve permet, jamais de baisse des compteurs
  dw := least(999, greatest(0, coalesce(p_sw, 0) - bsw));
  dl := least(999, greatest(0, coalesce(p_sl, 0) - bsl));
  allowed := greatest(0, least(floor(cr)::int, k_day - dg));
  aw := least(dw, allowed); al := least(dl, allowed - aw);
  nsw := least(999, bsw + aw); nsl := least(999, bsl + al);

  -- rang : on peut descendre librement, monter d'au plus 4 étoiles par victoire acceptée
  claim_lv := least(22, greatest(0, coalesce(p_lv, 0)));
  claim_st := least(case when claim_lv < 22 then public.board_maxst(claim_lv) else 999 end, greatest(0, coalesce(p_st, 0)));
  cs := public.board_base(claim_lv) + claim_st;
  bs := public.board_base(blv) + bst;
  ns := least(cs, bs + k_stars * aw);
  if ns = cs then nlv := claim_lv; nst := claim_st;
  else arr := public.board_from_score(ns); nlv := arr[1]; nst := arr[2]; end if;
  nbest := least(22, greatest(bbest, nlv));

  clamped := (aw < dw) or (al < dl) or (ns < cs);
  row_data := jsonb_build_object('nick', nick, 'av', av, 'lv', nlv, 'st', nst, 'best', nbest, 'sw', nsw, 'sl', nsl,
                                 'season', season, 'uid', uid, 'rv', 2, 'at', (extract(epoch from now()) * 1000)::bigint);
  insert into public.board (user_id, data, updated_at) values (uid, row_data, now())
  on conflict (user_id) do update set data = excluded.data, updated_at = excluded.updated_at;

  update public.board_guard
     set credits = cr - (aw + al), refill_at = now(),
         day = (now() at time zone 'utc')::date, day_games = dg + aw + al
   where user_id = uid;

  return jsonb_build_object('ok', true, 'row', row_data, 'clamped', clamped);
end $$;

-- 5. Droits : seules les connexions de joueurs (y compris anonymes) peuvent appeler board_submit.
revoke all on function public.board_submit(text,text,int,int,int,int,int,text,int) from public, anon;
grant execute on function public.board_submit(text,text,int,int,int,int,int,text,int) to authenticated;
revoke all on function public.board_maxst(int), public.board_base(int), public.board_from_score(int), public.board_int(jsonb,text)
  from public, anon, authenticated;

-- 6. Pour voir le haut du classement (à lancer quand tu veux, ne modifie rien).
--    select data->>'nick' as pseudo, data->>'lv' as niveau, data->>'st' as etoiles,
--           data->>'sw' as victoires, data->>'sl' as defaites, data->>'season' as saison, updated_at
--      from public.board order by (data->>'lv')::int desc, (data->>'st')::int desc limit 30;
