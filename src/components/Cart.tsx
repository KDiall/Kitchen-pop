"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readCart, setQty, type CartItem } from "@/lib/cart";

export function Cart() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener("cart:change", sync);
    return () => window.removeEventListener("cart:change", sync);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price_cents * i.qty, 0);

  const itemCount = items.reduce((n, i) => n + i.qty, 0);

  if (items.length === 0) {
    return (
      <aside
        className="bg-white rounded-xl p-6 border border-stone-200/80 sticky top-24 h-fit"
        style={{
          animation: "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-stone-900">Your order</h2>
          <span className="text-[11px] uppercase tracking-wider text-stone-400">
            Empty
          </span>
        </div>
        <p className="mt-4 text-sm text-stone-500 leading-relaxed">
          Browse today&apos;s menu and add a few dishes to get started.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="bg-white rounded-xl border border-stone-200/80 sticky top-24 h-fit overflow-hidden shadow-sm"
      style={{
        animation: "slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
      }}
    >
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-stone-900">Your order</h2>
        <span className="text-[11px] uppercase tracking-wider text-orange-700 font-semibold tabular-nums">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
      <ul className="px-6 divide-y divide-stone-100">
        {items.map((i, idx) => (
          <li
            key={i.id}
            className="py-3 flex items-center justify-between gap-3"
            style={{
              animation: `slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + idx * 0.05}s both`,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-stone-900 leading-snug">
                {i.name}
              </p>
              <p className="text-xs text-stone-500 tabular-nums mt-0.5">
                {(i.price_cents / 100).toFixed(2)} ea
              </p>
            </div>
            <div className="flex items-center shrink-0 rounded-md ring-1 ring-stone-200">
              <button
                aria-label="Decrease"
                className="w-7 h-7 text-stone-500 hover:text-orange-700 hover:bg-orange-50 rounded-l-md transition-colors"
                onClick={() => setQty(i.id, i.qty - 1)}
              >
                −
              </button>
              <span className="w-7 text-center text-sm tabular-nums font-medium">
                {i.qty}
              </span>
              <button
                aria-label="Increase"
                className="w-7 h-7 text-stone-500 hover:text-orange-700 hover:bg-orange-50 rounded-r-md transition-colors"
                onClick={() => setQty(i.id, i.qty + 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-6 pt-4 pb-6 bg-gradient-to-b from-orange-50/40 to-orange-50/70 border-t border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-stone-600">Subtotal</span>
          <span className="font-serif text-2xl tabular-nums text-stone-900">
            <span className="text-xs text-orange-700 mr-1.5 font-semibold">
              NLe
            </span>
            {(subtotal / 100).toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full bg-orange-700 hover:bg-orange-800 text-white rounded-md py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_4px_12px_-4px_rgba(194,65,12,0.3)] active:scale-[0.98]"
        >
          Continue to checkout
          <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>
    </aside>
  );
}
