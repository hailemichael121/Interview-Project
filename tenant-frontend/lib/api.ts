export * from "./api-service";
export { default as apiService } from "./api-service";
export { default as useApi } from "@/hooks/use-api";

import apiService from "./api-service";

export const getOrganizations = apiService.organization.listUserOrganizations;
export const createOrganization = apiService.organization.createOrganization;
export const getOrganizationMembers = apiService.organization.listMembers;
export const getOutlines = apiService.outline.listOutlines;
export const createOutline = apiService.outline.createOutline;
export const updateOutline = apiService.outline.updateOutline;
export const deleteOutline = apiService.outline.deleteOutline;
export const getTeamMembers = apiService.organization.listMembers;
export const inviteMember = apiService.organization.inviteMember;
export const removeMember = apiService.organization.revokeMember;
export const getUserProfile = apiService.user.getProfile;
export const updateUserProfile = apiService.user.updateProfile;
export const getPendingInvitations =
  apiService.invitation.getPendingInvitations;
export const acceptInvitation = apiService.invitation.acceptInvitation;
