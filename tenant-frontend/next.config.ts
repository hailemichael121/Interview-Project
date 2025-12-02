// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For production deployment
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**.onrender.com",
      },
    ],
  },

  // Proxy only for local development
  async rewrites() {
    // In production, we make direct calls to backend
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // Local development proxy
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://tenant-backend-cz23.onrender.com";

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/auth/:path*`,
      },
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

  // CORS headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production"
              ? "https://tenanncy.vercel.app"
              : "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Organization-Id, Cookie, Authorization",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;