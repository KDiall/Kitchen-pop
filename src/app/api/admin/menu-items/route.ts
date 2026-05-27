import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";

export async function POST(req: Request) {
  const { menu_id, name, price_cents } = await req.json();

  if (!menu_id || !name?.trim() || !price_cents) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await db
    .from("menu_items")
    .insert({ menu_id, name: name.trim(), price_cents, available: true })
    .select("id, name, price_cents, available")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
