import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";

export async function GET() {
  const { data, error } = await db
    .from("menu_items")
    .select("name, price_cents, menu_id")
    .order("name");

  if (error) {
    return NextResponse.json({ items: [] });
  }

  const seen = new Map<string, number>();
  for (const row of data ?? []) {
    if (!seen.has(row.name)) {
      seen.set(row.name, row.price_cents);
    }
  }

  const items = Array.from(seen.entries())
    .map(([name, price_cents]) => ({ name, price_cents }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ items });
}
