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
import { ArrowRight } from "@phosphor-icons/react";
import { APPLY_DEADLINE_SHORT, DEADLINE_LABEL, SITE } from "@/lib/site";

/*
  스크롤 스토리 히어로
  - 히어로가 220vh 동안 고정되고, 스크롤 진행도에 따라 헤드라인 세 단어에 형광펜이 순서대로 칠해진다.
  - "표시하고" 단계에서는 형광펜 대신 펜으로 단어에 동그라미를 그리고 "오탈자 발견!"이 손글씨처럼 쓰인다. 표지에는 아무 표시도 하지 않는다.
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

/** 펜으로 단어에 동그라미를 치고 옆에 메모를 쓰는 표시 */
const LOOP_PATH = "M 8,22 C 10,6 40,2 60,4 C 85,6 98,14 96,24 C 94,36 60,40 35,38 C 12,36 2,28 6,20 C 8,14 20,10 32,9";

function PenWord({
  word,
  mode,
  pathLen,
  clipPath,
}: {
  word: string;
  mode: "scroll" | "inview" | "static";
  pathLen?: MotionValue<number>;
  clipPath?: MotionValue<string>;
}) {
  // Motion은 SVG path의 pathLength를 stroke-dasharray/offset으로 변환해 그린다.
  const pathProps =
    mode === "scroll"
      ? { style: { pathLength: pathLen } }
      : mode === "inview"
        ? { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: 0.9, delay: 0.4, ease: "easeInOut" as const } }
        : {};
  const labelProps =
    mode === "scroll"
      ? { style: { clipPath } }
      : mode === "inview"
        ? { initial: { clipPath: "inset(0 100% 0 0)" }, whileInView: { clipPath: "inset(0 0% 0 0)" }, viewport: { once: true }, transition: { duration: 0.5, delay: 1.3, ease: "easeOut" as const } }
        : {};

  return (
    <span className="relative inline-block px-[0.06em]">
      {word}
      <svg
        className="pointer-events-none absolute -inset-x-[0.18em] -inset-y-[0.12em] h-[calc(100%+0.24em)] w-[calc(100%+0.36em)] overflow-visible"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d={LOOP_PATH}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          {...pathProps}
        />
      </svg>
      <motion.span
        className="absolute -right-[0.3em] -top-[0.95em] whitespace-nowrap text-[0.3em] font-bold tracking-tight text-[var(--accent)]"
        style={{ rotate: -4 }}
        aria-hidden
        {...labelProps}
      >
        오탈자 발견!
      </motion.span>
    </span>
  );
}

const coverAlt = "바로바로 파이썬 표지 초안. 바로 배워 바로 쓰자! 박현규, 셀레나 지음, 골든래빗";

/** 데스크톱: 스크롤 고정 스토리 */
function DesktopStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const fill0 = useTransform(scrollYProgress, RANGES[0], [0, 100]);
  const fill2 = useTransform(scrollYProgress, RANGES[2], [0, 100]);
  // "표시하고": 펜 동그라미(선 길이) → 메모 글씨(왼쪽부터 드러남)
  const loopLength = useTransform(scrollYProgress, [0.34, 0.54], [0, 1]);
  const labelInset = useTransform(scrollYProgress, [0.55, 0.64], [100, 0]);
  const labelClip = useMotionTemplate`inset(0 ${labelInset}% 0 0)`;

  const rotate = useTransform(scrollYProgress, [0, 0.3], [-2.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.03]);


  return (
    <div ref={ref} className="relative h-[220vh]">
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] items-center">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-8 px-6">
          <div className="col-span-7">
            <h1 className="max-w-[15ch] text-5xl font-extrabold leading-[1.12] tracking-[-0.02em] lg:text-6xl">
              <MarkerWord word={WORDS[0]} fill={fill0} />{" "}
              <PenWord word={WORDS[1]} mode="scroll" pathLen={loopLength} clipPath={labelClip} />
              <br />
              <MarkerWord word={WORDS[2]} fill={fill2} />
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
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <h1 className="max-w-[15ch] text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
          <span className="marker">{WORDS[0]}</span>{" "}
          <PenWord word={WORDS[1]} mode={animateIn ? "inview" : "static"} />
          <br />
          <span className="marker">{WORDS[2]}</span>
        </h1>
        <HeroCopy />
      </div>
      <div className="lg:col-span-5">
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="relative aspect-[1331/1815] w-full -rotate-[2.5deg] rounded-[10px] bg-white shadow-[0_40px_80px_-30px_rgba(14,77,161,0.45)] ring-1 ring-black/5">
            <Image src="/cover.png" alt={coverAlt} fill priority sizes="(max-width: 1024px) 420px, 400px" className="rounded-[10px] object-cover" />
          </div>
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
