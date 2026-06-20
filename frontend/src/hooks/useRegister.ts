import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { registerSchema, RegisterInput } from '../utils/schemas';
import { useRegisterMutation } from '../api/authQueries';

interface UseRegisterOptions {
  onRegisterSuccess: (email: string) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export function useRegister({ onRegisterSuccess, showToast }: UseRegisterOptions) {
  const registerMutation = useRegisterMutation(onRegisterSuccess);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    } as RegisterInput,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await registerMutation.mutateAsync(value);
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    },
  });

  return {
    form,
    isSubmitting: registerMutation.isPending,
  };
}
