import type { NextConfig } from 'next';

// Static hosting (GitHub Pages) serves from /<repo>; set by the deploy workflow.
const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? '/NOESIS' : '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: { unoptimized: true },
  ...(pages
    ? { output: 'export', basePath, assetPrefix: basePath, trailingSlash: true }
    : {
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
