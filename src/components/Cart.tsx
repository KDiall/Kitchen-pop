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

  const subtotal = items.reduce((sum, i) => sum + i.price_cents * i.qty);

  if (items.length === 0) {
    return (
      <aside className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-4 h-fit">
        <h2 className="font-semibold">Your order</h2>
        <p className="text-sm text-gray-500 mt-2">Nothing yet.</p>
      </aside>
    );
  }

  return (
    <aside className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-4 h-fit">
      <h2 className="font-semibold mb-3">Your order</h2>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between text-sm">
            <span className="flex-1 pr-2">{i.name}</span>
            <div className="flex items-center gap-2">
              <button
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setQty(i.id, i.qty - 1)}
              >
                –
              </button>
              <span className="w-5 text-center">{i.qty}</span>
              <button
                className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setQty(i.id, i.qty + 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t flex items-center justify-between">
        <span className="text-sm text-gray-600">Subtotal</span>
        <span className="font-semibold">
          NLe {(subtotal / 100).toFixed(2)}
        </span>
      </div>
      <button
        onClick={() => router.push("/checkout")}
        className="mt-4 w-full bg-black text-white rounded-lg py-2 hover:opacity-90"
      >
        Checkout
      </button>
    </aside>
  );
}
