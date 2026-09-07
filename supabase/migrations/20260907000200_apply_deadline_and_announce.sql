-- 베타리더 신청 마감(2026-09-10 23:59:59 KST): 이후 신규 신청 불가, 기존 신청 수정은 가능
create or replace function public.apply_open()
returns boolean
language sql
stable
as $$
  select now() <= timestamptz '2026-09-10 23:59:59+09';
$$;

drop policy if exists "applications: own insert" on public.applications;
create policy "applications: own insert" on public.applications
  for insert to authenticated
  with check (auth.uid() = user_id and status = 'pending' and public.apply_open());

-- 선정 발표(2026-09-11 09:00 KST) 전에는 승인 상태여도 원고 열람/미션 제출 불가
create or replace function public.is_accepted_reader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select now() >= timestamptz '2026-09-11 09:00:00+09'
    and exists (
      select 1 from public.applications a
      where a.user_id = auth.uid() and a.status = 'accepted'
    );
$$;
