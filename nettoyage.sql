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
