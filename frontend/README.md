# Ingoboka Frontend

Next.js 14 App Router frontend for the Ingoboka microinsurance platform.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

- `npm run dev` — development server (http://localhost:3000)
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
