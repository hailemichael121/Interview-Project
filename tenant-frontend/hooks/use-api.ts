// hooks/use-api.ts
import { useCallback, useState } from "react";
import apiService, {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateOutlineDto,
  UpdateOutlineDto,
  UpdateUserDto,
  InviteMemberDto,
} from "@/lib/api-service";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = () => {
  // Generic API call handler
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
      } catch (error: unknown) {
        const errorMessage = error.message || "An unknown error occurred";
        onError?.(errorMessage);
        return null;
      }
    },
    []
  );

  // Auth API hooks
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
      [callApi]
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
      [callApi]
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
    }, [callApi]);

    return { ...state, getSession };
  };

  // User API hooks
  const useUserProfile = () => {
    const [state, setState] = useState<ApiState<any>>({
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
    }, [callApi]);

    const updateProfile = useCallback(
      async (data: UpdateUserDto) => {
        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () => apiService.user.updateProfile(data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [callApi]
    );

    return { ...state, getProfile, updateProfile };
  };

  const useCurrentUser = () => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: true,
      error: null,
    });

    const getCurrentUser = useCallback(async () => {
      setState((prev) => ({ ...prev, loading: true }));

      return callApi(
        () => apiService.user.getCurrentUser(),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [callApi]);

    return { ...state, getCurrentUser };
  };

  // Organization API hooks
  const useOrganizations = () => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: false,
      error: null,
    });

    const createOrganization = useCallback(
      async (data: CreateOrganizationDto) => {
        setState({ data: null, loading: true, error: null });

        return callApi(
          () => apiService.organization.createOrganization(data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [callApi]
    );

    const listOrganizations = useCallback(
      async (page = 1, perPage = 10) => {
        setState({ data: null, loading: true, error: null });

        return callApi(
          () => apiService.organization.listUserOrganizations(page, perPage),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [callApi]
    );

    return { ...state, createOrganization, listOrganizations };
  };

  const useOrganization = (organizationId?: string) => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: true,
      error: null,
    });

    const getDetails = useCallback(async () => {
      if (!organizationId) {
        setState({
          data: null,
          loading: false,
          error: "Organization ID is required",
        });
        return null;
      }

      setState((prev) => ({ ...prev, loading: true }));

      return callApi(
        () => apiService.organization.getOrganizationDetails(organizationId),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [organizationId, callApi]);

    const updateOrganization = useCallback(
      async (data: UpdateOrganizationDto) => {
        if (!organizationId) {
          setState({
            data: null,
            loading: false,
            error: "Organization ID is required",
          });
          return null;
        }

        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () =>
            apiService.organization.updateOrganization(organizationId, data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId, callApi]
    );

    const switchContext = useCallback(async () => {
      if (!organizationId) {
        setState({
          data: null,
          loading: false,
          error: "Organization ID is required",
        });
        return null;
      }

      setState((prev) => ({ ...prev, loading: true }));

      return callApi(
        () => apiService.organization.switchOrganization(organizationId),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [organizationId, callApi]);

    const listMembers = useCallback(
      async (page = 1, perPage = 10) => {
        if (!organizationId) {
          setState({
            data: null,
            loading: false,
            error: "Organization ID is required",
          });
          return null;
        }

        setState({ data: null, loading: true, error: null });

        return callApi(
          () =>
            apiService.organization.listMembers(organizationId, page, perPage),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId, callApi]
    );

    const inviteMember = useCallback(
      async (data: InviteMemberDto) => {
        if (!organizationId) {
          setState({
            data: null,
            loading: false,
            error: "Organization ID is required",
          });
          return null;
        }

        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () => apiService.organization.inviteMember(organizationId, data),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId, callApi]
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

  // Outline API hooks
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
      [organizationId, callApi]
    );

    const listOutlines = useCallback(
      async (page = 1, perPage = 10) => {
        setState({ data: null, loading: true, error: null });

        return callApi(
          () => apiService.outline.listOutlines(page, perPage, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId, callApi]
    );

    const getOutline = useCallback(
      async (outlineId: string) => {
        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () => apiService.outline.getOutline(outlineId, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId, callApi]
    );

    const updateOutline = useCallback(
      async (outlineId: string, data: UpdateOutlineDto) => {
        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () =>
            apiService.outline.updateOutline(outlineId, data, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId, callApi]
    );

    const deleteOutline = useCallback(
      async (outlineId: string) => {
        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () => apiService.outline.deleteOutline(outlineId, organizationId),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [organizationId, callApi]
    );

    const getOrganizationStats = useCallback(async () => {
      setState((prev) => ({ ...prev, loading: true }));

      return callApi(
        () => apiService.outline.getOrganizationStats(organizationId),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [organizationId, callApi]);

    return {
      ...state,
      createOutline,
      listOutlines,
      getOutline,
      updateOutline,
      deleteOutline,
      getOrganizationStats,
    };
  };

  // Invitation API hooks
  const useInvitations = () => {
    const [state, setState] = useState<ApiState<any>>({
      data: null,
      loading: true,
      error: null,
    });

    const getPendingInvitations = useCallback(async () => {
      setState((prev) => ({ ...prev, loading: true }));

      return callApi(
        () => apiService.invitation.getPendingInvitations(),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [callApi]);

    const acceptInvitation = useCallback(
      async (invitationId: string, email: string) => {
        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () => apiService.invitation.acceptInvitation(invitationId, email),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [callApi]
    );

    const declineInvitation = useCallback(
      async (invitationId: string, email: string) => {
        setState((prev) => ({ ...prev, loading: true }));

        return callApi(
          () => apiService.invitation.declineInvitation(invitationId, email),
          (result) => setState({ data: result, loading: false, error: null }),
          (error) => setState({ data: null, loading: false, error })
        );
      },
      [callApi]
    );

    return {
      ...state,
      getPendingInvitations,
      acceptInvitation,
      declineInvitation,
    };
  };

  // Health check hook
  const useHealthCheck = () => {
    const [state, setState] = useState<ApiState<boolean>>({
      data: null,
      loading: true,
      error: null,
    });

    const checkHealth = useCallback(async () => {
      setState((prev) => ({ ...prev, loading: true }));

      return callApi(
        () => apiService.health.checkHealth(),
        (result) => setState({ data: result, loading: false, error: null }),
        (error) => setState({ data: null, loading: false, error })
      );
    }, [callApi]);

    return { ...state, checkHealth };
  };

  return {
    // Auth
    useAuthSignUp,
    useAuthSignIn,
    useAuthSession,

    // User
    useUserProfile,
    useCurrentUser,

    // Organization
    useOrganizations,
    useOrganization,

    // Outline
    useOutlines,

    // Invitation
    useInvitations,

    // Health
    useHealthCheck,

    // Direct API access (for advanced use cases)
    api: apiService,
  };
};

// Export default hook
export default useApi;
