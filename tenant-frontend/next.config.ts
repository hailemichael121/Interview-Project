// next.config.js - FIXED for Render
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Keep this for Render

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.onrender.com",
      },
    ],
  },

  // Keep rewrites but update for production
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
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

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://tenanncy.onrender.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Organization-Id, Cookie, Authorization, Origin",
          },
          // ✅ ADD THIS: Allows Set-Cookie to be exposed to frontend
          {
            key: "Access-Control-Expose-Headers",
            value: "Set-Cookie",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
