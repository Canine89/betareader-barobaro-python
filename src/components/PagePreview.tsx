"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, animate } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";

/*
  책 속 미리보기 "촤라락"
  - 섹션이 화면에 들어오면 한 뭉치로 겹쳐 있던 32쪽이 왼쪽부터 순서대로 부채꼴로 펼쳐진다.
    (엄지로 책을 훑는 느낌: 각 장이 살짝 기울어져 있다가 제자리로 안착)
  - 펼쳐진 뒤에는 드래그하거나 화살표로 넘겨 보고, 한 장을 누르면 크게 본다.
  - 왜: "읽고 싶게" 만드는 것이 목적이라 책의 실제 지면을 보여 주되, 스크롤 한 번의 놀라움을 준다.
  - 모션 감소 설정에서는 펼침 없이 바로 나열한다.
*/

const PAGE_COUNT = 32;
const PAGE_W = 532.913;
const PAGE_H = 728.504;
const pages = Array.from({ length: PAGE_COUNT }, (_, i) => ({
  n: i + 1,
  src: `/pages/p-${String(i + 1).padStart(2, "0")}.webp`,
}));

const CARD_W = 210; // px, 데스크톱
const OVERLAP = 0.62; // 다음 장이 앞 장을 덮는 비율

export function PagePreview() {
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [bounds, setBounds] = useState({ left: 0, right: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const [spread, setSpread] = useState(false);
  const dragging = useRef(false);

  const measure = useCallback(() => {
    const v = viewportRef.current;
    const t = trackRef.current;
    if (!v || !t) return;
    const left = Math.min(0, v.clientWidth - t.scrollWidth);
    setBounds({ left, right: 0 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const v = viewportRef.current;
      const amount = v ? v.clientWidth * 0.7 : 600;
      const target = Math.max(bounds.left, Math.min(0, x.get() - dir * amount));
      animate(x, target, { type: "spring", stiffness: 120, damping: 22 });
    },
    [bounds.left, x],
  );

  // 라이트박스 키보드
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((p) => (p !== null && p < PAGE_COUNT ? p + 1 : p));
      if (e.key === "ArrowLeft") setOpen((p) => (p !== null && p > 1 ? p - 1 : p));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const stackDistance = (i: number) => -i * CARD_W * (1 - OVERLAP); // 첫 장 위치로 모으는 거리

  return (
    <>
      <div className="relative">
        <div
          ref={viewportRef}
          className="overflow-hidden py-8 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        >
          <motion.div
            ref={trackRef}
            drag="x"
            dragConstraints={bounds}
            dragElastic={0.08}
            dragMomentum
            style={{ x }}
            onDragStart={() => (dragging.current = true)}
            onDragEnd={() => window.setTimeout(() => (dragging.current = false), 50)}
            className="flex w-max cursor-grab items-end pl-6 pr-24 active:cursor-grabbing sm:pl-10"
            onViewportEnter={() => setSpread(true)}
            viewport={{ once: true, amount: 0.3 }}
          >
            {pages.map((p, i) => {
              const tilt = ((i % 3) - 1) * 1.6; // -1.6, 0, 1.6도 번갈아
              return (
                <motion.button
                  key={p.n}
                  type="button"
                  aria-label={`${p.n}쪽 크게 보기`}
                  onClick={() => {
                    if (!dragging.current) setOpen(p.n);
                  }}
                  initial={reduce ? false : { x: stackDistance(i), rotate: -14 + i * 0.25, opacity: i === 0 ? 1 : 0.85 }}
                  animate={
                    spread || reduce
                      ? { x: 0, rotate: tilt, opacity: 1 }
                      : { x: stackDistance(i), rotate: -14 + i * 0.25, opacity: i === 0 ? 1 : 0.85 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 140,
                    damping: 18,
                    mass: 0.8,
                    delay: reduce ? 0 : i * 0.045,
                  }}
                  whileHover={reduce ? undefined : { y: -14, rotate: 0, scale: 1.04, zIndex: 100, transition: { duration: 0.25 } }}
                  style={{
                    width: CARD_W,
                    marginLeft: i === 0 ? 0 : -CARD_W * OVERLAP,
                    zIndex: PAGE_COUNT - i, // 앞 장이 위에 오도록 (쌓였을 때 1쪽이 맨 위)
                    transformOrigin: "bottom left",
                  }}
                  className="relative shrink-0 select-none overflow-hidden rounded-[6px] bg-white shadow-[0_18px_40px_-18px_rgba(14,77,161,0.5)] ring-1 ring-black/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--accent)]"
                >
                  <Image
                    src={p.src}
                    alt={`바로바로 파이썬 ${p.n}쪽 미리보기`}
                    width={Math.round(PAGE_W)}
                    height={Math.round(PAGE_H)}
                    sizes="210px"
                    draggable={false}
                    className="pointer-events-none block h-auto w-full"
                  />
                  <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-[#15181f]/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {p.n}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4 px-1">
          <p className="text-sm text-[var(--muted)]">끌어서 넘기거나 한 장을 눌러 크게 보세요.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => step(-1)} className="btn btn-secondary !min-h-10 !px-3" aria-label="이전 페이지들">
              <ArrowLeft size={18} weight="bold" aria-hidden />
            </button>
            <button type="button" onClick={() => step(1)} className="btn btn-secondary !min-h-10 !px-3" aria-label="다음 페이지들">
              <ArrowRight size={18} weight="bold" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${open}쪽`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1020]/85 p-4 backdrop-blur-sm"
            onClick={() => setOpen(null)}
          >
            <motion.div
              key={open}
              initial={reduce ? false : { scale: 0.94, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="relative mb-14 max-h-[82dvh] overflow-hidden rounded-[8px] bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={pages[open - 1].src}
                alt={`바로바로 파이썬 ${open}쪽`}
                width={1100}
                height={1503}
                sizes="(max-width: 768px) 92vw, 66vh"
                priority
                className="block h-[82dvh] w-auto max-w-[92vw] object-contain"
              />
            </motion.div>

            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setOpen((p) => (p && p > 1 ? p - 1 : p))} disabled={open <= 1} className="btn btn-secondary !min-h-10 !px-3" aria-label="이전 쪽">
                <ArrowLeft size={18} weight="bold" aria-hidden />
              </button>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                {open} / {PAGE_COUNT}
              </span>
              <button type="button" onClick={() => setOpen((p) => (p && p < PAGE_COUNT ? p + 1 : p))} disabled={open >= PAGE_COUNT} className="btn btn-secondary !min-h-10 !px-3" aria-label="다음 쪽">
                <ArrowRight size={18} weight="bold" aria-hidden />
              </button>
            </div>
            <button type="button" onClick={() => setOpen(null)} className="btn btn-secondary absolute right-4 top-4 !min-h-10 !px-3" aria-label="닫기">
              <X size={18} weight="bold" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
