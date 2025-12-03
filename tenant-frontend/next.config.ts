// next.config.js - UPDATED
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.onrender.com",
      },
    ],
  },

  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://tenant-backend-cz23.onrender.com";

    return [
      // Auth routes
      {
        source: "/api/auth/:path*",
        destination: `${backendUrl}/api/auth/:path*`,
      },
      // Organization routes (with /api/)
      {
        source: "/api/organization/:path*",
        destination: `${backendUrl}/api/organization/:path*`,
      },
      // Outline routes (with /api/)
      {
        source: "/api/outlines/:path*",
        destination: `${backendUrl}/api/outlines/:path*`,
      },
      // User routes (NO /api/ prefix)
      {
        source: "/users/:path*",
        destination: `${backendUrl}/users/:path*`,
      },
    ];
  },

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
