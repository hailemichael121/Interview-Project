import { authClient } from "./auth-client";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function apiFetch(url: string, options: RequestInit = {}) {
  const session = await authClient.getSession();
  const headers = {
    "Content-Type": "application/json",
    ...(session.data?.session ? { Authorization: `Bearer ${session.data.session.token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${apiBase}${url}`, { ...options, headers });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Org APIs
export async function getOrganizations() {
  return apiFetch("/organizations");
}

export async function createOrganization(data: { name: string; description?: string }) {
  return apiFetch("/organizations", { method: "POST", body: JSON.stringify(data) });
}

// Outline APIs (scoped to org)
export async function getOutlines(orgId: string) {
  return apiFetch(`/organizations/${orgId}/outlines`);
}

export async function createOutline(orgId: string, data: any) {
  return apiFetch(`/organizations/${orgId}/outlines`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateOutline(orgId: string, outlineId: string, data: any) {
  return apiFetch(`/organizations/${orgId}/outlines/${outlineId}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteOutline(orgId: string, outlineId: string) {
  return apiFetch(`/organizations/${orgId}/outlines/${outlineId}`, { method: "DELETE" });
}

// Team APIs (scoped to org)
export async function getTeamMembers(orgId: string) {
  return apiFetch(`/organizations/${orgId}/members`);
}

export async function inviteMember(orgId: string, data: { email: string; role: "owner" | "member" }) {
  return apiFetch(`/organizations/${orgId}/invite`, { method: "POST", body: JSON.stringify(data) });
}

export async function removeMember(orgId: string, userId: string) {
  return apiFetch(`/organizations/${orgId}/members/${userId}`, { method: "DELETE" });
}