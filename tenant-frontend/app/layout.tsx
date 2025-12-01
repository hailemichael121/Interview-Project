// app/layout.tsx (update)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { OrgProvider } from "@/lib/org-context";
import { ThemeToggler } from "@/components/theme-toggler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workspace - Multi-Tenant App",
  description: "A modern multi-tenant workspace application",
  icons: {
    icon: "/images/tenant-light.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <OrgProvider>
            {children}
            <div className="fixed bottom-4 right-4 z-50">
              <ThemeToggler compact />
            </div>
            <Toaster />
          </OrgProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
