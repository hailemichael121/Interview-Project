// lib/api.ts
const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

function isMockApiActive() {
  // If backend url is missing, default to mock
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) return true;
  // If build-time env forces it
  if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true") return true;
  // If running in browser and toggle exists, respect it
  if (typeof window !== "undefined") {
    const v = localStorage.getItem("use-mock-auth");
    if (v !== null) return v === "true";
  }
  return false;
}

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
  if (isMockApiActive()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`[api][mock] ${options.method || 'GET'} ${url}`);
    const path = url.startsWith("/api") ? url.slice(4) : url; // strip /api prefix for matching

    // Mock responses based on URL/path
    if (path === "/organizations") {
      return mockOrganizations;
    }

    if (path === "/outlines" || path === "/api/outlines") {
      return mockOutlines;
    }

    if (path.match(/\/organizations\/.+\/outlines/) || path.match(/\/api\/outlines/)) {
      return mockOutlines;
    }

    if (path.match(/\/organizations\/.+\/members/) || path === "/team/members" || path === "/api/team/members") {
      return mockTeamMembers;
    }

    if (path === "/organizations" && options.method === "POST") {
      const body = JSON.parse(options.body as string);
      const newOrg = {
        id: Date.now().toString(),
        name: body.name,
        role: "owner" as const,
      };
      mockOrganizations.push(newOrg);
      return newOrg;
    }

    // create outline via /api/outlines or /organizations/:id/outlines
    if ((path === "/outlines" || path.match(/\/organizations\/.+\/outlines/)) && options.method === "POST") {
      const body = JSON.parse(options.body as string);
      const newOutline = {
        id: Date.now().toString(),
        ...body,
      };
      mockOutlines.push(newOutline);
      return newOutline;
    }

    // update/delete outline by id (support /api/outlines/:id or /organizations/:orgId/outlines/:id)
    if (path.match(/\/outlines\/[^/]+/) || path.match(/\/organizations\/.+\/outlines\/.+/)) {
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

  // Real API implementation - uses cookies for authentication
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers as Record<string, string>,
  };

  console.log(`[api] ${options.method || 'GET'} ${apiBase}${url}`);

  const res = await fetch(`${apiBase}${url}`, {
    ...options,
    headers,
    credentials: "include", // Important for cookies
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `API Error: ${res.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    console.log(`[api] response ok json ${url}`);
    return res.json();
  }
  console.log(`[api] response ok text ${url}`);
  return res.text();
}

// Rest of your API functions remain the same...
export async function getOutlines() {
  return apiFetch("/api/outlines");
}

export async function createOutline(data: {
  header: string;
  sectionType: string;
  status?: string;
  target: number;
  limit: number;
  reviewer: string;
}) {
  return apiFetch("/api/outlines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOutline(
  outlineId: string,
  data: Partial<{
    header: string;
    sectionType: string;
    status: string;
    target: number;
    limit: number;
    reviewer: string;
  }>
) {
  return apiFetch(`/api/outlines/${outlineId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOutline(outlineId: string) {
  return apiFetch(`/api/outlines/${outlineId}`, {
    method: "DELETE",
  });
}

export async function getTeamMembers() {
  return apiFetch("/api/team/members");
}

export async function inviteMember(data: { email: string; role?: string }) {
  return apiFetch("/api/team/invite", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeMember(userId: string) {
  return apiFetch("/api/team/revoke", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}
