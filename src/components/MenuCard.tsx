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
    <div className="bg-white rounded-lg p-5 border border-neutral-200 hover:border-emerald-300 hover:shadow-sm transition-all">
      <h3 className="font-medium text-[15px] leading-snug text-neutral-900">
        {item.name}
      </h3>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm tabular-nums">
          <span className="text-neutral-400">NLe</span>{" "}
          <span className="text-neutral-900 font-medium">
            {(item.price_cents / 100).toFixed(2)}
          </span>
        </span>
        <button
          onClick={handleAdd}
          disabled={added}
          className={`text-sm rounded-md px-3 py-1.5 font-medium transition-colors ${
            added
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {added ? "Added" : "Add"}
        </button>
      </div>
    </div>
  );
}
