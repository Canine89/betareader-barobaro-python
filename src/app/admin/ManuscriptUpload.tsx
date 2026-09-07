"use client";

import { useRef, useState, useTransition } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { PDF_MAX_BYTES } from "@/lib/site";
import { refreshAdmin } from "./actions";

export function ManuscriptUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function upload() {
    if (!file) return;
    if (file.size > PDF_MAX_BYTES) return setMsg("50MB를 넘는 파일은 올릴 수 없습니다.");
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    // Storage 키는 ASCII만 허용. 한글 파일명은 안전한 이름으로 바꾼다.
    const base = file.name.replace(/\.pdf$/i, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
    const key = `${base || "manuscript"}.pdf`;
    const { error } = await supabase.storage
      .from("manuscript")
      .upload(key, file, { upsert: true, contentType: "application/pdf" });
    setBusy(false);
    if (error) return setMsg(`업로드 실패: ${error.message}`);
    setMsg(`${key} 업로드 완료`);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    startTransition(() => refreshAdmin());
  }

  return (
    <div className="grid gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        disabled={busy}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="field file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--accent)]"
        aria-label="원고 PDF 선택"
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={upload} disabled={!file || busy} className="btn btn-primary !min-h-11 text-sm">
          <UploadSimple size={18} weight="bold" aria-hidden />
          {busy ? "올리는 중..." : "원고 업로드"}
        </button>
        {msg && <p className="text-sm text-[var(--muted)]">{msg}</p>}
      </div>
    </div>
  );
}
