"use client";

import { useRef, useState, useTransition } from "react";
import { FilePdf, Trash, UploadSimple } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { PDF_MAX_BYTES } from "@/lib/site";
import { recordPdf, removePdf } from "./actions";

type Props = {
  userId: string;
  readerName: string;
  current: { name: string; uploadedAt: string } | null;
  locked: boolean;
};

/** 파일 이름 끝에 _이름 이 없으면 붙여 준다. */
function normalizeFileName(original: string, readerName: string) {
  const base = original.replace(/\.pdf$/i, "").trim();
  const clean = readerName.replace(/\s+/g, "");
  const suffix = `_${clean}`;
  const named = base.endsWith(suffix) ? base : `${base}${suffix}`;
  return `${named.replace(/[\\/:*?"<>|]/g, "_")}.pdf`;
}

export function PdfUpload({ userId, readerName, current, locked }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<"idle" | "uploading" | "done">("idle");
  const [pending, startTransition] = useTransition();

  const targetName = file ? normalizeFileName(file.name, readerName) : null;

  function onPick(f: File | null) {
    setError(null);
    setProgress("idle");
    if (!f) return setFile(null);
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setFile(null);
      return setError("PDF 파일만 올릴 수 있습니다.");
    }
    if (f.size > PDF_MAX_BYTES) {
      setFile(null);
      return setError("파일이 50MB를 넘습니다. 주석만 남긴 원본 PDF를 그대로 저장해 주세요.");
    }
    setFile(f);
  }

  async function upload() {
    if (!file || !targetName) return;
    setError(null);
    setProgress("uploading");
    const supabase = createClient();
    // Storage 키에는 한글을 쓸 수 없어 ASCII 경로에 저장하고, 표시용 이름은 DB에 따로 기록한다.
    const path = `${userId}/annotated-${Date.now()}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("submissions")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) {
      setProgress("idle");
      return setError(`업로드하지 못했습니다. (${upErr.message})`);
    }
    startTransition(async () => {
      const res = await recordPdf(path, targetName);
      if (res.error) {
        setError(res.error);
        setProgress("idle");
      } else {
        setProgress("done");
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  function remove() {
    if (!confirm("올린 PDF를 삭제할까요?")) return;
    startTransition(async () => {
      const res = await removePdf();
      if (res.error) setError(res.error);
    });
  }

  const busy = progress === "uploading" || pending;

  return (
    <div className="grid gap-4">
      {current && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-field)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FilePdf size={24} weight="duotone" className="shrink-0 text-[var(--accent)]" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{current.name}</p>
              <p className="text-xs text-[var(--faint)]">
                {new Date(current.uploadedAt).toLocaleString("ko-KR")} 업로드
              </p>
            </div>
          </div>
          {!locked && (
            <button type="button" onClick={remove} disabled={busy} className="btn btn-ghost !min-h-9 !px-3 text-sm">
              <Trash size={16} weight="bold" aria-hidden />
              삭제
            </button>
          )}
        </div>
      )}

      {!locked && (
        <>
          <div className="grid gap-2">
            <label htmlFor="pdf" className="label">
              {current ? "다른 파일로 교체" : "주석 PDF 파일"}
            </label>
            <input
              ref={inputRef}
              id="pdf"
              type="file"
              accept="application/pdf,.pdf"
              disabled={busy}
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              className="field file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--accent)]"
            />
            <p className="help">
              파일 이름 끝에 <span className="font-mono">_{readerName.replace(/\s+/g, "")}</span> 표시가 없으면 자동으로 붙입니다.
            </p>
          </div>

          {targetName && (
            <p className="text-sm">
              업로드될 파일명: <span className="font-mono font-semibold">{targetName}</span>
            </p>
          )}

          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {progress === "done" && !error && (
            <p role="status" className="text-sm font-medium text-[var(--accent)]">
              PDF를 올렸습니다.
            </p>
          )}

          <div>
            <button type="button" onClick={upload} disabled={!file || busy} className="btn btn-primary">
              <UploadSimple size={18} weight="bold" aria-hidden />
              {progress === "uploading" ? "올리는 중..." : "PDF 업로드"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
