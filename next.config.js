/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/backend-engineering' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/backend-engineering/' : '',
}

module.exports = nextConfig
