// lib/api.ts (update with mock data)
import { authClient } from "./auth-client";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const useMockApi =
  process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" ||
  !process.env.NEXT_PUBLIC_BACKEND_URL;

// Mock data
const mockOutlines = [
  {
    id: "1",
    header: "Cover Page",
    sectionType: "Executive Summary",
    status: "Completed" as const,
    target: 5,
    limit: 10,
    reviewer: "Assim" as const,
  },
  {
    id: "2",
    header: "Table of Contents",
    sectionType: "Table of Contents",
    status: "In-Progress" as const,
    target: 3,
    limit: 8,
    reviewer: "Bini" as const,
  },
  {
    id: "3",
    header: "Technical Approach",
    sectionType: "Technical Approach",
    status: "Pending" as const,
    target: 7,
    limit: 15,
    reviewer: "Mami" as const,
  },
];

const mockOrganizations = [
  {
    id: "1",
    name: "Acme Inc",
    role: "owner" as const,
  },
  {
    id: "2",
    name: "Tech Corp",
    role: "member" as const,
  },
];

const mockTeamMembers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner" as const,
    avatar: "JD",
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@example.com",
    role: "member" as const,
    avatar: "AS",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "member" as const,
    avatar: "BJ",
  },
];

export async function apiFetch(url: string, options: RequestInit = {}) {
  if (useMockApi) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock responses based on URL
    if (url === "/organizations") {
      return mockOrganizations;
    }

    if (url.match(/\/organizations\/.+\/outlines/)) {
      return mockOutlines;
    }

    if (url.match(/\/organizations\/.+\/members/)) {
      return mockTeamMembers;
    }

    if (url === "/organizations" && options.method === "POST") {
      const body = JSON.parse(options.body as string);
      const newOrg = {
        id: Date.now().toString(),
        name: body.name,
        role: "owner" as const,
      };
      mockOrganizations.push(newOrg);
      return newOrg;
    }

    if (
      url.match(/\/organizations\/.+\/outlines/) &&
      options.method === "POST"
    ) {
      const body = JSON.parse(options.body as string);
      const newOutline = {
        id: Date.now().toString(),
        ...body,
      };
      mockOutlines.push(newOutline);
      return newOutline;
    }

    if (url.match(/\/organizations\/.+\/outlines\/.+/)) {
      if (options.method === "PUT") {
        const body = JSON.parse(options.body as string);
        const outlineId = url.split("/").pop();
        const index = mockOutlines.findIndex((o) => o.id === outlineId);
        if (index !== -1) {
          mockOutlines[index] = { ...mockOutlines[index], ...body };
        }
        return mockOutlines[index];
      }

      if (options.method === "DELETE") {
        const outlineId = url.split("/").pop();
        const index = mockOutlines.findIndex((o) => o.id === outlineId);
        if (index !== -1) {
          mockOutlines.splice(index, 1);
        }
        return { success: true };
      }
    }

    return { success: true };
  }

  // Real API implementation
  const session = await authClient.getSession();
  const headers = {
    "Content-Type": "application/json",
    ...(session.data?.session
      ? {
          Authorization: `Bearer ${session.data.session.token}`,
        }
      : {}),
    ...options.headers,
  };

  const res = await fetch(`${apiBase}${url}`, { ...options, headers });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Rest of your API functions remain the same...
export async function getOrganizations() {
  return apiFetch("/organizations");
}

export async function createOrganization(data: {
  name: string;
  description?: string;
}) {
  return apiFetch("/organizations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOutlines(orgId: string) {
  return apiFetch(`/organizations/${orgId}/outlines`);
}

export async function createOutline(orgId: string, data: any) {
  return apiFetch(`/organizations/${orgId}/outlines`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOutline(
  orgId: string,
  outlineId: string,
  data: any
) {
  return apiFetch(`/organizations/${orgId}/outlines/${outlineId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOutline(orgId: string, outlineId: string) {
  return apiFetch(`/organizations/${orgId}/outlines/${outlineId}`, {
    method: "DELETE",
  });
}

export async function getTeamMembers(orgId: string) {
  return apiFetch(`/organizations/${orgId}/members`);
}

export async function inviteMember(
  orgId: string,
  data: { email: string; role: "owner" | "member" }
) {
  return apiFetch(`/organizations/${orgId}/invite`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeMember(orgId: string, userId: string) {
  return apiFetch(`/organizations/${orgId}/members/${userId}`, {
    method: "DELETE",
  });
}
