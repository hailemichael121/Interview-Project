import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins/organization";

export const auth = betterAuth({
  database: {
    type: "postgres", 
    connection: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    organization()
  ],
  trustHost: true,
});