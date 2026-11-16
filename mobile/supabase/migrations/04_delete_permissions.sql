-- 04_delete_permissions.sql
-- Permissões de exclusão:
--   • Usuário comum: remove apenas as próprias ocorrências (reports) e os próprios pontos de coleta.
--   • Admin (profiles.role = 'admin'): remove qualquer ocorrência ou ponto de coleta.
-- Também faz a exclusão de uma ocorrência apagar junto fotos, votos e comentários ligados a ela
-- (antes, essas referências impediam o DELETE).
-- Rodar no Supabase: SQL Editor > New query > colar > Run. Pode ser executado mais de uma vez.

-- 1) Função auxiliar: o usuário logado é admin?
--    SECURITY DEFINER para ler profiles sem depender das políticas de RLS dessa tabela.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- 2) Tabelas que apontam para reports passam a ser apagadas em cascata
--    (report_images, votes, comments e qualquer outra com chave estrangeira para reports.id).
do $$
declare
  fk record;
begin
  for fk in
    select c.conname, c.conrelid::regclass as tbl, a.attname as col
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
    where c.contype = 'f'
      and c.confrelid = 'public.reports'::regclass
      and c.confdeltype <> 'c'            -- ainda não é ON DELETE CASCADE
      and array_length(c.conkey, 1) = 1   -- chave de uma coluna só
  loop
    execute format('alter table %s drop constraint %I', fk.tbl, fk.conname);
    execute format(
      'alter table %s add constraint %I foreign key (%I) references public.reports(id) on delete cascade',
      fk.tbl, fk.conname, fk.col
    );
    raise notice 'FK % em % agora é ON DELETE CASCADE', fk.conname, fk.tbl;
  end loop;
end $$;

-- 3) Políticas de DELETE (RLS)
alter table public.reports enable row level security;
alter table public.drop_off_points enable row level security;

drop policy if exists "reports_delete_owner_or_admin" on public.reports;
create policy "reports_delete_owner_or_admin"
  on public.reports
  for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "drop_off_points_delete_owner_or_admin" on public.drop_off_points;
create policy "drop_off_points_delete_owner_or_admin"
  on public.drop_off_points
  for delete
  to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- 4) Conferir as políticas de DELETE ativas
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename in ('reports', 'drop_off_points')
  and cmd in ('DELETE', 'ALL')
order by tablename, policyname;
