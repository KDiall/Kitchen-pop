import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: order, error: fetchError } = await db
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Can only mark paid orders as delivered" },
      { status: 400 }
    );
  }

  const { error } = await db
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
