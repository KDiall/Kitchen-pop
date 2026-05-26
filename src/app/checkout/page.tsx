"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readCart, clearCart, type CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(readCart());
  }, []);

  const total = items.reduce((s, i) => s + i.price_cents * i.qty, 0);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      clearCart();
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        router.push(`/ticket/${data.code}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold">Empty cart</h1>
        <button
          onClick={() => router.push("/")}
          className="mt-4 underline text-sm"
        >
          Back to menu
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <ul className="space-y-1 text-sm mb-4">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between">
            <span>
              {i.qty}× {i.name}
            </span>
            <span>
              NLe {((i.price_cents * i.qty) / 100).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-semibold border-t pt-2 mb-6">
        <span>Total</span>
        <span>NLe {(total / 100).toFixed(2)}</span>
      </div>
      <form onSubmit={pay} className="space-y-4">
        <label className="block">
          <span className="text-sm">Mobile money number</span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+232..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg py-2.5 disabled:opacity-50"
        >
          {loading
            ? "Starting payment…"
            : `Pay NLe ${(total / 100).toFixed(2)}`}
        </button>
      </form>
    </main>
  );
}
