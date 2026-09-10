-- 일정 변경 (2026-09-10)
-- 신청 마감 9/23 23:59:59, 선정 발표 9/24 09:00, 원고 공개·베타리딩 시작 10/12 09:00, 미션 마감 10/26 23:59:59 (KST)

create or replace function public.apply_open()
returns boolean
language sql
stable
as $$
  select now() <= timestamptz '2026-09-23 23:59:59+09';
$$;

-- 원고 열람과 미션 제출은 베타리딩 시작 시각부터
create or replace function public.is_accepted_reader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select now() >= timestamptz '2026-10-12 09:00:00+09'
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
  select now() <= timestamptz '2026-10-26 23:59:59+09';
$$;
