"use client";

import { useEffect, useState } from "react";
import { addToCart, readCart } from "@/lib/cart";

type Props = {
  item: { id: string; name: string; price_cents: number };
};

export function MenuCard({ item }: Props) {
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(0);

  useEffect(() => {
    const sync = () => {
      const cart = readCart();
      const found = cart.find((c) => c.id === item.id);
      setQty(found?.qty ?? 0);
    };
    sync();
    window.addEventListener("cart:change", sync);
    return () => window.removeEventListener("cart:change", sync);
  }, [item.id]);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div className="group bg-white rounded-xl border border-stone-200/80 hover:border-orange-300 hover:shadow-[0_4px_20px_-4px_rgba(194,65,12,0.15)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl leading-snug text-stone-900 flex-1 group-hover:text-orange-900 transition-colors">
            {item.name}
          </h3>
          <span className="text-sm tabular-nums text-stone-900 font-medium shrink-0">
            {(item.price_cents / 100).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-orange-700/80 mt-1.5 italic">
          Cooked fresh today
        </p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold">
              NLe
            </span>
            {qty > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold tabular-nums leading-none">
                {qty}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`text-sm rounded-md px-4 py-1.5 font-medium transition-all duration-200 ${
              added
                ? "scale-95 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-orange-700 text-white hover:bg-orange-800 active:scale-95 shadow-sm"
            }`}
          >
            {added ? "✓ Added" : qty > 0 ? "Add more" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
