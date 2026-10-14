# Sukilo — storefront

Next.js 16 (App Router) and React 19 storefront for the Sukilo FastAPI backend
(`../Sukilo-Api`). The code is plain JavaScript (`.js` / `.jsx`); path aliases
(`@/…`) are defined in `jsconfig.json`.

## Getting started

```powershell
# The API must be running first (see ../Sukilo-Api/README.md), on http://localhost:8000
Copy-Item .env.example .env.local   # only if .env.local does not exist yet
npm install
npm run dev                          # http://localhost:3000
```

Production build:

```powershell
npm run lint
npm run build
npm start
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend, without `/api/v1`. Defaults to `http://localhost:8000`. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for canonical/OpenGraph metadata and the sitemap. |
| `NEXT_PUBLIC_CONSENT_POLICY_VERSION` | Consent policy version sent with consent changes. The API publishes no endpoint for it and rejects stale versions. Defaults to `dev-1`, the development API's version. |

`NEXT_PUBLIC_*` values are embedded in the browser bundle and are read at build
time, so never put secrets in them, and rebuild after changing them.

The browser origin (for example `http://localhost:3000`) must be listed in the
API's `CORS_ORIGINS` and `FRONTEND_URL`, otherwise requests and token refresh
are rejected.

## Structure

```
app/            Routes (server components by default; "use client" only where needed)
  account/      Overview, addresses, preferences, security, privacy
  admin/        Admin panel with its own layout (no storefront header/footer)
    login/      Credential sign-in (`POST /api/v1/auth/login`); unsigned visitors land here
    (panel)/    Signed-in frame: dashboard, access control, and planned sections
components/     UI grouped by area: layout, home, products, filters, search,
                barcode, vendor, account, admin, ui
  admin/        AdminShell, AdminHeader, AdminSidebar, nav.js (sidebar entries),
                dashboard/ (dashboard page, chart and widgets)
context/        Country / currency / locale, auth, cart and wishlist providers
hooks/          Small client hooks (debounce, voice, image search, suggestions…)
config/         Markets, currencies and display-only FX rates
schemas/        zod schemas for the auth and account forms
lib/
  api.js        The only place that calls fetch: base URL, JSON/FormData bodies,
                204/empty responses, ApiError with readable messages
  auth.js       Session: login/register/OTP/password reset, refresh, logout
  account.js    /me: profile, sessions, identifier change, preferences, consents,
                addresses, data export, closure; step-up and signed-in OTP verify
  access.js     /access: roles, permissions, assignment list/grant/revoke
  admin.js      Admin dashboard data. Returns sample data from admin-sample.js
                for now; its comment documents the response shape to build
  products.js   Product list, detail, GTIN lookup, categories, create
  search.js     Barcode, barcode photo, image search, suggestions
  system.js     Health, database and vector-store probes for /status
  format.js, product.js, search-params.js, …  Pure helpers
```

## Authentication

- Login returns a short-lived access token. It is kept **in memory only** and
  sent as `Authorization: Bearer …`.
- The API also sets an HttpOnly refresh cookie and a CSRF cookie, both scoped
  to `/api/v1/auth`. The CSRF value is returned in the login/refresh body and
  stored in `localStorage` so it can be echoed as `X-CSRF-Token`; it is useless
  without the HttpOnly cookie.
- On page load, and when a request gets `401`, `lib/auth.js` calls
  `POST /api/v1/auth/token/refresh` once and retries.
- Refresh tokens rotate on every use, and the API revokes the session if an
  old one is replayed. Tabs therefore refresh one at a time (Web Locks API) and
  share the new access token and sign-out over a same-origin `BroadcastChannel`.
- `/account/*` redirects anonymous users to `/login?callbackUrl=…`.
  `/admin/*` redirects them to `/admin/login`, which signs in with the same
  email-or-phone and password endpoint. Authorization is enforced by the API;
  the client redirect is only for UX. Any signed-in user can open the admin
  shell, so every admin endpoint (including the future dashboard one) must
  check permissions server-side, as `/access/*` already does.
- Sensitive actions re-check the password and send an emailed code first:
  data export (`DATA_EXPORT`), account closure and role changes (`STEP_UP`).
  The API also requires the access token to come from a password login made
  recently: 5 minutes for changing email/phone, 15 for closing the account.
  Refreshed tokens (for example after a page reload) don't qualify, so those
  pages ask the user to sign in again first. After an email/phone change the
  API ends every session, so the UI signs out.
