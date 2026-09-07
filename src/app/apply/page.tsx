import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "베타리더 신청" };

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/apply");

  const { data: app } = await supabase
    .from("applications")
    .select("name, phone, address, email, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const defaults = {
    name: app?.name ?? meta.full_name ?? meta.name ?? "",
    phone: app?.phone ?? "",
    address: app?.address ?? "",
    email: app?.email ?? user.email ?? "",
  };

  return (
    <>
      <Nav />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {app ? "신청 정보 수정" : "베타리더 신청"}
          </h1>
          <p className="mt-3 max-w-[44ch] leading-relaxed text-[var(--muted)]">
            {app
              ? "배송지나 연락처가 바뀌었다면 여기서 고칠 수 있습니다."
              : "종이책을 보내 드릴 정보를 적어 주세요. 2분이면 끝납니다."}
          </p>
          <div className="mt-10">
            <ApplyForm defaults={defaults} isEdit={!!app} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
