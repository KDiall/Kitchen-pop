"use client";

import { useState } from "react";

type Order = {
  id: string;
  code: string;
  phone: string;
  total_cents: number;
  status: string;
  created_at: string;
};

type Props = {
  orders: Order[];
  prepList: [string, number][];
  totalItems: number;
  totalRevenue: number;
};

const TABS = ["All", "Pending", "Paid", "Delivered"] as const;
type Tab = (typeof TABS)[number];

function statusBadge(s: string) {
  switch (s) {
    case "delivered":
      return "text-stone-500 bg-stone-50 ring-1 ring-stone-200";
    case "paid":
      return "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
    default:
      return "text-amber-700 bg-amber-50 ring-1 ring-amber-200";
  }
}

export function AdminOrdersPanel({
  orders,
  prepList,
  totalItems,
  totalRevenue,
}: Props) {
  const [tab, setTab] = useState<Tab>("All");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered =
    tab === "All" ? orders : orders.filter((o) => o.status === tab.toLowerCase());

  async function markDelivered(order: Order) {
    setPendingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
      });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs uppercase tracking-[0.15em] font-semibold px-3 py-1.5 rounded-md transition-all ${
              tab === t
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-stone-200/70 rounded-xl overflow-hidden border border-stone-200/70 mb-12 shadow-sm">
        <div className="bg-white p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-sky-700 font-semibold">
            Orders
          </p>
          <p className="font-serif text-5xl mt-1.5 tabular-nums text-stone-900">
            {orders.length}
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

      {/* Prep list */}
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

      {/* Orders table */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-2xl text-stone-900">All orders</h2>
          <span className="text-[11px] uppercase tracking-[0.15em] text-stone-400">
            Most recent first
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="border border-stone-200/80 rounded-xl p-10 text-center text-sm text-stone-500 bg-white">
            {tab === "All" ? "Nothing yet." : `No ${tab.toLowerCase()} orders.`}
          </div>
        ) : (
          <ul className="bg-white border border-stone-200/80 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-sm">
            {filtered.map((o) => (
              <li
                key={o.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-stone-50/40 transition-colors"
              >
                <span
                  className={`font-serif text-xl tracking-[0.1em] ${
                    o.status === "paid"
                      ? "text-emerald-700"
                      : o.status === "delivered"
                      ? "text-stone-400 line-through"
                      : "text-amber-600"
                  }`}
                >
                  {o.code}
                </span>
                <span className="text-stone-500 text-xs tabular-nums">
                  {o.phone}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${statusBadge(
                    o.status
                  )}`}
                >
                  {o.status}
                </span>
                <span className="tabular-nums text-sm font-medium text-stone-900">
                  <span className="text-xs text-emerald-700 mr-1 font-semibold">
                    NLe
                  </span>
                  {(o.total_cents / 100).toFixed(2)}
                </span>
                {o.status === "paid" && (
                  <button
                    disabled={pendingId === o.id}
                    onClick={() => markDelivered(o)}
                    className="text-[10px] uppercase tracking-[0.12em] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition-colors disabled:opacity-40"
                  >
                    {pendingId === o.id ? "…" : "✓ Delivered"}
                  </button>
                )}
                {o.status === "delivered" && (
                  <span className="text-[10px] uppercase tracking-[0.12em] text-stone-400">
                    ✔ Done
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
