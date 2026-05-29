import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/notifier";
import { generateCode } from "@/lib/codes";
import { createCheckout } from "@/lib/monime";

type Body = {
  phone: string;
  items: { id: string; name: string; price_cents: number; qty: number }[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (!body.phone || !body.items?.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const total = body.items.reduce(
    (s, i) => s + i.price_cents * i.qty,
    0
  );

  const code = generateCode();
  const reference = crypto.randomUUID();

  const { data: order, error } = await db
    .from("orders")
    .insert({
      code,
      reference,
      phone: body.phone,
      total_cents: total,
      status: "pending",
    })
    .select("id, code, reference")
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 }
    );
  }

  await db.from("order_items").insert(
    body.items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.id,
      name: i.name,
      price_cents: i.price_cents,
      qty: i.qty,
    }))
  );

  const url = new URL(req.url);

  let redirect_url: string | null = null;
  try {
    const monime = await createCheckout({
      code: order.code,
      reference,
      phone: body.phone,
      items: body.items,
      baseUrl: `${url.protocol}//${url.host}`,
    });
    redirect_url = monime.redirect_url;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment initiation failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    code: order.code,
    redirect_url,
  });
}
