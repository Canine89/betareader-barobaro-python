"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Status = "pending" | "accepted" | "rejected";

export type StatusState = { status?: Status; error?: string; savedAt?: number };

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("관리자만 사용할 수 있습니다.");
  return supabase;
}

/** 상태 변경. 저장 후 DB에서 다시 읽은 값을 돌려주어 화면이 실제 저장 결과를 보여 주게 한다. */
export async function setStatus(prev: StatusState, formData: FormData): Promise<StatusState> {
  const userId = String(formData.get("user_id") ?? "");
  const status = String(formData.get("status") ?? "") as Status;
  if (!userId || !["pending", "accepted", "rejected"].includes(status)) {
    return { ...prev, error: "잘못된 요청입니다." };
  }
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("user_id", userId)
    .select("status")
    .maybeSingle();
  if (error) return { ...prev, error: `저장하지 못했습니다. (${error.message})` };
  if (!data) return { ...prev, error: "저장되지 않았습니다. 권한을 확인해 주세요." };
  revalidatePath("/admin");
  return { status: data.status as Status, savedAt: Date.now() };
}

export async function acceptAllPending() {
  const supabase = await requireAdmin();
  await supabase.from("applications").update({ status: "accepted" }).eq("status", "pending");
  revalidatePath("/admin");
}

export async function refreshAdmin() {
  revalidatePath("/admin");
}
