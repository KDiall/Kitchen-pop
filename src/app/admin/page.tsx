import { db } from "@/lib/notifier";
import { AdminMenuPanel } from "@/components/AdminMenuPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayMenu } = await db
    .from("menus")
    .select("id, cutoff_at")
    .eq("served_on", today)
    .maybeSingle();

  const { data: menuItems } = todayMenu
    ? await db
        .from("menu_items")
        .select("id, name, price_cents, available")
        .eq("menu_id", todayMenu.id)
        .order("name")
    : { data: [] };

  const { data: allOrders } = await db
    .from("orders")
    .select("id, code, phone, total_cents, status, created_at")
    .order("created_at", { ascending: false });

  const paidOrders = (allOrders ?? []).filter((o) => o.status === "paid");
  const paidIds = paidOrders.map((o) => o.id);

  const itemsResult = paidIds.length
    ? await db
        .from("order_items")
        .select("order_id, name, qty")
        .in("order_id", paidIds)
    : { data: [] };

  const items = itemsResult.data ?? [];

  const prepTotals = new Map<string, number>();
  for (const item of items) {
    prepTotals.set(item.name, (prepTotals.get(item.name) ?? 0) + item.qty);
  }

  const prepList = Array.from(prepTotals.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const totalRevenue = paidOrders.reduce(
    (s, o) => s + o.total_cents,
    0
  );
  const totalItems = Array.from(prepTotals.values()).reduce(
    (s, n) => s + n,
    0
  );

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 pb-6 border-b border-stone-200/80">
        <span className="text-[11px] uppercase tracking-[0.2em] text-orange-700 font-semibold">
          {dateStr}
        </span>
        <h1 className="font-serif text-5xl tracking-tight text-stone-900 mt-2 leading-tight">
          Kitchen <span className="italic text-orange-700">dashboard</span>
        </h1>
        <p className="text-sm text-stone-500 mt-3">
          Manage today’s menu and view paid orders.
        </p>
      </div>

      <AdminMenuPanel
        initialMenuId={todayMenu?.id ?? null}
        initialCutoffAt={todayMenu?.cutoff_at ?? null}
        initialItems={menuItems ?? []}
      />

      <div className="grid grid-cols-3 gap-px bg-stone-200/70 rounded-xl overflow-hidden border border-stone-200/70 mb-12 shadow-sm">
        <div className="bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-sky-700 font-semibold">
            Orders
          </p>
          <p className="font-serif text-5xl mt-1.5 tabular-nums text-stone-900">
            {(allOrders ?? []).length}
          </p>
        </div>
        <div className="bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-amber-700 font-semibold">
            Items
          </p>
          <p className="font-serif text-5xl mt-1.5 tabular-nums text-stone-900">
            {totalItems}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50/60 to-white p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-700 font-semibold">
            Revenue
          </p>
          <p className="font-serif text-5xl mt-1.5 tabular-nums text-stone-900">
            <span className="text-sm text-emerald-700 mr-1.5 font-semibold align-baseline">
              NLe
            </span>
            {(totalRevenue / 100).toFixed(0)}
          </p>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-2xl text-stone-900">Prep list</h2>
          <span className="text-[11px] uppercase tracking-[0.15em] text-stone-400">
            By dish
          </span>
        </div>
        {prepList.length === 0 ? (
          <div className="border border-stone-200/80 rounded-xl p-10 text-center text-sm text-stone-500 bg-white">
            No paid orders yet.
          </div>
        ) : (
          <ul className="bg-white border border-stone-200/80 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-sm">
            {prepList.map(([name, qty]) => (
              <li
                key={name}
                className="flex items-center px-5 py-3.5 hover:bg-orange-50/40 transition-colors gap-4"
              >
                <span className="text-sm text-stone-900 flex-1">{name}</span>
                <span className="tabular-nums text-xs font-semibold text-orange-700 bg-orange-50 ring-1 ring-orange-200 px-2 py-0.5 rounded-full">
                  ×{qty}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-2xl text-stone-900">All orders</h2>
          <span className="text-[11px] uppercase tracking-[0.15em] text-stone-400">
            Most recent first
          </span>
        </div>
        {(allOrders ?? []).length === 0 ? (
          <div className="border border-stone-200/80 rounded-xl p-10 text-center text-sm text-stone-500 bg-white">
            Nothing yet.
          </div>
        ) : (
          <ul className="bg-white border border-stone-200/80 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-sm">
            {(allOrders ?? []).map((o) => (
              <li
                key={o.id}
                className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-stone-50/40 transition-colors"
              >
                <span className={`font-serif text-xl tracking-[0.1em] ${o.status === "paid" ? "text-emerald-700" : "text-amber-600"}`}>
                  {o.code}
                </span>
                <span className="text-stone-500 text-xs tabular-nums">
                  {o.phone}
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${o.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                  {o.status}
                </span>
                <span className="tabular-nums text-sm font-medium text-stone-900">
                  <span className="text-xs text-emerald-700 mr-1 font-semibold">NLe</span>
                  {(o.total_cents / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
