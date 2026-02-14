-- 1) 角色类型
create type public.app_role as enum ('admin', 'parent', 'student');

-- 2) 用户资料表（与 auth.users 一一对应）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  full_name text,
  must_reset_password boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 3) 仅本人可读自己的 profile
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

-- 4) 仅管理员可更新任意 profile（例如重置 must_reset_password）
create policy "profiles_update_admin"
on public.profiles
for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- 5) 禁止客户端直接 insert/delete，账号创建由 Edge Function 完成
revoke insert, delete on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;
