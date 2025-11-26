import { DashboardLayout } from "@/components/layout/dashboard-layout";

// Mock organization data - replace with actual data from auth context
const mockOrganization = {
  id: "1",
  name: "Acme Inc",
  role: "owner" as const
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout organization={mockOrganization}>
      {children}
    </DashboardLayout>
  );
}