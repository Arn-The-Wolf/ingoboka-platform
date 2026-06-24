# Ingoboka Platform

Next.js 14 App Router frontend for the Ingoboka microinsurance platform (Rwanda).

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

App: http://localhost:3000

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to your Ingoboka API.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint

## Portals

| Route | Portal |
|-------|--------|
| `/rw/login` | Auth |
| `/rw/dashboard` | Citizen policy wallet |
| `/rw/insurer/dashboard` | Insurer claims queue |
| `/rw/verify/:token` | Public QR verification |

Locales: `rw` (default), `en`
