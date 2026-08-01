# Ingoboka Platform - Frontend

> Digital microinsurance platform for Rwanda - Empowering citizens with affordable insurance

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

## 🌟 Overview

Ingoboka is a B2B2C digital insurance platform designed for Rwanda, enabling:
- **Citizens** to enroll in affordable micro-insurance products
- **Insurers** to manage product catalogs and process claims
- **Agents** to assist customers with enrollment
- **Platform Admins** to onboard partners and monitor the ecosystem

### Key Features

✅ Multi-role authentication (Citizen, Insurer, Agent, Admin)  
✅ Product catalog with daily/weekly/monthly premiums  
✅ Needs assessment with AI recommendations  
✅ Digital policy cards with QR verification  
✅ Claims submission and tracking  
✅ Mobile money payment integration  
✅ Bilingual support (Kinyarwanda & English)  
✅ Progressive Web App (PWA) ready  
✅ Responsive design (mobile-first)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Backend API** running (see `.tmp-api/README.md`)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Configure API endpoint
# Edit .env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# 4. Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 📦 Project Structure


```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── (admin)/       # Platform admin dashboard
│   │   ├── (agent)/       # Agent workspace
│   │   ├── (auth)/        # Login, register, verify
│   │   ├── (citizen)/     # Citizen dashboard & features
│   │   ├── (insurer)/     # Insurer portal
│   │   └── (marketing)/   # Public landing pages
│   ├── api/               # API routes (if needed)
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── citizen/          # Citizen-specific features
│   ├── insurer/          # Insurer-specific features
│   ├── landing/          # Landing page sections
│   ├── layout/           # Layout components
│   ├── navigation/       # Navigation components
│   └── ui/               # Reusable UI components
│
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-policies.ts   # Policy management
│   └── use-claims.ts     # Claims management
│
├── lib/                  # Utilities & helpers
│   ├── api/              # API client modules
│   ├── auth/             # Auth utilities
│   └── utils.ts          # General utilities
│
├── i18n/                 # Internationalization
│   ├── messages/         # Translation files
│   │   ├── en.json       # English
│   │   └── rw.json       # Kinyarwanda
│   ├── request.ts
│   └── routing.ts
│
├── store/                # State management (Zustand)
│   └── auth-store.ts     # Authentication state
│
├── types/                # TypeScript definitions
│   └── index.ts
│
└── middleware.ts         # Next.js middleware
```

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` file with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Application
NEXT_PUBLIC_APP_NAME=Ingoboka
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Features
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_DEFAULT_LOCALE=RW
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Type Checking
npm run type-check   # Run TypeScript compiler check
```

---

## 🎨 User Roles & Access

### 👤 Citizen
**Routes:** `/dashboard`, `/products`, `/policies`, `/claims`

**Features:**
- Browse insurance products
- Take needs assessment quiz
- Enroll in policies
- View policy wallet with QR codes
- Submit and track claims
- Manage dependants

### 🤝 Agent
**Routes:** `/agent/dashboard`

**Features:**
- Assist citizens with enrollment
- Create applications on behalf of customers
- Track conversion metrics

### 🏢 Insurer (Partner)
**Routes:** `/insurer/dashboard`, `/insurer/products`, `/insurer/claims`

**Features:**
- Create and manage insurance products
- Review and approve applications
- Process claim decisions
- View analytics and reports

### ⚙️ Platform Admin
**Routes:** `/admin/dashboard`, `/admin/users`, `/admin/organizations`

**Features:**
- Onboard new insurance partners
- Monitor platform metrics
- View audit logs
- Manage users and organizations

---

## 🌍 Internationalization (i18n)

The platform supports two languages:

- **🇷🇼 Kinyarwanda (RW)** - Default
- **🇬🇧 English (EN)**

### Switching Languages

Users can switch languages via the language selector in the navigation.

### Adding Translations

1. Edit translation files in `src/i18n/messages/`
2. Add keys to both `en.json` and `rw.json`
3. Use in components:

```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('componentName');
  return <h1>{t('title')}</h1>;
}
```

---

## 🎭 Authentication Flow


### Registration (Citizens)

1. User provides: Name, Phone, Email, National ID, Password
2. OTP sent via email/SMS
3. User verifies OTP
4. User grants consent (data processing, terms)
5. Redirected to dashboard

### Login

- **Citizens:** Login with phone or email + password
- **Staff (Insurer/Agent/Admin):** Login with email + password
- JWT tokens stored in localStorage
- Automatic token refresh

### Demo Credentials

For testing purposes:

