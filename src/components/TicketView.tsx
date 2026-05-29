"use client";

import { useEffect, useState, useCallback } from "react";

type Order = {
  code: string;
  phone: string;
  total_cents: number;
  status: string;
  created_at: string;
};

type Item = {
  name: string;
  qty: number;
  price_cents: number;
};

export function TicketView({
  order: initial,
  items,
}: {
  order: Order;
  items: Item[];
}) {
  const [order, setOrder] = useState(initial);
  const [retrying, setRetrying] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/ticket/${order.code}/status`);
      const data = await res.json();
      if (data.status === "paid") {
        setOrder((prev) => ({ ...prev, status: "paid" }));
      }
    } catch {
      // ignore
    }
  }, [order.code]);

  useEffect(() => {
    if (order.status !== "paid") {
      const id = setInterval(poll, 3000);
      return () => clearInterval(id);
    }
  }, [order.status, poll]);

  useEffect(() => {
    if (order.status !== "paid") {
      const created = new Date(order.created_at).getTime();
      const elapsed = Date.now() - created;
      if (elapsed >= 240_000) {
        setShowRetry(true);
      } else {
        const remaining = 240_000 - elapsed;
        const id = setTimeout(() => setShowRetry(true), remaining);
        return () => clearTimeout(id);
      }
    }
  }, [order.status, order.created_at]);

  const isPaid = order.status === "paid";

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/ticket/${order.code}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch {
      // ignore
    }
    setRetrying(false);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <span
          className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-medium px-3 py-1 rounded-full ${
            isPaid
              ? "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200"
              : "text-amber-700 bg-amber-50 ring-1 ring-amber-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPaid ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {isPaid ? "Payment received" : "Awaiting payment"}
        </span>
        <h1 className="font-serif text-5xl tracking-tight text-stone-900 mt-4 leading-tight">
          {isPaid ? (
            <>You&apos;re <span className="italic text-emerald-700">all set.</span></>
          ) : (
            <>Almost <span className="italic text-orange-700">there.</span></>
          )}
        </h1>
        <p className="text-sm text-stone-500 mt-3">
          {isPaid
            ? "Show the code below at the kitchen for pickup."
            : "Complete payment on your phone — this page will update."}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm">
        <div
          className={`px-6 py-12 text-center border-b border-dashed border-stone-200 ${
            isPaid
              ? "bg-gradient-to-b from-emerald-50/60 to-white"
              : "bg-gradient-to-b from-orange-50/60 to-white"
          }`}
        >
          <p
            className={`text-[11px] uppercase tracking-[0.2em] font-semibold ${
              isPaid ? "text-emerald-700" : "text-orange-700"
            }`}
          >
            Pickup code
          </p>
          <p className="font-serif text-8xl font-normal tracking-[0.15em] mt-3 text-stone-900">
            {order.code}
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-orange-700">
              Order
            </h3>
            <span className="text-[11px] uppercase tracking-wider text-stone-400">
              {items.length} {items.length === 1 ? "dish" : "dishes"}
            </span>
          </div>
          <ul className="divide-y divide-stone-100">
            {items.map((i, idx) => (
              <li
                key={idx}
                className="py-2.5 flex items-baseline gap-3 text-sm"
              >
                <span className="text-orange-700 font-semibold tabular-nums shrink-0 w-6">
                  {i.qty}×
                </span>
                <span className="flex-1 text-stone-800">{i.name}</span>
                <span className="tabular-nums text-stone-900 shrink-0">
                  {((i.price_cents * i.qty) / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-4 bg-gradient-to-b from-orange-50/40 to-orange-50/70 border-t border-stone-100 flex items-baseline justify-between">
          <span className="text-sm text-stone-600">Total</span>
          <span className="font-serif text-2xl tabular-nums text-stone-900">
            <span className="text-xs text-orange-700 mr-1.5 font-semibold">NLe</span>
            {(order.total_cents / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {showRetry && !isPaid && (
        <div className="mt-6 text-center">
          <p className="text-sm text-amber-700 mb-3">
            Payment session expired. Generate a new link to try again.
          </p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 text-sm rounded-md px-5 py-2.5 font-medium bg-orange-700 text-white hover:bg-orange-800 shadow-sm transition-all disabled:opacity-60"
          >
            {retrying ? "Generating…" : "Generate new code"}
          </button>
        </div>
      )}

      <p className="text-[11px] text-stone-400 text-center mt-6 tabular-nums">
        {order.phone} ·{" "}
        {new Date(order.created_at).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
