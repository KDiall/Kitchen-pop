import { db } from "@/lib/notifier";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: orders } = await db
    .from("orders")
    .select("id, code, phone, total_cents, status, created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  const orderIds = (orders ?? []).map((o) => o.id);

  const itemsResult = orderIds.length
    ? await db
        .from("order_items")
        .select("order_id, name, qty")
        .in("order_id", orderIds)
    : { data: [] };

  const items = itemsResult.data ?? [];

  const prepTotals = new Map<string, number>();
  for (const item of items) {
    prepTotals.set(item.name, (prepTotals.get(item.name) ?? 0) + item.qty);
  }

  const prepList = Array.from(prepTotals.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Prep List</h1>
      {prepList.length === 0 ? (
        <p className="text-gray-500">No paid orders yet.</p>
      ) : (
        <ul className="bg-white rounded-xl border border-gray-100 divide-y">
          {prepList.map(([name, qty]) => (
            <li key={name} className="flex justify-between p-4">
              <span className="font-medium">{name}</span>
              <span className="font-mono">×{qty}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-10 mb-3">Paid Orders</h2>
      {(orders ?? []).length === 0 ? (
        <p className="text-gray-500 text-sm">Nothing yet.</p>
      ) : (
        <ul className="space-y-2">
          {(orders ?? []).map((o) => (
            <li
              key={o.id}
              className="bg-white rounded-lg border border-gray-100 p-3 flex justify-between text-sm"
            >
              <div>
                <span className="font-mono font-semibold">{o.code}</span>
                <span className="text-gray-500 ml-3">{o.phone}</span>
              </div>
              <span>NLe {(o.total_cents / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
