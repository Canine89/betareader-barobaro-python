"use client";

import { useActionState, useState } from "react";
import { REVIEW_MAX_CHARS, REVIEW_MIN_CHARS, REVIEW_TARGET_CHARS } from "@/lib/site";
import { CircleNotch } from "@phosphor-icons/react";
import { saveReview, type ReviewState } from "./actions";

export function ReviewForm({ initial, locked }: { initial: string; locked: boolean }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(saveReview, {});
  const [text, setText] = useState(initial);
  const len = text.trim().length;
  const enough = len >= REVIEW_MIN_CHARS;

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="review" className="label">
          소감
        </label>
        <textarea
          id="review"
          name="review"
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={locked}
          maxLength={REVIEW_MAX_CHARS}
          placeholder="책을 읽고 느낀 점을 자유롭게 적어 주세요. 좋았던 부분, 막혔던 부분, 입문자에게 권할 만한지 솔직하게 써 주시면 가장 도움이 됩니다."
          className="field min-h-64 resize-y leading-relaxed"
          aria-describedby="review-help"
        />
        <div id="review-help" className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="help">
            워드 1/4 페이지, 10pt 기준 (약 {REVIEW_TARGET_CHARS}자). 최소 {REVIEW_MIN_CHARS}자
          </span>
          <span className={enough ? "font-semibold text-[var(--accent)]" : "text-[var(--faint)]"}>
            {len.toLocaleString()}자
          </span>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="text-sm font-medium text-[var(--accent)]">
          소감을 저장했습니다. 마감 전까지 언제든 고칠 수 있습니다.
        </p>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={locked || pending || !enough} aria-busy={pending}>
          {pending && <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden />}
          {pending ? "저장 중..." : initial ? "소감 다시 저장" : "소감 제출"}
        </button>
      </div>
    </form>
  );
}
