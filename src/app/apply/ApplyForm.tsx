"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleNotch } from "@phosphor-icons/react";
import { submitApplication, type ApplyState } from "./actions";
import { AddressField, parseAddress } from "./AddressField";

type Props = {
  defaults: { name: string; phone: string; address: string; email: string };
  isEdit: boolean;
};

export function ApplyForm({ defaults, isEdit }: Props) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitApplication, {});
  const v = state.values ?? defaults;
  const e = state.errors ?? {};

  return (
    <form action={action} noValidate className="grid gap-6">
      <div className="grid gap-2">
        <label htmlFor="name" className="label">이름</label>
        <input id="name" name="name" defaultValue={v.name} className="field" autoComplete="name" required aria-invalid={!!e.name} aria-describedby={e.name ? "name-err" : undefined} />
        {e.name && <p id="name-err" className="error">{e.name}</p>}
      </div>

      <div className="grid gap-2">
        <label htmlFor="phone" className="label">연락처</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={v.phone} placeholder="010-1234-5678" className="field" autoComplete="tel" required aria-invalid={!!e.phone} aria-describedby="phone-help" />
        <p id="phone-help" className="help">배송 안내와 급한 연락에만 사용합니다.</p>
        {e.phone && <p className="error">{e.phone}</p>}
      </div>

      <AddressField defaults={parseAddress(v.address)} errors={e.address ? { base: e.address } : undefined} />

      <div className="grid gap-2">
        <label htmlFor="email" className="label">이메일 주소</label>
        <input id="email" name="email" type="email" defaultValue={v.email} className="field" autoComplete="email" required aria-invalid={!!e.email} aria-describedby="email-help" />
        <p id="email-help" className="help">로그인한 구글 계정의 이메일이 기본으로 들어갑니다. 다른 주소로 안내받고 싶다면 바꿔 주세요.</p>
        {e.email && <p className="error">{e.email}</p>}
      </div>

      <fieldset className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5">
        <legend className="px-1 text-sm font-semibold">개인정보 수집·이용 동의 (필수)</legend>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm text-[var(--muted)]">
          <dt className="font-semibold text-[var(--fg)]">수집 항목</dt>
          <dd>이름, 주소, 연락처, 이메일 주소</dd>
          <dt className="font-semibold text-[var(--fg)]">이용 목적</dt>
          <dd>베타리더 선정과 연락, 원고 전달, 출간 도서 배송</dd>
          <dt className="font-semibold text-[var(--fg)]">보유 기간</dt>
          <dd>도서 배송 완료 후 30일 이내 파기</dd>
          <dt className="font-semibold text-[var(--fg)]">제3자 제공</dt>
          <dd>배송을 위해 택배사에 이름, 주소, 연락처 제공</dd>
        </dl>
        <p className="mt-3 text-sm text-[var(--muted)]">
          동의를 거부할 수 있으나, 거부하면 베타리더 신청이 불가능합니다.{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-[var(--fg)]" target="_blank">
            전문 보기
          </Link>
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-medium">
          <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]" required aria-invalid={!!e.consent} />
          <span>위 내용을 확인했으며 개인정보 수집·이용에 동의합니다.</span>
        </label>
        {e.consent && <p className="error mt-2">{e.consent}</p>}
      </fieldset>

      {e.form && <p role="alert" className="error">{e.form}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary text-base" disabled={pending} aria-busy={pending}>
          {pending && <CircleNotch size={18} weight="bold" className="animate-spin" aria-hidden />}
          {pending ? "저장 중..." : isEdit ? "신청 정보 수정" : "신청 제출"}
        </button>
        {isEdit && (
          <Link href="/my" className="btn btn-ghost text-base">
            내 페이지로
          </Link>
        )}
      </div>
    </form>
  );
}
