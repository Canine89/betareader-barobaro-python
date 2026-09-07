import Link from "next/link";
import {
  Package,
  BookOpenText,
  PencilSimpleLine,
  ChatCircleText,
  FilePdf,
  CaretDown,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroCover } from "@/components/HeroCover";
import { Reveal } from "@/components/Reveal";
import {
  ANNOUNCE_LABEL,
  APPLY_DEADLINE,
  APPLY_DEADLINE_LABEL,
  APPLY_DEADLINE_SHORT,
  DEADLINE_LABEL,
  REVIEW_TARGET_CHARS,
  SITE,
  daysUntil,
  daysUntilDeadline,
  isApplyClosed,
} from "@/lib/site";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "언제까지 신청할 수 있나요?",
    a: `${APPLY_DEADLINE_LABEL}까지 신청을 받습니다. 선정 결과는 ${ANNOUNCE_LABEL}에 내 페이지에서 확인할 수 있습니다.`,
  },
  {
    q: "누구나 신청할 수 있나요?",
    a: "네. 파이썬을 처음 배우는 분이라면 더 환영합니다. 프로그래밍 경험이 없어도 괜찮습니다. 입문서는 입문자의 눈으로 읽어야 제대로 다듬어집니다.",
  },
  {
    q: "원고는 어떻게 받나요?",
    a: `${ANNOUNCE_LABEL} 발표와 함께 선정된 분의 내 페이지에 원고 PDF 다운로드 버튼이 열립니다.`,
  },
  {
    q: "PDF 주석은 어떻게 남기나요?",
    a: "Adobe Acrobat Reader(무료), macOS 미리보기, 크롬 브라우저 등 PDF 뷰어의 주석 도구로 오탈자나 오류에 메모를 남기면 됩니다. 저장한 파일 이름 끝에 _이름을 붙여 올려 주세요. 예: 바로바로파이썬_홍길동.pdf",
  },
  {
    q: "소감은 얼마나 써야 하나요?",
    a: `워드 1/4 페이지, 10pt 기준입니다. 글자 수로는 ${REVIEW_TARGET_CHARS}자 안팎이면 충분합니다. 사이트의 소감 작성란에 직접 입력합니다.`,
  },
  {
    q: "개인정보는 어디에 쓰이나요?",
    a: "베타리더 선정과 연락, 종이책 배송에만 사용합니다. 배송을 위해 택배사에 이름, 주소, 연락처를 전달하며 배송이 끝나면 파기합니다.",
  },
  {
    q: "마감을 넘기면 어떻게 되나요?",
    a: `${DEADLINE_LABEL}이 지나면 제출이 닫힙니다. 소감 작성과 주석 PDF 업로드, 두 가지를 모두 마쳐야 종이책을 받을 수 있습니다.`,
  },
];

