-- 02_top_contributors.sql
-- Ranking de colaboradores: conta apenas reportes aprovados pela moderação.
-- Rode este script no SQL Editor do Supabase.

create or replace function public.get_top_contributors(p_limit int default 10)
returns table (
  user_id uuid,
  name text,
  avatar text,
  approved_reports bigint,
  rank_position bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    coalesce(nullif(trim(p.name::text), ''), 'Usuário') as name,
    coalesce(p.avatar::text, 'default') as avatar,
    count(r.id) as approved_reports,
    rank() over (order by count(r.id) desc) as rank_position
  from public.profiles p
  join public.reports r
    on r.user_id = p.id
   and r.status in ('Aprovado', 'Publicado', 'Resolvido')
  group by p.id, p.name, p.avatar
  order by approved_reports desc, name asc
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

grant execute on function public.get_top_contributors(int) to authenticated;
