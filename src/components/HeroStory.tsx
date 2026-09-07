"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowRight, PencilSimpleLine, Star } from "@phosphor-icons/react";
import { APPLY_DEADLINE_SHORT, DEADLINE_LABEL, SITE } from "@/lib/site";

/*
  스크롤 스토리 히어로
  - 히어로가 220vh 동안 고정되고, 스크롤 진행도에 따라 헤드라인 세 단어에 형광펜이 순서대로 칠해진다.
  - 같은 진행도로 표지 위에 형광펜 줄, 오탈자 포스트잇, 추천 도장이 차례로 나타난다.
  - 왜: 미션(읽고, 표시하고, 추천하라)을 스크롤 한 번으로 설명하기 위한 스토리텔링.
  - 모바일(<lg)과 prefers-reduced-motion에서는 고정 없이 완성 상태를 정적으로 보여 준다.
*/

const WORDS = ["읽고,", "표시하고,", "추천하라!"] as const;
const RANGES: [number, number][] = [
  [0.04, 0.26],
  [0.36, 0.58],
  [0.68, 0.9],
];

function HeroCopy({ children }: { children?: ReactNode }) {
  return (
    <>
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
      {children}
    </>
  );
}

/** 형광펜이 왼쪽에서 오른쪽으로 칠해지는 단어 */
function MarkerWord({ word, fill }: { word: string; fill: MotionValue<number> }) {
  const size = useMotionTemplate`${fill}% 42%`;
  return (
    <motion.span
      className="inline-block px-[0.06em]"
      style={{
        backgroundImage: "linear-gradient(color-mix(in oklab, var(--color-brand-yellow) 75%, transparent), color-mix(in oklab, var(--color-brand-yellow) 75%, transparent))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 88%",
        backgroundSize: size,
      }}
    >
      {word}
    </motion.span>
  );
}

