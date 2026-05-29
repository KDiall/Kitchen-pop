import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const { data } = await db
    .from("orders")
    .select("status")
    .eq("code", code)
    .maybeSingle();

  return NextResponse.json({
    status: data?.status ?? "unknown",
  });
}
