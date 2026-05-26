import { db } from "@/lib/notifier";
import { MenuCard } from "@/components/MenuCard";
import { Cart } from "@/components/Cart";

export const dynamic = "force-dynamic";

export default async function Page() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: menu } = await db
    .from("menus")
    .select("id, cutoff_at")
    .eq("served_on", today)
    .maybeSingle();

  if (!menu) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="border border-neutral-200 rounded-lg p-12 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">
            No menu today
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            The kitchen hasn&apos;t published a menu yet. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const cutoff = new Date(menu.cutoff_at);

  if (now < cutoff) {
    const { data: items } = await db
      .from("menu_items")
      .select("id, name, price_cents")
      .eq("menu_id", menu.id)
      .eq("available", true)
      .order("name");

    const cutoffStr = cutoff.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_320px] gap-8">
        <section>
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Open · closes {cutoffStr}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mt-3">
              Today&apos;s menu
            </h1>
            <p className="text-sm text-neutral-500 mt-1.5">
              Freshly cooked Sierra Leonean dishes. Pay by mobile money, pick up hot.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {items?.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </section>
        <Cart />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="border border-neutral-200 rounded-lg p-12 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">
          Closed for today
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          New menu opens tomorrow morning.
        </p>
      </div>
    </div>
  );
}
