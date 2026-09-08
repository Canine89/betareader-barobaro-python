"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, animate } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowsIn, CircleNotch, MagnifyingGlassMinus, MagnifyingGlassPlus, X } from "@phosphor-icons/react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

/*
  책 속 미리보기 "촤라락"
  - 섹션이 화면에 들어오면 한 뭉치로 겹쳐 있던 32쪽이 왼쪽부터 순서대로 부채꼴로 펼쳐진다.
    (엄지로 책을 훑는 느낌: 각 장이 살짝 기울어져 있다가 제자리로 안착)
  - 펼쳐진 뒤에는 드래그하거나 화살표로 넘겨 보고, 한 장을 누르면 크게 본다.
  - 왜: "읽고 싶게" 만드는 것이 목적이라 책의 실제 지면을 보여 주되, 스크롤 한 번의 놀라움을 준다.
  - 모션 감소 설정에서는 펼침 없이 바로 나열한다.
*/

const PAGE_COUNT = 32;
const IMG_W = 2200; // public/pages 원본 크기
const IMG_H = 3007;
const pages = Array.from({ length: PAGE_COUNT }, (_, i) => ({
  n: i + 1,
  src: `/pages/p-${String(i + 1).padStart(2, "0")}.webp`,
}));

const OVERLAP = 0.62; // 다음 장이 앞 장을 덮는 비율
// 카드 폭은 CSS로 반응형 처리(모바일 150px, sm 이상 210px). 겹침 여백은 폭 × OVERLAP.
const CARD_CLASS = "w-[150px] sm:w-[210px]";
const OVERLAP_CLASS = "-ml-[93px] sm:-ml-[130px]";

