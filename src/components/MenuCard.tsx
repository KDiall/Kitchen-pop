"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type Props = {
  item: { id: string; name: string; price_cents: number };
};

export function MenuCard({ item }: Props) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div className="group bg-white rounded-xl border border-stone-200/80 hover:border-orange-300 hover:shadow-[0_2px_16px_-4px_rgba(194,65,12,0.12)] transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl leading-snug text-stone-900 flex-1">
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
          <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold">
            NLe
          </span>
          <button
            onClick={handleAdd}
            disabled={added}
            className={`text-sm rounded-md px-4 py-1.5 font-medium transition-all ${
              added
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-orange-700 text-white hover:bg-orange-800 shadow-sm"
            }`}
          >
            {added ? "✓ Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
