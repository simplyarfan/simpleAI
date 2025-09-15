/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Image optimization settings
  images: {
    unoptimized: true,
    domains: ['localhost', 'thesimpleai.netlify.app', 'thesimpleai.vercel.app'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://thesimpleai.vercel.app/api',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Enterprise AI Hub',
    NEXT_PUBLIC_COMPANY_DOMAIN: process.env.NEXT_PUBLIC_COMPANY_DOMAIN || 'securemaxtech.com',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Remove static export configuration - use standard Next.js build
  trailingSlash: false,
  
  // Webpack configuration to handle potential module issues
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
