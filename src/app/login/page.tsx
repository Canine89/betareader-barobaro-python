import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SubmitButton } from "@/components/SubmitButton";
import { signInWithGoogle } from "./actions";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/my";
  const error = typeof sp.error === "string" ? sp.error : null;

  return (
    <>
      <Nav />
      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              구글 계정으로 시작합니다
            </h1>
            <p className="mt-4 max-w-[40ch] leading-relaxed text-[var(--muted)]">
              별도 회원가입 없이 구글 계정 하나로 신청서 작성, 원고 열람, 미션
              제출까지 진행합니다.
            </p>

            <form action={signInWithGoogle} className="mt-8">
              <input type="hidden" name="next" value={next} />
              <SubmitButton className="btn btn-primary w-full text-base sm:w-auto" pendingText="Google로 이동하는 중...">
                <GoogleLogo size={20} weight="bold" aria-hidden />
                Google로 계속하기
              </SubmitButton>
            </form>

            {error && (
              <p role="alert" className="error mt-4">
                {error}
              </p>
            )}

            <p className="mt-6 text-sm text-[var(--faint)]">
              로그인하면 이름, 이메일, 프로필 사진을 구글에서 받아 계정 식별에만
              사용합니다.{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-[var(--fg)]">
                개인정보 처리방침
              </Link>
            </p>
          </div>

          <div className="relative mx-auto hidden w-56 md:block">
            <Image
              src="/cover.png"
              alt=""
              width={1331}
              height={1815}
              className="rounded-[8px] shadow-[0_30px_60px_-30px_rgba(14,77,161,0.45)] ring-1 ring-black/5"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
