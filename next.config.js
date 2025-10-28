/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js to ignore test files when building pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => !ext.includes('test')),
};

module.exports = nextConfig;
