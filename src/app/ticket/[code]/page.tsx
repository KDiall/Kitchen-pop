import { db } from "@/lib/notifier";
import { TicketView } from "@/components/TicketView";

export const dynamic = "force-dynamic";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const { data: order } = await db
    .from("orders")
    .select("id, code, phone, total_cents, status, created_at")
    .eq("code", code)
    .maybeSingle();

  if (!order) {
    return (
      <main className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold">Ticket not found</h1>
      </main>
    );
  }

  const { data: items } = await db
    .from("order_items")
    .select("name, qty, price_cents")
    .eq("order_id", order.id);

  return <TicketView order={order} items={items ?? []} />;
}
