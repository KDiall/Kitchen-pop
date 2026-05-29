import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";
import { verifyWebhook } from "@/lib/monime";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature =
    req.headers.get("monime-signature") ??
    req.headers.get("x-monime-signature") ??
    "";

  if (!signature) {
    const all: Record<string, string> = {};
    req.headers.forEach((v, k) => { all[k] = v; });
    console.error("[webhook] no signature header found", all);
  }

  const ok = verifyWebhook(raw, signature);
  if (!ok) {
    console.error("[webhook] bad signature", {
      signature: signature.slice(0, 60),
      hasSecret: !!process.env.MONIME_WEBHOOK_SECRET,
    });
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const payload = JSON.parse(raw);
  const eventName =
    typeof payload.event === "string"
      ? payload.event
      : payload.event?.name;

  if (eventName !== "checkout_session.completed" && eventName !== "payment.succeeded") {
    console.error("[webhook] unhandled event", { eventName });
    return NextResponse.json({ ok: true });
  }

  const reference = payload.data?.reference;
  if (!reference) {
    console.error("[webhook] missing reference");
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const { error } = await db
    .from("orders")
    .update({ status: "paid" })
    .eq("reference", reference);

  if (error) {
    console.error("[webhook] db update failed", { reference, error });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
