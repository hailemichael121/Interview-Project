/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tenanncy.vercel.app',
      },
    ],
    unoptimized: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
