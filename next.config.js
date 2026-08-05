const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable:
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_PWA !== 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '185.181.10.165',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const proxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '');
    if (!proxyTarget) {
      return [];
    }
    return [
      {
        source: '/api/v1/:path*',
        destination: `${proxyTarget}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = withPWA(withNextIntl(nextConfig));
