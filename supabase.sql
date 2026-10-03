-- Duel d'Helvara : installation de la base Supabase.
-- À coller une seule fois dans Supabase → SQL Editor → New query → Run.
-- Le script peut être relancé sans danger.

-- Sauvegardes : une ligne par joueur, lisible et modifiable par lui seul.
create table if not exists public.saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Classement : tout le monde lit, chacun n'écrit que sa propre ligne.
create table if not exists public.board (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.saves enable row level security;
alter table public.board enable row level security;

drop policy if exists "saves: lecture perso"  on public.saves;
drop policy if exists "saves: ajout perso"    on public.saves;
drop policy if exists "saves: modif perso"    on public.saves;
drop policy if exists "board: lecture libre"  on public.board;
drop policy if exists "board: ajout perso"    on public.board;
drop policy if exists "board: modif perso"    on public.board;

create policy "saves: lecture perso" on public.saves for select to authenticated using (auth.uid() = user_id);
create policy "saves: ajout perso"   on public.saves for insert to authenticated with check (auth.uid() = user_id);
create policy "saves: modif perso"   on public.saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "board: lecture libre" on public.board for select to anon, authenticated using (true);
create policy "board: ajout perso"   on public.board for insert to authenticated with check (auth.uid() = user_id);
create policy "board: modif perso"   on public.board for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "board: suppression perso" on public.board;
create policy "board: suppression perso" on public.board for delete to authenticated using (auth.uid() = user_id);

-- Garde-fou : une sauvegarde ou une ligne de classement ne peut pas dépasser 256 Ko.
alter table public.saves drop constraint if exists saves_taille;
alter table public.board drop constraint if exists board_taille;
alter table public.saves add constraint saves_taille check (pg_column_size(data) < 262144);
alter table public.board add constraint board_taille check (pg_column_size(data) < 16384);

-- Classement en direct.
do $$ begin
  alter publication supabase_realtime add table public.board;
exception when duplicate_object then null; end $$;
