import { db } from "@/lib/notifier";
import { AdminMenuPanel } from "@/components/AdminMenuPanel";
import { AdminOrdersPanel } from "@/components/AdminOrdersPanel";

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

  const ordersNeedingPrep = (allOrders ?? []).filter(
    (o) => o.status === "paid"
  );
  const prepOrderIds = ordersNeedingPrep.map((o) => o.id);

  const itemsResult = prepOrderIds.length
    ? await db
        .from("order_items")
        .select("order_id, name, qty")
        .in("order_id", prepOrderIds)
    : { data: [] };

  const items = itemsResult.data ?? [];

  const prepTotals = new Map<string, number>();
  for (const item of items) {
    prepTotals.set(item.name, (prepTotals.get(item.name) ?? 0) + item.qty);
  }

  const prepList = Array.from(prepTotals.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const allPaid = (allOrders ?? []).filter((o) => o.status === "paid");
  const totalRevenue = allPaid.reduce((s, o) => s + o.total_cents, 0);
  const totalItems = Array.from(prepTotals.values()).reduce((s, n) => s + n, 0);

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
          Manage today&rsquo;s menu, mark orders as delivered.
        </p>
      </div>

      <AdminMenuPanel
        initialMenuId={todayMenu?.id ?? null}
        initialCutoffAt={todayMenu?.cutoff_at ?? null}
        initialItems={menuItems ?? []}
      />

      <AdminOrdersPanel
        orders={allOrders ?? []}
        prepList={prepList}
        totalItems={totalItems}
        totalRevenue={totalRevenue}
      />
    </div>
  );
}