export default function HomePage() {
  const applyClosed = isApplyClosed();
  const applyDday = daysUntil(APPLY_DEADLINE);
  const dday = daysUntilDeadline();

  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* 히어로: 좌측 카피, 우측 표지 */}
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pt-12">
          <div className="lg:col-span-7">
            <h1 className="max-w-[15ch] text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
              읽고, 표시하고,
              <br />
              추천하라!
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
              《{SITE.bookTitle}》 베타리더를{" "}
              <span className="whitespace-nowrap font-semibold text-[var(--fg)]">{APPLY_DEADLINE_SHORT}까지</span>{" "}
              모집합니다!
              <br />
              <span className="font-semibold text-[var(--fg)] underline decoration-[var(--color-brand-yellow)] decoration-[3px] underline-offset-[6px]">
                두 가지 미션을 {DEADLINE_LABEL}까지 완수하면
              </span>{" "}
              완성된 종이책을 무료로 보내 드려요!
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/apply" className="btn btn-primary text-base">
                베타리더 신청하기
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
              <Link href="#missions" className="btn btn-secondary text-base">
                미션 살펴보기
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:pl-6">
            <HeroCover />
          </div>
        </section>

        {/* 특전: 1 + 2 벤토 */}
        <section id="perks" className="scroll-mt-20 bg-[var(--surface-2)] py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                베타리더에게 드리는 것
              </h2>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Reveal className="flex items-center gap-6 rounded-[var(--radius-card)] bg-[var(--color-brand-yellow)] p-7 text-[#15181f] sm:p-8 lg:col-span-6">
                <Package size={48} weight="duotone" className="hidden shrink-0 sm:block" aria-hidden />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5b4300]">
                    베타리더 특전
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                    도서 출간 후 종이책 무료 배송
                  </h3>
                  <p className="mt-2 max-w-[40ch] leading-relaxed text-[#3d2f00]">
                    미션을 완료한 베타리더 모두에게 정식 출간된 종이책을 신청서의 주소로
                    보내 드립니다.
                  </p>
                </div>
              </Reveal>

              <Reveal
                delay={0.08}
                className="rounded-[var(--radius-card)] bg-[var(--color-brand-blue)] p-7 text-white lg:col-span-3"
              >
                <BookOpenText size={28} weight="duotone" aria-hidden />
                <h3 className="mt-3 text-lg font-bold tracking-tight">서점보다 먼저 읽는 원고</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                  조판까지 끝난 원고 PDF를 출간 전에 열어 봅니다.
                </p>
              </Reveal>

              <Reveal
                delay={0.16}
                className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-7 lg:col-span-3"
              >
                <PencilSimpleLine size={28} weight="duotone" className="text-[var(--accent)]" aria-hidden />
                <h3 className="mt-3 text-lg font-bold tracking-tight">책에 남는 의견</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                  보내 주신 오탈자와 소감은 편집부가 검토해 출간 원고에 반영합니다.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 미션: 2열, 큰 숫자 */}
        <section id="missions" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {DEADLINE_LABEL}까지, 두 가지만 해 주세요
              </h2>
              <p className="mt-3 max-w-[48ch] text-[var(--muted)]">
                두 미션 모두 내 페이지에서 제출합니다. 선정 발표 후 열립니다.
              </p>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
              <Reveal as="article" className="border-t-4 border-[var(--accent)] pt-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-7xl font-black leading-none tracking-tighter text-[var(--accent)]">
                    1
                  </span>
                  <ChatCircleText size={36} weight="duotone" className="mt-2 text-[var(--accent)]" aria-hidden />
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-tight">소감 쓰기</h3>
                <p className="mt-3 leading-relaxed text-[var(--muted)]">
                  책을 다 읽은 뒤 소감을 사이트에 직접 작성합니다. 좋았던 점, 어려웠던
                  부분, 입문자에게 권할 만한지 솔직하게 적어 주세요.
                </p>
                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  <dt className="font-semibold">분량</dt>
                  <dd className="text-[var(--muted)]">워드 1/4 페이지, 10pt 기준 (약 {REVIEW_TARGET_CHARS}자)</dd>
                  <dt className="font-semibold">제출처</dt>
                  <dd className="text-[var(--muted)]">내 페이지의 소감 작성란</dd>
                </dl>
              </Reveal>

              <Reveal as="article" delay={0.1} className="border-t-4 border-[var(--accent)] pt-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-7xl font-black leading-none tracking-tighter text-[var(--accent)]">
                    2
                  </span>
                  <FilePdf size={36} weight="duotone" className="mt-2 text-[var(--accent)]" aria-hidden />
                </div>
                <h3 className="mt-6 text-2xl font-bold tracking-tight">오탈자 주석 PDF 올리기</h3>
                <p className="mt-3 leading-relaxed text-[var(--muted)]">
                  읽으면서 발견한 오탈자와 오류를 원고 PDF에 주석으로 남깁니다. 저장한
                  파일 이름 끝에 _이름을 붙여 업로드하세요.
                </p>
                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  <dt className="font-semibold">형식</dt>
                  <dd className="text-[var(--muted)]">PDF, 50MB 이하</dd>
                  <dt className="font-semibold">파일명</dt>
                  <dd className="font-mono text-[13px] text-[var(--muted)]">바로바로파이썬_홍길동.pdf</dd>
                </dl>
              </Reveal>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link href="/my" className="btn btn-primary text-base">
                미션 제출하러 가기
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
              <p className="text-sm text-[var(--muted)]">
                로그인 후 내 페이지에서 소감 작성란과 PDF 업로드가 열립니다.
              </p>
            </div>
          </div>
        </section>

        {/* 일정: 블루 밴드 + D-day */}
        <section id="schedule" className="scroll-mt-20 bg-[var(--color-brand-blue)] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end">
              <Reveal className="lg:col-span-5">
                <p className="text-lg font-semibold text-white/80">
                  {applyClosed ? "미션 마감까지" : "신청 마감까지"}
                </p>
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="text-7xl font-black leading-none tracking-tighter sm:text-8xl">
                    D-{applyClosed ? dday : applyDday}
                  </span>
                </p>
                <p className="mt-4 text-white/80">
                  {applyClosed
                    ? `${DEADLINE_LABEL} 자정에 제출이 닫힙니다.`
                    : `${APPLY_DEADLINE_LABEL} 자정에 신청이 닫힙니다.`}
                </p>
              </Reveal>
              <Reveal delay={0.1} className="lg:col-span-7">
                <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { when: `${APPLY_DEADLINE_LABEL}까지`, what: "베타리더 신청", note: "구글 계정으로 로그인하고 신청서를 작성합니다." },
                    { when: ANNOUNCE_LABEL, what: "선정 발표", note: "내 페이지에서 결과를 확인하고 원고 PDF를 내려받습니다." },
                    { when: "발표 후", what: "원고 읽기", note: "읽으면서 오탈자와 오류에 주석을 남깁니다." },
                    { when: DEADLINE_LABEL, what: "미션 제출 마감", note: "소감과 주석 PDF를 제출합니다." },
                  ].map((s) => (
                    <li key={s.what} className="border-t border-white/30 pt-4">
                      <p className="text-sm font-semibold text-[var(--color-brand-yellow)]">{s.when}</p>
                      <p className="mt-1 text-lg font-bold">{s.what}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">{s.note}</p>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">자주 묻는 질문</h2>
            </Reveal>
            <div className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex items-center justify-between gap-6 text-left text-lg font-semibold">
                    {f.q}
                    <CaretDown
                      size={20}
                      weight="bold"
                      className="faq-chevron shrink-0 text-[var(--faint)] transition-transform"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-3 max-w-[60ch] leading-relaxed text-[var(--muted)]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 마지막 CTA */}
        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="rounded-[var(--radius-card)] bg-[var(--yellow-soft)] px-8 py-14 text-center sm:px-12 sm:py-20">
              <h2 className="mx-auto max-w-[20ch] text-3xl font-extrabold tracking-tight text-[var(--fg)] sm:text-4xl">
                첫 독자의 자리, 지금 신청하세요
              </h2>
              <p className="mx-auto mt-4 max-w-[40ch] text-[var(--muted)]">
                신청은 {APPLY_DEADLINE_LABEL}까지, 2분이면 끝납니다. 미션을 마치면
                종이책이 집으로 갑니다.
              </p>
              <Link href="/apply" className="btn btn-primary mt-8 text-base">
                베타리더 신청하기
                <ArrowRight size={18} weight="bold" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
