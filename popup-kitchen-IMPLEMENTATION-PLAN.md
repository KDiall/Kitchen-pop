# Implementation Plan: Pop-up Kitchen
**For:** Windsurf AI  
**Read first:** `popup-kitchen-PRD.md`  
**Rule:** Complete each phase fully and verify it before moving to the next. Do not skip ahead.

---

## Phase 0 — Orientation (no code changes)

**Goal:** Understand the repo before touching anything.

1. Read every file listed in PRD Section 10 (File Map)
2. Confirm the 3 bug fixes from PRD Section 2 are present in the code:
   - `Cart.tsx` line with `.reduce(` has `, 0)` at the end
   - `page.tsx` cutoff check reads `now < cutoff`
   - `webhook/route.ts` uses `.eq("reference", payload.data.reference)`
3. If any fix is missing, apply it now before proceeding
4. Run `npm install` — confirm zero errors

**Exit check:** `npm install` completes cleanly. All 3 fixes confirmed in source.

---

## Phase 1 — Supabase Setup

**Goal:** Live database with schema and seed data.

### Steps

1. Go to [supabase.com](https://supabase.com) → create a new project
   - Name it `popup-kitchen`
   - Choose a strong database password and save it
   - Pick the region closest to West Africa (e.g. `eu-west-1`)
   - Wait for provisioning (~2 min)

2. Go to **Settings → API**, copy:
   - **Project URL** → save as `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (the secret one, NOT the anon key) → save as `SUPABASE_SERVICE_ROLE_KEY`

3. Go to **SQL Editor → New Query**, paste the full contents of `supabase/schema.sql`, run it
   - You should see success with no errors
   - This creates 4 tables and inserts today's menu

4. Verify in **Table Editor**:
   - `menus` → 1 row for today's date
   - `menu_items` → 6 rows (Jollof Rice, Cassava Leaves, etc.)
   - `orders` → empty (correct)
   - `order_items` → empty (correct)

5. Create `.env.local` in project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<paste here>
   SUPABASE_SERVICE_ROLE_KEY=<paste here>
   MONIME_ACCESS_TOKEN=placeholder
   MONIME_SPACE_ID=placeholder
   MONIME_WEBHOOK_SECRET=placeholder
   ```
   > Monime keys are placeholders for now — app will still run locally up to the payment step

**Exit check:** Run `npm run dev`. Visit `http://localhost:3000`. You should see the menu grid with 6 dishes. The cart sidebar should appear on the right. If you see "No menu published yet", the schema SQL did not run successfully — go back and re-run it.

---

## Phase 2 — Local Smoke Test

**Goal:** Confirm every route renders without errors before touching payments.

### Steps

1. With `npm run dev` running, test each route:

   | URL | Expected result |
   |---|---|
   | `http://localhost:3000/` | Menu grid with 6 dishes + cart sidebar |
   | `http://localhost:3000/admin` | "No paid orders yet" (empty state) |
   | `http://localhost:3000/ticket/TEST` | "Ticket not found" message |
   | `http://localhost:3000/checkout` | "Empty cart" with back link |

2. Test cart interactions:
   - Click **Add** on any menu item → item appears in cart sidebar
   - Click **+** and **–** → qty changes correctly
   - Click **–** until qty is 0 → item disappears from cart
   - Click **Checkout** → redirects to `/checkout` with items listed
   - Confirm subtotal math is correct (price × qty for each item, summed)

3. Open browser DevTools → Console → confirm no JavaScript errors during any of the above

**Exit check:** All routes render. Cart add/remove/qty works. No console errors. Subtotal calculates correctly.

---

## Phase 3 — Monime Integration

**Goal:** Real payment credentials wired up.

### Steps

1. Go to [monime.io](https://monime.io) → sign up or log in

2. From your Monime dashboard, retrieve:
   - **Access Token** → replace `placeholder` for `MONIME_ACCESS_TOKEN` in `.env.local`
   - **Space ID** → replace `placeholder` for `MONIME_SPACE_ID` in `.env.local`

3. Restart the dev server after updating `.env.local` (`Ctrl+C` then `npm run dev`)

4. **If Monime is not available** (account pending, region restrictions, etc.):
   - Apply the Mock Mode patch from PRD Section 7 to `src/app/api/checkout/route.ts`
   - This skips the Monime call and routes directly to the ticket page
   - Mark this with a `// TODO: remove mock` comment
   - Continue to Phase 4 — you can wire real Monime credentials post-deploy

### Webhook (set up after deploy — come back here in Phase 5)

- Monime webhook URL will be `https://YOUR_VERCEL_URL/api/webhook`
- You cannot configure this until you have a Vercel URL
- The `MONIME_WEBHOOK_SECRET` will come from the Monime dashboard after webhook registration

**Exit check:** Either real Monime credentials are in `.env.local` OR mock mode patch is applied and marked with TODO. Dev server starts without errors.

---

## Phase 4 — End-to-End Local Test

**Goal:** Confirm the full order flow works locally before deploying.

### Steps

1. Start fresh: clear localStorage in browser DevTools → Application → Local Storage → delete `popup_cart_v1`

2. Run the full happy path:
   - Visit `http://localhost:3000/`
   - Add 2 different items to cart
   - Click Checkout
   - Confirm both items appear with correct prices and total
   - Enter a phone number (use `+23276000000` as a test number if using mock mode)
   - Click Pay
   - **If real Monime:** you will be redirected to Monime's payment page — stop here, confirm redirect worked
   - **If mock mode:** you should land on `/ticket/XXXX` with a 4-char code and "Waiting for payment…" status

3. Check Supabase Table Editor → `orders`:
   - Should have 1 row with status `"pending"`
   - `code` should match what you saw on the ticket page
   - `phone` should match what you entered

4. Check `order_items`:
   - Should have rows matching the items you added

5. **Test the admin page:**
   - In Supabase Table Editor, manually change the order's `status` to `"paid"`
   - Visit `http://localhost:3000/admin`
   - Prep list should show your items with quantities
   - Paid orders list should show your order

6. **Test the ticket paid state:**
   - Visit `http://localhost:3000/ticket/[YOUR_CODE]`
   - Should now show green "Paid — see you at pickup" badge

**Exit check:** Full flow completes. Order row exists in Supabase. Admin shows prep list. Ticket shows correct status.

---

## Phase 5 — Vercel Deploy

**Goal:** Working public URL.

### Steps

1. Commit and push all changes to your GitHub fork:
   ```bash
   git add -A
   git commit -m "fix: bugs patched, env wired, ready for deploy"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo

3. Vercel will auto-detect Next.js — **do not change any build settings**

4. Before clicking Deploy, go to **Environment Variables** and add all 5 vars:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
   MONIME_ACCESS_TOKEN
   MONIME_SPACE_ID
   MONIME_WEBHOOK_SECRET
   ```
   > If using mock mode, set `MONIME_ACCESS_TOKEN`, `MONIME_SPACE_ID`, `MONIME_WEBHOOK_SECRET` to the string `"placeholder"` — the app won't call Monime so the values don't matter

5. Click **Deploy** — wait for build to complete (~1-2 min)

6. If build fails:
   - Check the build log in Vercel
   - TypeScript errors will be visible here — fix them and push again
   - Most common issue: missing env var causing a `!` assertion to throw at build time

**Exit check:** Vercel shows green "Deployed". You have a public URL like `https://popup-kitchen-xxx.vercel.app`.

---

## Phase 6 — Production Verification

**Goal:** Confirm the deployed app works end-to-end on the live URL.

### Steps

1. Visit `YOUR_VERCEL_URL/` → menu grid loads with 6 dishes

2. Visit `YOUR_VERCEL_URL/admin` → loads without error (empty state is fine)

3. Run the full order flow on production:
   - Add items → checkout → enter phone → pay
   - Confirm redirect to Monime (or ticket page if mock mode)
   - Confirm order row appears in Supabase

4. **If using real Monime — wire up the webhook:**
   - Go to Monime dashboard → Webhooks → add endpoint: `https://YOUR_VERCEL_URL/api/webhook`
   - Copy the webhook signing secret → go to Vercel → Environment Variables → update `MONIME_WEBHOOK_SECRET`
   - Redeploy (Vercel → Deployments → Redeploy) for the new env var to take effect
   - Test a real payment → confirm order flips to `"paid"` in Supabase → confirm ticket shows green badge

5. **Final checklist:**
   - [ ] `YOUR_VERCEL_URL/` — menu loads
   - [ ] Cart add/remove/qty — works
   - [ ] Checkout form — submits
   - [ ] Payment redirect or mock ticket — works
   - [ ] `/ticket/[code]` — renders correctly
   - [ ] `/admin` — renders correctly
   - [ ] Supabase has order rows after testing
   - [ ] No errors in Vercel function logs (Vercel → Functions tab)

**Exit check:** All checklist items above pass. You have a working public URL.

---

## Phase 7 — Handoff Notes

Document the following for future reference:

1. **Supabase project URL and dashboard link**
2. **Vercel project URL**
3. **How to reseed the menu daily** (run the seed section of `schema.sql` in Supabase SQL Editor each morning, or set up a cron)
4. **Mock mode status** — is Monime real or mocked? If mocked, what needs to change to go live?
5. **Admin page protection** — currently unprotected, note this as a TODO

---

## Failure Reference

| Symptom | Likely cause | Fix |
|---|---|---|
| "No menu published yet" on home | Schema not run, or run on a different date | Re-run `schema.sql` in Supabase SQL Editor today |
| "Closed for today" shown all day | `cutoff_at` timezone mismatch | Check if `cutoff_at` in Supabase is 5pm UTC vs 5pm WAT — adjust interval in schema |
| 500 on `/api/checkout` | Missing Supabase env vars or wrong key (anon vs service_role) | Confirm `SUPABASE_SERVICE_ROLE_KEY` is the secret key, not the anon key |
| Monime 401 / auth error | Wrong access token or space ID | Double-check values from Monime dashboard |
| Webhook returns 401 Bad signature | Wrong `MONIME_WEBHOOK_SECRET` or secret not updated after redeploy | Update env var in Vercel and redeploy |
| Cart subtotal shows NaN | Bug not fixed — `.reduce()` missing initial value | Confirm fix from Phase 0 step 2 |
| Menu shows when it should be closed | Bug not fixed — inverted cutoff | Confirm `now < cutoff` fix from Phase 0 step 2 |
| Order never flips to paid | Bug not fixed — wrong webhook field | Confirm `reference` fix from Phase 0 step 2 |
| Build fails on Vercel with TS errors | Type issues in source | Check Vercel build log, fix errors, push again |

---

*This plan assumes the bugs in PRD Section 2 are already applied. Start at Phase 0 to verify.*
