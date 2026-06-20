import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface OAuthCallbackProps {
  onAuthSuccess: () => void;
  onAuthError: (error: string) => void;
}

export default function OAuthCallback({ onAuthSuccess, onAuthError }: OAuthCallbackProps) {
  useEffect(() => {
    // Parse parameters from redirect URL
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');

    if (success === 'true') {
      // Brief delay for premium user experience and smooth transition
      const timer = setTimeout(() => {
        onAuthSuccess();
      }, 1200);

      return () => clearTimeout(timer);
    } else {
      const errorMsg = params.get('error') || 'Authentication failed: OAuth validation error';
      const timer = setTimeout(() => {
        onAuthError(errorMsg);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [onAuthSuccess, onAuthError]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
      <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent font-outfit">
        Completing Sign In
      </h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        Connecting your Google profile to your session...
      </p>
    </div>
  );
}
