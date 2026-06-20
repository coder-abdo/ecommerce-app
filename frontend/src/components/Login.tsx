import { useLogin } from '../hooks/useLogin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginProps {
  onLoginSuccess: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function Login({ onLoginSuccess, showToast }: LoginProps) {
  const { form, isSubmitting } = useLogin({ onLoginSuccess, showToast });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor="login-email">Email Address</Label>
            <Input
              type="email"
              id="login-email"
              placeholder="name@example.com"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={`bg-background/50 border-muted ${
                field.state.meta.errors.length ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              type="password"
              id="login-password"
              placeholder="••••••••"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className={`bg-background/50 border-muted ${
                field.state.meta.errors.length ? 'border-destructive focus-visible:ring-destructive' : ''
              }`}
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      />

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
}