function StickyNote({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-[6px] bg-[var(--color-brand-yellow)] px-4 py-3 text-sm font-bold text-[#15181f] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.45)] ${className ?? ""}`}
    >
      <PencilSimpleLine size={18} weight="bold" aria-hidden />
      오탈자 발견!
    </div>
  );
}

function Stamp({ className }: { className?: string }) {
  return (
    <div
      className={`flex size-24 flex-col items-center justify-center rounded-full border-[5px] border-[var(--color-brand-blue)] bg-[var(--surface)] text-[var(--color-brand-blue)] shadow-[0_18px_40px_-18px_rgba(14,77,161,0.6)] ${className ?? ""}`}
    >
      <Star size={22} weight="fill" aria-hidden />
      <span className="text-lg font-black leading-none tracking-tight">추천!</span>
    </div>
  );
}

const coverAlt = "바로바로 파이썬 표지 초안. 바로 배워 바로 쓰자! 박현규, 셀레나 지음, 골든래빗";

/** 데스크톱: 스크롤 고정 스토리 */
function DesktopStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const fill0 = useTransform(scrollYProgress, RANGES[0], [0, 100]);
  const fill1 = useTransform(scrollYProgress, RANGES[1], [0, 100]);
  const fill2 = useTransform(scrollYProgress, RANGES[2], [0, 100]);
  const fills = [fill0, fill1, fill2];

  const rotate = useTransform(scrollYProgress, [0, 0.3], [-2.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.03]);

  const line1 = useTransform(scrollYProgress, [0.36, 0.46], [0, 1]);
  const line2 = useTransform(scrollYProgress, [0.42, 0.52], [0, 1]);
  // opacity 대신 scale 키프레임으로 등장시킨다 (scale 0 = 보이지 않음).
  const noteScale = useTransform(scrollYProgress, [0.48, 0.5, 0.6], [0, 0.6, 1]);
  const stampScale = useTransform(scrollYProgress, [0.7, 0.72, 0.86], [0, 1.8, 1]);
  const stampRotate = useTransform(scrollYProgress, [0.72, 0.86], [8, -10]);

  return (
    <div ref={ref} className="relative h-[220vh]">
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] items-center">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-8 px-6">
          <div className="col-span-7">
            <h1 className="max-w-[15ch] text-5xl font-extrabold leading-[1.12] tracking-[-0.02em] lg:text-6xl">
              <MarkerWord word={WORDS[0]} fill={fills[0]} />{" "}
              <MarkerWord word={WORDS[1]} fill={fills[1]} />
              <br />
              <MarkerWord word={WORDS[2]} fill={fills[2]} />
            </h1>
            <HeroCopy />
          </div>

          <div className="col-span-5 pl-6">
            <div className="relative ml-auto w-full max-w-[400px]">
              <motion.div
                style={{ rotate, scale, willChange: "transform" }}
                className="relative aspect-[1331/1815] w-full rounded-[10px] bg-white shadow-[0_40px_80px_-30px_rgba(14,77,161,0.45)] ring-1 ring-black/5"
              >
                <Image src="/cover.png" alt={coverAlt} fill priority sizes="400px" className="rounded-[10px] object-cover" />
                {/* 형광펜 줄: 표지 하단 키워드 줄 위에 */}
                <motion.div
                  style={{ scaleX: line1, transformOrigin: "left center" }}
                  className="absolute left-[9%] top-[53.2%] h-[3.6%] w-[62%] bg-[var(--color-brand-yellow)]/70 mix-blend-multiply"
                  aria-hidden
                />
                <motion.div
                  style={{ scaleX: line2, transformOrigin: "left center" }}
                  className="absolute left-[9%] top-[57.4%] h-[3.6%] w-[52%] bg-[var(--color-brand-yellow)]/70 mix-blend-multiply"
                  aria-hidden
                />
              </motion.div>

              <motion.div
                style={{ scale: noteScale, rotate: -6 }}
                className="absolute -right-8 top-[9%]"
                aria-hidden
              >
                <StickyNote />
              </motion.div>

              <motion.div
                style={{ scale: stampScale, rotate: stampRotate }}
                className="absolute -left-8 bottom-[7%]"
                aria-hidden
              >
                <Stamp />
              </motion.div>

              <p className="mt-6 text-center text-xs text-[var(--faint)]">
                표지는 초안이며 출간 시 달라질 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 모바일 / 모션 감소: 완성 상태를 정적으로 */
function StaticStory({ animateIn }: { animateIn: boolean }) {
  const pop = animateIn
    ? { initial: { opacity: 0, scale: 0.7 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true } }
    : {};
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <h1 className="max-w-[15ch] text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
          <span className="marker">{WORDS[0]}</span> <span className="marker">{WORDS[1]}</span>
          <br />
          <span className="marker">{WORDS[2]}</span>
        </h1>
        <HeroCopy />
      </div>
      <div className="lg:col-span-5">
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="relative aspect-[1331/1815] w-full -rotate-[2.5deg] rounded-[10px] bg-white shadow-[0_40px_80px_-30px_rgba(14,77,161,0.45)] ring-1 ring-black/5">
            <Image src="/cover.png" alt={coverAlt} fill priority sizes="(max-width: 1024px) 420px, 400px" className="rounded-[10px] object-cover" />
            <div className="absolute left-[9%] top-[53.2%] h-[3.6%] w-[62%] bg-[var(--color-brand-yellow)]/70 mix-blend-multiply" aria-hidden />
            <div className="absolute left-[9%] top-[57.4%] h-[3.6%] w-[52%] bg-[var(--color-brand-yellow)]/70 mix-blend-multiply" aria-hidden />
          </div>
          <motion.div {...pop} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="absolute -right-3 top-[9%] -rotate-6 sm:-right-6" aria-hidden>
            <StickyNote />
          </motion.div>
          <motion.div {...pop} transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }} className="absolute -left-3 bottom-[9%] -rotate-[10deg] sm:-left-6" aria-hidden>
            <Stamp />
          </motion.div>
          <p className="mt-6 text-center text-xs text-[var(--faint)]">
            표지는 초안이며 출간 시 달라질 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroStory() {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <section>
        <StaticStory animateIn={false} />
      </section>
    );
  }
  return (
    <section>
      <div className="hidden lg:block">
        <DesktopStory />
      </div>
      <div className="lg:hidden">
        <StaticStory animateIn />
      </div>
    </section>
  );
}
