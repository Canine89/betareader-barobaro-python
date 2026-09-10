export const SITE = {
  name: "바로바로 파이썬 베타리더 모집",
  bookTitle: "바로바로 파이썬",
  bookSubtitle: "바로 배워 바로 쓰자!",
  authors: "박현규, 셀레나 지음",
  publisher: "골든래빗",
  description:
    "출간 전 원고를 가장 먼저 읽고 의견을 남겨 주세요. 미션을 완료한 베타리더에게 종이책을 무료로 보내 드립니다.",
};

/** 베타리더 신청 마감: 2026년 9월 15일 23:59:59 (KST) */
export const APPLY_DEADLINE = new Date("2026-09-15T23:59:59+09:00");
export const APPLY_DEADLINE_LABEL = "2026년 9월 15일";
export const APPLY_DEADLINE_SHORT = "9월 15일";

/**
 * 베타리딩 시작(원고 공개)은 날짜를 고정하지 않는다.
 * 2교 원고가 준비되면 선정자에게 개별 연락하고, 관리자 페이지의 "베타리딩 시작" 스위치로 원고와 미션을 연다.
 */
export const READING_START_NOTE = "2교 원고가 준비되는 대로 개별 연락";

/** 미션 마감: 2026년 9월 28일 23:59:59 (KST) */
export const DEADLINE = new Date("2026-09-28T23:59:59+09:00");
export const DEADLINE_LABEL = "2026년 9월 28일";
export const DEADLINE_SHORT = "9월 28일";

/** 소감 최소 글자 수. 워드 1/4 페이지(10pt)를 대략 450자로 본다. */
export const REVIEW_MIN_CHARS = 400;
export const REVIEW_TARGET_CHARS = 450;
export const REVIEW_MAX_CHARS = 3000;

export const PDF_MAX_BYTES = 50 * 1024 * 1024;

/** KST 달력 기준 남은 일수 (마감일 당일 = D-0) */
export function daysUntil(target: Date, now = new Date()) {
  const KST = 9 * 3_600_000;
  const dayOf = (d: Date) => Math.floor((d.getTime() + KST) / 86_400_000);
  return Math.max(0, dayOf(target) - dayOf(now));
}

export function daysUntilDeadline(now = new Date()) {
  return daysUntil(DEADLINE, now);
}

export function isApplyClosed(now = new Date()) {
  return now.getTime() > APPLY_DEADLINE.getTime();
}



export function isPastDeadline(now = new Date()) {
  return now.getTime() > DEADLINE.getTime();
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  );
}
