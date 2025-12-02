// components/team/team-stats.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Mail } from "lucide-react";
import { OrganizationMember } from "@/types/types";

interface TeamStatsProps {
  members: OrganizationMember[];
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    expires: string;
    createdAt: string;
    organizationId: string;
    organization?: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export function TeamStats({ members, invitations }: TeamStatsProps) {
  const totalMembers = members.length;
  const ownersCount = members.filter((m) => m.role === "OWNER").length;
  const pendingInvitations = invitations.filter((i) => i.status === "PENDING").length;

  const stats = [
    {
      title: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Owners",
      value: ownersCount,
      icon: Crown,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Pending Invites",
      value: pendingInvitations,
      icon: Mail,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}