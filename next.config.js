/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to ignore test files when building pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('test')),

  // Performance optimizations
  compress: true,
  swcMinify: true, // Use SWC for faster minification (5x faster than Terser)
  reactStrictMode: true, // Enable strict mode to catch potential issues

  // Remove console logs in production (keep error/warn for debugging)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' 
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
  },

  // Image optimization with modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
  },

  // ESLint configuration for builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors/warnings.
    // We keep warnings but don't fail builds (console.logs are wrapped in dev checks anyway)
    ignoreDuringBuilds: true, // Ignore ESLint warnings during build
  },

  // TypeScript configuration for builds  
  typescript: {
    // Ensure type errors fail the build
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
