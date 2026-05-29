import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/notifier";
import { createCheckout } from "@/lib/monime";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const { data: order } = await db
    .from("orders")
    .select("id, code, reference, phone, total_cents, status")
    .eq("code", code)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "paid" || order.status === "delivered") {
    return NextResponse.json(
      { error: "Order is already paid" },
      { status: 400 }
    );
  }

  const { data: items } = await db
    .from("order_items")
    .select("name, price_cents, qty")
    .eq("order_id", order.id);

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Order has no items" }, { status: 400 });
  }

  const newReference = crypto.randomUUID();

  await db
    .from("orders")
    .update({ reference: newReference })
    .eq("id", order.id);

  const url = new URL(_req.url);

  let redirect_url: string | null = null;
  try {
    const monime = await createCheckout({
      code: order.code,
      reference: newReference,
      items: items.map((i) => ({
        name: i.name,
        price_cents: i.price_cents,
        qty: i.qty,
      })),
      baseUrl: `${url.protocol}//${url.host}`,
    });
    redirect_url = monime.redirect_url;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Payment initiation failed",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ redirect_url });
}
