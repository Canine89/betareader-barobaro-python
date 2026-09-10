import type { SupabaseClient } from "@supabase/supabase-js";

/** 관리자가 켜고 끄는 사이트 설정 (site_settings 단일 행) */
export type SiteSettings = { reading_open: boolean; updated_at: string };

export async function getSettings(supabase: SupabaseClient): Promise<SiteSettings> {
  const { data } = await supabase.from("site_settings").select("reading_open, updated_at").eq("id", 1).maybeSingle();
  return data ?? { reading_open: false, updated_at: "" };
}
