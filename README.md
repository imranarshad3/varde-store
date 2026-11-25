# VARDE — Low Tide store

Next.js (App Router) + React + GSAP storefront with a Postgres-backed admin.

## Pages
Store: `/` lookbook home · `/shop` · `/product/[slug]` · `/cart` · `/checkout` · `/lookbook` · `/about` · `/journal` · `/account` · `/contact` · `/faq` · `/shipping-returns` · `/size-guide`
Admin: `/admin` dashboard · products · orders (CSV export) · discounts · reviews · customers · messages · settings

Features: discount codes (starter code `WELCOME10`), moderated reviews with star ratings, back-in-stock waitlist, instant search (press `/`), recently viewed.

## Environment variables (Vercel → Settings → Environment Variables)
- `DATABASE_URL` (or `POSTGRES_URL`): added automatically when you connect a Neon database. Tables are created and the catalogue is seeded on first request.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: the admin login.
- `SESSION_SECRET` (optional): long random string for signing sessions.

Without a database the store still runs on the built-in catalogue; saving orders, messages and admin edits needs the database.

## Local
```bash
npm install
DATABASE_URL=postgres://... ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=... npm run dev
```

Photos in `public/img` are AI-generated placeholders.
