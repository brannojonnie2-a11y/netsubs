/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  cacheComponents: true,
  env: {
    // Environment variables will be loaded from .env.local and .env.production
  },
};

module.exports = nextConfig;
