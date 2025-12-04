// app/layout.tsx - UPDATED
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { OrgProvider } from "@/lib/org-context";
import { ThemeToggler } from "@/components/theme-toggler";
import { QueryProvider } from "@/lib/query-client";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workspace - Multi-Tenant App",
  description: "A modern multi-tenant workspace application",
  icons: {
    icon: "/images/tenant-light.png",
  },
};

const PaperOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-9999 paper-overlay" />
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body
        suppressHydrationWarning={true}
        className={`antialiased font-sans`}
      >
        <QueryProvider>
          <ThemeProvider>
            <OrgProvider>
              <PaperOverlay />
              {children}
              <div className="fixed bottom-4 right-4 z-50">
                <ThemeToggler compact />
              </div>
              <Toaster />
            </OrgProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}