import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-[var(--fg)]">{SITE.publisher}</span>
          <span className="mx-2 text-[var(--line)]">|</span>
          {SITE.bookTitle} 베타리더 모집
        </p>
        <nav className="flex gap-5">
          <Link href="/privacy" className="hover:text-[var(--fg)]">
            개인정보 처리방침
          </Link>
          <Link href="/apply" className="hover:text-[var(--fg)]">
            베타리더 신청
          </Link>
        </nav>
      </div>
    </footer>
  );
}
