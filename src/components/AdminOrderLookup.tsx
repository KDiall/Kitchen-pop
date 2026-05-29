"use client";

import { useState } from "react";

type Item = { name: string; qty: number; price_cents: number };
type Order = {
  code: string;
  phone: string;
  total_cents: number;
  status: string;
  created_at: string;
  items: Item[];
};

function statusStyles(s: string) {
  switch (s) {
    case "delivered":
      return "text-stone-500 bg-stone-50 ring-1 ring-stone-200";
    case "paid":
      return "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
    default:
      return "text-amber-700 bg-amber-50 ring-1 ring-amber-200";
  }
}

export function AdminOrderLookup() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(
        `/api/admin/order-lookup?code=${encodeURIComponent(code.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Not found");
      } else {
        setOrder(data);
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-2xl text-stone-900">Verify code</h2>
        <span className="text-[11px] uppercase tracking-[0.15em] text-stone-400">
          Lookup by pickup code
        </span>
      </div>

      <form
        onSubmit={lookup}
        className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code (e.g. BQ74)"
            maxLength={4}
            className="flex-1 rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-sm uppercase tracking-[0.15em] font-semibold outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/15 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-orange-700 hover:bg-orange-800 text-white rounded-md px-5 py-2.5 text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "…" : "Look up"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-5 border-t border-stone-100 pt-5">
            <div className="flex items-center gap-4 mb-4">
              <span className="font-serif text-3xl tracking-[0.12em] text-stone-900">
                {order.code}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full ${statusStyles(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="text-xs text-stone-500 mb-4 space-y-1">
              <p>Phone: {order.phone}</p>
              <p>
                Date:{" "}
                {new Date(order.created_at).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <ul className="divide-y divide-stone-100 border-t border-stone-200">
              {order.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 py-2.5 text-sm"
                >
                  <span className="text-orange-700 font-semibold tabular-nums w-6 shrink-0">
                    {item.qty}×
                  </span>
                  <span className="flex-1 text-stone-800">{item.name}</span>
                  <span className="tabular-nums text-stone-900">
                    {(item.price_cents / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-stone-200">
              <span className="text-sm text-stone-600 font-medium">Total</span>
              <span className="font-serif text-xl tabular-nums text-stone-900">
                <span className="text-xs text-orange-700 mr-1 font-semibold">
                  NLe
                </span>
                {(order.total_cents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
