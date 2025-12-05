"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import authClient from "@/lib/auth-client";

interface AuthRedirectProps {
  children: React.ReactNode;
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        router.push("/dashboard");
      }
    };

    checkIfLoggedIn();
  }, [router]);

  return <>{children}</>;
}
