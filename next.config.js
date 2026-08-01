/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for react-pdf compatibility with Next.js < v15
  swcMinify: false,
  
  // Image optimization for Core Web Vitals
  images: {
    domains: ['localhost', 'ijarcm.com', 'www.ijarcm.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@headlessui/react'],
  },
  
  // Compression
  compress: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration for PDF.js compatibility
  webpack: (config, { isServer }) => {
    // Fix for pdfjs-dist v4.x compatibility with Next.js
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle pdfjs-dist properly for react-pdf v10.x
    if (!isServer) {
      config.resolve.alias.pdfjs$ = 'pdfjs-dist/legacy/build/pdf.js';
      config.resolve.alias.pdfjsWorker$ = 'pdfjs-dist/legacy/build/pdf.worker.js';
    }
    
    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300'
          },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key, X-Site-Abbreviation' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
    ];
  },
  
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/public/:path*',
          destination: '/api/:path*',
        }
      ]
    };
  },
};

module.exports = nextConfig;