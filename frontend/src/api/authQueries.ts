import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store';
import { setCredentials, clearCredentials } from '../store/authSlice';
import { LoginInput, RegisterInput } from '../utils/schemas';

interface UserProfileResponse {
  name: string;
  role: string;
  authMethod: 'Google' | 'Password';
}

interface RegisterResponse {
  message: string;
}

export function useLoginMutation(onSuccessCallback?: () => void) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<UserProfileResponse, Error, LoginInput>({
    mutationFn: async (credentials: LoginInput) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed.');
      }

      return response.json();
    },
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          name: data.name,
          role: data.role,
          authMethod: 'Password',
        })
      );
      // Invalidate query to trigger profile fetch
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useRegisterMutation(onSuccessCallback?: (email: string) => void) {
  return useMutation<RegisterResponse, Error, RegisterInput & { email: string }>({
    mutationFn: async (userData: RegisterInput) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      if (onSuccessCallback) {
        onSuccessCallback(variables.email);
      }
    },
  });
}

export function useLogoutMutation(onSuccessCallback?: () => void) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed.');
      }

      return response.json();
    },
    onSuccess: () => {
      dispatch(clearCredentials());
      queryClient.setQueryData(['me'], null);
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useMeQuery(enabled: boolean = true) {
  const dispatch = useAppDispatch();

  return useQuery<UserProfileResponse | null, Error>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (response.status === 401) {
        // Return null silently for guest users
        dispatch(clearCredentials());
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to load active profile.');
      }

      const data = await response.json();
      dispatch(
        setCredentials({
          name: data.name,
          role: data.role,
          authMethod: data.authMethod || 'Password',
        })
      );
      return data;
    },
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfileMutation(onSuccessCallback?: () => void) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<UserProfileResponse & { message: string }, Error, { name?: string; password?: string }>({
    mutationFn: async (profileData) => {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }

      return response.json();
    },
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          name: data.name,
          role: data.role,
          authMethod: data.authMethod || 'Password',
        })
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}
