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
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">No menu published yet</h1>
      </main>
    );
  }

  const now = new Date();
  const cutoff = new Date(menu.cutoff_at);

  if (now > cutoff) {
    const { data: items } = await db
      .from("menu_items")
      .select("id, name, price_cents")
      .eq("menu_id", menu.id)
      .eq("available", true)
      .order("name");

    return (
      <main className="max-w-5xl mx-auto p-6 grid md:grid-cols-[1fr_320px] gap-6">
        <section>
          <header className="mb-6">
            <h1 className="text-3xl font-bold">Today&apos;s Menu</h1>
            <p className="text-sm text-gray-600">
              Orders close at{" "}
              {cutoff.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </header>
          <div className="grid sm:grid-cols-2 gap-4">
            {items?.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </section>
        <Cart />
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-semibold">Closed for today</h1>
      <p className="text-sm text-gray-600 mt-2">Check back tomorrow.</p>
    </main>
  );
}
