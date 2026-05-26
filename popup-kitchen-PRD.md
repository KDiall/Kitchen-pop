# PRD: Pop-up Kitchen — Build, Fix & Deploy

**Project name:** `popup-kitchen`  
**Stack:** Next.js 15 · TypeScript · Tailwind v4 · Supabase · Monime · Vercel  
**Currency:** NLe (New Leone, Sierra Leone)  
**Target:** Working public Vercel URL, end-to-end order + payment flow

---

## 1. What This App Does

A daily food ordering web app for a pop-up kitchen in Sierra Leone. The flow:

1. Kitchen publishes a menu for today with a cutoff time
2. Customer visits `/` → sees today's menu items with prices in NLe
3. Customer adds items to cart (stored in `localStorage`)
4. Customer goes to `/checkout`, enters mobile money number (`+232...`)
5. App creates an order in Supabase, then calls **Monime** to start a mobile money payment session
6. Customer is redirected to Monime's hosted payment page
7. Monime fires a webhook to `/api/webhook` on payment success → order flips to `"paid"`
8. Customer lands on `/ticket/[CODE]` → sees 4-character pickup code
9. Kitchen checks `/admin` → sees prep list (aggregated items) + all paid orders

---

## 2. Repo State — Bugs Already Fixed

These three bugs have already been patched in the source. **Do not re-introduce them.**

| File | Bug | Fix Applied |
|---|---|---|
| `src/components/Cart.tsx` | `.reduce()` missing initial value `0` — crashes on first item | Added `, 0` as second argument |
| `src/app/page.tsx` | Cutoff check was `now > cutoff` (inverted) — showed menu when closed, closed when open | Changed to `now < cutoff` |
| `src/app/api/webhook/route.ts` | Looked up order by `.eq("id", payload.data.id)` using Monime's internal ID | Changed to `.eq("reference", payload.data.reference)` |

---

## 3. Environment Variables

### 3.1 Required Variables

Create a `.env.local` file in the project root with these exact keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Monime
MONIME_ACCESS_TOKEN=your_monime_access_token
MONIME_SPACE_ID=your_monime_space_id
MONIME_WEBHOOK_SECRET=your_monime_webhook_secret
```

### 3.2 Supabase Setup

1. Go to [supabase.com](https://supabase.com) → create a new project
2. Wait for the project to provision
3. Go to **Settings → API**:
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **service_role key** (not the anon key) → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **SQL Editor** → paste and run the full contents of `supabase/schema.sql`
   - This creates all 4 tables (`menus`, `menu_items`, `orders`, `order_items`)
   - It also seeds today's menu with 6 Sierra Leonean dishes automatically

> **Important:** The schema uses `current_date` for seeding, so run it on the day you want the menu to appear. Re-run it each day or set up a cron job.

### 3.3 Monime Setup

1. Go to [monime.io](https://monime.io) → sign up for an account
2. From your dashboard, retrieve:
   - **Access Token** → `MONIME_ACCESS_TOKEN`
   - **Space ID** → `MONIME_SPACE_ID`
3. Configure a webhook pointing to `https://YOUR_VERCEL_URL/api/webhook`
   - Retrieve the **webhook signing secret** → `MONIME_WEBHOOK_SECRET`

> **If Monime is not available yet:** See Section 7 (Mock Mode) for a workaround that lets you deploy and test without a real Monime account.

---

## 4. Database Schema (reference)

```sql
-- menus: one row per day
menus (id uuid PK, served_on date UNIQUE, cutoff_at timestamptz)

-- menu_items: items on each day's menu
menu_items (id uuid PK, menu_id uuid FK→menus, name text, price_cents int, available boolean)

-- orders: one per customer checkout
orders (id uuid PK, code text UNIQUE, reference text UNIQUE, phone text,
        total_cents int, status text DEFAULT 'pending', created_at timestamptz)

-- order_items: line items per order
order_items (id uuid PK, order_id uuid FK→orders, menu_item_id uuid FK→menu_items,
             name text, price_cents int, qty int)
```

---

## 5. Application Routes

| Route | Type | Description |
|---|---|---|
| `/` | Server page | Today's menu or "No menu" / "Closed" states |
| `/checkout` | Client page | Cart review + mobile money number input |
| `/ticket/[code]` | Server page | Order confirmation with pickup code |
| `/admin` | Server page | Prep list + paid orders (no auth — add basic protection if needed) |
| `/api/checkout` | POST API | Creates order in Supabase, calls Monime, returns redirect URL |
| `/api/webhook` | POST API | Receives Monime webhook, verifies signature, marks order paid |

---

## 6. Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:3000`. The home page will show:
- **"No menu published yet"** if the schema hasn't been run or today's date has no menu row
- **"Closed for today"** if the current time is past `cutoff_at` (default: 5pm local)
- **The menu grid** if it's before cutoff and a menu exists for today

To test the payment flow locally, you need a tunnel for the Monime webhook (e.g. `ngrok http 3000` → use the ngrok URL as your webhook endpoint in Monime dashboard).

---

## 7. Mock Mode (if Monime credentials are unavailable)

