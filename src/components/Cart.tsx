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
      <aside className="bg-white rounded-lg p-5 border border-neutral-200 sticky top-20 h-fit">
        <h2 className="text-sm font-semibold text-neutral-900">Your order</h2>
        <p className="mt-3 text-sm text-neutral-500">No items yet.</p>
      </aside>
    );
  }

  return (
    <aside className="bg-white rounded-lg p-5 border border-neutral-200 sticky top-20 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-neutral-900">Your order</h2>
        <span className="text-xs text-neutral-500">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-neutral-900">{i.name}</p>
              <p className="text-xs text-neutral-500 tabular-nums mt-0.5">
                NLe {((i.price_cents * i.qty) / 100).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 border border-neutral-200 rounded-md">
              <button
                aria-label="Decrease"
                className="w-7 h-7 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                onClick={() => setQty(i.id, i.qty - 1)}
              >
                −
              </button>
              <span className="w-6 text-center text-sm tabular-nums">
                {i.qty}
              </span>
              <button
                aria-label="Increase"
                className="w-7 h-7 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
                onClick={() => setQty(i.id, i.qty + 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 pt-4 border-t border-neutral-200 flex items-center justify-between">
        <span className="text-sm text-neutral-600">Subtotal</span>
        <span className="text-sm font-semibold tabular-nums">
          NLe {(subtotal / 100).toFixed(2)}
        </span>
      </div>
      <button
        onClick={() => router.push("/checkout")}
        className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2.5 text-sm font-medium transition-colors"
      >
        Checkout
      </button>
    </aside>
  );
}
