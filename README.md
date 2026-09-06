# Wrapper — Admin Credit Portal

Admin-only Next.js portal. Admins sign up, buy credit packs, and their other product deducts **1 credit per API hit**. There are no monthly or yearly plans — credits last until they are used.

## What it does

- Admin signup / login (name, company, email, phone)
- 3 dynamic credit packs stored in MongoDB
- Razorpay checkout for credit packs; credits are added only after payment is verified
- Internal APIs for another project: **check credits** and **deduct 1 credit**
- Usage ledger: who used the hit (end-user email), when, remaining credits
- Portal pages: overview, packs, usage filters, purchases, account

## Default packs (change via seed)

| Pack | Credits | Rate | Total |
| --- | --- | --- | --- |
| Starter | 10 | ₹10 / credit | ₹100 |
| Growth | 50 | ₹9 / credit | ₹450 |
| Bulk | 100 | ₹8 / credit | ₹800 |

Buy more at once → cheaper per credit. Edit `scripts/seed.ts` and run `npm run seed` again to upsert new rates.

## Setup

1. Run MongoDB locally (`docker compose up -d`), install it, or use Atlas.
2. Copy env values:

```bash
copy .env.example .env.local
```

3. Set `MONGODB_URI`, `JWT_SECRET`, `INTERNAL_API_TOKEN`, and Razorpay keys in `.env.local`.

## Razorpay

1. Create keys from the [Razorpay dashboard](https://dashboard.razorpay.com/app/website-app-settings/api-keys) (use Test mode first).
2. Put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local`, then restart `npm run dev`.
3. Optional but recommended in production: add a webhook to `https://your-domain/api/purchases/webhook` for `payment.captured` and `order.paid`, and set `RAZORPAY_WEBHOOK_SECRET`.

Flow: Buy pack → Razorpay order → checkout modal → signature verify → credits added. The checkout handler works on localhost. Webhook is the backup if the browser closes after a successful pay.

Test card (Razorpay test mode): `4111 1111 1111 1111`, any future expiry, any CVV.
4. Install and seed:

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This portal is admin-only.

## APIs for your other project

Send the **internal token** on every call:

- Header `x-internal-token: <INTERNAL_API_TOKEN>`
- or `Authorization: Bearer <INTERNAL_API_TOKEN>`

Admin **id** and **email** are on the Account page after login.

### Check credits

`POST /api/v1/credits/check`

```json
{
  "adminId": "ADMIN_OBJECT_ID",
  "adminEmail": "admin@company.com"
}
```

Success:

```json
{
  "ok": true,
  "hasCredits": true,
  "credits": 42,
  "adminId": "...",
  "adminEmail": "admin@company.com"
}
```

### Deduct 1 credit (one hit)

`POST /api/v1/credits/deduct`

```json
{
  "adminId": "ADMIN_OBJECT_ID",
  "adminEmail": "admin@company.com",
  "userEmail": "enduser@client.com",
  "source": "chat"
}
```

`userEmail` is the person inside the admin's product who triggered the hit. That email shows on the Usage page.

If credits are 0:

```json
{
  "ok": false,
  "error": "INSUFFICIENT_CREDITS",
  "message": "No credits remaining. Purchase a credit pack to continue.",
  "credits": 0,
  "hasCredits": false
}
```

HTTP status is `402`.

Deduction is atomic (`credits >= 1` in the same update) so two parallel hits cannot go below zero.

## Stack

Next.js (App Router) + MongoDB (Mongoose). The whole admin portal, auth, and internal APIs live in one Next.js app.
