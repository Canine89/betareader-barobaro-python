"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { APPLY_DEADLINE_LABEL, isApplyClosed } from "@/lib/site";

export type ApplyState = {
  errors?: Partial<Record<"name" | "phone" | "address" | "email" | "consent" | "form", string>>;
  values?: { name: string; phone: string; address: string; email: string };
};

const PHONE_RE = /^[0-9+()\-\s]{8,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const zip = String(formData.get("zip") ?? "").trim();
  const base = String(formData.get("base") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim();
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    address: detail ? `(${zip}) ${base}, ${detail}` : `(${zip}) ${base}`,
    email: String(formData.get("email") ?? "").trim(),
  };
  const consent = formData.get("consent") === "on";

  const errors: ApplyState["errors"] = {};
  if (values.name.length < 1 || values.name.length > 50) errors.name = "이름을 입력해 주세요.";
  if (!PHONE_RE.test(values.phone)) errors.phone = "연락처를 숫자로 입력해 주세요. 예: 010-1234-5678";
  if (!/^\d{5}$/.test(zip) || base.length < 5) errors.address = "주소 검색을 눌러 배송지 주소를 선택해 주세요.";
  else if (detail.length > 100) errors.address = "상세 주소는 100자 이내로 적어 주세요.";
  if (!EMAIL_RE.test(values.email)) errors.email = "올바른 이메일 주소를 입력해 주세요.";
  if (!consent) errors.consent = "개인정보 수집·이용에 동의해야 신청할 수 있습니다.";
  if (Object.keys(errors).length) return { errors, values };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/apply");

  if (isApplyClosed()) {
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!existing) {
      return { errors: { form: `베타리더 모집이 ${APPLY_DEADLINE_LABEL}에 마감되었습니다.` }, values };
    }
  }

  const { error } = await supabase.from("applications").upsert(
    {
      user_id: user.id,
      ...values,
      consent: true,
      consent_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { errors: { form: `저장하지 못했습니다. 잠시 후 다시 시도해 주세요. (${error.message})` }, values };
  }

  revalidatePath("/my");
  redirect("/my?applied=1");
}
