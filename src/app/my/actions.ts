"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_MAX_CHARS, REVIEW_MIN_CHARS, isPastDeadline } from "@/lib/site";
import { getSettings } from "@/lib/settings";

export type ReviewState = { ok?: boolean; error?: string; savedAt?: string };

async function requireAcceptedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "로그인이 필요합니다." };
  const [{ data: app }, settings] = await Promise.all([
    supabase.from("applications").select("status").eq("user_id", user.id).maybeSingle(),
    getSettings(supabase),
  ]);
  if (app?.status !== "accepted" || !settings.reading_open) {
    return { supabase, user: null, error: "선정된 베타리더만 베타리딩 시작 이후에 제출할 수 있습니다." };
  }
  return { supabase, user, error: null };
}

export async function saveReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  if (isPastDeadline()) return { error: "제출 기간이 끝났습니다." };
  const review = String(formData.get("review") ?? "").trim();
  const len = review.length;
  if (len < REVIEW_MIN_CHARS) return { error: `소감은 ${REVIEW_MIN_CHARS}자 이상 작성해 주세요. (현재 ${len}자)` };
  if (len > REVIEW_MAX_CHARS) return { error: `소감은 ${REVIEW_MAX_CHARS}자 이하로 줄여 주세요. (현재 ${len}자)` };

  const { supabase, user, error } = await requireAcceptedUser();
  if (!user) return { error: error ?? "권한이 없습니다." };

  const now = new Date().toISOString();
  const { error: dbError } = await supabase.from("submissions").upsert(
    { user_id: user.id, review, review_submitted_at: now },
    { onConflict: "user_id" },
  );
  if (dbError) return { error: `저장하지 못했습니다. (${dbError.message})` };

  revalidatePath("/my");
  return { ok: true, savedAt: now };
}

export async function recordPdf(path: string, name: string): Promise<{ error?: string }> {
  if (isPastDeadline()) return { error: "제출 기간이 끝났습니다." };
  const { supabase, user, error } = await requireAcceptedUser();
  if (!user) return { error: error ?? "권한이 없습니다." };
  if (!path.startsWith(`${user.id}/`)) return { error: "잘못된 파일 경로입니다." };

  // 이전 파일이 있으면 정리
  const { data: prev } = await supabase
    .from("submissions")
    .select("pdf_path")
    .eq("user_id", user.id)
    .maybeSingle();
  if (prev?.pdf_path && prev.pdf_path !== path) {
    await supabase.storage.from("submissions").remove([prev.pdf_path]);
  }

  const { error: dbError } = await supabase.from("submissions").upsert(
    { user_id: user.id, pdf_path: path, pdf_name: name, pdf_uploaded_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (dbError) return { error: `기록하지 못했습니다. (${dbError.message})` };
  revalidatePath("/my");
  return {};
}

export async function removePdf(): Promise<{ error?: string }> {
  if (isPastDeadline()) return { error: "제출 기간이 끝났습니다." };
  const { supabase, user, error } = await requireAcceptedUser();
  if (!user) return { error: error ?? "권한이 없습니다." };

  const { data: sub } = await supabase
    .from("submissions")
    .select("pdf_path")
    .eq("user_id", user.id)
    .maybeSingle();
  if (sub?.pdf_path) {
    await supabase.storage.from("submissions").remove([sub.pdf_path]);
  }
  const { error: dbError } = await supabase
    .from("submissions")
    .update({ pdf_path: null, pdf_name: null, pdf_uploaded_at: null })
    .eq("user_id", user.id);
  if (dbError) return { error: dbError.message };
  revalidatePath("/my");
  return {};
}
