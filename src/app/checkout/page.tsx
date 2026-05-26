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
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-4xl text-stone-900">
          Your cart is <span className="italic text-orange-700">empty</span>
        </h1>
        <p className="text-sm text-stone-500 mt-3">
          Browse the menu and add a few dishes first.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 underline underline-offset-4 decoration-orange-300 hover:decoration-orange-700 transition"
        >
          ← Back to menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <button
        onClick={() => router.push("/")}
        className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-orange-700 mb-6 transition-colors font-semibold"
      >
        ← Back to menu
      </button>

      <h1 className="font-serif text-5xl tracking-tight text-stone-900 leading-tight">
        Review &amp; <span className="italic text-orange-700">pay</span>
      </h1>
      <p className="text-sm text-stone-500 mt-3">
        Confirm your order and enter your mobile money number.
      </p>

      <div className="mt-8 bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-stone-100">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-orange-700 font-semibold">
            Order
          </h2>
          <span className="text-[11px] uppercase tracking-wider text-stone-400">
            {items.length} {items.length === 1 ? "dish" : "dishes"}
          </span>
        </div>
        <ul className="px-6 divide-y divide-stone-100">
          {items.map((i) => (
            <li
              key={i.id}
              className="py-3 flex items-baseline gap-3 text-sm"
            >
              <span className="text-orange-700 font-semibold tabular-nums shrink-0 w-6">
                {i.qty}×
              </span>
              <span className="flex-1 text-stone-800">{i.name}</span>
              <span className="tabular-nums text-stone-900 shrink-0">
                {((i.price_cents * i.qty) / 100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="px-6 py-4 bg-gradient-to-b from-orange-50/40 to-orange-50/70 border-t border-stone-100 flex items-baseline justify-between">
          <span className="text-sm text-stone-600">Total</span>
          <span className="font-serif text-3xl tabular-nums text-stone-900">
            <span className="text-xs text-orange-700 mr-1.5 font-semibold align-baseline">
              NLe
            </span>
            {(total / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <form onSubmit={pay} className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-stone-900"
          >
            Mobile money number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+232 76 000 000"
            className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/15 transition-all"
          />
          <span className="block mt-1.5 text-xs text-stone-500">
            We&apos;ll send the payment prompt to this number.
          </span>
        </div>
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-700 hover:bg-orange-800 text-white rounded-md py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading
            ? "Starting payment…"
            : `Pay NLe ${(total / 100).toFixed(2)}`}
        </button>
        <p className="text-[11px] text-stone-400 text-center">
          Secure mobile money via Monime
        </p>
      </form>
    </div>
  );
}
