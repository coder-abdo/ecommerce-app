import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, useAppSelector } from './store';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import OAuthCallback from './components/OAuthCallback';
import { useMeQuery } from './api/authQueries';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2 } from 'lucide-react';
import './index.css';

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [route, setRoute] = useState<'auth' | 'dashboard' | 'oauth-callback'>('auth');
  
  // 1. Query user profile based on HttpOnly cookie session
  const meQuery = useMeQuery();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasSuccess = params.has('success');
    const hasError = params.has('error');
    const isCallbackPath = window.location.pathname.includes('oauth-callback');

    if (hasSuccess || isCallbackPath) {
      setRoute('oauth-callback');
    } else if (auth.isAuthenticated) {
      setRoute('dashboard');
    } else {
      setRoute('auth');
    }

    if (hasError) {
      showToast(params.get('error') || 'An authentication error occurred', 'error');
      // Clean query parameters from URL bar
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [auth.isAuthenticated]);

  const handleLogout = () => {
    setRoute('auth');
    showToast('Logged out successfully', 'success');
  };

  const handleOAuthSuccess = async () => {
    // Re-fetch user profile (cookie is now set on browser)
    await meQuery.refetch();
    setRoute('dashboard');
    window.history.replaceState({}, document.title, '/');
  };

  const handleOAuthError = (errorMsg: string) => {
    showToast(errorMsg, 'error');
    setRoute('auth');
    window.history.replaceState({}, document.title, '/');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleRegisterSuccess = (prefilledEmail: string) => {
    setActiveTab('login');
    setTimeout(() => {
      const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
      if (emailInput) {
        emailInput.value = prefilledEmail;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  };

  // Show premium loading spinner while resolving cookies on startup
  if (meQuery.isLoading && route !== 'oauth-callback') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
        <h2 className="text-lg font-semibold text-white font-outfit">Loading Session...</h2>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
      {/* ROUTER SWITCH */}
      {route === 'oauth-callback' && (
        <OAuthCallback 
          onAuthSuccess={handleOAuthSuccess} 
          onAuthError={handleOAuthError} 
        />
      )}

      {route === 'dashboard' && auth.isAuthenticated && (
        <Dashboard 
          onLogout={handleLogout} 
          showToast={showToast}
        />
      )}

      {route === 'auth' && (
        <div className="w-full max-w-[450px] p-4">
          <Card className="bg-card/45 border-white/10 backdrop-blur-2xl shadow-2xl p-6 rounded-3xl">
            <CardHeader className="text-center pb-6 space-y-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent font-outfit">
                  GadgetHub
                </h1>
              </div>
              <CardDescription className="text-muted-foreground text-sm">
                Experience future-ready retail today
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs 
                value={activeTab} 
                onValueChange={(val) => setActiveTab(val)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 bg-white/5 border border-white/5 p-1 rounded-xl">
                  <TabsTrigger value="login" className="rounded-lg text-sm">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="rounded-lg text-sm">Create Account</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="pt-4">
                  <Login 
                    onLoginSuccess={() => setRoute('dashboard')} 
                    showToast={showToast} 
                  />
                </TabsContent>
                <TabsContent value="register" className="pt-4">
                  <Register 
                    onRegisterSuccess={handleRegisterSuccess} 
                    showToast={showToast} 
                  />
                </TabsContent>
              </Tabs>

              <div className="flex items-center my-4 text-xs text-muted-foreground before:content-[''] before:flex-1 before:border-b before:border-white/10 before:mr-3 after:content-[''] after:flex-1 after:border-b after:border-white/10 after:ml-3">
                or continue with
              </div>

              {/* Google OAuth Login Button */}
              <a 
                href="/api/auth/google" 
                className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-xl shadow-md transition duration-200"
              >
                <svg className="google-icon h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.65 1.63 14.99 1 12 1 7.37 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.73 8.93 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.43c-.28 1.48-1.11 2.73-2.37 3.58l3.69 2.87c2.16-1.99 3.74-4.92 3.74-8.54z"/>
                  <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.37-1.49-.37-2.3s.13-1.58.37-2.3L1.5 6.9C.54 8.84 0 10.96 0 13.2s.54 4.36 1.5 6.3l3.86-3z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.68-2.33 1.09-4.27 1.09-3.07 0-5.73-2.69-6.64-5.46L1.5 16.3C3.4 20.15 7.37 23 12 23z"/>
                </svg>
                <span>Sign in with Google</span>
              </a>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Alert Toast */}
      {toast && (
        <div className={`toast-notification ${toast.type} show`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}
