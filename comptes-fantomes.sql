-- Duel d'Helvara : nettoyage automatique des comptes fantômes (étape 2 de l'audit).
-- À coller dans Supabase → SQL Editor → New query → Run. Le script peut être relancé sans danger
-- (relancer remplace la tâche planifiée, sans doublon). Nécessite pg_cron, déjà activé pour la tâche
-- « helvara-conservation » (nettoyage.sql, bloc 3). Ce fichier est indépendant : ne lance pas nettoyage.sql en entier.
--
-- Contexte : chaque visiteur reçoit un compte anonyme dès l'ouverture du jeu. Un pic de visiteurs (ou des robots)
-- crée des milliers de comptes qui ne jouent jamais.
-- Règle : chaque nuit à 3 h 30 (UTC), on supprime les comptes ANONYMES qui n'ont jamais joué (aucune partie terminée
-- dans leur sauvegarde, ou aucune sauvegarde) ET qui n'ont pas servi depuis 14 jours. Un joueur qui a terminé au moins
-- une partie garde son compte (12 mois d'inactivité, tâche « helvara-conservation »). Les comptes Google ne sont
-- jamais touchés. Les lignes saves, board et board_guard partent avec le compte.

-- 1. Pour voir combien de comptes seraient concernés (ne supprime rien) :
select count(*) as comptes_fantomes
from auth.users u
where u.is_anonymous
  and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '14 days'
  and not exists (
    select 1 from public.saves s
    where s.user_id = u.id
      and coalesce(nullif(s.data ->> 'w', '')::numeric, 0)
        + coalesce(nullif(s.data ->> 'l', '')::numeric, 0)
        + coalesce(nullif(s.data ->> 'd', '')::numeric, 0) > 0
  );

-- 2. La tâche planifiée.
select cron.schedule('helvara-fantomes', '30 3 * * *', $job$
  delete from auth.users u
  where u.is_anonymous
    and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '14 days'
    and not exists (
      select 1 from public.saves s
      where s.user_id = u.id
        and coalesce(nullif(s.data ->> 'w', '')::numeric, 0)
          + coalesce(nullif(s.data ->> 'l', '')::numeric, 0)
          + coalesce(nullif(s.data ->> 'd', '')::numeric, 0) > 0
    );
$job$);

-- 3. Pour vérifier que la tâche est bien planifiée :
-- select jobname, schedule, active from cron.job;
