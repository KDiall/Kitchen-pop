import { db } from "@/lib/notifier";
import { MenuCard } from "@/components/MenuCard";
import { Cart } from "@/components/Cart";
import { WorldDishes } from "@/components/WorldDishes";

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
      <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade-in">
        <div className="text-6xl mb-6 animate-float">🍳</div>
        <h1 className="font-serif text-3xl text-stone-900">No menu today</h1>
        <p className="text-sm text-stone-500 mt-3">
          The kitchen hasn&apos;t published yet. Check back soon.
        </p>
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
    const dateStr = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    return (
      <>
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_340px] gap-10">
          <section>
            <div
              className="mb-10 pb-6 border-b border-stone-200/80 relative"
              style={{
                animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              <div className="absolute -top-6 -left-10 w-48 h-48 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-4 left-40 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-orange-700 font-semibold">
                    {dateStr}
                  </span>
                  <span className="h-px flex-1 bg-stone-200" />
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 ping-slow" />
                      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                    </span>
                    Open until {cutoffStr}
                  </span>
                </div>
                <h1 className="font-serif text-6xl tracking-tight text-stone-900 leading-[1.02]">
                  Today&apos;s{" "}
                  <span className="italic text-orange-700">menu</span>
                </h1>
                <p className="text-stone-600 mt-5 max-w-md leading-relaxed">
                  Freshly cooked Sierra Leonean classics. Order before cutoff, pay
                  by mobile money, pick up hot.
                </p>
              </div>
            </div>
            {items && items.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {items.map((item, i) => (
                  <MenuCard key={item.id} item={item} index={i} />
                ))}
              </div>
            )}
          </section>
          <Cart />
        </div>
        <WorldDishes />
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade-in">
      <div className="text-6xl mb-6 animate-float">🌙</div>
      <h1 className="font-serif text-3xl text-stone-900">Closed for today</h1>
      <p className="text-sm text-stone-500 mt-3">
        New menu opens tomorrow morning.
      </p>
      <WorldDishes preview />
    </div>
  );
}
