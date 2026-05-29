"use client";

import { useEffect, useState } from "react";
import { addToCart, readCart } from "@/lib/cart";

type Props = {
  item: { id: string; name: string; price_cents: number };
  index?: number;
};

export function MenuCard({ item, index = 0 }: Props) {
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(0);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const sync = () => {
      const cart = readCart();
      const found = cart.find((c) => c.id === item.id);
      const nextQty = found?.qty ?? 0;
      setQty((prev) => {
        if (nextQty > prev) setBump(true);
        return nextQty;
      });
    };
    sync();
    window.addEventListener("cart:change", sync);
    return () => window.removeEventListener("cart:change", sync);
  }, [item.id]);

  useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(false), 400);
    return () => clearTimeout(t);
  }, [bump]);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div
      className="group bg-white rounded-xl border border-stone-200/80 hover:border-orange-300 transition-all duration-300 card-lift shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-8px_rgba(194,65,12,0.12)] overflow-hidden"
      style={{
        animation: `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.04 + index * 0.04}s both`,
      }}
    >
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
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold tabular-nums leading-none ${
                  bump ? "animate-cart-bump" : ""
                }`}
              >
                {qty}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`text-sm rounded-md px-4 py-1.5 font-medium transition-all duration-200 ${
              added
                ? "scale-95 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-orange-700 text-white hover:bg-orange-800 active:scale-95 shadow-sm hover:shadow-[0_2px_8px_-2px_rgba(194,65,12,0.3)]"
            }`}
          >
            {added ? "✓ Added" : qty > 0 ? "Add more" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
