import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "개인정보 처리방침" };

const sections = [
  {
    h: "1. 수집하는 개인정보 항목",
    p: [
      "필수 항목: 이름, 주소, 연락처(휴대전화 번호), 이메일 주소",
      "구글 로그인 시 자동 수집: 구글 계정 이메일, 프로필 이름, 프로필 사진 URL",
      "서비스 이용 과정에서 생성: 소감 텍스트, 업로드한 주석 PDF 파일, 제출 일시",
    ],
  },
  {
    h: "2. 개인정보의 수집 및 이용 목적",
    p: [
      "베타리더 신청 접수와 선정 결과 안내",
      "원고 PDF 전달과 미션 제출 관리",
      "출간 도서(종이책) 배송",
      "베타리딩 진행과 관련한 연락",
    ],
  },
  {
    h: "3. 개인정보의 보유 및 이용 기간",
    p: [
      "수집한 개인정보는 도서 배송 완료 후 30일 이내에 파기합니다.",
      "베타리더로 선정되지 않은 분의 정보는 선정 결과 확정 후 30일 이내에 파기합니다.",
      "소감과 주석 PDF는 출간 원고 반영을 위해 도서 출간 시점까지 보관하며, 개인 식별 정보는 분리하여 보관합니다.",
    ],
  },
  {
    h: "4. 개인정보의 제3자 제공",
    p: [
      "도서 배송을 위해 택배사에 이름, 주소, 연락처를 제공합니다. 그 밖의 제3자 제공은 없습니다.",
    ],
  },
  {
    h: "5. 개인정보 처리 위탁",
    p: [
      "본 사이트는 데이터 저장과 인증에 Supabase, 호스팅에 Vercel을 사용합니다. 이들 서비스는 정보 보관과 전송 목적으로만 개인정보를 처리합니다.",
    ],
  },
  {
    h: "6. 정보주체의 권리",
    p: [
      "신청자는 언제든지 내 페이지에서 본인의 신청 정보를 열람하고 수정할 수 있습니다.",
      "삭제를 원하시면 편집부로 요청해 주세요. 요청을 받은 즉시 처리합니다.",
      "개인정보 수집·이용 동의를 거부할 수 있으나, 거부하면 베타리더 신청이 불가능합니다.",
    ],
  },
  {
    h: "7. 개인정보 보호책임자",
    p: [`${SITE.publisher} 편집부`],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">개인정보 처리방침</h1>
          <p className="mt-3 text-[var(--muted)]">
            {SITE.publisher}은 《{SITE.bookTitle}》 베타리더 모집과 운영을 위해 아래와 같이 개인정보를
            처리합니다. 시행일: 2026년 9월 7일
          </p>
          <div className="mt-10 grid gap-10">
            {sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-xl font-bold tracking-tight">{s.h}</h2>
                <ul className="mt-3 grid gap-2 leading-relaxed text-[var(--muted)]">
                  {s.p.map((line) => (
                    <li key={line} className="pl-4 before:-ml-4 before:mr-2 before:content-['-']">
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
