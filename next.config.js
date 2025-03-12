// next.config.js (CORRECTED)
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Remove this later
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.chanel.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.nike.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // NO REWRITES NEEDED ANYMORE (or, at most, a no-op):
   async rewrites() {
     return [
       {
         source: '/api/:path*',
         destination: '/api/:path*', // Just forward to /api
       },
     ];
   },
};

export default nextConfig;
