// app/dashboard/test/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api-service";

export default function TestDashboardPage() {
  const router = useRouter();
  const [authData, setAuthData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      // Check localStorage
      const token = localStorage.getItem("auth_token");
      const user = localStorage.getItem("auth_user");

      console.log("LocalStorage check:", { token, user });

      if (!token || !user) {
        setError("No authentication data found");
        setLoading(false);
        return;
      }

      try {
        const userObj = JSON.parse(user);
        setAuthData({ token, user: userObj });

        // Test API call
        const profileResponse = await apiService.user.getProfile();
        console.log("Profile response:", profileResponse);

        if (profileResponse.success) {
          setProfileData(profileResponse.data);
        } else {
          setError("Failed to fetch profile");
        }
      } catch (err) {
        console.error("Test error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOut = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/auth/signin");
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Auth Test Dashboard</h1>

      <div className="grid gap-6">
        {/* Authentication Status */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-red-600 dark:text-red-400 font-medium">
                Error: {error}
              </p>
            </div>
          ) : authData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Authenticated</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">
                    {authData.user.name || authData.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Token (first 20 chars)
                  </p>
                  <p className="font-mono text-sm">
                    {authData.token.substring(0, 20)}...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Not authenticated</p>
          )}
        </div>

        {/* Profile Data */}
        {profileData && (
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Profile Data</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/dashboard")}>
              Go to Real Dashboard
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">LocalStorage auth_token:</p>
              <p className="font-mono text-sm truncate">
                {localStorage.getItem("auth_token") || "Not found"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cookies:</p>
              <p className="font-mono text-sm">{document.cookie}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