If you cannot obtain Monime credentials right now, apply this temporary patch to `src/app/api/checkout/route.ts` so the app is fully testable end-to-end:

**Replace** the `createCheckout` call and the final `return` in the POST handler:

```typescript
// MOCK: skip Monime, go straight to ticket
// TODO: replace with real createCheckout call when credentials are available
return NextResponse.json({
  code: order.code,
  redirect_url: null,
});
```

With this patch:
- The checkout page will route directly to `/ticket/[code]` instead of redirecting to Monime
- The order will be created in Supabase with status `"pending"` (not `"paid"`)
- To see it in `/admin`, manually update the order status to `"paid"` in the Supabase table editor
- **Remove this mock before going live**

---

## 8. Known Gotchas & Guard Rails

### 8.1 `menu_item_id NOT NULL` constraint

`order_items.menu_item_id` is `NOT NULL` in the schema. The checkout API inserts using the item `id` from the cart (which comes from `menu_items.id`). This is correct as long as items in the cart were fetched from the DB. Do not allow arbitrary item IDs from the client without validation.

### 8.2 `generateCode()` collision risk

`src/lib/codes.ts` generates a 4-character alphanumeric code using `Math.random()`. With enough orders this will eventually collide. The `orders.code` column has a `UNIQUE` constraint so Supabase will reject duplicates — but the API will return a 500 with no retry logic. For now this is acceptable; for production volume, add a retry loop.

### 8.3 Admin page has no authentication

`/admin` is publicly accessible. For production, protect it with Vercel password protection, middleware auth, or at minimum an obscure path.

### 8.4 Menu timezone

`cutoff_at` is stored as `timestamptz`. The schema seeds it as `current_date + interval '17 hours'` which is 5pm UTC. Adjust the interval to match West Africa Time (WAT = UTC+1) if needed: `interval '16 hours'` for 5pm WAT.

### 8.5 Webhook replay protection

`verifyWebhook()` in `src/lib/monime.ts` checks that the webhook timestamp is within ±5 minutes. This is correct. Do not remove or weaken this check.

### 8.6 Tailwind v4

This project uses **Tailwind v4** (not v3). The PostCSS config uses `@tailwindcss/postcss`. Do not install `tailwindcss` v3 or add a `tailwind.config.js` — it will break.

---

## 9. Vercel Deployment

### 9.1 Steps

```bash
# 1. Push your fork to GitHub (if not already done)
git add -A
git commit -m "fix: bugs patched, ready for deploy"
git push origin main

# 2. Import project on Vercel
# Go to vercel.com → Add New Project → Import your GitHub repo

# 3. Framework detection
# Vercel will auto-detect Next.js — accept all defaults

# 4. Environment variables
# In the Vercel project settings → Environment Variables, add all 5 vars:
# NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# MONIME_ACCESS_TOKEN
# MONIME_SPACE_ID
# MONIME_WEBHOOK_SECRET

# 5. Deploy
# Click Deploy — Vercel will build and publish
```

### 9.2 Post-deploy checklist

- [ ] Visit `YOUR_URL/` → menu loads (or correct empty state shows)
- [ ] Add an item → cart appears in sidebar
- [ ] Go to checkout → enter a phone number → payment flow initiates
- [ ] Visit `YOUR_URL/admin` → page loads without error
- [ ] Update Monime webhook URL to `https://YOUR_URL/api/webhook`
- [ ] Test a full payment end-to-end with a real mobile money number

### 9.3 Re-seeding the menu daily

The `supabase/schema.sql` seeds today's menu. After the first deploy, you need a strategy for each new day:

**Option A (manual):** Run the seed SQL in Supabase SQL Editor each morning  
**Option B (automated):** Create a Supabase Edge Function or a Vercel cron job that inserts tomorrow's menu row at midnight

---

## 10. File Map

```
src/
  app/
    page.tsx              ← Home: menu grid (server component)
    layout.tsx            ← Root layout
    globals.css           ← Global styles + Tailwind
    checkout/
      page.tsx            ← Checkout form (client component)
    ticket/[code]/
      page.tsx            ← Pickup ticket (server component)
    admin/
      page.tsx            ← Prep list + orders (server component)
    api/
      checkout/route.ts   ← POST: create order + Monime session
      webhook/route.ts    ← POST: Monime payment.succeeded handler
  components/
    MenuCard.tsx          ← Single menu item card (client)
    Cart.tsx              ← Sticky cart sidebar (client)
    TicketView.tsx        ← Ticket display (pure component)
  lib/
    cart.ts               ← localStorage cart helpers
    codes.ts              ← 4-char code generator
    monime.ts             ← Monime API client + webhook verifier
    notifier.ts           ← Supabase client (named `db`)
supabase/
  schema.sql              ← Full DB schema + seed data
```

---

## 11. Out of Scope (do not build unless asked)

- User accounts / authentication for customers
- Order history per customer
- Menu management UI (menus are managed via Supabase directly)
- Email or SMS notifications
- Multi-day or recurring menu scheduling
- Refund flow
- Analytics dashboard

---

*Last updated: May 2026 — based on direct code analysis of the inherited repo.*
