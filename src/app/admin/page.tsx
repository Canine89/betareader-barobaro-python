import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DownloadSimple, FileCsv } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { DEADLINE_LABEL, APPLY_DEADLINE_LABEL } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import { SubmitButton } from "@/components/SubmitButton";
import { acceptAllPending, setReadingOpen } from "./actions";
import { ManuscriptUpload } from "./ManuscriptUpload";
import { StatusForm, type Status } from "./StatusForm";

export const metadata: Metadata = { title: "관리자" };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/my");

  const [{ data: apps }, { data: subs }, { data: manuscripts }, settings] = await Promise.all([
    supabase.from("applications").select("*").order("created_at", { ascending: false }),
    supabase.from("submissions").select("*"),
    supabase.storage.from("manuscript").list("", { limit: 20 }),
    getSettings(supabase),
  ]);
  const subByUser = new Map((subs ?? []).map((s) => [s.user_id, s]));

  const signedByPath = new Map<string, string>();
  await Promise.all(
    (subs ?? [])
      .filter((s) => s.pdf_path)
      .map(async (s) => {
        const { data } = await supabase.storage
          .from("submissions")
          .createSignedUrl(s.pdf_path as string, 60 * 60, { download: s.pdf_name ?? "annotated.pdf" });
        if (data?.signedUrl) signedByPath.set(s.pdf_path as string, data.signedUrl);
      }),
  );

  const counts = { total: apps?.length ?? 0, pending: 0, accepted: 0, rejected: 0, done: 0 };
  for (const a of apps ?? []) {
    counts[a.status as "pending" | "accepted" | "rejected"]++;
    const s = subByUser.get(a.user_id);
    if (s?.review_submitted_at && s?.pdf_uploaded_at) counts.done++;
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">관리자</h1>
              <p className="mt-2 text-[var(--muted)]">
                신청 {counts.total}명 · 심사 중 {counts.pending} · 승인 {counts.accepted} · 미션 완료 {counts.done}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/admin/export" className="btn btn-secondary !min-h-11 text-sm">
                <FileCsv size={18} weight="bold" aria-hidden />
                CSV 내려받기
              </a>
              <form action={acceptAllPending}>
                <SubmitButton className="btn btn-primary !min-h-11 text-sm" pendingText="승인 처리 중..." disabled={counts.pending === 0}>
                  심사 중 {counts.pending}명 모두 승인
                </SubmitButton>
              </form>
            </div>
          </div>

          <section className={`mt-8 rounded-[var(--radius-card)] p-6 ${settings.reading_open ? "bg-[var(--accent-soft)]" : "bg-[var(--yellow-soft)]"}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  베타리딩 {settings.reading_open ? "진행 중" : "시작 전"}
                </h2>
                <p className="mt-1 max-w-[60ch] text-sm text-[var(--muted)]">
                  {settings.reading_open
                    ? `선정된 베타리더에게 원고 다운로드와 미션 제출이 열려 있습니다. 미션 마감은 ${DEADLINE_LABEL}입니다.`
                    : `승인 결과는 신청자에게 바로 보이지만, 원고 다운로드와 미션 제출은 이 스위치를 켤 때 열립니다. 2교 원고를 아래에 올리고 선정자에게 개별 연락한 뒤 켜 주세요. 신청 마감은 ${APPLY_DEADLINE_LABEL}입니다.`}
                </p>
              </div>
              <form action={setReadingOpen}>
                <input type="hidden" name="reading_open" value={settings.reading_open ? "false" : "true"} />
                <SubmitButton
                  className={settings.reading_open ? "btn btn-secondary !min-h-11 text-sm" : "btn btn-primary !min-h-11 text-sm"}
                  pendingText="반영 중..."
                >
                  {settings.reading_open ? "베타리딩 잠시 닫기" : "베타리딩 시작 (원고 공개)"}
                </SubmitButton>
              </form>
            </div>
          </section>

          <section className="mt-10 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-6">
            <h2 className="text-lg font-bold">원고 PDF</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              여기 올린 파일은 승인된 베타리더의 내 페이지에 다운로드 버튼으로 나타납니다.
            </p>
            {manuscripts?.length ? (
              <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                {manuscripts.map((m) => (
                  <li key={m.name} className="rounded-full bg-[var(--surface-2)] px-3 py-1 font-mono">
                    {m.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-[var(--faint)]">아직 올린 원고가 없습니다.</p>
            )}
            <div className="mt-4 max-w-xl">
              <ManuscriptUpload />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold">신청자</h2>
            {!apps?.length ? (
              <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--line)] p-8 text-center text-[var(--muted)]">
                아직 신청자가 없습니다.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--line)]">
                <table className="w-full min-w-[960px] text-sm">
                  <thead className="bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3">이름</th>
                      <th className="px-4 py-3">연락처 / 이메일</th>
                      <th className="px-4 py-3">주소</th>
                      <th className="px-4 py-3">상태</th>
                      <th className="px-4 py-3">소감</th>
                      <th className="px-4 py-3">PDF</th>
                      <th className="px-4 py-3">신청일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {apps.map((a) => {
                      const s = subByUser.get(a.user_id);
                      const url = s?.pdf_path ? signedByPath.get(s.pdf_path) : undefined;
                      return (
                        <tr key={a.id} className="align-top">
                          <td className="px-4 py-3 font-semibold">{a.name}</td>
                          <td className="px-4 py-3 text-[var(--muted)]">
                            {a.phone}
                            <br />
                            {a.email}
                          </td>
                          <td className="px-4 py-3 text-[var(--muted)]">{a.address}</td>
                          <td className="px-4 py-3">
                            <StatusForm key={`${a.user_id}-${a.status}`} userId={a.user_id} name={a.name} saved={a.status as Status} />
                          </td>
                          <td className="px-4 py-3">
                            {s?.review ? (
                              <details>
                                <summary className="cursor-pointer font-medium text-[var(--accent)]">
                                  {s.review.length}자 보기
                                </summary>
                                <p className="mt-2 max-w-md whitespace-pre-wrap text-[var(--muted)]">{s.review}</p>
                              </details>
                            ) : (
                              <span className="text-[var(--faint)]">미제출</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {url ? (
                              <a href={url} className="inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline" download>
                                <DownloadSimple size={16} weight="bold" aria-hidden />
                                {s?.pdf_name}
                              </a>
                            ) : (
                              <span className="text-[var(--faint)]">미제출</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[var(--muted)]">
                            {new Date(a.created_at).toLocaleDateString("ko-KR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
