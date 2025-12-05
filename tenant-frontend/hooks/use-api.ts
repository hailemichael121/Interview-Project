/* eslint-disable @typescript-eslint/no-explicit-any */
import apiService from "@/lib/api-service";
import {
  UpdateUserDto,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  InviteMemberDto,
  CreateOutlineDto,
  UpdateOutlineDto,
  UserProfileResponse,
  OrganizationListResponse,
  InvitationListResponse,
} from "@/types/types";
import { useCallback, useState } from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useApiCall = () => {
  const callApi = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      onSuccess?: (data: T) => void,
      onError?: (error: string) => void
    ): Promise<T | null> => {
      try {
        const result = await apiCall();
        onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        onError?.(errorMessage);
        return null;
      }
    },
    []
  );

  return callApi;
};

export const useApi = () => {
  const callApi = useApiCall();

  // ==================== AUTH HOOKS ====================
  const useAuthSignUp = () => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: false,
      error: null,
    });

    const signUp = useCallback(
      async (data: { name: string; email: string; password: string }) => {
        setState({ data: null, loading: true, error: null });
        return callApi(
          () => apiService.auth.signUp(data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      []
    );

    return { ...state, signUp };
  };

  const useAuthSignIn = () => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: false,
      error: null,
    });

    const signIn = useCallback(
      async (data: { email: string; password: string }) => {
        setState({ data: null, loading: true, error: null });
        return callApi(
          () => apiService.auth.signIn(data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      []
    );

    return { ...state, signIn };
  };

  const useAuthSession = () => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: true,
      error: null,
    });

    const getSession = useCallback(async () => {
      setState((prev) => ({ ...prev, loading: true }));
      return callApi(
        () => apiService.auth.getSession(),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, []);

    return { ...state, getSession };
  };

  // ==================== USER HOOKS ====================
  const useUserProfile = () => {
    const [state, setState] = useState<ApiState<UserProfileResponse>>({
      data: null,
      loading: true,
      error: null,
    });

    const getProfile = useCallback(async () => {
      setState((prev) => ({ ...prev, loading: true }));
      return callApi(
        () => apiService.user.getProfile(),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, []);

    const updateProfile = useCallback(async (data: UpdateUserDto) => {
      setState((prev) => ({ ...prev, loading: true }));
      return callApi(
        () => apiService.user.updateProfile(data),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, []);

    return { ...state, getProfile, updateProfile };
  };

  // ==================== ORGANIZATION HOOKS ====================
  const useOrganizations = () => {
    const [state, setState] = useState<ApiState<OrganizationListResponse>>({
      data: null,
      loading: false,
      error: null,
    });

    const createOrganization = useCallback(
      async (data: CreateOrganizationDto) => {
        setState({ data: null, loading: true, error: null });
        return callApi<any>(
          () => apiService.organization.createOrganization(data),
          (result) =>
            setState({ data: result as any, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      []
    );

    const listOrganizations = useCallback(async (page = 1, perPage = 10) => {
      setState({ data: null, loading: true, error: null });
      return callApi(
        () => apiService.organization.listUserOrganizations(page, perPage),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, []);

    return { ...state, createOrganization, listOrganizations };
  };

  // ==================== INVITATION HOOKS ====================
  const useInvitations = () => {
    const [listState, setListState] = useState<
      ApiState<InvitationListResponse>
    >({
      data: null,
      loading: true,
      error: null,
    });

    const [actionState, setActionState] = useState<
      ApiState<{ message: string } | null>
    >({
      data: null,
      loading: false,
      error: null,
    });

    const getPendingInvitations = useCallback(async () => {
      setListState((prev) => ({ ...prev, loading: true }));
      return callApi(
        () => apiService.invitation.getPendingInvitations(),
        (result) => setListState({ data: result, loading: false, error: null }),
        (error) => setListState({ data: null, loading: false, error })
      );
    }, []);

    const acceptInvitation = useCallback(async (invitationId: string) => {
      setActionState({ data: null, loading: true, error: null });
      return callApi(
        () => apiService.invitation.acceptInvitation(invitationId),
        (result) =>
          setActionState({ data: result as any, loading: false, error: null }),
        (error) => setActionState({ data: null, loading: false, error })
      );
    }, []);

    const declineInvitation = useCallback(async (invitationId: string) => {
      setActionState({ data: null, loading: true, error: null });
      return callApi(
        () => apiService.invitation.declineInvitation(invitationId),
        (result) =>
          setActionState({ data: result as any, loading: false, error: null }),
        (error) => setActionState({ data: null, loading: false, error })
      );
    }, []);

    return {
      ...listState,
      action: actionState,
      getPendingInvitations,
      acceptInvitation,
      declineInvitation,
    };
  };

  // ==================== OTHER HOOKS (unchanged) ====================
  const useOrganization = (organizationId?: string) => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: !!organizationId,
      error: null,
    });

    const getDetails = useCallback(async () => {
      if (!organizationId) return null;
      setState((prev) => ({ ...prev, loading: true }));
      return callApi(
        () => apiService.organization.getOrganizationDetails(organizationId),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [organizationId]);

    const updateOrganization = useCallback(
      async (data: UpdateOrganizationDto) => {
        if (!organizationId) return null;
        setState((prev) => ({ ...prev, loading: true }));
        return callApi(
          () =>
            apiService.organization.updateOrganization(organizationId, data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    const switchContext = useCallback(async () => {
      if (!organizationId) return null;
      setState((prev) => ({ ...prev, loading: true }));
      return callApi(
        () => apiService.organization.switchOrganization(organizationId),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [organizationId]);

    const listMembers = useCallback(
      async (page = 1, perPage = 10) => {
        if (!organizationId) return null;
        setState({ data: null, loading: true, error: null });
        return callApi(
          () =>
            apiService.organization.listMembers(organizationId, page, perPage),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    const inviteMember = useCallback(
      async (data: InviteMemberDto) => {
        if (!organizationId) return null;
        setState((prev) => ({ ...prev, loading: true }));
        return callApi(
          () => apiService.organization.inviteMember(organizationId, data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    return {
      ...state,
      getDetails,
      updateOrganization,
      switchContext,
      listMembers,
      inviteMember,
    };
  };

  const useOutlines = (organizationId?: string) => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: false,
      error: null,
    });

    const createOutline = useCallback(
      async (data: CreateOutlineDto) => {
        setState({ data: null, loading: true, error: null });
        return callApi(
          () => apiService.outline.createOutline(data, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    const listOutlines = useCallback(
      async (page = 1, perPage = 10) => {
        if (!organizationId) return null;
        setState({ data: null, loading: true, error: null });
        return callApi(
          () => apiService.outline.listOutlines(organizationId, page, perPage),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    const getOutline = useCallback(
      async (outlineId: string) => {
        if (!organizationId) return null;
        setState((prev) => ({ ...prev, loading: true }));
        return callApi(
          () => apiService.outline.getOutline(outlineId, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    const updateOutline = useCallback(
      async (outlineId: string, data: UpdateOutlineDto) => {
        if (!organizationId) return null;
        setState((prev) => ({ ...prev, loading: true }));
        return callApi(
          () =>
            apiService.outline.updateOutline(outlineId, data, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    const deleteOutline = useCallback(
      async (outlineId: string) => {
        if (!organizationId) return null;
        setState((prev) => ({ ...prev, loading: true }));
        return callApi(
          () => apiService.outline.deleteOutline(outlineId, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId]
    );

    const getOrganizationOutlineStats = useCallback(async () => {
      if (!organizationId) return null;
      setState((prev) => ({ ...prev, loading: true }));
      return callApi(
        () => apiService.outline.getOrganizationOutlineStats(organizationId),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [organizationId]);

    return {
      ...state,
      createOutline,
      listOutlines,
      getOutline,
      updateOutline,
      deleteOutline,
      getOrganizationOutlineStats,
    };
  };

  return {
    useAuthSignUp,
    useAuthSignIn,
    useAuthSession,
    useUserProfile,
    useOrganizations,
    useOrganization,
    useOutlines,
    useInvitations,
    api: apiService,
  };
};

export default useApi;
