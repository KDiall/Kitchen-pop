import crypto from "node:crypto";

function env(name: string): string {
  return process.env[name] ?? "";
}

const ACCESS_TOKEN = env("MONIME_ACCESS_TOKEN");
const SPACE_ID = env("MONIME_SPACE_ID");

const BASE = "https://api.monime.io";

type CreateCheckoutInput = {
  code: string;
  reference: string;
  phone: string;
  items: { name: string; price_cents: number; qty: number }[];
  baseUrl: string;
};

export async function createCheckout(input: CreateCheckoutInput) {
  if (!ACCESS_TOKEN || !SPACE_ID) {
    throw new Error("Monime credentials not configured");
  }
  const idempotencyKey = crypto.randomUUID();

  const res = await fetch(`${BASE}/v1/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Monime-Space-Id": SPACE_ID,
      "Idempotency-Key": idempotencyKey,
      "Monime-Version": "caph.2025-08-23",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: "Pop-up Kitchen Order",
      lineItems: input.items.map((i) => ({
        name: i.name,
        price: { currency: "SLE", value: i.price_cents },
        type: "custom" as const,
        quantity: i.qty,
      })),
      reference: input.reference,
      customer: { phone: input.phone },
      successUrl: `${input.baseUrl}/ticket/${input.code}`,
      cancelUrl: input.baseUrl,
      paymentOptions: {
        momo: { disable: false },
        card: { disable: true },
        bank: { disable: true },
        wallet: { disable: true },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`monime ${res.status}: ${text}`);
  }

  const body = await res.json() as Record<string, unknown>;

  const result = (body?.result ?? body) as Record<string, unknown>;
  const id = (result.id ?? body.id) as string;
  const redirect_url =
    (result.redirect_url as string) ??
    (result.redirectUrl as string) ??
    (body.redirect_url as string) ??
    (body.redirectUrl as string) ??
    "";

  if (!redirect_url) {
    console.error("[monime] no redirect_url in response", JSON.stringify(body));
  }

  return { id, redirect_url };
}

export function verifyWebhook(
  rawBody: string,
  signatureHeader: string
): boolean {
  const secret = process.env.MONIME_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(",")) {
    const [key, ...rest] = part.split("=");
    parts[key] = rest.join("=");
  }

  const timestamp = parts["t"];
  const receivedSig = parts["v1"];
  if (!timestamp || !receivedSig) return false;

  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts)) return false;
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age > 5 * 60 || age < -60) return false;

  const expectedB64 = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}_${rawBody}`, "utf8")
    .digest("base64");

  try {
    const a = Buffer.from(receivedSig, "base64");
    const b = Buffer.from(expectedB64, "base64");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
