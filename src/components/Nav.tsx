import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserCircle } from "@phosphor-icons/react/dist/ssr";

const links = [
  { href: "/#preview", label: "미리보기" },
  { href: "/#perks", label: "특전" },
  { href: "/#missions", label: "미션" },
  { href: "/#schedule", label: "일정" },
  { href: "/#faq", label: "FAQ" },
];

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2 font-extrabold tracking-tight">
          <span className="text-lg">바로바로 파이썬</span>
          <span className="text-sm font-semibold text-[var(--muted)]">베타리더</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--muted)] md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-[var(--fg)]">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/my" className="btn btn-secondary !min-h-10 !px-4 text-sm">
              <UserCircle size={20} weight="bold" aria-hidden />
              내 페이지
            </Link>
          ) : (
            <Link href="/login" className="btn btn-secondary !min-h-10 !px-4 text-sm">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
