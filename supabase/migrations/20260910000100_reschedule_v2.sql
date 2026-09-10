-- 일정 변경 v2 (2026-09-10)
-- 신청 마감 9/15 23:59:59, 미션 마감 9/28 23:59:59 (KST)
-- 베타리딩 시작(원고 공개)은 날짜 대신 관리자 스위치(site_settings.reading_open)로 연다.

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  reading_open boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

alter table public.site_settings enable row level security;
drop policy if exists "settings: read" on public.site_settings;
create policy "settings: read" on public.site_settings
  for select to authenticated using (true);
drop policy if exists "settings: admin update" on public.site_settings;
create policy "settings: admin update" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.apply_open()
returns boolean
language sql
stable
as $$
  select now() <= timestamptz '2026-09-15 23:59:59+09';
$$;

create or replace function public.is_accepted_reader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.site_settings s where s.id = 1 and s.reading_open)
    and exists (
      select 1 from public.applications a
      where a.user_id = auth.uid() and a.status = 'accepted'
    );
$$;

create or replace function public.before_deadline()
returns boolean
language sql
stable
as $$
  select now() <= timestamptz '2026-09-28 23:59:59+09';
$$;
