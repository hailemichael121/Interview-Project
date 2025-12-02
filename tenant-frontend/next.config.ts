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
            value:
              process.env.NODE_ENV === "production"
                ? "https://tenanncy.vercel.app"
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

  turbopack: {
    resolveAlias: {
      react: require.resolve("react"),
      "react-dom": require.resolve("react-dom"),
    },
  },
};

module.exports = nextConfig;
