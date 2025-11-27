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
  // Remove social providers entirely
  plugins: [organization()],
  trustHost: true,
});
