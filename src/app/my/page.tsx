import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle,
  Circle,
  DownloadSimple,
  HourglassMedium,
  PencilSimple,
  SignOut,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { DEADLINE_LABEL, daysUntilDeadline, isPastDeadline } from "@/lib/site";
import { ReviewForm } from "./ReviewForm";
import { PdfUpload } from "./PdfUpload";

export const metadata: Metadata = { title: "내 페이지" };

const STATUS = {
  pending: { label: "심사 중", tone: "bg-[var(--yellow-soft)] text-[var(--yellow-ink)]", Icon: HourglassMedium },
  accepted: { label: "베타리더 승인", tone: "bg-[var(--accent-soft)] text-[var(--accent)]", Icon: CheckCircle },
  rejected: { label: "이번에는 함께하지 못해요", tone: "bg-[var(--surface-2)] text-[var(--muted)]", Icon: XCircle },
} as const;

export default async function MyPage({ searchParams }: PageProps<"/my">) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my");

  const [{ data: app }, { data: sub }, { data: isAdmin }] = await Promise.all([
    supabase.from("applications").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("submissions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("is_admin"),
  ]);

  const past = isPastDeadline();
  const dday = daysUntilDeadline();
  const accepted = app?.status === "accepted";

  // 승인된 베타리더에게 원고 PDF 링크 제공
  let manuscripts: { name: string; url: string }[] = [];
  if (accepted) {
    const { data: files } = await supabase.storage.from("manuscript").list("", { limit: 20 });
    const pdfs = (files ?? []).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length) {
      const { data: signed } = await supabase.storage
        .from("manuscript")
        .createSignedUrls(pdfs.map((f) => f.name), 60 * 60);
      manuscripts = (signed ?? [])
        .filter((s) => s.signedUrl)
        .map((s, i) => ({ name: pdfs[i].name, url: s.signedUrl as string }));
    }
  }

  const reviewDone = !!sub?.review_submitted_at;
  const pdfDone = !!sub?.pdf_uploaded_at;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">내 페이지</h1>
              <p className="mt-2 text-[var(--muted)]">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin" className="btn btn-secondary !min-h-10 !px-4 text-sm">
                  관리자
                </Link>
              )}
              <form action="/auth/signout" method="post">
                <button type="submit" className="btn btn-ghost !min-h-10 !px-4 text-sm">
                  <SignOut size={18} weight="bold" aria-hidden />
                  로그아웃
                </button>
              </form>
            </div>
          </div>

          {sp.applied === "1" && (
            <p role="status" className="mt-6 rounded-[var(--radius-field)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-medium text-[var(--accent)]">
              신청서를 받았습니다. 승인되면 이 페이지에서 원고를 내려받을 수 있습니다.
            </p>
          )}

          {/* 신청 상태 */}
          <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold">신청 상태</h2>
            {app ? (
              (() => {
                const s = STATUS[app.status as keyof typeof STATUS];
                return (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${s.tone}`}>
                      <s.Icon size={18} weight="bold" aria-hidden />
                      {s.label}
                    </span>
                    <Link href="/apply" className="btn btn-ghost !min-h-10 !px-3 text-sm">
                      <PencilSimple size={16} weight="bold" aria-hidden />
                      신청 정보 수정
                    </Link>
                  </div>
                );
              })()
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[var(--muted)]">아직 신청서를 작성하지 않았습니다.</p>
                <Link href="/apply" className="btn btn-primary !min-h-11 text-sm">
                  베타리더 신청하기
                </Link>
              </div>
            )}
            {app && (
              <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-[var(--line)] pt-5 text-sm">
                <dt className="font-semibold">이름</dt><dd className="text-[var(--muted)]">{app.name}</dd>
                <dt className="font-semibold">연락처</dt><dd className="text-[var(--muted)]">{app.phone}</dd>
                <dt className="font-semibold">주소</dt><dd className="text-[var(--muted)]">{app.address}</dd>
                <dt className="font-semibold">이메일</dt><dd className="text-[var(--muted)]">{app.email}</dd>
              </dl>
            )}
          </section>

          {/* 원고 */}
          {accepted && (
            <section className="mt-6 rounded-[var(--radius-card)] bg-[var(--color-brand-blue)] p-6 text-white sm:p-8">
              <h2 className="text-lg font-bold">원고 PDF</h2>
              {manuscripts.length ? (
                <ul className="mt-4 grid gap-2">
                  {manuscripts.map((m) => (
                    <li key={m.name}>
                      <a href={m.url} className="btn btn-secondary !min-h-11 text-sm" download>
                        <DownloadSimple size={18} weight="bold" aria-hidden />
                        {m.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-white/80">원고 파일을 준비 중입니다. 곧 이 자리에 다운로드 버튼이 열립니다.</p>
              )}
              <p className="mt-4 text-xs text-white/70">원고는 베타리딩 목적으로만 사용해 주세요. 외부 공유는 삼가 주세요.</p>
            </section>
          )}

          {/* 미션 */}
          <section className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight">미션</h2>
              <p className="text-sm font-semibold text-[var(--muted)]">
                {past ? "제출이 마감되었습니다" : `마감 ${DEADLINE_LABEL} (D-${dday})`}
              </p>
            </div>

            {!accepted ? (
              <div className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--line)] p-6 text-[var(--muted)]">
                {app
                  ? app.status === "rejected"
                    ? "이번 베타리딩에는 참여하지 못하게 되었습니다. 관심 가져 주셔서 고맙습니다."
                    : "승인이 완료되면 여기서 소감 작성과 PDF 업로드가 열립니다."
                  : "신청서를 먼저 작성해 주세요."}
              </div>
            ) : (
              <div className="mt-4 grid gap-6">
                <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
                  <header className="flex items-center gap-3">
                    {reviewDone ? (
                      <CheckCircle size={26} weight="fill" className="text-[var(--accent)]" aria-hidden />
                    ) : (
                      <Circle size={26} weight="bold" className="text-[var(--faint)]" aria-hidden />
                    )}
                    <h3 className="text-lg font-bold">1. 소감 쓰기</h3>
                  </header>
                  <div className="mt-5">
                    <ReviewForm initial={sub?.review ?? ""} locked={past} />
                  </div>
                </article>

                <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
                  <header className="flex items-center gap-3">
                    {pdfDone ? (
                      <CheckCircle size={26} weight="fill" className="text-[var(--accent)]" aria-hidden />
                    ) : (
                      <Circle size={26} weight="bold" className="text-[var(--faint)]" aria-hidden />
                    )}
                    <h3 className="text-lg font-bold">2. 오탈자 주석 PDF 올리기</h3>
                  </header>
                  <div className="mt-5">
                    <PdfUpload
                      userId={user.id}
                      readerName={app!.name}
                      current={sub?.pdf_path ? { name: sub.pdf_name ?? "", uploadedAt: sub.pdf_uploaded_at ?? "" } : null}
                      locked={past}
                    />
                  </div>
                </article>

                {reviewDone && pdfDone && (
                  <p role="status" className="rounded-[var(--radius-card)] bg-[var(--yellow-soft)] px-6 py-5 font-semibold text-[var(--yellow-ink)]">
                    두 미션을 모두 마쳤습니다. 출간 후 종이책을 신청서의 주소로 보내 드립니다.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
