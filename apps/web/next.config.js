/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static generation completely
  trailingSlash: false,
  // Use standalone output
  output: 'standalone',
  // Disable static optimization
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

module.exports = nextConfig;
