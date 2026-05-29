import crypto from "node:crypto";

function env(name: string): string {
  return process.env[name] ?? "";
}

const ACCESS_TOKEN = env("MONIME_ACCESS_TOKEN");
const SPACE_ID = env("MONIME_SPACE_ID");

const BASE = "https://api.monime.io";

type CreateCheckoutInput = {
  reference: string;
  phone: string;
  total_cents: number;
};

export async function createCheckout(input: CreateCheckoutInput) {
  if (!ACCESS_TOKEN || !SPACE_ID) {
    throw new Error("Monime credentials not configured");
  }

  const res = await fetch(`${BASE}/v1/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Monime-Space-Id": SPACE_ID,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "SLE", value: input.total_cents },
      reference: input.reference,
      customer: { phone: input.phone },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`monime ${res.status}: ${text}`);
  }

  const body = (await res.json()) as Record<string, unknown>;
  const redirect_url =
    (body.redirect_url as string) ??
    (body.redirectUrl as string) ??
    (body.url as string) ??
    "";

  if (!redirect_url) {
    console.error("[monime] no redirect_url in response", JSON.stringify(body));
  }

  return { redirect_url };
}

export function verifyWebhook(
  rawBody: string,
  signatureHeader: string
): boolean {
  const secret = process.env.MONIME_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[verifyWebhook] MONIME_WEBHOOK_SECRET not set");
    return false;
  }
  if (!signatureHeader) {
    console.error("[verifyWebhook] missing signature header");
    return false;
  }

  const parts: Record<string, string> = {};
  for (const part of signatureHeader.split(",")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1);
    parts[key] = val;
  }

  console.error("[verifyWebhook] parsed header parts", JSON.stringify(parts));

  const timestamp = parts["t"];
  const receivedSig = parts["v1"];
  if (!timestamp) {
    console.error("[verifyWebhook] missing timestamp");
    return false;
  }
  if (!receivedSig) {
    console.error("[verifyWebhook] missing v1 signature");
    return false;
  }

  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts)) {
    console.error("[verifyWebhook] invalid timestamp", { timestamp });
    return false;
  }
  const age = Math.floor(Date.now() / 1000) - ts;
  if (age > 5 * 60 || age < -60) {
    console.error("[verifyWebhook] timestamp out of range", { ts, age });
    return false;
  }

  const expectedB64 = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}_${rawBody}`, "utf8")
    .digest("base64");

  try {
    const a = Buffer.from(receivedSig, "base64");
    const b = Buffer.from(expectedB64, "base64");
    if (a.length !== b.length) {
      console.error("[verifyWebhook] signature length mismatch");
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    console.error("[verifyWebhook] base64 decode error", err);
    return false;
  }
}
