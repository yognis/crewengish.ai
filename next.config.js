/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to ignore test files when building pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('test')),

  // Allow access from local network devices (mobile phones, tablets, etc.)
  experimental: {
    allowedDevOrigins: ['192.168.1.5'],
  },
};

module.exports = nextConfig;
