"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { APPLY_DEADLINE_SHORT, DEADLINE_LABEL, SITE } from "@/lib/site";
import { AnnotatedHeadline } from "./AnnotatedHeadline";

/*
  히어로: 헤드라인의 세 단어(미션)에 손으로 표시하듯 형광펜, 동그라미, 밑줄이 순서대로 그려진다.
  표지는 살짝 기울어진 채 떠오르는 진입 모션만 갖는다. 표지 위에는 아무 표시도 하지 않는다.
*/
export function HeroStory() {
  const reduce = useReducedMotion();
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
        <AnnotatedHeadline className="max-w-[15ch] text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-6xl" />
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
        <div className="relative mx-auto w-full max-w-[420px] lg:ml-auto lg:mr-0 lg:max-w-[400px]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -2.5 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative aspect-[1331/1815] w-full overflow-hidden rounded-[10px] bg-white shadow-[0_40px_80px_-30px_rgba(14,77,161,0.45)] ring-1 ring-black/5"
            style={{ willChange: "transform" }}
          >
            <Image
              src="/cover.png"
              alt="바로바로 파이썬 표지 초안. 바로 배워 바로 쓰자! 박현규, 셀레나 지음, 골든래빗"
              fill
              priority
              sizes="(max-width: 1024px) 420px, 400px"
              className="object-cover"
            />
          </motion.div>
          <p className="mt-6 text-center text-xs text-[var(--faint)]">
            표지는 초안이며 출간 시 달라질 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
