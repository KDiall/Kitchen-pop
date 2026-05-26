export type CartItem = {
  id: string;
  name: string;
  price_cents: number;
  qty: number;
};

const KEY = "popup_cart_v1";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:change"));
}

export function addToCart(item: {
  id: string;
  name: string;
  price_cents: number;
}) {
  const cart = readCart();
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  writeCart(cart);
}

export function setQty(id: string, qty: number) {
  const cart = readCart()
    .map((c) => (c.id === id ? { ...c, qty } : c))
    .filter((c) => c.qty > 0);
  writeCart(cart);
}

export function clearCart() {
  writeCart([]);
}
