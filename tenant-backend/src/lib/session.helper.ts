import { Request } from 'express';
import { AuthService } from '../auth/auth.service';

export interface SessionData {
  user?: {
    id: string;
    name?: string | null;
    email: string;
  };
  session?: {
    userId: string;
    organizationId?: string;
  };
  activeOrganizationId?: string;
  userId?: string;
  organizationId?: string;
}

export async function getSessionFromRequest(req: Request, authService: AuthService): Promise<SessionData | null> {
  try {
    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([k, v]) => {
      if (v) {
        headers[k] = Array.isArray(v) ? v.join(', ') : (v as string);
      }
    });

    // Use Better Auth handler to get session - path should be /session (not /api/auth/session)
    const handler = await authService.auth.handler({
      method: 'GET',
      headers: headers as any,
      url: '/session',
      body: undefined,
      query: new URLSearchParams(),
    });

    if (handler && handler.body) {
      const sessionData = typeof handler.body === 'string' ? JSON.parse(handler.body) : handler.body;
      
      if (sessionData?.user || sessionData?.session) {
        const user = sessionData.user || sessionData;
        const userId = user?.id || sessionData.session?.userId;
        
        // Get active organization - Better Auth organization plugin stores this in session
        // We may need to query the database to get the user's active organization
        let activeOrgId = 
          sessionData.activeOrganizationId || 
          sessionData.organizationId || 
          sessionData.session?.organizationId ||
          headers['x-organization-id'] || 
          headers['x-active-organization-id'];
        
        // If no active org in session, try to get from database
        if (!activeOrgId && userId) {
          const { prisma } = await import('./prisma');
          const member = await prisma.organizationMember.findFirst({
            where: { userId },
            orderBy: { joinedAt: 'asc' }, // Get the first/oldest organization
          });
          activeOrgId = member?.organizationId;
        }
        
        return {
          user: user,
          session: sessionData.session,
          userId: userId,
          activeOrganizationId: activeOrgId,
          organizationId: activeOrgId,
        };
      }
    }
  } catch (err) {
    console.error('Session retrieval error:', err);
  }

  // Fallback to headers
  const userId = req.headers['x-user-id'] as string | undefined;
  const organizationId = req.headers['x-organization-id'] as string | undefined;
  
  if (userId) {
    return {
      userId,
      organizationId,
      activeOrganizationId: organizationId,
    };
  }

  return null;
}

