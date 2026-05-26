import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";
import { verifyWebhook } from "@/lib/monime";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("monime-signature") ?? "";

  if (!verifyWebhook(raw, signature)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const payload = JSON.parse(raw);

  if (payload.event !== "payment.succeeded") {
    return NextResponse.json({ ok: true });
  }

  const { error } = await db
    .from("orders")
    .update({ status: "paid" })
    .eq("id", payload.data.id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
