"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Status = "pending" | "accepted" | "rejected";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("관리자만 사용할 수 있습니다.");
  return supabase;
}

export async function setStatus(formData: FormData) {
  const userId = String(formData.get("user_id") ?? "");
  const status = String(formData.get("status") ?? "") as Status;
  if (!userId || !["pending", "accepted", "rejected"].includes(status)) return;
  const supabase = await requireAdmin();
  await supabase.from("applications").update({ status }).eq("user_id", userId);
  revalidatePath("/admin");
}

export async function acceptAllPending() {
  const supabase = await requireAdmin();
  await supabase.from("applications").update({ status: "accepted" }).eq("status", "pending");
  revalidatePath("/admin");
}

export async function refreshAdmin() {
  revalidatePath("/admin");
}