export function PagePreview() {
  const reduce = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [bounds, setBounds] = useState({ left: 0, right: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const [loadedPage, setLoadedPage] = useState<number | null>(null); // 크게 보기 이미지 로딩 완료 쪽
  // 펼침 트리거는 가로로 긴 띠가 아니라 섹션 컨테이너 기준 (모바일에서도 확실히 발동)
  const spread = useInView(viewportRef, { once: true, amount: 0.35 });
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

  // 라이트박스: 키보드, 스크롤 잠금, 배경 클릭 닫기
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((p) => (p !== null && p < PAGE_COUNT ? p + 1 : p));
      if (e.key === "ArrowLeft") setOpen((p) => (p !== null && p > 1 ? p - 1 : p));
    };
    // 배경을 "가만히 눌렀다 뗀" 경우에만 닫는다. 끌기(이동)나 이미지·버튼·페이지 틀에서 시작한 조작은 무시.
    // 확대 라이브러리가 문서 리스너를 먼저 잡으므로 window 캡처 단계에서 pointerdown/pointerup으로 직접 판정한다.
    let start: { x: number; y: number; onBackdrop: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      const box = document.querySelector("[data-lightbox]");
      const inBox = !!(t && box && box.contains(t));
      const onContent = !!t?.closest("img, button, [data-page]");
      start = { x: e.clientX, y: e.clientY, onBackdrop: inBox && !onContent };
    };
    const onUp = (e: PointerEvent) => {
      const s = start;
      start = null;
      if (!s || !s.onBackdrop) return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6) return;
      setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 첫 장 위치로 모으는 거리: 각 카드 폭의 백분율이라 화면 크기와 무관하게 정확히 겹친다
  const stackDistance = (i: number) => `${-i * (1 - OVERLAP) * 100}%`;

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
            className="flex w-max cursor-grab items-end pl-4 pr-16 active:cursor-grabbing sm:pl-10 sm:pr-24"
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
                    delay: reduce ? 0 : i * 0.04,
                  }}
                  whileHover={reduce ? undefined : { y: -14, rotate: 0, scale: 1.04, zIndex: 100, transition: { duration: 0.25 } }}
                  style={{
                    zIndex: PAGE_COUNT - i, // 앞 장이 위에 오도록 (쌓였을 때 1쪽이 맨 위)
                    transformOrigin: "bottom left",
                  }}
                  className={`relative shrink-0 select-none overflow-hidden rounded-[6px] bg-white shadow-[0_18px_40px_-18px_rgba(14,77,161,0.5)] ring-1 ring-black/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[var(--accent)] ${CARD_CLASS} ${i === 0 ? "" : OVERLAP_CLASS}`}
                >
                  <Image
                    src={p.src}
                    alt={`바로바로 파이썬 ${p.n}쪽 미리보기`}
                    width={IMG_W}
                    height={IMG_H}
                    sizes="(max-width: 640px) 150px, 210px"
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
          <p className="text-sm text-[var(--muted)]">
            <span className="sm:hidden">옆으로 밀어 넘기고, 한 장을 눌러 크게 보세요.</span>
            <span className="hidden sm:inline">끌어서 넘기거나 한 장을 눌러 크게 보세요.</span>
          </p>
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
            className="fixed inset-0 z-50 bg-[#0b1020]/90 backdrop-blur-sm"
            data-lightbox
          >
            <TransformWrapper
              key={open}
              minScale={1}
              maxScale={4}
              centerOnInit
              doubleClick={{ mode: "toggle", step: 1.5 }}
              wheel={{ step: 0.06 }}
              pinch={{ step: 5 }}
              panning={{ velocityDisabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <motion.div
                      initial={reduce ? false : { scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      data-page
                      className="relative overflow-hidden rounded-[8px] bg-white shadow-2xl"
                    >
                      <Image
                        src={pages[open - 1].src}
                        alt={`바로바로 파이썬 ${open}쪽`}
                        width={IMG_W}
                        height={IMG_H}
                        sizes="(max-width: 768px) 100vw, 1400px"
                        quality={90}
                        priority
                        draggable={false}
                        onLoad={() => setLoadedPage(open)}
                        className="block max-h-[80dvh] w-auto max-w-[94vw] select-none object-contain"
                      />
                      {loadedPage !== open && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80" aria-live="polite">
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#15181f]/85 px-4 py-2 text-sm font-semibold text-white">
                            <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden />
                            {open}쪽 불러오는 중
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </TransformComponent>

                  <div
                    className="absolute inset-x-0 bottom-4 flex flex-wrap items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button type="button" onClick={() => setOpen((p) => (p && p > 1 ? p - 1 : p))} disabled={open <= 1} className="btn btn-secondary !min-h-10 !px-3" aria-label="이전 쪽">
                      <ArrowLeft size={18} weight="bold" aria-hidden />
                    </button>
                    <span className="rounded-full bg-[#15181f]/85 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20">
                      {open} / {PAGE_COUNT}
                    </span>
                    <button type="button" onClick={() => setOpen((p) => (p && p < PAGE_COUNT ? p + 1 : p))} disabled={open >= PAGE_COUNT} className="btn btn-secondary !min-h-10 !px-3" aria-label="다음 쪽">
                      <ArrowRight size={18} weight="bold" aria-hidden />
                    </button>
                    <span className="mx-2 hidden h-6 w-px bg-white/20 sm:block" aria-hidden />
                    <button type="button" onClick={() => zoomOut()} className="btn btn-secondary !min-h-10 !px-3" aria-label="축소">
                      <MagnifyingGlassMinus size={18} weight="bold" aria-hidden />
                    </button>
                    <button type="button" onClick={() => zoomIn()} className="btn btn-secondary !min-h-10 !px-3" aria-label="확대">
                      <MagnifyingGlassPlus size={18} weight="bold" aria-hidden />
                    </button>
                    <button type="button" onClick={() => resetTransform()} className="btn btn-secondary !min-h-10 !px-3" aria-label="원래 크기">
                      <ArrowsIn size={18} weight="bold" aria-hidden />
                    </button>
                  </div>
                  <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-[#15181f]/85 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20">
                    휠·핀치·더블클릭으로 확대, 끌어서 이동
                  </p>
                </>
              )}
            </TransformWrapper>

            <button type="button" onClick={() => setOpen(null)} className="btn btn-secondary absolute right-4 top-4 !min-h-10 !px-3" aria-label="닫기">
              <X size={18} weight="bold" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
