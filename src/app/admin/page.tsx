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

  const totalRevenue = (orders ?? []).reduce(
    (s, o) => s + o.total_cents,
    0
  );
  const totalItems = Array.from(prepTotals.values()).reduce(
    (s, n) => s + n,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Kitchen dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Live view of paid orders. Refresh to update.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-10">
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Orders
          </p>
          <p className="text-2xl font-semibold mt-1 tabular-nums">
            {(orders ?? []).length}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            Items
          </p>
          <p className="text-2xl font-semibold mt-1 tabular-nums">
            {totalItems}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-700">
            Revenue
          </p>
          <p className="text-2xl font-semibold mt-1 tabular-nums text-emerald-900">
            <span className="text-sm text-emerald-600 font-normal">NLe </span>
            {(totalRevenue / 100).toFixed(0)}
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">
          Prep list
        </h2>
        {prepList.length === 0 ? (
          <div className="border border-neutral-200 rounded-lg p-8 text-center text-sm text-neutral-500">
            No paid orders yet.
          </div>
        ) : (
          <ul className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200 overflow-hidden">
            {prepList.map(([name, qty]) => (
              <li
                key={name}
                className="flex justify-between items-center px-4 py-3 hover:bg-emerald-50/40 transition-colors"
              >
                <span className="text-sm text-neutral-900">{name}</span>
                <span className="tabular-nums text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ×{qty}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">
          Paid orders
        </h2>
        {(orders ?? []).length === 0 ? (
          <div className="border border-neutral-200 rounded-lg p-8 text-center text-sm text-neutral-500">
            Nothing yet.
          </div>
        ) : (
          <ul className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-200 overflow-hidden">
            {(orders ?? []).map((o) => (
              <li
                key={o.id}
                className="flex justify-between items-center px-4 py-3 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-sm tracking-wider text-emerald-700">
                    {o.code}
                  </span>
                  <span className="text-neutral-500 text-xs">{o.phone}</span>
                </div>
                <span className="tabular-nums text-sm font-medium">
                  NLe {(o.total_cents / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
