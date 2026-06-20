import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { loginSchema, LoginInput } from '../utils/schemas';
import { useLoginMutation } from '../api/authQueries';

interface UseLoginOptions {
  onLoginSuccess: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function useLogin({ onLoginSuccess, showToast }: UseLoginOptions) {
  const loginMutation = useLoginMutation(onLoginSuccess);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    } as LoginInput,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await loginMutation.mutateAsync(value);
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    },
  });

  return {
    form,
    isSubmitting: loginMutation.isPending,
  };
}
