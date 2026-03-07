# Deployment Guide

## Vercel Deployment

This app is configured for Vercel deployment via `vercel.json`.

### Required Environment Variables on Vercel

Set these in the Vercel dashboard under Project > Settings > Environment Variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Random 32+ character secret for session cookies |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL (https://api.manus.im) |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (https://manus.im) |
| `OWNER_OPEN_ID` | Owner's Manus OpenID |
| `OWNER_NAME` | Owner's display name |

### Deploy Steps

1. Push the code to a GitHub repository
2. Connect the repository to Vercel
3. Set all environment variables listed above
4. Deploy — Vercel will run `pnpm build` automatically

### Admin Panel Access

Navigate to `/admin` and enter the password: **weareme**

### Telegram Bot

The bot token and chat ID are hardcoded in `server/routers.ts`. You can update them via the Admin Panel > Telegram Config tab.
