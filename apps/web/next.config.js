/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable all optimizations that might cause hanging
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  // Disable webpack optimizations
  webpack: (config) => {
    config.optimization.minimize = false;
    // Disable tracing to avoid file permission issues
    config.devtool = false;
    return config;
  },
  // Disable experimental features
  experimental: {
    // Disable all experimental features that might cause issues
  },
};

module.exports = nextConfig;
