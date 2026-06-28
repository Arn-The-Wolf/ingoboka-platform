# Ingoboka Platform

Next.js 14 App Router frontend for the Ingoboka microinsurance platform (Rwanda).

## Local development

### 1. Start the API

Run the Ingoboka API locally on port **8080** (see the API repo / `.tmp-api` if bundled). The frontend expects:

```
http://localhost:8080/api/v1
```

### 2. Configure the frontend

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

`.env.local` should contain:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

Do **not** point at remote hosts (e.g. `185.181.10.165`) for local work.

### 3. Open the app

http://localhost:3000

Default locale: `rw` — e.g. http://localhost:3000/rw/login

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint

## Public marketing site

| Route | Page |
|-------|------|
| `/rw` | Home |
| `/rw/features` | Features |
| `/rw/how-it-works` | How it works |
| `/rw/plans` | Insurance plans |
| `/rw/about` | About |
| `/rw/faq` | FAQ |
| `/rw/contact` | Contact |
| `/rw/privacy` | Privacy policy |
| `/rw/terms` | Terms of service |

Replace `/rw` with `/en` for English.

## Portals

| Route | Portal |
|-------|--------|
| `/rw/login` | Auth |
| `/rw/dashboard` | Citizen policy wallet |
| `/rw/insurer/dashboard` | Insurer claims queue |
| `/rw/agent/dashboard` | Agent applications |
| `/rw/admin/dashboard` | Platform admin |
| `/rw/verify/:token` | Public QR verification |

Locales: `rw` (default), `en`

## Demo credentials (local API with seed data)

| Role | Sign in with | Password |
|------|----------------|----------|
| Citizen | Phone `0780000001` (or email after register) | `Ingoboka@2026` |
| Partner admin | `eric@demo-insurer.rw` | `Ingoboka@2026` |
| Claims officer | `claims@demo-insurer.rw` | `Ingoboka@2026` |
| Agent | `agent@demo-insurer.rw` | `Ingoboka@2026` |
| Platform admin | `agressive.one04@gmail.com` | `admin@123` |

Citizen login uses **phone** tab with `0780000001` and country `+250` (sent to API as `+250780000001`).
