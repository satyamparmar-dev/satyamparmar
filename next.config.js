/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/satyamparmar' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/satyamparmar/' : '',
      // Performance optimizations
      experimental: {
        // optimizeCss: true, // Disabled due to critters dependency issues
      },
  // Reduce bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
      // Enable compression
      compress: true,
}

module.exports = nextConfig
