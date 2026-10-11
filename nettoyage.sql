-- Duel d'Helvara : nettoyage du classement.
-- À lancer dans Supabase → SQL Editor quand des doublons apparaissent.

-- 1. Autorise un joueur à retirer sa propre ligne (utilisé quand une partie anonyme rejoint un compte Google existant).
drop policy if exists "board: suppression perso" on public.board;
create policy "board: suppression perso" on public.board for delete to authenticated using (auth.uid() = user_id);

-- 2. Retire du classement les comptes anonymes (visiteurs sans Google).
--    Un joueur anonyme qui revient sur le jeu réapparaît tout seul.
delete from public.board b
using auth.users u
where u.id = b.user_id and u.is_anonymous;

-- 3. Durées de conservation annoncées dans confidentialite.html.
--    Comptes anonymes sans connexion depuis 12 mois, comptes Google sans connexion depuis 24 mois.
--    À lancer de temps en temps, ou à planifier (voir plus bas). Les lignes saves et board partent avec le compte.
delete from auth.users
where coalesce(last_sign_in_at, created_at) < now() - interval '12 months' and is_anonymous;
delete from auth.users
where coalesce(last_sign_in_at, created_at) < now() - interval '24 months' and not is_anonymous;

--    Pour que ça se fasse tout seul, une fois par semaine (Supabase → Database → Extensions → activer pg_cron, puis lancer) :
-- select cron.schedule('helvara-conservation', '0 4 * * 1', $job$
--   delete from auth.users where coalesce(last_sign_in_at, created_at) < now() - interval '12 months' and is_anonymous;
--   delete from auth.users where coalesce(last_sign_in_at, created_at) < now() - interval '24 months' and not is_anonymous;
-- $job$);

-- 4. Modération : retirer un pseudo abusif du classement (remplace le texte par le pseudo concerné).
--    Le joueur réapparaît avec un nouveau pseudo s'il en choisit un autre ; pour le renommer d'office, voir la ligne en dessous.
-- delete from public.board where data->>'nick' ilike '%pseudo-abusif%';
-- update public.board set data = jsonb_set(data, '{nick}', '"Joueur"') where data->>'nick' ilike '%pseudo-abusif%';
