"use client";

import { useFormStatus } from "react-dom";
import { CircleNotch } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/** 폼 제출 중이면 스피너와 진행 문구를 보여 주는 버튼 */
export function SubmitButton({
  children,
  pendingText,
  className = "btn btn-primary",
  disabled,
}: {
  children: ReactNode;
  pendingText: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={disabled || pending} aria-busy={pending}>
      {pending ? (
        <>
          <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