| Role | Email/Phone | Password |
|------|-------------|----------|
| Citizen | `+250780000001` | `Ingoboka@2026` |
| Insurer Admin | `eric@demo-insurer.rw` | `Ingoboka@2026` |
| Agent | `agent@demo-insurer.rw` | `Ingoboka@2026` |

---

## 🎨 Styling & Theming

### Design System

- **UI Library:** Radix UI primitives
- **Styling:** Tailwind CSS utility classes
- **Icons:** Lucide React
- **Animations:** Framer Motion

### Color Palette

```css
/* Primary (Brand) */
--brand-primary: #10b981 (Green)
--brand-secondary: #3b82f6 (Blue)
--brand-accent: #fbbf24 (Amber)

/* Admin Theme */
--admin-primary: #22c55e (Green)
--admin-secondary: #6366f1 (Indigo)

/* Semantic */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Customization

Edit `tailwind.config.ts` to customize colors, spacing, and more.

---

## 📱 Progressive Web App (PWA)

The app can be installed on mobile devices:

### Features
- Offline support
- App manifest
- Service worker
- Installable on Android/iOS
- Push notifications (future)

### Configuration

PWA settings in `next.config.mjs`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});
```

---

## 🔌 API Integration

### API Client

Located in `src/lib/api/`:

```typescript
// Example usage
import { authApi } from '@/lib/api/auth';

const login = async () => {
  const response = await authApi.login({
    phone: '+250780000001',
    password: 'password'
  });
  // response.accessToken, response.user
};
```

### Available API Modules

- `auth.ts` - Authentication
- `products.ts` - Product catalog
- `policies.ts` - Policy management
- `claims.ts` - Claims handling
- `admin.ts` - Admin operations

### Error Handling

```typescript
try {
  await someApiCall();
} catch (error) {
  if (error.status === 401) {
    // Unauthorized - redirect to login
  } else {
    // Show error message
    console.error(error.message);
  }
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests (to be implemented)
npm test

# E2E tests (to be implemented)
npm run test:e2e

# Coverage
npm run test:coverage
```

### Recommended Testing Stack

- **Unit:** Jest + React Testing Library
- **E2E:** Playwright or Cypress
- **Component:** Storybook (optional)

---

## 🚢 Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

```bash
# Or deploy manually
npm run build
vercel --prod
```

### Docker

```dockerfile
# Dockerfile included in project
docker build -t ingoboka-frontend .
docker run -p 3000:3000 ingoboka-frontend
```

### Environment-Specific Builds

```bash
# Staging
NEXT_PUBLIC_API_BASE_URL=https://staging-api.ingoboka.rw npm run build

# Production
NEXT_PUBLIC_API_BASE_URL=https://api.ingoboka.rw npm run build
```

---

## 🔒 Security

### Implemented Measures

✅ JWT authentication with refresh tokens  
✅ CSRF protection  
✅ XSS prevention (React escaping)  
✅ Secure HTTP-only cookies (optional)  
✅ Input validation (Zod schemas)  
✅ Role-based access control  

### Security Best Practices

- Never commit `.env.local` files
- Use HTTPS in production
- Implement rate limiting on API
- Regular dependency updates
- Security audits

---

## 📊 Performance

### Optimizations

- ✅ Code splitting (automatic in Next.js)
- ✅ Image optimization (`next/image`)
- ✅ React Query caching
- ✅ Static generation where possible
- ✅ Lazy loading components

### Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint | < 1.5s | ✅ |
| Largest Contentful Paint | < 2.5s | ✅ |
| Time to Interactive | < 3.5s | ✅ |
| Cumulative Layout Shift | < 0.1 | ✅ |

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

#### API Connection Failed

1. Check backend is running
2. Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Check CORS settings on backend

#### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Additional Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/primitives/docs)

### Backend API

- Backend README: `.tmp-api/README.md`
- API Documentation: `http://localhost:8085/swagger-ui/index.html`
- System Architecture: `.tmp-api/docs/architecture/`

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit with meaningful message
4. Push and create pull request
5. Request review from team

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful component names
- Add comments for complex logic

---

## 📝 License

Proprietary - Ingoboka Platform Team

---

## 👥 Team

- **Backend:** Rodin Mahinga
- **Frontend:** Arnold
- **Platform:** Ingoboka Team

---

## 📞 Support

For issues or questions:
- 📧 Email: support@ingoboka.rw
- 🐛 Issues: GitHub Issues
- 💬 Slack: #ingoboka-dev

---

**Made with ❤️ for Rwanda**
