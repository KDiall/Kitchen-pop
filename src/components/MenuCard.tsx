"use client";

import { addToCart } from "@/lib/cart";

type Props = {
  item: { id: string; name: string; price_cents: number };
};

export function MenuCard({ item }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-lg">{item.name}</h3>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-gray-700">
          NLe {(item.price_cents / 100).toFixed(2)}
        </span>
        <button
          onClick={() => addToCart(item)}
          className="bg-black text-white text-sm rounded-lg px-3 py-1.5 hover:opacity-90"
        >
          Add
        </button>
      </div>
    </div>
  );
}
