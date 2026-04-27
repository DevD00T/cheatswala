# Cheatswala Storefront (`ecommerce-main-3`)

SSR Next.js storefront for products, checkout, orders, wishlist, and account.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill required values (`MONGODB_URI`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
3. Optional but recommended for Telegram ops notifications:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_ADMIN_CHAT_ID`
   - `TELEGRAM_NOTIFY_USERNAMES` (comma-separated list, e.g. `@zirosyntax,@ops_channel`)
   - `ADMIN_DASHBOARD_URL` (example: `https://admin.litecheats.com`)
   - `STOREFRONT_URL` (example: `https://www.cheatswala.net`)
   - `TELEGRAM_WEBHOOK_URL` (example: `https://www.cheatswala.net/api/telegram/webhook`)
   - `TELEGRAM_WEBHOOK_SECRET` (recommended)
   - `ADMIN_API_SERVICE_TOKEN` (must match admin app)
4. Install dependencies and run:

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Auth Model

- Clerk authentication is enabled on the frontend.
- App is wrapped with `ClerkProvider` and protected identity is resolved in API routes via Clerk server auth.
- Middleware is configured in `middleware.js` using `clerkMiddleware`.
- Header includes:
  - `SignInButton`
  - `SignUpButton`
  - `UserButton`

## Theme System

- Frontend uses a shadcn-compatible dark/light wrapper via `next-themes`.
- Theme toggle is available in the header.
- Global typography and spacing were updated for improved readability and consistency.

## Telegram Notifications

- New manual-payment orders send a Telegram alert using `grammy`.
- Recipients are resolved in this order:
  - Admin settings value `telegramNotifyUsernames`
  - `TELEGRAM_NOTIFY_USERNAMES` env fallback
  - `TELEGRAM_ADMIN_CHAT_ID` env fallback
- Alert includes inline action buttons:
  - `Mark Delivered` (calls admin accept endpoint)
  - `Send Email` (calls admin sendmail endpoint)
  - `Cancel Order` (calls admin cancel endpoint)
- Alert also includes action links:
  - Open specific order in admin queue (`/orders?orderId=...`)
  - Open orders queue
  - Open storefront payment page for that order
- Webhook endpoint: `POST /api/telegram/webhook`

## Product Images

- Product images are served from MongoDB GridFS through `GET /api/media/[id]`.
- Use `GRIDFS_BUCKET_NAME` to override the default bucket (`productImages`).

## Production Hardening Included

- Security headers in `next.config.js`
- Clerk middleware for route/session auth context
- Method guards for API routes (`405` + `Allow` header)
- Safer authenticated API helpers under `lib/api/*`
- Password hashing and policy checks under `lib/auth/password.js`

## Build & Verify

```bash
npm run lint
npm run build
```
