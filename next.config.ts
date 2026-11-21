import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/password/reset',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  async rewrites() {
    const target = (
      process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000'
    ).replace(/\/$/, '');
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },
};

export default nextConfig;
