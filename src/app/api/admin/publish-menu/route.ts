import { NextResponse } from "next/server";
import { db } from "@/lib/notifier";

export async function POST(req: Request) {
  const today = new Date().toISOString().slice(0, 10);
  const body = await req.json().catch(() => ({}));

  const cutoffAt: string = body.cutoffIso
    ? body.cutoffIso
    : new Date(`${today}T23:59:00`).toISOString();

  const { data: existing } = await db
    .from("menus")
    .select("id, cutoff_at")
    .eq("served_on", today)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, menuId: existing.id, cutoffAt: existing.cutoff_at, date: today });
  }

  const { data: inserted, error } = await db
    .from("menus")
    .insert({ served_on: today, cutoff_at: cutoffAt })
    .select("id, cutoff_at")
    .single();

  if (error || !inserted) {
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, menuId: inserted.id, cutoffAt: inserted.cutoff_at, date: today });
}

export async function PATCH(req: Request) {
  const { menuId, cutoffIso } = await req.json();
  if (!menuId || !cutoffIso) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await db
    .from("menus")
    .update({ cutoff_at: cutoffIso })
    .eq("id", menuId);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
