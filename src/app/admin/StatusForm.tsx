"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle, CircleNotch, HourglassMedium, XCircle } from "@phosphor-icons/react";
import { setStatus, type StatusState } from "./actions";

export type Status = "pending" | "accepted" | "rejected";

const STATUS_UI: Record<Status, { label: string; tone: string; Icon: typeof CheckCircle }> = {
  pending: { label: "심사 중", tone: "bg-[var(--yellow-soft)] text-[var(--yellow-ink)]", Icon: HourglassMedium },
  accepted: { label: "승인", tone: "bg-[var(--accent-soft)] text-[var(--accent)]", Icon: CheckCircle },
  rejected: { label: "미선정", tone: "bg-[var(--surface-2)] text-[var(--muted)]", Icon: XCircle },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_UI[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${s.tone}`}>
      <s.Icon size={14} weight="bold" aria-hidden />
      {s.label}
    </span>
  );
}

/** 한 신청자의 상태를 바꾸고 저장하는 폼. 배지는 서버가 저장을 확인한 값만 보여 준다. */
export function StatusForm({ userId, name, saved }: { userId: string; name: string; saved: Status }) {
  const [state, action, pending] = useActionState<StatusState, FormData>(setStatus, { status: saved });
  const confirmed = state.status ?? saved;
  const [choice, setChoice] = useState<Status>(confirmed);

  // 서버가 새 상태를 확인해 주면 셀렉트도 그 값으로 맞춘다 (렌더 중 상태 조정 패턴)
  const [prevConfirmed, setPrevConfirmed] = useState(confirmed);
  if (prevConfirmed !== confirmed) {
    setPrevConfirmed(confirmed);
    setChoice(confirmed);
  }

  // "저장됐습니다"는 2.5초 뒤에 사라진다
  const [flashDoneFor, setFlashDoneFor] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!state.savedAt) return;
    const t = window.setTimeout(() => setFlashDoneFor(state.savedAt), 2500);
    return () => window.clearTimeout(t);
  }, [state.savedAt]);
  const flash = !!state.savedAt && flashDoneFor !== state.savedAt;

  const dirty = choice !== confirmed;

  return (
    <form action={action} className="grid gap-2">
      <StatusBadge status={confirmed} />
      <div className="flex items-center gap-2">
        <input type="hidden" name="user_id" value={userId} />
        <select
          name="status"
          value={choice}
          onChange={(e) => setChoice(e.target.value as Status)}
          disabled={pending}
          className="field !py-1.5 !text-sm"
          aria-label={`${name} 상태`}
        >
          {(Object.keys(STATUS_UI) as Status[]).map((k) => (
            <option key={k} value={k}>
              {STATUS_UI[k].label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!dirty || pending}
          aria-busy={pending}
          className={`btn !min-h-9 !px-3 text-xs ${dirty ? "btn-primary" : "btn-secondary"}`}
        >
          {pending ? (
            <>
              <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden />
              저장 중
            </>
          ) : (
            "저장"
          )}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="error text-xs">
          {state.error}
        </p>
      )}
      {flash && !state.error && (
        <p role="status" className="text-xs font-medium text-[var(--accent)]">
          저장됐습니다
        </p>
      )}
      {dirty && !pending && <p className="text-xs text-[var(--faint)]">저장을 눌러야 반영됩니다</p>}
    </form>
  );
}
