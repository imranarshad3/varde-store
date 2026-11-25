# VARDE — Low Tide lookbook store

A Next.js (App Router) + React + GSAP storefront with an animated runway lookbook, quick-add, saved items and a bag drawer.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Push this folder to a GitHub repo and import it at https://vercel.com/new. No settings to change: Vercel detects Next.js automatically.

Or from this folder, with the Vercel CLI:

```bash
npx vercel --prod
```

## Where things live

- `lib/data.ts`: the 9 looks and 36 products (names, prices, images)
- `components/Lookbook.tsx`: the runway and its GSAP animation
- `components/ProductGrid.tsx`: the 2×2 pieces grid
- `components/QuickAdd.tsx`, `components/BagDrawer.tsx`: shopping flow
- `public/img/`: model cut-outs (`m1–m9`) and product shots (`p{look}_{n}`)

The model and product photos are AI-generated placeholders. Swap in your own images with the same file names.
