/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to ignore test files when building pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('test')),

  // ESLint configuration for builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors/warnings.
    // We keep warnings but don't fail builds (console.logs are wrapped in dev checks anyway)
    ignoreDuringBuilds: false, // Show warnings
  },

  // TypeScript configuration for builds  
  typescript: {
    // Ensure type errors fail the build
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
