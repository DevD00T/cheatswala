# Cheatswala Storefront (`ecommerce-main-3`)

SSR Next.js storefront for products, checkout, orders, wishlist, and account.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill required values (`MONGODB_URI`, `NEXTAUTH_SECRET`).
3. For password reset emails (recommended):
   - `RESEND_API_KEY`
   - `RESEND_FROM` (example: `Litecheats Technologies <support@litecheats.com>`)
4. Optional but recommended for Telegram ops notifications:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_BOT_USERNAME` (optional; used in `/start` message)
   - `TELEGRAM_ADMIN_CHAT_ID`
   - `TELEGRAM_NOTIFY_USERNAMES` (comma-separated list, e.g. `@zirosyntax,@ops_channel`)
   - `ADMIN_DASHBOARD_URL` (example: `https://admin.litecheats.com`)
   - `STOREFRONT_URL` (example: `https://www.cheatswala.net`)
   - `TELEGRAM_WEBHOOK_URL` (example: `https://www.cheatswala.net/api/telegram/webhook`)
   - `TELEGRAM_WEBHOOK_SECRET` (recommended)
   - `ADMIN_API_SERVICE_TOKEN` (must match admin app)
5. Install dependencies and run:

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Auth Model

- Email/password authentication via NextAuth credentials provider.
- Sign up API: `POST /api/auth/register`
- Sign in UI: `/account` (calls `next-auth` `signIn('credentials')`)
- Password reset (Resend):
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

## Theme System

- Light-only UI with updated typography and spacing.

## Telegram Notifications

- New manual-payment orders can be sent in two modes:
  - `Webhook mode` (existing): notifications are sent from checkout API using `grammy`.
  - `Bun worker mode` (recommended for reliability): a server-side Bun worker polls MongoDB for new orders and sends Telegram alerts.
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

### Bun Worker Mode

1. Set `TELEGRAM_USE_ORDER_WORKER=true` in env.
2. Ensure these are configured: `MONGODB_URI`, `TELEGRAM_BOT_TOKEN`, `ADMIN_DASHBOARD_URL`, `ADMIN_API_SERVICE_TOKEN`.
3. Run worker:

```bash
npm run telegram:worker
```

- The worker watches new orders from MongoDB and sends Telegram order cards with inline buttons.
- One-click actions (`Mark Delivered`, `Send Email`, `Cancel Order`) call admin APIs with `x-service-token`.
- Keep webhook route active (`/api/telegram/webhook`) with `TELEGRAM_WORKER_ENABLE_UPDATE_POLLING=false` for production webhook mode.
- `/start` stores Telegram subscriber chat mapping.
- `/status` is admin-restricted (configured admin targets + explicit allow for `@zirosyntax`).

## Product Images

- Product images are served from MongoDB GridFS through `GET /api/media/[id]`.
- Use `GRIDFS_BUCKET_NAME` to override the default bucket (`productImages`).

## Production Hardening Included

- Security headers in `next.config.js`
- Method guards for API routes (`405` + `Allow` header)
- Safer authenticated API helpers under `lib/api/*`
- Password hashing and policy checks under `lib/auth/password.js`

## Build & Verify

```bash
npm run lint
npm run build
```
