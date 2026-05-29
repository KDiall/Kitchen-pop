import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const { data: order, error } = await db
    .from("orders")
    .select("id, code, phone, total_cents, status, created_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: items } = await db
    .from("order_items")
    .select("name, qty, price_cents")
    .eq("order_id", order.id);

  return NextResponse.json({ ...order, items: items ?? [] });
}
