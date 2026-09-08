"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

/*
  카카오(다음) 우편번호 서비스로 주소를 검색해 채운다.
  - 검색 패널은 페이지 안에 펼쳐진다 (embed).
  - 우편번호와 기본주소는 검색으로만 채우고, 상세주소만 직접 입력한다.
  - 저장 시 서버에서 "(우편번호) 기본주소, 상세주소" 한 줄로 합친다.
*/

type PostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName?: string;
  apartment?: "Y" | "N";
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: {
        oncomplete: (data: PostcodeData) => void;
        onclose?: () => void;
        width?: string | number;
        height?: string | number;
      }) => { embed: (el: HTMLElement, opts?: { autoClose?: boolean }) => void };
    };
  }
}

const POSTCODE_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export function parseAddress(full: string) {
  const m = full.match(/^\((\d{5})\)\s*([^,]*)(?:,\s*(.*))?$/);
  if (!m) return { zip: "", base: full, detail: "" };
  return { zip: m[1], base: m[2].trim(), detail: (m[3] ?? "").trim() };
}

export function AddressField({
  defaults,
  errors,
}: {
  defaults: { zip: string; base: string; detail: string };
  errors?: { zip?: string; base?: string; detail?: string };
}) {
  const [zip, setZip] = useState(defaults.zip);
  const [base, setBase] = useState(defaults.base);
  const [detail, setDetail] = useState(defaults.detail);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !ready || !panelRef.current || !window.daum) return;
    const el = panelRef.current;
    el.innerHTML = "";
    new window.daum.Postcode({
      oncomplete(data) {
        const building = data.apartment === "Y" && data.buildingName ? ` (${data.buildingName})` : "";
        setZip(data.zonecode);
        setBase(`${data.roadAddress || data.jibunAddress}${building}`);
        setOpen(false);
        window.setTimeout(() => detailRef.current?.focus(), 50);
      },
      width: "100%",
      height: "100%",
    }).embed(el, { autoClose: false });
  }, [open, ready]);

  return (
    <div className="grid gap-2">
      <Script
        src={POSTCODE_SRC}
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setLoadError(true)}
      />
      <span className="label">주소</span>

      <div className="flex gap-2">
        <input
          name="zip"
          value={zip}
          readOnly
          placeholder="우편번호"
          className="field w-32 bg-[var(--surface-2)]"
          aria-label="우편번호"
          aria-invalid={!!errors?.zip}
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={loadError}
          className="btn btn-secondary !min-h-[50px] text-sm"
        >
          <MagnifyingGlass size={18} weight="bold" aria-hidden />
          주소 검색
        </button>
      </div>

      {open && (
        <div className="overflow-hidden rounded-[var(--radius-field)] border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2 text-sm">
            <span className="font-semibold">도로명, 건물명, 지번으로 검색하세요</span>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost !min-h-8 !px-2 text-xs" aria-label="주소 검색 닫기">
              <X size={16} weight="bold" aria-hidden />
              닫기
            </button>
          </div>
          <div ref={panelRef} className="h-[440px] w-full">
            {!ready && <p className="p-4 text-sm text-[var(--muted)]">주소 검색을 불러오는 중...</p>}
          </div>
        </div>
      )}

      <input
        name="base"
        value={base}
        readOnly
        placeholder="주소 검색을 누르면 자동으로 채워집니다"
        className="field bg-[var(--surface-2)]"
        aria-label="기본 주소"
        aria-invalid={!!errors?.base}
      />
      <input
        ref={detailRef}
        name="detail"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="상세 주소 (동·호수 등)"
        className="field"
        aria-label="상세 주소"
        autoComplete="address-line2"
      />
      <p className="help">종이책을 받을 주소입니다. 검색으로 기본 주소를 채우고 동·호수를 적어 주세요.</p>
      {loadError && <p className="error">주소 검색을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</p>}
      {(errors?.zip || errors?.base || errors?.detail) && (
        <p className="error">{errors.zip ?? errors.base ?? errors.detail}</p>
      )}
    </div>
  );
}
