/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'dhugaa-media.s3.amazonaws.com',
      'res.cloudinary.com',
      process.env.NEXT_PUBLIC_IMAGE_DOMAIN,
    ].filter(Boolean),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Disable webpack caching in development to avoid OneDrive file lock issues
  webpack: (config, { dev, isServer }) => {
    if (dev && process.platform === 'win32') {
      // Disable caching in development on Windows to avoid OneDrive issues
      config.cache = false;
    }
    return config;
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig

