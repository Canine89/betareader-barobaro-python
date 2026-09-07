-- 원고 PDF 버킷: 승인된 베타리더와 관리자만 읽기, 관리자만 쓰기
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('manuscript', 'manuscript', false, 52428800, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_accepted_reader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.applications a
    where a.user_id = auth.uid() and a.status = 'accepted'
  );
$$;

create policy "manuscript: accepted or admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'manuscript' and (public.is_accepted_reader() or public.is_admin()));
create policy "manuscript: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'manuscript' and public.is_admin());
create policy "manuscript: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'manuscript' and public.is_admin())
  with check (bucket_id = 'manuscript' and public.is_admin());
create policy "manuscript: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'manuscript' and public.is_admin());

-- 미션 마감(2026-09-22 23:59:59 KST) 이후에는 승인된 베타리더도 제출/수정 불가
create or replace function public.before_deadline()
returns boolean
language sql
stable
as $$
  select now() <= timestamptz '2026-09-22 23:59:59+09';
$$;

drop policy if exists "submissions: own insert" on public.submissions;
create policy "submissions: own insert" on public.submissions
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_accepted_reader() and public.before_deadline());

drop policy if exists "submissions: own update" on public.submissions;
create policy "submissions: own update" on public.submissions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and public.is_accepted_reader() and public.before_deadline());

drop policy if exists "submissions bucket: own upload" on storage.objects;
create policy "submissions bucket: own upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_accepted_reader() and public.before_deadline()
  );

drop policy if exists "submissions bucket: own update" on storage.objects;
create policy "submissions bucket: own update" on storage.objects
  for update to authenticated
  using (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.is_accepted_reader() and public.before_deadline()
  );
