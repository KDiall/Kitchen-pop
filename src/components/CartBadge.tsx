"use client";

import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";

export function CartBadge() {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const sync = () => {
      const next = readCart().reduce((n, i) => n + i.qty, 0);
      setCount((prev) => {
        if (next > prev) setBump(true);
        return next;
      });
    };
    sync();
    window.addEventListener("cart:change", sync);
    return () => window.removeEventListener("cart:change", sync);
  }, []);

  useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(false), 400);
    return () => clearTimeout(t);
  }, [bump]);

  if (count === 0) return null;

  return (
    <span
      className={`pointer-events-none inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-700 text-white text-[10px] font-bold tabular-nums leading-none transition-transform ${
        bump ? "scale-125" : "scale-100"
      }`}
    >
      {count}
    </span>
  );
}
