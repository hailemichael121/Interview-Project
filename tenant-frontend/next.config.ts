/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tenanncy.vercel.app",
      },
    ],
    unoptimized: process.env.NODE_ENV === "production",
  },

  // Proxy API requests to your backend
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://tenant-backend-cz23.onrender.com";

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/auth/:path*`,
      },
      // Add other API endpoints you need to proxy
      {
        source: "/api/organization/:path*",
        destination: `${backendUrl}/api/organization/:path*`,
      },
      {
        source: "/api/outlines/:path*",
        destination: `${backendUrl}/api/outlines/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${backendUrl}/api/users/:path*`,
      },
    ];
  },

  // CORS headers for development
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production"
                ? "https://your-frontend-domain.vercel.app" // Change to your actual domain
                : "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Organization-Id",
          },
        ],
      },
    ];
  },

  // Optional: For better security in production
  experimental: {
    // Remove this if you're not using Turbopack
    turbo: {
      // Turbopack specific configurations if needed
    },
  },
};

module.exports = nextConfig;
