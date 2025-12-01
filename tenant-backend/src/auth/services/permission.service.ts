// src/auth/services/permission.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Role } from '../types/role.enum';

export interface OrganizationContext {
  organizationId: string;
  memberId: string;
  memberRole: Role;
}

export interface OutlineWithCreator {
  id: string;
  organizationId: string;
  createdByMemberId: string;
  reviewerId?: string | null;
}

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  /**
   * Check if user can create outline in organization
   */
  canCreateOutline(context: OrganizationContext): boolean {
    // USER role cannot create outlines in organizations
    const allowedRoles: Role[] = [Role.OWNER, Role.REVIEWER, Role.MEMBER];
    const canCreate = allowedRoles.includes(context.memberRole);
    this.logger.debug(
      `User ${context.memberId} can create outline: ${canCreate}`,
    );
    return canCreate;
  }

  /**
   * Check if user can update outline
   */
  canUpdateOutline(
    context: OrganizationContext,
    outline: OutlineWithCreator,
    updates: Record<string, any>,
  ): {
    allowed: boolean;
    reason?: string;
    allowedFields?: Record<string, any>;
  } {
    this.logger.debug(`Checking update permissions for outline ${outline.id}`);

    // 1. Must be in same organization
    if (context.organizationId !== outline.organizationId) {
      this.logger.warn(
        `Organization mismatch: ${context.organizationId} vs ${outline.organizationId}`,
      );
      return { allowed: false, reason: 'Not in same organization' };
    }

    // 2. USER role cannot update anything
    if (context.memberRole === Role.USER) {
      return { allowed: false, reason: 'USER role cannot update outlines' };
    }

    // 3. Check by role
    const isCreator = outline.createdByMemberId === context.memberId;
    const isAssignedReviewer = outline.reviewerId === context.memberId;

    this.logger.debug(
      `User role: ${context.memberRole}, isCreator: ${isCreator}, isAssignedReviewer: ${isAssignedReviewer}`,
    );

    switch (context.memberRole) {
      case Role.OWNER:
        // Owner can update everything
        this.logger.debug('Owner has full update permissions');
        return {
          allowed: true,
          allowedFields: updates,
        };

      case Role.REVIEWER:
        // Reviewer can only update status if they're assigned as reviewer
        if (isAssignedReviewer) {
          const isUpdatingStatus = 'status' in updates;
          const onlyStatusUpdate =
            Object.keys(updates).length === 1 && isUpdatingStatus;

          if (onlyStatusUpdate) {
            this.logger.debug('Reviewer can update status of assigned outline');
            return {
              allowed: true,
              allowedFields: { status: updates.status },
            };
          }
        }
        this.logger.warn('Reviewer cannot update outline');
        return {
          allowed: false,
          reason:
            'Reviewers can only update status of outlines assigned to them',
        };

      case Role.MEMBER:
        if (!isCreator) {
          this.logger.warn('Non-creator member cannot update outline');
          return {
            allowed: false,
            reason: 'Only creators can update their outlines',
          };
        }

        // Creator can update all fields except status (unless they're also the reviewer)
        const isTryingToUpdateStatus = 'status' in updates;

        if (isTryingToUpdateStatus && !isAssignedReviewer) {
          this.logger.warn('Creator cannot update status unless also reviewer');
          return {
            allowed: false,
            reason:
              'Creators cannot update status unless they are also the assigned reviewer',
          };
        }

        // If creator is also reviewer, they can update status
        if (isCreator && isAssignedReviewer) {
          this.logger.debug('Creator-reviewer has full update permissions');
          return { allowed: true, allowedFields: updates };
        }

        // Creator can update all other fields
        const { status, ...otherFields } = updates;
        this.logger.debug('Creator can update all fields except status');
        return { allowed: true, allowedFields: otherFields };

      default:
        this.logger.warn(`Invalid role for update: ${context.memberRole}`);
        return { allowed: false, reason: 'Insufficient permissions' };
    }
  }

  /**
   * Check if user can delete outline
   */
  canDeleteOutline(
    context: OrganizationContext,
    outline: OutlineWithCreator,
  ): boolean {
    if (context.organizationId !== outline.organizationId) {
      this.logger.warn(
        `Organization mismatch for delete: ${context.organizationId} vs ${outline.organizationId}`,
      );
      return false;
    }

    // USER role cannot delete anything
    if (context.memberRole === Role.USER) {
      return false;
    }

    // Only owner or creator can delete
    const canDelete =
      context.memberRole === Role.OWNER ||
      outline.createdByMemberId === context.memberId;
    this.logger.debug(
      `User ${context.memberId} can delete outline ${outline.id}: ${canDelete}`,
    );
    return canDelete;
  }

  /**
   * Check if user can view outline
   */
  canViewOutline(
    context: OrganizationContext,
    outline: OutlineWithCreator,
  ): boolean {
    // All members (except USER role in organizations) can view outlines in their organization
    if (context.memberRole === Role.USER) {
      return false;
    }

    const canView = context.organizationId === outline.organizationId;
    this.logger.debug(
      `User ${context.memberId} can view outline ${outline.id}: ${canView}`,
    );
    return canView;
  }

  /**
   * Check if user can view organization details
   */
  canViewOrganization(context: OrganizationContext): boolean {
    const canView = [Role.OWNER, Role.REVIEWER, Role.MEMBER].includes(
      context.memberRole,
    );
    this.logger.debug(
      `User ${context.memberId} can view organization: ${canView}`,
    );
    return canView;
  }

  /**
   * Check if user can manage members
   */
  canManageMembers(context: OrganizationContext): boolean {
    const canManage = context.memberRole === Role.OWNER;
    this.logger.debug(
      `User ${context.memberId} can manage members: ${canManage}`,
    );
    return canManage;
  }

  /**
   * Check if user can invite members
   */
  canInviteMembers(context: OrganizationContext): boolean {
    const canInvite = context.memberRole === Role.OWNER;
    this.logger.debug(
      `User ${context.memberId} can invite members: ${canInvite}`,
    );
    return canInvite;
  }

  /**
   * Check if user can update organization
   */
  canUpdateOrganization(context: OrganizationContext): boolean {
    const canUpdate = context.memberRole === Role.OWNER;
    this.logger.debug(
      `User ${context.memberId} can update organization: ${canUpdate}`,
    );
    return canUpdate;
  }
}
