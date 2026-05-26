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
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="border border-neutral-200 rounded-lg p-10 text-center">
          <h1 className="text-lg font-semibold text-neutral-900">
            Your cart is empty
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Add a few dishes first.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← Back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <button
        onClick={() => router.push("/")}
        className="text-sm text-neutral-500 hover:text-emerald-700 mb-4 transition-colors"
      >
        ← Back to menu
      </button>
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      <p className="text-sm text-neutral-500 mt-1 mb-6">
        Review your order and pay by mobile money.
      </p>

      <div className="border border-neutral-200 rounded-lg p-5">
        <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
          Order summary
        </h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-neutral-700">
                <span className="text-neutral-900 font-medium">{i.qty}×</span>{" "}
                {i.name}
              </span>
              <span className="tabular-nums text-neutral-900">
                NLe {((i.price_cents * i.qty) / 100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-neutral-200 pt-3 mt-3 text-sm">
          <span className="font-medium">Total</span>
          <span className="font-semibold tabular-nums">
            NLe {(total / 100).toFixed(2)}
          </span>
        </div>
      </div>

      <form
        onSubmit={pay}
        className="mt-4 border border-neutral-200 rounded-lg p-5 space-y-4"
      >
        <label className="block">
          <span className="text-sm font-medium text-neutral-900">
            Mobile money number
          </span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+232 76 000 000"
            className="mt-1.5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
          />
          <span className="block mt-1.5 text-xs text-neutral-500">
            We&apos;ll send the payment prompt here.
          </span>
        </label>
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? "Starting payment…"
            : `Pay NLe ${(total / 100).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
