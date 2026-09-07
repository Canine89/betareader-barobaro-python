# 바로바로 파이썬 베타리더 모집 사이트

《바로바로 파이썬》(골든래빗) 베타리더를 모집하고, 미션(소감 작성·오탈자 주석 PDF 업로드)을 제출받는 사이트입니다.

- Next.js 16 (App Router) + Tailwind v4 + Motion
- Supabase (Google OAuth, Postgres, Storage)
- Vercel 배포

## 로컬 실행

```bash
cp .env.example .env.local   # Supabase URL / publishable key 입력
npm install
npm run dev
```

## Supabase

- 마이그레이션: `supabase/migrations/` (`supabase db push`)
- 인증 설정: `supabase/config.toml` (`supabase config push`)
  - 환경 변수 `SUPABASE_AUTH_SITE_URL`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` 필요
- 관리자: `public.admins` 테이블의 이메일로 로그인하면 `/admin` 사용 가능

## 구조

| 경로 | 설명 |
| --- | --- |
| `/` | 모집 랜딩 (특전, 미션, 일정, FAQ) |
| `/login` | Google 로그인 |
| `/apply` | 신청서 (이름, 연락처, 주소, 이메일, 개인정보 동의) |
| `/my` | 신청 상태, 원고 PDF 다운로드, 미션 제출 |
| `/admin` | 신청자 관리, 승인, 제출물 확인, CSV, 원고 업로드 |
| `/privacy` | 개인정보 처리방침 |

미션 마감은 `src/lib/site.ts`의 `DEADLINE`과 DB 정책(`before_deadline()`) 두 곳에 있습니다.
