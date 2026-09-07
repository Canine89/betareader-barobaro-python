import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvCell(v: unknown) {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return new NextResponse("forbidden", { status: 403 });

  const [{ data: apps }, { data: subs }] = await Promise.all([
    supabase.from("applications").select("*").order("created_at"),
    supabase.from("submissions").select("*"),
  ]);
  const subByUser = new Map((subs ?? []).map((s) => [s.user_id, s]));

  const header = ["이름", "연락처", "주소", "이메일", "상태", "신청일", "소감 제출", "PDF 파일명", "PDF 업로드", "소감"];
  const rows = (apps ?? []).map((a) => {
    const s = subByUser.get(a.user_id);
    return [
      a.name, a.phone, a.address, a.email, a.status, a.created_at,
      s?.review_submitted_at ?? "", s?.pdf_name ?? "", s?.pdf_uploaded_at ?? "", s?.review ?? "",
    ].map(csvCell).join(",");
  });
  const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="betareaders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
