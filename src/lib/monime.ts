import crypto from "node:crypto";

const ACCESS_TOKEN = process.env.MONIME_ACCESS_TOKEN!;
const SPACE_ID = process.env.MONIME_SPACE_ID!;
const WEBHOOK_SECRET = process.env.MONIME_WEBHOOK_SECRET!;

const BASE = "https://api.monime.io";

type CreateCheckoutInput = {
  amount: number;
  phone: string;
  reference: string;
};

export async function createCheckout(input: CreateCheckoutInput) {
  const res = await fetch(`${BASE}/v1/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Monime-Space-Id": SPACE_ID,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "SLE", value: input.amount },
      reference: input.reference,
      customer: { phone: input.phone },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`monime ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    id: data.id as string,
    redirect_url: data.redirect_url as string,
  };
}

export function verifyWebhook(
  rawBody: string,
  signatureHeader: string
): boolean {
  if (!WEBHOOK_SECRET || !signatureHeader) return false;

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
    .createHmac("sha256", WEBHOOK_SECRET)
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
