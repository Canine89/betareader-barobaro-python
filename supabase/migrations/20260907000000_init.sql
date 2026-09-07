-- 베타리더 모집 사이트 초기 스키마

-- 관리자 목록 (이메일 기준)
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);
insert into public.admins (email) values ('hgpark@goldenrabbit.co.kr') on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 베타리더 신청서
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  phone text not null check (char_length(phone) between 8 and 30),
  address text not null check (char_length(address) between 5 and 300),
  email text not null check (position('@' in email) > 1),
  consent boolean not null check (consent = true),
  consent_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 미션 제출물 (소감 + PDF)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  review text,
  pdf_path text,
  pdf_name text,
  review_submitted_at timestamptz,
  pdf_uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- RLS
alter table public.admins enable row level security;
alter table public.applications enable row level security;
alter table public.submissions enable row level security;

-- admins: 관리자만 조회
create policy "admins: admin read" on public.admins
  for select to authenticated using (public.is_admin());

-- applications
create policy "applications: own read" on public.applications
  for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "applications: own insert" on public.applications
  for insert to authenticated with check (auth.uid() = user_id and status = 'pending');
create policy "applications: own update" on public.applications
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status = (select a.status from public.applications a where a.user_id = auth.uid()));
create policy "applications: admin update" on public.applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- submissions
create policy "submissions: own read" on public.submissions
  for select to authenticated using (auth.uid() = user_id or public.is_admin());
create policy "submissions: own insert" on public.submissions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "submissions: own update" on public.submissions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage: 주석 PDF 버킷 (비공개, PDF만, 50MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 52428800, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "submissions bucket: own upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "submissions bucket: own update" on storage.objects
  for update to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "submissions bucket: own delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "submissions bucket: own or admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'submissions' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