- Registration sends a 6-digit code by email, then `POST /api/v1/auth/otp/verify`
  with purpose `REGISTER` activates the account. After login, `GET /api/v1/access/me`
  decides the next page: a staff role opens `/admin`, and an account with no role
  stays on the storefront. In development the API writes the email to
  `Sukilo-Api/data/outbox` unless `SMTP_HOST` and `SMTP_FROM` are set. Without
  those settings the verify page shows the code, because no email is transmitted.

## Backend endpoints used

| Feature | Endpoint |
| --- | --- |
| Product list, search, category filter | `GET /api/v1/products?skip&limit&q&category` |
| Categories (header, filters, home, sitemap) | `GET /api/v1/products/categories` |
| Product detail | `GET /api/v1/products/{id}` |
| GS1 link `/01/{gtin}` | `GET /api/v1/products/gtin/{gtin}` |
| Barcode search (typed or scanned) | `GET /api/v1/search/barcode?code=` |
| Barcode from photo | Decoded in the browser (`@zxing/browser`), then `GET /api/v1/search/barcode` |
| Visual search | `POST /api/v1/search/image` |
| Vendor product creation | `POST /api/v1/products` (multipart) |
| Register / verify / login | `POST /api/v1/auth/register`, `/otp/verify`, `/login` |
| Password reset (+ resend code) | `POST /api/v1/auth/password/forgot`, `/otp/request` (`RESET`), `/otp/verify`, `/password/reset` |
| Refresh / logout | `POST /api/v1/auth/token/refresh`, `/logout` |
| Account overview, devices | `GET /api/v1/me`, `GET /api/v1/auth/sessions`, `DELETE /api/v1/auth/sessions/{id}`, `POST /api/v1/auth/sessions/revoke-all` |
| Change email / phone | `PATCH /api/v1/me`, `POST /api/v1/auth/otp/verify` (`VERIFY_EMAIL`/`VERIFY_PHONE`), `POST /api/v1/me/identifier-change/confirm` |
| Market preferences | `GET` / `PUT /api/v1/me/preferences` (409 on a stale `expected_version`) |
| Consents and history | `GET /api/v1/me/consents?country_code[&history&limit&cursor]`, `POST /api/v1/me/consents` |
| Addresses | `GET` / `POST /api/v1/me/addresses`, `PATCH` / `DELETE /api/v1/me/addresses/{id}`, `POST /api/v1/me/addresses/{id}/default` |
| Data export | `POST /api/v1/me/data-export/verification`, `/otp/verify` (`DATA_EXPORT`), `POST /api/v1/me/data-export` (`Idempotency-Key`), `GET /api/v1/me/data-exports/{id}`, `POST …/download-grant`, `POST …/download` |
| Account closure | `POST /api/v1/auth/step-up/request`, `/otp/verify` (`STEP_UP`), `POST /api/v1/me/closure`, `POST /api/v1/me/closure/confirm` |
| Signed-in roles | `GET /api/v1/access/me` |
| Admin: access control | `GET /api/v1/access/roles`, `/permissions`, `/assignments`; `POST /api/v1/access/assignments` and `DELETE /api/v1/access/assignments/{id}` with `X-Step-Up-Grant` |
| Status page | `GET /api/v1/health`, `GET /api/v1/database-test`, `GET /api/v1/vectors/health` |

`POST /api/v1/vectors/index`, `/vectors/search` and `/vectors/smoke` are
operator-only demo routes without authentication and are deliberately not
called from the storefront.

Image search and product creation need the API's vector stack
(`ENABLE_VECTOR_STACK=true` with Qdrant); otherwise they return `503` and the UI
shows that error.

## Known gaps (no backend support yet)

- No cart/order/checkout API: cart and wishlist are stored in the browser only.
- No brands, vendors/stores, reviews, ratings, stock, discounts or sort options.
  `/vendors` is a placeholder and the vendor dashboard lists recent products with
  `source = "vendor"` (there is no per-vendor ownership).
- Products have a single price and currency. Prices in another market currency
  are shown as an approximate ("≈") conversion using static rates in
  `config/locales.js`.
- No endpoint to resend a registration code; the OTP page links back to the
  registration form instead.
- Data exports stay `PENDING` until a background worker prepares them; the API
  has no worker yet, and `download` returns an opaque reference with no
  endpoint to fetch the file.
- No "list my exports" endpoint: the privacy page remembers the latest export
  request id in `localStorage`.
- Access control needs user and country IDs (UUIDs); there is no user search
  or country lookup endpoint.
