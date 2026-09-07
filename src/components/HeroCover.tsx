"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

/** 표지: 페이지 로드 시 살짝 기울어진 채 떠오른다. 첫 화면의 시선을 표지로 모으기 위한 진입 모션. */
export function HeroCover() {
  const reduce = useReducedMotion();
  return (
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
          sizes="(max-width: 1024px) 420px, 40vw"
          className="object-cover"
        />
      </motion.div>
      <p className="mt-6 text-center text-xs text-[var(--faint)]">
        표지는 초안이며 출간 시 달라질 수 있습니다.
      </p>
    </div>
  );
}
