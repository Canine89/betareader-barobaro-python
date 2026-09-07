"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { annotate, annotationGroup } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";

/*
  손으로 표시한 듯한 헤드라인 (rough-notation)
  - 읽고     → 형광펜 (highlight)
  - 표시하고 → 펜 동그라미 (circle) + "오탈자 발견!" 메모
  - 추천하라 → 펜 밑줄 (underline)
  스케치 선을 두 번 겹쳐 시간 기반으로 그리므로 실제 펜 움직임처럼 보인다.
  prefers-reduced-motion에서는 애니메이션 없이 즉시 그린다.
*/

const WORDS = ["읽고,", "표시하고,", "추천하라!"] as const;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function AnnotatedHeadline({ className }: { className?: string }) {
  const readRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const recommendRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [noteVisible, setNoteVisible] = useState(false);

  useEffect(() => {
    const els = [readRef.current, markRef.current, recommendRef.current];
    if (els.some((e) => !e)) return;
    let annotations: RoughAnnotation[] = [];
    let cancelled = false;
    const timers: number[] = [];

    const draw = () => {
      annotations.forEach((a) => a.remove());
      const pen = cssVar("--accent") || "#0e4da1";
      const marker = "rgba(250, 174, 23, 0.75)";
      const animate = !reduce;
      annotations = [
        annotate(els[0]!, { type: "highlight", color: marker, animate, animationDuration: 650, iterations: 1, padding: [2, 4] }),
        annotate(els[1]!, { type: "circle", color: pen, strokeWidth: 3, animate, animationDuration: 900, iterations: 2, padding: [4, 10] }),
        annotate(els[2]!, { type: "underline", color: pen, strokeWidth: 3, animate, animationDuration: 600, iterations: 2, padding: 4 }),
      ];
      annotationGroup(annotations).show();
      // 동그라미가 다 그려진 뒤 메모가 나타난다
      timers.push(window.setTimeout(() => !cancelled && setNoteVisible(true), animate ? 650 + 900 : 0));
    };

    // 폰트 로딩 후 글자 크기가 확정된 뒤 그린다
    const start = () => {
      if (cancelled) return;
      timers.push(window.setTimeout(draw, reduce ? 0 : 500));
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    // 창 크기가 바뀌면 위치를 다시 계산해 그린다 (애니메이션 없이)
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        annotations.forEach((a) => {
          a.animate = false;
          a.show();
        });
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      annotations.forEach((a) => a.remove());
    };
  }, [reduce]);

  return (
    <h1 className={className}>
      <span ref={readRef}>{WORDS[0]}</span>{" "}
      <span className="relative inline-block">
        <span ref={markRef}>{WORDS[1]}</span>
        <span
          aria-hidden
          className="absolute -right-[0.15em] -top-[1.45em] whitespace-nowrap text-[0.3em] font-bold tracking-tight text-[var(--accent)] transition-opacity duration-500"
          style={{ opacity: noteVisible ? 1 : 0, rotate: "-4deg" }}
        >
          오탈자 발견!
        </span>
      </span>
      <br />
      <span ref={recommendRef}>{WORDS[2]}</span>
    </h1>
  );
}
