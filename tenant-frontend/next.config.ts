/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["tenanncy.vercel.app"],
    unoptimized: process.env.NODE_ENV === "production", // Disable optimization if issues persist
  },
  // Remove turbopack if causing issues in production
  experimental: {
    turbo: undefined,
  },
};

module.exports = nextConfig;
