"use client";

import { worldDishes } from "@/data/global-dishes";
import { addToCart, readCart } from "@/lib/cart";
import { useEffect, useState } from "react";

type Props = {
  preview?: boolean;
};

function WorldCard({
  dish,
  index = 0,
}: {
  dish: (typeof worldDishes)[number];
  index?: number;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: dish.id,
      name: `${dish.emoji} ${dish.name}`,
      price_cents: dish.price_cents,
    });
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{dish.emoji}</span>
              <h3 className="font-serif text-lg leading-snug text-stone-900 group-hover:text-orange-900 transition-colors truncate">
                {dish.name}
              </h3>
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-semibold mt-1.5">
              {dish.origin}
            </p>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed line-clamp-2">
              {dish.description}
            </p>
          </div>
          <span className="text-sm tabular-nums text-stone-900 font-medium shrink-0 mt-1">
            {(dish.price_cents / 100).toFixed(2)}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold">
            NLe
          </span>
          <button
            onClick={handleAdd}
            className={`text-sm rounded-md px-4 py-1.5 font-medium transition-all duration-200 ${
              added
                ? "scale-95 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-orange-700 text-white hover:bg-orange-800 active:scale-95 shadow-sm hover:shadow-[0_2px_8px_-2px_rgba(194,65,12,0.3)]"
            }`}
          >
            {added ? "✓ Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorldDishes({ preview }: Props) {
  const dishes = preview ? worldDishes.slice(0, 6) : worldDishes;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div
        className="text-center mb-12"
        style={{
          animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <span className="text-[11px] uppercase tracking-[0.2em] text-orange-700 font-semibold">
          Around the World
        </span>
        <h2 className="font-serif text-4xl tracking-tight text-stone-900 mt-3 leading-tight">
          Global <span className="italic text-orange-700">kitchen</span>
        </h2>
        <p className="text-sm text-stone-500 mt-3 max-w-lg mx-auto leading-relaxed">
          A curated selection of iconic dishes from every corner of the
          planet — all freshly cooked with love.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {dishes.map((dish, i) => (
          <WorldCard key={dish.id} dish={dish} index={i} />
        ))}
      </div>
    </section>
  );
}
